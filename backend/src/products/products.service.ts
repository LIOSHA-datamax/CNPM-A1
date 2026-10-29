import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private inferCategory(name: string, description?: string | null): string {
    const lowerName = name.toLowerCase();
    const lowerDesc = (description || '').toLowerCase();
    if (lowerName.includes('trà')) {
      return 'Trà hoa quả';
    }
    if (lowerName.includes('sữa') || lowerDesc.includes('truyền thống')) {
      return 'Cà phê truyền thống';
    }
    return 'Cà phê Espresso';
  }

  async findAll(search?: string) {
    const trimmed = search?.trim();
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        ...(trimmed
          ? {
              OR: [
                { name: { contains: trimmed, mode: 'insensitive' } },
                { description: { contains: trimmed, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'asc' },
    });

    return products.map((product) => ({
      ...product,
      price: Number(product.price),
      category:
        (product as any).category ||
        this.inferCategory(product.name, product.description),
    }));
  }

  async findAllToppings() {
    const toppings = await this.prisma.topping.findMany({
      where: { isAvailable: true },
      orderBy: { price: 'asc' },
    });

    return toppings.map((topping) => ({
      ...topping,
      price: Number(topping.price),
    }));
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    const toppings = await this.findAllToppings();

    return {
      ...product,
      price: Number(product.price),
      category:
        (product as any).category ||
        this.inferCategory(product.name, product.description),
      toppings,
    };
  }
}
