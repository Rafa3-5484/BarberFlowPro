import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinancialService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    type: 'INCOME' | 'EXPENSE' | 'WITHDRAWAL';
    description: string;
    amount: number;
    paymentMethod?: string;
    dueDate?: string;
    paidDate?: string;
    status?: string;
    category?: string;
  }) {
    return this.prisma.financialRecord.create({
      data: {
        type: data.type as any,
        description: data.description,
        amount: data.amount,
        paymentMethod: data.paymentMethod as any || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        paidDate: data.paidDate ? new Date(data.paidDate) : null,
        status: (data.status as any) || 'PENDING',
        category: data.category,
      },
    });
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { page = 1, limit = 50, type, status, category, startDate, endDate } = params;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (type) where.type = type;
    if (status) where.status = status;
    if (category) where.category = category;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.financialRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.financialRecord.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const record = await this.prisma.financialRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Registro financeiro não encontrado');
    return record;
  }

  async update(id: string, data: any) {
    const record = await this.prisma.financialRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Registro financeiro não encontrado');

    const updateData: any = {};
    if (data.type !== undefined) updateData.type = data.type;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.paidDate !== undefined) updateData.paidDate = data.paidDate ? new Date(data.paidDate) : null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.category !== undefined) updateData.category = data.category;

    return this.prisma.financialRecord.update({ where: { id }, data: updateData });
  }

  async remove(id: string) {
    const record = await this.prisma.financialRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Registro financeiro não encontrado');

    return this.prisma.financialRecord.delete({ where: { id } });
  }

  async getSummary(params: { startDate?: string; endDate?: string }) {
    const { startDate, endDate } = params;
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const records = await this.prisma.financialRecord.findMany({ where });

    const totalIncome = records
      .filter(r => r.type === 'INCOME' && r.status === 'PAID')
      .reduce((sum, r) => sum + r.amount, 0);

    const totalExpenses = records
      .filter(r => r.type === 'EXPENSE' && r.status === 'PAID')
      .reduce((sum, r) => sum + r.amount, 0);

    const pendingIncome = records
      .filter(r => r.type === 'INCOME' && r.status === 'PENDING')
      .reduce((sum, r) => sum + r.amount, 0);

    const pendingExpenses = records
      .filter(r => r.type === 'EXPENSE' && r.status === 'PENDING')
      .reduce((sum, r) => sum + r.amount, 0);

    const balance = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      pendingIncome,
      pendingExpenses,
      balance,
      totalRecords: records.length,
    };
  }

  async getMonthlySummary(year: number) {
    const records = await this.prisma.financialRecord.findMany({
      where: {
        createdAt: {
          gte: new Date(year, 0, 1),
          lte: new Date(year, 11, 31, 23, 59, 59, 999),
        },
      },
    });

    const monthlyData: Record<number, { income: number; expense: number; balance: number }> = {};

    for (let i = 0; i < 12; i++) {
      monthlyData[i + 1] = { income: 0, expense: 0, balance: 0 };
    }

    for (const r of records) {
      const month = r.createdAt.getMonth() + 1;
      if (r.status === 'PAID') {
        if (r.type === 'INCOME') monthlyData[month].income += r.amount;
        else if (r.type === 'EXPENSE') monthlyData[month].expense += r.amount;
      }
    }

    for (let i = 1; i <= 12; i++) {
      monthlyData[i].balance = monthlyData[i].income - monthlyData[i].expense;
    }

    return Object.entries(monthlyData).map(([month, data]) => ({
      month: Number(month),
      ...data,
    }));
  }

  async getCategories() {
    const records = await this.prisma.financialRecord.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ['category'],
    });
    return records.map(r => r.category).filter(Boolean);
  }
}
