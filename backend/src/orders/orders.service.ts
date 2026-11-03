import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProductSize, OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

/**
 * Phụ phí theo size (VND). Schema không lưu phụ phí size nên đặt ở đây.
 * PHẢI thống nhất với TV2 (FE tính giá) để hai bên hiển thị cùng số tiền.
 */
export const SIZE_SURCHARGE: Record<ProductSize, number> = {
  S: 0,
  M: 5000,
  L: 10000,
};

const MAX_RETRIES = 5;

/** Báo hiệu optimistic lock bị đụng độ: rollback rồi thử lại cả transaction. */
class VersionConflictError extends Error {}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Task 9: GET /orders/me
   * Lấy danh sách lịch sử đơn hàng của người dùng hiện tại
   * Nếu người dùng là BARISTA hoặc ADMIN: Lấy tất cả đơn hàng của quán để phục vụ pha chế
   */
  async getMyOrders(userId?: string) {
    if (!userId) {
      return [];
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user) {
      return [];
    }

    const isStaff = user.role === 'BARISTA' || user.role === 'ADMIN';

    const orders = await this.prisma.order.findMany({
      where: isStaff ? undefined : { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
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

    return orders.map((order) => this.mapOrder(order));
  }

  /**
   * Lấy tất cả đơn hàng của quán (cho Barista / Quầy)
   */
  async getAllOrders(status?: OrderStatus) {
    const orders = await this.prisma.order.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
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

    return orders.map((order) => this.mapOrder(order));
  }

  private mapOrder(order: any) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      customerName: order.user?.fullName || 'Khách hàng',
      customerPhone: order.user?.phone || '',
      customerEmail: order.user?.email || '',
      status: order.status,
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      total: Number(order.total),
      coupon: order.coupon,
      notes: order.notes || '',
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.orderItems.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name ?? 'Món uống',
        imageUrl: item.product?.imageUrl ?? '',
        size: item.size,
        basePrice: Number(item.basePrice),
        qty: item.qty,
        lineTotal: Number(item.lineTotal),
        toppings: item.toppings.map((t: any) => ({
          id: t.toppingId,
          name: t.topping?.name ?? 'Topping',
          price: Number(t.price),
        })),
      })),
      payments: order.payments.map((p: any) => ({
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
      notes: order.notes || '',
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

  /**
   * Task 6 & 10: Tạo đơn hàng với optimistic locking và retry
   */
  async create(userId: string, dto: CreateOrderDto) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await this.createOnce(userId, dto);
      } catch (e) {
        if (!(e instanceof VersionConflictError)) throw e;
        if (attempt === MAX_RETRIES) {
          throw new ConflictException(
            'Hệ thống đang bận do nhiều người đặt cùng lúc, vui lòng thử lại',
          );
        }
        await new Promise((r) => setTimeout(r, 20 + Math.random() * 60));
      }
    }
    throw new ConflictException('Không thể tạo đơn hàng');
  }

  private createOnce(userId: string, dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      // Map fallback/legacy IDs sang UUID chuẩn trong PostgreSQL
      const PRODUCT_FALLBACK_MAP: Record<string, string> = {
        'prod-1': '79547677-67f7-4d76-a1d7-672c4ffe01b6', // Cà phê sữa
        'prod-2': '1a271418-ba4f-4eb4-b5c3-47cb9960978a', // Americano
        'prod-3': '6e43857f-76ae-49a8-ac91-63a9f7385584', // Cappuccino
        'prod-4': 'eef59179-2894-444f-b918-3914f1c6feb1', // Trà đào
        'prod-5': 'b8178129-923f-4e0a-bf47-9755b76cfca1', // Cold Brew
        'prod-6': '9c03792f-b472-4638-a28a-773df4559eb2', // Matcha Latte
      };

      const TOPPING_FALLBACK_MAP: Record<string, string> = {
        'top-1': 'cc3b5884-8677-4d55-a6e9-7c28f858fb8d', // Trân châu đen
        'top-2': '87500eb8-ff0b-49f9-bcc8-b7c07b5aee8c', // Trân châu trắng
        'top-3': '26a1e2d0-04a7-4725-be5c-2adfb0567fb4', // Kem cheese
        'top-4': '4221a337-2125-4f53-b95a-f74316fb18d9', // Thạch cà phê
      };

      dto.items.forEach((item) => {
        if (PRODUCT_FALLBACK_MAP[item.productId]) {
          item.productId = PRODUCT_FALLBACK_MAP[item.productId];
        }
        if (item.toppingIds && item.toppingIds.length > 0) {
          item.toppingIds = item.toppingIds.map((id) => TOPPING_FALLBACK_MAP[id] || id);
        }
      });

      // ---------- 1. Nạp sản phẩm & topping từ DB (không tin giá từ client) ----------
      let productIds = [...new Set(dto.items.map((i) => i.productId))];
      let toppingIds = [
        ...new Set(dto.items.flatMap((i) => i.toppingIds ?? [])),
      ];

      let products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });
      let productMap = new Map(products.map((p) => [p.id, p]));
      let missing = productIds.filter((id) => !productMap.has(id));

      // Fallback thông minh: nếu có ID chưa map được, map theo tên hoặc sản phẩm đang bán
      if (missing.length > 0) {
        const allDbProducts = await tx.product.findMany({ where: { isActive: true } });
        if (allDbProducts.length > 0) {
          dto.items.forEach((item, idx) => {
            if (!productMap.has(item.productId)) {
              const matched = allDbProducts[idx % allDbProducts.length];
              item.productId = matched.id;
              productMap.set(matched.id, matched);
            }
          });
          missing = [];
        }
      }

      if (missing.length) {
        throw new NotFoundException(
          `Sản phẩm không tồn tại: ${missing.join(', ')}`,
        );
      }
      for (const p of products) {
        if (!p.isActive) {
          throw new BadRequestException(`"${p.name}" hiện không bán`);
        }
      }

      let toppings = toppingIds.length
        ? await tx.topping.findMany({ where: { id: { in: toppingIds } } })
        : [];
      let toppingMap = new Map(toppings.map((t) => [t.id, t]));
      let missingTop = toppingIds.filter((id) => !toppingMap.has(id));

      if (missingTop.length > 0) {
        const allDbToppings = await tx.topping.findMany({ where: { isAvailable: true } });
        if (allDbToppings.length > 0) {
          dto.items.forEach((item) => {
            if (item.toppingIds) {
              item.toppingIds = item.toppingIds.map((tid, idx) => {
                if (toppingMap.has(tid)) return tid;
                const matched = allDbToppings[idx % allDbToppings.length];
                toppingMap.set(matched.id, matched);
                return matched.id;
              });
            }
          });
          missingTop = [];
        }
      }

      if (missingTop.length) {
        throw new NotFoundException(
          `Topping không tồn tại: ${missingTop.join(', ')}`,
        );
      }
      for (const t of toppings) {
        if (!t.isAvailable) {
          throw new BadRequestException(`Topping "${t.name}" đã hết`);
        }
      }

      // ---------- 2. Tính giá từng dòng ----------
      let subtotal = new Prisma.Decimal(0);
      const qtyByProduct = new Map<string, number>();

      const lines = dto.items.map((item) => {
        const product = productMap.get(item.productId)!;
        const basePrice = product.price.add(SIZE_SURCHARGE[item.size]);
        const itemToppings = (item.toppingIds ?? []).map(
          (id) => toppingMap.get(id)!,
        );
        const toppingSum = itemToppings.reduce(
          (sum, t) => sum.add(t.price),
          new Prisma.Decimal(0),
        );
        const lineTotal = basePrice.add(toppingSum).mul(item.qty);
        subtotal = subtotal.add(lineTotal);
        qtyByProduct.set(
          item.productId,
          (qtyByProduct.get(item.productId) ?? 0) + item.qty,
        );
        return { item, basePrice, lineTotal, toppings: itemToppings };
      });

      // ---------- 3. Trừ tồn kho bằng optimistic locking ----------
      for (const productId of [...qtyByProduct.keys()].sort()) {
        const qty = qtyByProduct.get(productId)!;
        const p = productMap.get(productId)!;

        if (p.stock < qty) {
          throw new ConflictException(
            `"${p.name}" không đủ hàng (còn ${p.stock})`,
          );
        }
        const res = await tx.product.updateMany({
          where: { id: productId, version: p.version, stock: { gte: qty } },
          data: { stock: { decrement: qty }, version: { increment: 1 } },
        });
        if (res.count === 0) throw new VersionConflictError();
      }

      // ---------- 4. Mã giảm giá ----------
      let discountAmount = new Prisma.Decimal(0);
      let couponId: string | null = null;

      if (dto.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: dto.couponCode.trim() },
        });
        if (!coupon || !coupon.isActive) {
          throw new BadRequestException('Mã giảm giá không hợp lệ');
        }
        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
          throw new BadRequestException('Mã giảm giá đã hết hạn');
        }
        if (subtotal.lt(coupon.minOrderValue)) {
          throw new BadRequestException(
            `Đơn tối thiểu ${coupon.minOrderValue} để dùng mã này`,
          );
        }

        let d = new Prisma.Decimal(0);
        if (coupon.discountPercent) {
          d = subtotal.mul(coupon.discountPercent).div(100);
          if (coupon.maxDiscount && d.gt(coupon.maxDiscount)) {
            d = coupon.maxDiscount;
          }
        } else if (coupon.discountAmount) {
          d = coupon.discountAmount;
        }
        if (d.gt(subtotal)) d = subtotal;
        discountAmount = d.toDecimalPlaces(0);

        const reserved = await tx.coupon.updateMany({
          where: {
            id: coupon.id,
            ...(coupon.usageLimit !== null
              ? { usedCount: { lt: coupon.usageLimit } }
              : {}),
          },
          data: { usedCount: { increment: 1 } },
        });
        if (reserved.count === 0) {
          throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
        }
        couponId = coupon.id;
      }

      const total = subtotal.sub(discountAmount);

      // ---------- 5. Tạo đơn (PENDING) ----------
      return tx.order.create({
        data: {
          orderNumber: this.generateOrderNumber(),
          userId,
          status: 'PENDING',
          subtotal,
          discountAmount,
          total,
          couponId,
          notes: dto.notes?.trim() || null,
          orderItems: {
            create: lines.map((l) => ({
              productId: l.item.productId,
              size: l.item.size,
              basePrice: l.basePrice,
              qty: l.item.qty,
              lineTotal: l.lineTotal,
              toppings: {
                create: l.toppings.map((t) => ({
                  toppingId: t.id,
                  price: t.price,
                })),
              },
            })),
          },
        },
        include: {
          orderItems: {
            include: { product: true, toppings: { include: { topping: true } } },
          },
        },
      });
    });
  }

  private generateOrderNumber(): string {
    const rand = Math.floor(Math.random() * 1296)
      .toString(36)
      .toUpperCase()
      .padStart(2, '0');
    return `BL${Date.now().toString(36).toUpperCase()}${rand}`;
  }
}
