import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

/** Các chuyển trạng thái hợp lệ (khớp sơ đồ State Machine trong đề bài). */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PAID', 'PAYMENT_FAILED', 'CANCELLED'],
  PAYMENT_FAILED: ['PENDING', 'CANCELLED'], // thử lại thanh toán hoặc hủy
  PAID: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY'],
  READY: ['COMPLETED'],
  COMPLETED: [], // trạng thái kết thúc
  CANCELLED: [], // trạng thái kết thúc
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/** Ném 400 nếu chuyển trạng thái không hợp lệ. */
export function assertTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransition(from, to)) {
    throw new BadRequestException(
      `Không thể chuyển đơn hàng từ ${from} sang ${to}`,
    );
  }
}
