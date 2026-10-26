import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Task 2: GET /products
   * Lấy danh sách sản phẩm (menu cà phê kèm topping)
   */
  async findAll() {
    const [products, toppings] = await Promise.all([
      this.prisma.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.topping.findMany({
        where: { isAvailable: true },
      }),
    ]);

    return {
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        imageUrl: p.imageUrl,
        stock: p.stock,
        version: p.version,
      })),
      toppings: toppings.map((t) => ({
        id: t.id,
        name: t.name,
        price: Number(t.price),
      })),
    };
  }

  /**
   * Lấy chi tiết 1 sản phẩm
   */
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm có id: ${id}`);
    }

    const toppings = await this.prisma.topping.findMany({
      where: { isAvailable: true },
    });

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      imageUrl: product.imageUrl,
      stock: product.stock,
      version: product.version,
      availableToppings: toppings.map((t) => ({
        id: t.id,
        name: t.name,
        price: Number(t.price),
      })),
    };
  }
}
