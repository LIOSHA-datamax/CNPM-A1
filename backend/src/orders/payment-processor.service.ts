import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Order, Payment, PaymentMethod, Prisma } from '@prisma/client';
// TODO: chỉnh đường dẫn cho khớp PrismaService của nhóm
import { PrismaService } from '../prisma/prisma.service';
import { OrderLifecycleService } from './order-lifecycle.service';

export interface GatewayResult {
  success: boolean;
  transactionRef?: string;
}

export interface PayInput {
  userId: string;
  orderId: string;
  method: PaymentMethod;
  /** Lấy từ header `Idempotency-Key` (bắt buộc). */
  idempotencyKey: string;
  /**
   * Hàm gọi cổng thanh toán giả lập do TV4 cung cấp.
   * Chỉ được gọi ĐÚNG 1 LẦN cho mỗi Idempotency-Key.
   */
  charge: (amount: Prisma.Decimal) => Promise<GatewayResult>;
}

export interface PayResult {
  payment: Payment;
  order: Order;
  /** true nếu đây là kết quả trả lại của một request trước đó (không xử lý lại). */
  replayed: boolean;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isUniqueViolation(e: unknown): boolean {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002'
  );
}

/**
 * Xử lý thanh toán idempotent.
 * Ranh giới với TV4: TV4 viết controller POST /payments + mock gateway,
 * rồi gọi `pay({... charge: (amount) => mockGateway.charge(...) })`.
 */
@Injectable()
export class PaymentProcessorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lifecycle: OrderLifecycleService,
  ) {}

  async pay(input: PayInput): Promise<PayResult> {
    const { userId, orderId, method, idempotencyKey, charge } = input;

    if (!idempotencyKey || !idempotencyKey.trim()) {
      throw new BadRequestException('Thiếu header Idempotency-Key');
    }

    // 1. Key đã dùng -> trả lại kết quả cũ, KHÔNG xử lý lại
    const existing = await this.prisma.payment.findUnique({
      where: { idempotencyKey },
    });
    if (existing) return this.replay(existing, userId, orderId);

    // 2. "Giành quyền" xử lý key này bằng cách insert Payment(PENDING).
    //    Cột idempotencyKey @unique đảm bảo chỉ 1 request thắng khi chạy song song.
    let payment: Payment;
    try {
      payment = await this.prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({ where: { id: orderId } });
        if (!order || order.userId !== userId) {
          throw new NotFoundException('Không tìm thấy đơn hàng');
        }
        if (order.status !== 'PENDING' && order.status !== 'PAYMENT_FAILED') {
          throw new ConflictException(
            `Đơn đang ở trạng thái ${order.status}, không thể thanh toán`,
          );
        }
        const inflight = await tx.payment.findFirst({
          where: { orderId, status: 'PENDING' },
        });
        if (inflight) {
          throw new ConflictException(
            'Đơn đang có giao dịch thanh toán khác được xử lý',
          );
        }
        // Thử lại sau khi lỗi: PAYMENT_FAILED -> PENDING
        if (order.status === 'PAYMENT_FAILED') {
          await this.lifecycle.transitionInTx(tx, orderId, 'PENDING');
        }
        return tx.payment.create({
          data: {
            orderId,
            idempotencyKey,
            amount: order.total,
            method,
            status: 'PENDING',
          },
        });
      });
    } catch (e) {
      // Request song song cùng key đã thắng -> trả kết quả của nó
      if (isUniqueViolation(e)) {
        const winner = await this.prisma.payment.findUnique({
          where: { idempotencyKey },
        });
        if (winner) return this.replay(winner, userId, orderId);
      }
      throw e;
    }

    // 3. Gọi cổng thanh toán (ngoài transaction vì có thể chậm)
    let result: GatewayResult;
    try {
      result = await charge(payment.amount);
    } catch {
      result = { success: false };
    }

    // 4. Ghi kết quả + đổi trạng thái đơn trong CÙNG 1 transaction
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: result.success ? 'SUCCESS' : 'FAILED',
          transactionRef: result.transactionRef ?? null,
        },
      });
      const order = await this.lifecycle.transitionInTx(
        tx,
        orderId,
        result.success ? 'PAID' : 'PAYMENT_FAILED',
      );
      return { payment: updated, order, replayed: false };
    });
  }

  private async replay(
    payment: Payment,
    userId: string,
    orderId: string,
  ): Promise<PayResult> {
    if (payment.orderId !== orderId) {
      throw new UnprocessableEntityException(
        'Idempotency-Key này đã được dùng cho đơn hàng khác',
      );
    }
    // Request gốc có thể đang xử lý dở -> chờ tối đa ~5 giây
    for (let i = 0; i < 20 && payment.status === 'PENDING'; i++) {
      await sleep(250);
      payment = (await this.prisma.payment.findUnique({
        where: { id: payment.id },
      }))!;
    }
    if (payment.status === 'PENDING') {
      throw new ConflictException(
        'Giao dịch đang được xử lý, vui lòng thử lại sau',
      );
    }
    const order = await this.prisma.order.findUniqueOrThrow({
      where: { id: payment.orderId },
    });
    if (order.userId !== userId) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }
    return { payment, order, replayed: true };
  }
}
