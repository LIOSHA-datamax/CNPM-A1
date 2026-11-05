import { PrismaClient, Role, OrderStatus, ProductSize, PaymentMethod, PaymentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Coupons
  const coupons = [
    {
      code: 'CHAOBANMOI',
      discountPercent: 10,
      minOrderValue: 40000,
      usageLimit: 100,
      isActive: true,
      expiresAt: new Date('2027-12-31'),
    },
    {
      code: 'BREWNEW',
      discountPercent: 20,
      maxDiscount: 30000,
      minOrderValue: 50000,
      usageLimit: 100,
      isActive: true,
      expiresAt: new Date('2027-12-31'),
    },
    {
      code: 'GIAM10K',
      discountAmount: 10000,
      minOrderValue: 40000,
      usageLimit: 50,
      isActive: true,
      expiresAt: new Date('2027-12-31'),
    },
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
  }

  // 2. Toppings đa dạng, sát thực tế quán cà phê & trà hiện đại
  const toppingsData = [
    { name: 'Trân châu đen', price: 5000 },
    { name: 'Trân châu trắng', price: 7000 },
    { name: 'Kem cheese (Kem)', price: 10000 },
    { name: 'Thạch cà phê', price: 6000 },
    { name: 'Đào miếng', price: 10000 },
    { name: 'Shot Espresso', price: 10000 },
    { name: 'Sữa đặc thêm', price: 5000 },
    { name: 'Sữa tươi yến mạch (Oat Milk)', price: 10000 },
    { name: 'Sốt Caramel', price: 8000 },
    { name: 'Bột Cacao', price: 5000 },
    { name: 'Thạch trái cây nhiệt đới', price: 8000 },
    { name: 'Hạt chia thanh mát', price: 7000 },
    { name: 'Cam vàng tươi cắt lát', price: 6000 },
    { name: 'Đậu đỏ bùi ngọt', price: 8000 },
  ];

  const toppings = [];
  for (const t of toppingsData) {
    let top = await prisma.topping.findFirst({ where: { name: t.name } });
    if (!top) {
      top = await prisma.topping.create({ data: t });
    }
    toppings.push(top);
  }

  // 3. Products
  const productsData = [
    {
      name: 'Cà phê sữa',
      description: 'Cà phê Robusta truyền thống kết hợp sữa đặc ngọt béo đậm đà.',
      price: 35000,
      imageUrl: '/images/ca-phe-sua.jpg',
      stock: 50,
      version: 0,
    },
    {
      name: 'Americano',
      description: 'Espresso pha loãng với nước tinh khiết, hương vị thanh nhẹ thơm nồng.',
      price: 40000,
      imageUrl: '/images/americano.jpg',
      stock: 40,
      version: 0,
    },
    {
      name: 'Cappuccino',
      description: 'Espresso kết hợp sữa nóng và lớp bọt sữa béo mịn nghệ thuật.',
      price: 45000,
      imageUrl: '/images/cappuccino.jpg',
      stock: 35,
      version: 0,
    },
    {
      name: 'Trà đào',
      description: 'Trà đen thanh mát kết hợp đào miếng tươi giòn ngọt ngào.',
      price: 39000,
      imageUrl: '/images/tra-dao.jpg',
      stock: 60,
      version: 0,
    },
    {
      name: 'Cold Brew',
      description: 'Cà phê ủ lạnh 16 tiếng hương vị êm dịu, mượt mà thanh mát tự nhiên.',
      price: 45000,
      imageUrl: '/images/cold-brew.jpg',
      stock: 50,
      version: 0,
    },
    {
      name: 'Matcha Latte',
      description: 'Trà xanh Uji Nhật Bản thượng hạng hòa quyện sữa tươi béo ngậy thơm lừng.',
      price: 48000,
      imageUrl: '/images/matcha-latte.jpg',
      stock: 45,
      version: 0,
    },
  ];

  const products = [];
  for (const p of productsData) {
    let prod = await prisma.product.findFirst({ where: { name: p.name } });
    if (!prod) {
      prod = await prisma.product.create({ data: p });
    } else {
      prod = await prisma.product.update({
        where: { id: prod.id },
        data: {
          imageUrl: p.imageUrl,
          description: p.description,
          price: p.price,
        },
      });
    }
    products.push(prod);
  }

  // 4. Users (Password: 123456)
  const defaultPasswordHash = await bcrypt.hash('123456', 10);

  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@brewlite.com' },
    update: {
      passwordHash: defaultPasswordHash,
    },
    create: {
      email: 'customer@brewlite.com',
      passwordHash: defaultPasswordHash,
      fullName: 'Nguyễn Văn Khách',
      phone: '0901234567',
      role: Role.CUSTOMER,
      loyaltyPoints: 120,
    },
  });

  await prisma.user.upsert({
    where: { email: 'lan@brewlite.com' },
    update: {
      passwordHash: defaultPasswordHash,
      fullName: 'lan',
      phone: '0909574525',
    },
    create: {
      id: 'b6f56a5f-6c9f-46de-9091-d55dc9aee5b7',
      email: 'lan@brewlite.com',
      passwordHash: defaultPasswordHash,
      fullName: 'lan',
      phone: '0909574525',
      role: Role.CUSTOMER,
      loyaltyPoints: 10,
    },
  });

  await prisma.user.upsert({
    where: { email: 'barista@brewlite.com' },
    update: {
      passwordHash: defaultPasswordHash,
      fullName: 'Nguyễn Văn A',
    },
    create: {
      email: 'barista@brewlite.com',
      passwordHash: defaultPasswordHash,
      fullName: 'Nguyễn Văn A',
      phone: '0908765432',
      role: Role.BARISTA,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@brewlite.com' },
    update: {
      passwordHash: defaultPasswordHash,
      fullName: 'Quản trị viên',
    },
    create: {
      email: 'admin@brewlite.com',
      passwordHash: defaultPasswordHash,
      fullName: 'Quản trị viên',
      phone: '0909999999',
      role: Role.ADMIN,
    },
  });

  // 5. Seed sample orders for Task 9 (Order History GET /orders/me demo)
  const existingOrder = await prisma.order.findFirst({
    where: { userId: customerUser.id },
  });

  if (!existingOrder) {
    // Order 1: PAID (Cappuccino + Topping)
    await prisma.order.create({
      data: {
        orderNumber: 'BL-1042',
        userId: customerUser.id,
        status: OrderStatus.PAID,
        subtotal: 55000,
        discountAmount: 10000,
        total: 45000,
        orderItems: {
          create: [
            {
              productId: products[2].id, // Cappuccino
              size: ProductSize.M,
              basePrice: 45000,
              qty: 1,
              lineTotal: 55000,
              toppings: {
                create: [
                  {
                    toppingId: toppings[2].id, // Kem cheese
                    price: 10000,
                  },
                ],
              },
            },
          ],
        },
        payments: {
          create: {
            idempotencyKey: 'idem-seed-1042',
            amount: 45000,
            method: PaymentMethod.E_WALLET,
            status: PaymentStatus.SUCCESS,
            transactionRef: 'MOMO-PAY-20261026-1042',
          },
        },
      },
    });

    // Order 2: PREPARING (Cà phê sữa + Trà đào)
    await prisma.order.create({
      data: {
        orderNumber: 'BL-1038',
        userId: customerUser.id,
        status: OrderStatus.PREPARING,
        subtotal: 123000,
        discountAmount: 0,
        total: 123000,
        orderItems: {
          create: [
            {
              productId: products[0].id, // Cà phê sữa
              size: ProductSize.M,
              basePrice: 35000,
              qty: 1,
              lineTotal: 40000,
              toppings: {
                create: [
                  {
                    toppingId: toppings[0].id, // Trân châu đen
                    price: 5000,
                  },
                ],
              },
            },
            {
              productId: products[3].id, // Trà đào
              size: ProductSize.L,
              basePrice: 39000,
              qty: 2,
              lineTotal: 83000,
              toppings: {
                create: [
                  {
                    toppingId: toppings[1].id, // Trân châu trắng
                    price: 7000,
                  },
                ],
              },
            },
          ],
        },
        payments: {
          create: {
            idempotencyKey: 'idem-seed-1038',
            amount: 123000,
            method: PaymentMethod.BANK_CARD,
            status: PaymentStatus.SUCCESS,
            transactionRef: 'VNPAY-20261026-1038',
          },
        },
      },
    });

    // Order 3: COMPLETED
    await prisma.order.create({
      data: {
        orderNumber: 'BL-1025',
        userId: customerUser.id,
        status: OrderStatus.COMPLETED,
        subtotal: 40000,
        discountAmount: 0,
        total: 40000,
        orderItems: {
          create: [
            {
              productId: products[1].id, // Americano
              size: ProductSize.M,
              basePrice: 40000,
              qty: 1,
              lineTotal: 40000,
            },
          ],
        },
        payments: {
          create: {
            idempotencyKey: 'idem-seed-1025',
            amount: 40000,
            method: PaymentMethod.E_WALLET,
            status: PaymentStatus.SUCCESS,
            transactionRef: 'MOMO-PAY-20261025-1025',
          },
        },
      },
    });

    console.log('Seeded 3 sample orders for customer@brewlite.com (BL-1042, BL-1038, BL-1025)');
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
