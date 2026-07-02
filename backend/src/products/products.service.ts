import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    description?: string;
    price: number;
    cost?: number;
    stock?: number;
    minStock?: number;
    category?: string;
  }) {
    return this.prisma.product.create({ data });
  }

  async findAll(category?: string, active?: string, lowStock?: string) {
    const where: any = {};
    if (category) where.category = category;
    if (active !== undefined) where.active = active === 'true';
    if (lowStock === 'true') {
      where.stock = { lte: this.prisma.product.fields.minStock };
    }

    return this.prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { _count: { select: { stockMovements: true } } },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        stockMovements: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!product) throw new NotFoundException('Produto não encontrado');
    return product;
  }

  async update(id: string, data: any) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Produto não encontrado');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.cost !== undefined) updateData.cost = data.cost;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.minStock !== undefined) updateData.minStock = data.minStock;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.active !== undefined) updateData.active = data.active;

    return this.prisma.product.update({ where: { id }, data: updateData });
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Produto não encontrado');

    return this.prisma.product.delete({ where: { id } });
  }

  async adjustStock(id: string, type: 'IN' | 'OUT', quantity: number, notes?: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Produto não encontrado');

    if (type === 'OUT' && product.stock < quantity) {
      throw new BadRequestException('Estoque insuficiente');
    }

    const stockChange = type === 'IN' ? quantity : -quantity;

    await this.prisma.product.update({
      where: { id },
      data: { stock: { increment: stockChange } },
    });

    await this.prisma.stockMovement.create({
      data: {
        productId: id,
        type,
        quantity,
        notes,
      },
    });

    return this.prisma.product.findUnique({
      where: { id },
      include: { stockMovements: { orderBy: { createdAt: 'desc' }, take: 5 } },
    });
  }

  async getLowStock() {
    return this.prisma.product.findMany({
      where: {
        active: true,
        stock: { lte: this.prisma.product.fields.minStock },
      },
      orderBy: { stock: 'asc' },
    });
  }

  async getCategories() {
    const products = await this.prisma.product.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ['category'],
    });
    return products.map(p => p.category).filter(Boolean);
  }

  async getTopSelling(startDate?: Date, endDate?: Date, limit = 10) {
    const movements = await this.prisma.stockMovement.findMany({
      where: {
        type: 'OUT',
        ...(startDate || endDate ? {
          createdAt: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        } : {}),
      },
      include: { product: true },
    });

    const productCount: Record<string, { name: string; totalOut: number }> = {};
    for (const m of movements) {
      if (!productCount[m.productId]) {
        productCount[m.productId] = { name: m.product.name, totalOut: 0 };
      }
      productCount[m.productId].totalOut += m.quantity;
    }

    return Object.entries(productCount)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.totalOut - a.totalOut)
      .slice(0, limit);
  }
}
