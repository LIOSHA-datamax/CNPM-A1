import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách lịch sử đơn hàng của người dùng hiện tại (Task 9: GET /orders/me)
   * Nếu chưa truyền userId (chưa có token hoặc test trực tiếp), mặc định lấy tài khoản demo customer@brewlite.com
   */
  async getMyOrders(userId?: string) {
    let targetUserId = userId;

    if (!targetUserId) {
      const defaultUser = await this.prisma.user.findFirst({
        where: { email: 'customer@brewlite.com' },
      });
      if (defaultUser) {
        targetUserId = defaultUser.id;
      }
    }

    if (!targetUserId) {
      return [];
    }

    const orders = await this.prisma.order.findMany({
      where: { userId: targetUserId },
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                price: true,
              },
            },
            toppings: {
              include: {
                topping: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                  },
                },
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            idempotencyKey: true,
            amount: true,
            method: true,
            status: true,
            transactionRef: true,
            createdAt: true,
          },
        },
        coupon: {
          select: {
            code: true,
            discountPercent: true,
            discountAmount: true,
          },
        },
      },
    });

    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      status: order.status,
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      total: Number(order.total),
      coupon: order.coupon,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.orderItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name ?? 'Món uống',
        imageUrl: item.product?.imageUrl ?? '',
        size: item.size,
        basePrice: Number(item.basePrice),
        qty: item.qty,
        lineTotal: Number(item.lineTotal),
        toppings: item.toppings.map((t) => ({
          id: t.toppingId,
          name: t.topping?.name ?? 'Topping',
          price: Number(t.price),
        })),
      })),
      payments: order.payments.map((p) => ({
        id: p.id,
        idempotencyKey: p.idempotencyKey,
        amount: Number(p.amount),
        method: p.method,
        status: p.status,
        transactionRef: p.transactionRef,
        createdAt: p.createdAt,
      })),
    }));
  }

  /**
   * Xem chi tiết một đơn hàng theo ID hoặc Order Number
   */
  async getOrderById(idOrNumber: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        OR: [{ id: idOrNumber }, { orderNumber: idOrNumber }],
      },
      include: {
        orderItems: {
          include: {
            product: true,
            toppings: {
              include: {
                topping: true,
              },
            },
          },
        },
        payments: true,
        coupon: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng: ${idOrNumber}`);
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      status: order.status,
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      total: Number(order.total),
      coupon: order.coupon,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.orderItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name ?? 'Món uống',
        imageUrl: item.product?.imageUrl ?? '',
        size: item.size,
        basePrice: Number(item.basePrice),
        qty: item.qty,
        lineTotal: Number(item.lineTotal),
        toppings: item.toppings.map((t) => ({
          id: t.toppingId,
          name: t.topping?.name ?? 'Topping',
          price: Number(t.price),
        })),
      })),
      payments: order.payments.map((p) => ({
        id: p.id,
        idempotencyKey: p.idempotencyKey,
        amount: Number(p.amount),
        method: p.method,
        status: p.status,
        transactionRef: p.transactionRef,
        createdAt: p.createdAt,
      })),
    };
  }
}
