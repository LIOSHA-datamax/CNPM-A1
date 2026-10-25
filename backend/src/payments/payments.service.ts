import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  private formatPaymentResponse(payment: any, order: any, isReplay = false) {
    const normalizedPayment = {
      ...payment,
      amount: Number(payment.amount),
    };

    const normalizedOrder = order
      ? {
          ...order,
          subtotal: Number(order.subtotal),
          discountAmount: Number(order.discountAmount),
          total: Number(order.total),
        }
      : undefined;

    return {
      ...normalizedPayment,
      payment: normalizedPayment,
      order: normalizedOrder,
      idempotentReplay: isReplay,
    };
  }

  async processPayment(dto: CreatePaymentDto, headerIdempotencyKey?: string) {
    const resolvedKey =
      dto.idempotencyKey?.trim() ||
      headerIdempotencyKey?.trim() ||
      randomUUID();

    // 1. Idempotency check: if a Payment with this idempotencyKey already exists, verify order match and return
    const existingPayment = await this.prisma.payment.findUnique({
      where: { idempotencyKey: resolvedKey },
      include: { order: true },
    });

    if (existingPayment) {
      if (existingPayment.orderId !== dto.orderId) {
        throw new ConflictException(
          'Idempotency key has already been used for a different order',
        );
      }
      return this.formatPaymentResponse(
        existingPayment,
        existingPayment.order,
        true,
      );
    }

    // 2. Fetch order and validate existence
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${dto.orderId}" not found`);
    }

    // 3. Order State Machine Guard (PDF Section 9.1):
    // Only PENDING or PAYMENT_FAILED (retry) orders can transition to PAID / PAYMENT_FAILED
    const allowedStatuses: OrderStatus[] = [
      OrderStatus.PENDING,
      OrderStatus.PAYMENT_FAILED,
    ];
    if (!allowedStatuses.includes(order.status)) {
      throw new BadRequestException(
        `Invalid order state transition: Order in status "${order.status}" cannot be paid`,
      );
    }

    // 4. Optional amount verification if client explicitly sent amount
    const orderTotal = Number(order.total);
    if (
      dto.amount !== undefined &&
      Math.abs(Number(dto.amount) - orderTotal) > 0.01
    ) {
      throw new BadRequestException(
        `Payment amount (${dto.amount}) does not match order total (${orderTotal})`,
      );
    }

    // 5. Mock Gateway Outcome inside atomic transaction
    const isFailure = dto.simulateFailure === true;
    const paymentStatus = isFailure
      ? PaymentStatus.FAILED
      : PaymentStatus.SUCCESS;
    const nextOrderStatus = isFailure
      ? OrderStatus.PAYMENT_FAILED
      : OrderStatus.PAID;
    const transactionRef = isFailure
      ? null
      : `MOCK-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const payment = await tx.payment.create({
          data: {
            orderId: order.id,
            idempotencyKey: resolvedKey,
            amount: order.total,
            method: dto.method,
            status: paymentStatus,
            transactionRef,
          },
        });

        const updatedOrder = await tx.order.update({
          where: { id: order.id },
          data: { status: nextOrderStatus },
        });

        // Accrue loyalty points on PAID
        if (!isFailure && order.userId) {
          const pointsEarned =
            orderTotal > 0 ? Math.max(1, Math.floor(orderTotal / 10000)) : 0;
          if (pointsEarned > 0) {
            await tx.user.update({
              where: { id: order.userId },
              data: {
                loyaltyPoints: { increment: pointsEarned },
              },
            });
          }
        }

        return { payment, updatedOrder };
      });

      return this.formatPaymentResponse(
        result.payment,
        result.updatedOrder,
        false,
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const raced = await this.prisma.payment.findUnique({
          where: { idempotencyKey: resolvedKey },
          include: { order: true },
        });
        if (raced && raced.orderId === dto.orderId) {
          return this.formatPaymentResponse(raced, raced.order, true);
        }
        throw new ConflictException('Duplicate idempotency key conflict');
      }
      throw error;
    }
  }

  async findByOrder(orderId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    return payments.map((p) => ({
      ...p,
      amount: Number(p.amount),
    }));
  }
}
