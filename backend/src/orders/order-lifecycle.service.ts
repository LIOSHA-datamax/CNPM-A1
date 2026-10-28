import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
// TODO: chỉnh đường dẫn cho khớp PrismaService của nhóm
import { PrismaService } from '../prisma/prisma.service';
import { assertTransition } from './order-state-machine';

/** Cứ mỗi 10.000đ của đơn PAID được 1 điểm. */
export const POINT_UNIT_VND = 10000;

type OrderWithItems = Prisma.OrderGetPayload<{ include: { orderItems: true } }>;

/**
 * Nơi DUY NHẤT được đổi trạng thái đơn hàng.
 * Mọi nơi khác (payments, barista...) phải gọi transition()/transitionInTx().
 * Nhờ đó side-effect (cộng điểm, hoàn kho...) chỉ xảy ra đúng 1 lần mỗi lần chuyển.
 */
@Injectable()
export class OrderLifecycleService {
  constructor(private readonly prisma: PrismaService) {}

  /** Chuyển trạng thái trong 1 transaction riêng. */
  transition(orderId: string, to: OrderStatus) {
    return this.prisma.$transaction((tx) =>
      this.transitionInTx(tx, orderId, to),
    );
  }

  /** Khách tự hủy đơn của mình. */
  async cancelByUser(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.userId !== userId) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }
    return this.transition(orderId, 'CANCELLED');
  }

  /** Dùng khi cần ghép chung transaction với thao tác khác (vd: lưu Payment). */
  async transitionInTx(
    tx: Prisma.TransactionClient,
    orderId: string,
    to: OrderStatus,
  ) {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    // 1. Chặn chuyển trạng thái sai (ném 400)
    assertTransition(order.status, to);

    // 2. Đổi trạng thái có điều kiện: nếu trạng thái đã bị ai đó đổi từ lúc đọc
    //    thì count = 0 -> side-effect bên dưới không bao giờ chạy 2 lần.
    const res = await tx.order.updateMany({
      where: { id: orderId, status: order.status },
      data: { status: to },
    });
    if (res.count === 0) {
      throw new ConflictException(
        'Đơn hàng vừa được cập nhật bởi thao tác khác, vui lòng thử lại',
      );
    }

    // 3. Side-effect theo trạng thái đích
    if (to === 'PAID') {
      await this.awardPoints(tx, order.userId, order.total);
    }
    if (to === 'CANCELLED') {
      await this.releaseResources(tx, order);
    }

    return tx.order.findUniqueOrThrow({ where: { id: orderId } });
  }

  // ------------------------------------------------------------------

  private pointsFor(total: Prisma.Decimal): number {
    return Math.floor(total.toNumber() / POINT_UNIT_VND);
  }

  private async awardPoints(
    tx: Prisma.TransactionClient,
    userId: string,
    total: Prisma.Decimal,
  ) {
    const points = this.pointsFor(total);
    if (points > 0) {
      await tx.user.update({
        where: { id: userId },
        data: { loyaltyPoints: { increment: points } },
      });
    }
  }

  /** Hủy đơn: hoàn kho, hoàn lượt coupon, thu hồi điểm nếu đơn đã PAID. */
  private async releaseResources(
    tx: Prisma.TransactionClient,
    order: OrderWithItems,
  ) {
    // Hoàn kho (gộp qty theo sản phẩm)
    const qtyByProduct = new Map<string, number>();
    for (const it of order.orderItems) {
      qtyByProduct.set(it.productId, (qtyByProduct.get(it.productId) ?? 0) + it.qty);
    }
    for (const productId of [...qtyByProduct.keys()].sort()) {
      await tx.product.update({
        where: { id: productId },
        data: {
          stock: { increment: qtyByProduct.get(productId)! },
          version: { increment: 1 },
        },
      });
    }

    // Hoàn lượt dùng coupon
    if (order.couponId) {
      await tx.coupon.updateMany({
        where: { id: order.couponId, usedCount: { gt: 0 } },
        data: { usedCount: { decrement: 1 } },
      });
    }

    // Thu hồi điểm đã cộng (chỉ khi đơn từng PAID), không để âm
    if (order.status === 'PAID') {
      const points = this.pointsFor(order.total);
      if (points > 0) {
        const user = await tx.user.findUnique({ where: { id: order.userId } });
        if (user) {
          await tx.user.update({
            where: { id: user.id },
            data: { loyaltyPoints: Math.max(0, user.loyaltyPoints - points) },
          });
        }
      }
    }
  }
}
