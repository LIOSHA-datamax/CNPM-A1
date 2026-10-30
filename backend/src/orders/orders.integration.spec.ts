/**
 * INTEGRATION TEST - chạy trên DB thật (Postgres).
 * !!! Test sẽ XÓA SẠCH dữ liệu các bảng. Chỉ dùng DB riêng, vd: brewlite_test !!!
 */
import { BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { OrderLifecycleService } from './order-lifecycle.service';
import { OrdersService } from './orders.service';
import { PaymentProcessorService } from './payment-processor.service';

const prisma = new PrismaClient();
const orders = new OrdersService(prisma as any);
const lifecycle = new OrderLifecycleService(prisma as any);
const payments = new PaymentProcessorService(prisma as any, lifecycle);

jest.setTimeout(30000);

async function cleanDb() {
  await prisma.payment.deleteMany();
  await prisma.orderItemTopping.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.topping.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
}

const makeUser = () =>
  prisma.user.create({
    data: {
      email: `u${Date.now()}${Math.random().toString(36).slice(2)}@test.com`,
      passwordHash: 'x',
    },
  });

const makeProduct = (stock: number, price = 40000) =>
  prisma.product.create({
    data: { name: 'Cà phê test', price, imageUrl: 'x.png', stock },
  });

const orderOf = (userId: string, productId: string, qty = 1, couponCode?: string) =>
  orders.create(userId, {
    items: [{ productId, size: 'S', qty }],
    couponCode,
  });

beforeAll(async () => {
  if (!/test/i.test(process.env.DATABASE_URL ?? '')) {
    throw new Error(
      'DATABASE_URL phải trỏ tới DB test (tên chứa "test"), tránh xóa nhầm dữ liệu thật',
    );
  }
});
beforeEach(cleanDb);
afterAll(async () => {
  await cleanDb();
  await prisma.$disconnect();
});

describe('(a) State machine trên DB', () => {
  it('chặn PENDING -> READY, giữ nguyên trạng thái', async () => {
    const user = await makeUser();
    const p = await makeProduct(5);
    const order = await orderOf(user.id, p.id);

    await expect(lifecycle.transition(order.id, 'READY')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    const after = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(after.status).toBe('PENDING');
  });
});

describe('(b) Thanh toán idempotent', () => {
  it('5 request SONG SONG cùng Idempotency-Key chỉ tạo 1 payment, charge 1 lần', async () => {
    const user = await makeUser();
    const p = await makeProduct(5, 40000);
    const order = await orderOf(user.id, p.id);
    const charge = jest.fn().mockResolvedValue({ success: true, transactionRef: 'TX1' });

    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        payments.pay({
          userId: user.id,
          orderId: order.id,
          method: 'E_WALLET',
          idempotencyKey: 'key-1',
          charge,
        }),
      ),
    );

    expect(charge).toHaveBeenCalledTimes(1);
    expect(await prisma.payment.count({ where: { orderId: order.id } })).toBe(1);
    expect(new Set(results.map((r) => r.payment.id)).size).toBe(1);
    expect(results.every((r) => r.order.status === 'PAID')).toBe(true);
    expect(results.filter((r) => !r.replayed)).toHaveLength(1);

    // Điểm loyalty chỉ cộng 1 lần: 40.000đ / 10.000 = 4 điểm
    const u = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(u.loyaltyPoints).toBe(4);
  });

  it('gọi lại tuần tự cùng key vẫn trả kết quả cũ', async () => {
    const user = await makeUser();
    const p = await makeProduct(5);
    const order = await orderOf(user.id, p.id);
    const charge = jest.fn().mockResolvedValue({ success: true });
    const input = {
      userId: user.id,
      orderId: order.id,
      method: 'BANK_CARD' as const,
      idempotencyKey: 'key-2',
      charge,
    };
    const first = await payments.pay(input);
    const second = await payments.pay(input);

    expect(first.replayed).toBe(false);
    expect(second.replayed).toBe(true);
    expect(charge).toHaveBeenCalledTimes(1);
  });

  it('thiếu Idempotency-Key -> 400', async () => {
    const user = await makeUser();
    const p = await makeProduct(5);
    const order = await orderOf(user.id, p.id);
    await expect(
      payments.pay({
        userId: user.id,
        orderId: order.id,
        method: 'E_WALLET',
        idempotencyKey: '',
        charge: jest.fn(),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('thanh toán lỗi -> PAYMENT_FAILED, thử lại key mới -> PAID', async () => {
    const user = await makeUser();
    const p = await makeProduct(5);
    const order = await orderOf(user.id, p.id);
    const base = { userId: user.id, orderId: order.id, method: 'E_WALLET' as const };

    const fail = await payments.pay({
      ...base,
      idempotencyKey: 'k-fail',
      charge: async () => ({ success: false }),
    });
    expect(fail.order.status).toBe('PAYMENT_FAILED');
    expect(fail.payment.status).toBe('FAILED');

    const retry = await payments.pay({
      ...base,
      idempotencyKey: 'k-retry',
      charge: async () => ({ success: true, transactionRef: 'OK' }),
    });
    expect(retry.order.status).toBe('PAID');
  });
});

describe('(c) Tồn kho đồng thời', () => {
  it('stock = 5, 10 request đặt đồng thời -> đúng 5 thành công, 5 bị 409, stock = 0', async () => {
    const user = await makeUser();
    const p = await makeProduct(5);

    const results = await Promise.allSettled(
      Array.from({ length: 10 }, () => orderOf(user.id, p.id, 1)),
    );
    const ok = results.filter((r) => r.status === 'fulfilled');
    const failed = results.filter(
      (r): r is PromiseRejectedResult => r.status === 'rejected',
    );

    expect(ok).toHaveLength(5);
    expect(failed).toHaveLength(5);
    failed.forEach((r) => expect(r.reason).toBeInstanceOf(ConflictException));

    const after = await prisma.product.findUniqueOrThrow({ where: { id: p.id } });
    expect(after.stock).toBe(0);
    expect(await prisma.order.count()).toBe(5);
  });

  it('hủy đơn hoàn lại kho', async () => {
    const user = await makeUser();
    const p = await makeProduct(5);
    const order = await orderOf(user.id, p.id, 2);
    expect((await prisma.product.findUniqueOrThrow({ where: { id: p.id } })).stock).toBe(3);

    await lifecycle.transition(order.id, 'CANCELLED');
    expect((await prisma.product.findUniqueOrThrow({ where: { id: p.id } })).stock).toBe(5);
  });
});

describe('Khuyến mãi & loyalty', () => {
  const makeCoupon = (data: Partial<Parameters<typeof prisma.coupon.create>[0]['data']> = {}) =>
    prisma.coupon.create({
      data: {
        code: 'SALE10',
        discountPercent: 10,
        minOrderValue: 30000,
        ...data,
      },
    });

  it('áp mã giảm 10%', async () => {
    const user = await makeUser();
    const p = await makeProduct(5, 40000);
    await makeCoupon();
    const order = await orderOf(user.id, p.id, 1, 'SALE10');
    expect(Number(order.discountAmount)).toBe(4000);
    expect(Number(order.total)).toBe(36000);
  });

  it('từ chối mã hết hạn / đơn dưới mức tối thiểu / hết lượt', async () => {
    const user = await makeUser();
    const p = await makeProduct(10, 40000);
    const cheap = await makeProduct(10, 20000);

    await makeCoupon({ code: 'OLD', expiresAt: new Date(Date.now() - 1000) });
    await expect(orderOf(user.id, p.id, 1, 'OLD')).rejects.toBeInstanceOf(BadRequestException);

    await makeCoupon({ code: 'MIN' });
    await expect(orderOf(user.id, cheap.id, 1, 'MIN')).rejects.toBeInstanceOf(BadRequestException);

    await makeCoupon({ code: 'ONCE', usageLimit: 1 });
    await orderOf(user.id, p.id, 1, 'ONCE');
    await expect(orderOf(user.id, p.id, 1, 'ONCE')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('hủy đơn hoàn lượt coupon; hủy đơn đã PAID thu hồi điểm', async () => {
    const user = await makeUser();
    const p = await makeProduct(5, 40000);
    await makeCoupon({ code: 'ONCE', usageLimit: 1 });

    const order = await orderOf(user.id, p.id, 1, 'ONCE');
    await payments.pay({
      userId: user.id,
      orderId: order.id,
      method: 'E_WALLET',
      idempotencyKey: 'k-loyal',
      charge: async () => ({ success: true }),
    });
    // total 36.000đ -> 3 điểm
    expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).loyaltyPoints).toBe(3);

    await lifecycle.transition(order.id, 'CANCELLED');
    expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).loyaltyPoints).toBe(0);
    expect((await prisma.coupon.findUniqueOrThrow({ where: { code: 'ONCE' } })).usedCount).toBe(0);
  });
});
