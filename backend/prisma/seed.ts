import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const coupons = [
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

  const toppings = [
    { name: 'Trân châu đen', price: 5000 },
    { name: 'Trân châu trắng', price: 7000 },
    { name: 'Kem cheese (Kem)', price: 10000 },
    { name: 'Thạch cà phê', price: 6000 },
  ];

  for (const t of toppings) {
    const existing = await prisma.topping.findFirst({ where: { name: t.name } });
    if (!existing) {
      await prisma.topping.create({ data: t });
    }
  }

  const products = [
    {
      name: 'Cà phê sữa',
      description: 'Cà phê Robusta truyền thống kết hợp sữa đặc ngọt béo.',
      price: 35000,
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600',
      stock: 50,
      version: 0,
    },
    {
      name: 'Americano',
      description: 'Espresso pha loãng với nước tinh khiết, hương vị thanh nhẹ.',
      price: 40000,
      imageUrl: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=600',
      stock: 40,
      version: 0,
    },
    {
      name: 'Cappuccino',
      description: 'Espresso kết hợp sữa nóng và lớp bọt sữa mịn.',
      price: 45000,
      imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600',
      stock: 35,
      version: 0,
    },
    {
      name: 'Trà đào',
      description: 'Trà đen thanh mát kết hợp đào miếng tươi giòn.',
      price: 39000,
      imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600',
      stock: 60,
      version: 0,
    },
  ];

  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.product.create({ data: p });
    }
  }

  const defaultPasswordHash = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'; // 123456

  await prisma.user.upsert({
    where: { email: 'customer@brewlite.com' },
    update: {},
    create: {
      email: 'customer@brewlite.com',
      passwordHash: defaultPasswordHash,
      fullName: 'Nguyễn Văn Khách',
      phone: '0901234567',
      role: Role.CUSTOMER,
      loyaltyPoints: 100,
    },
  });

  await prisma.user.upsert({
    where: { email: 'barista@brewlite.com' },
    update: {},
    create: {
      email: 'barista@brewlite.com',
      passwordHash: defaultPasswordHash,
      fullName: 'Trần Thị Pha Chế',
      phone: '0908765432',
      role: Role.BARISTA,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
