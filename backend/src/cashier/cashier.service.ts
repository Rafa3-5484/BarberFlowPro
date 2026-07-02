import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CashierService {
  constructor(private prisma: PrismaService) {}

  async openRegister(userId: string, initialAmount: number, notes?: string) {
    const openRegister = await this.prisma.cashRegister.findFirst({
      where: { status: 'OPEN' },
    });
    if (openRegister) {
      throw new BadRequestException('Já existe um caixa aberto');
    }

    return this.prisma.cashRegister.create({
      data: {
        userId,
        initialAmount,
        notes,
      },
    });
  }

  async closeRegister(id: string, finalAmount: number, notes?: string) {
    const register = await this.prisma.cashRegister.findUnique({
      where: { id },
      include: { movements: true },
    });
    if (!register) throw new NotFoundException('Caixa não encontrado');
    if (register.status === 'CLOSED') {
      throw new BadRequestException('Caixa já está fechado');
    }

    return this.prisma.cashRegister.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closeDate: new Date(),
        finalAmount,
        notes: notes ? `${register.notes || ''}\n${notes}` : register.notes,
      },
    });
  }

  async getCurrentRegister() {
    const register = await this.prisma.cashRegister.findFirst({
      where: { status: 'OPEN' },
      include: {
        movements: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, name: true } } },
        },
        user: { select: { id: true, name: true } },
      },
    });
    return register;
  }

  async getRegisterHistory(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.cashRegister.findMany({
        skip,
        take: limit,
        orderBy: { openDate: 'desc' },
        include: {
          user: { select: { id: true, name: true } },
          _count: { select: { movements: true } },
        },
      }),
      this.prisma.cashRegister.count(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async addMovement(data: {
    cashRegisterId: string;
    type: 'INCOME' | 'EXPENSE' | 'WITHDRAWAL';
    description: string;
    amount: number;
    paymentMethod?: string;
    userId: string;
  }) {
    const register = await this.prisma.cashRegister.findUnique({
      where: { id: data.cashRegisterId },
    });
    if (!register) throw new NotFoundException('Caixa não encontrado');
    if (register.status === 'CLOSED') {
      throw new BadRequestException('Caixa está fechado');
    }

    return this.prisma.cashMovement.create({
      data: {
        cashRegisterId: data.cashRegisterId,
        type: data.type as any,
        description: data.description,
        amount: data.amount,
        paymentMethod: data.paymentMethod as any || null,
        userId: data.userId,
      },
      include: { user: { select: { id: true, name: true } } },
    });
  }

  async getMovements(cashRegisterId?: string, page = 1, limit = 50) {
    const where: any = {};
    if (cashRegisterId) where.cashRegisterId = cashRegisterId;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.cashMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true } },
          cashRegister: { select: { id: true, status: true } },
        },
      }),
      this.prisma.cashMovement.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getDaySummary(date?: string) {
    const startDate = date ? new Date(date) : new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        status: 'COMPLETED',
      },
    });

    const totalReceived = appointments.reduce((sum, a) => sum + a.totalValue, 0);

    const cashiers = await this.prisma.cashier.findFirst({
      where: {
        date: { gte: startDate, lte: endDate },
      },
    });

    return {
      date: startDate.toISOString().split('T')[0],
      totalAppointments: appointments.length,
      totalReceived,
      cashier: cashiers,
    };
  }

  // Cashier (daily summary table) operations
  async openCashier(userId: string) {
    const existing = await this.prisma.cashier.findFirst({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    });
    if (existing) {
      throw new BadRequestException('Já existe um caixa aberto para hoje');
    }

    return this.prisma.cashier.create({
      data: {
        openTime: new Date(),
        status: 'OPEN',
      },
    });
  }

  async closeCashier(id: string, notes?: string) {
    const cashier = await this.prisma.cashier.findUnique({ where: { id } });
    if (!cashier) throw new NotFoundException('Caixa não encontrado');

    const appointments = await this.prisma.appointment.findMany({
      where: {
        cashierId: id,
        status: 'COMPLETED',
      },
    });

    const totalReceived = appointments.reduce((sum, a) => sum + a.totalValue, 0);
    const totalCash = 0;
    const totalPix = 0;
    const totalCard = 0;

    return this.prisma.cashier.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closeTime: new Date(),
        totalReceived,
        totalCash,
        totalPix,
        totalCard,
        finalBalance: totalReceived,
        notes,
      },
    });
  }

  async getTodayCashier() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return this.prisma.cashier.findFirst({
      where: {
        date: { gte: start, lte: end },
      },
      include: {
        appointments: {
          include: {
            client: { select: { id: true, name: true } },
            service: true,
            employee: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async getCashierHistory(page = 1, limit = 30) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.cashier.findMany({
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.cashier.count(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async linkAppointmentToCashier(appointmentId: string, cashierId: string) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment) throw new NotFoundException('Agendamento não encontrado');

    const cashier = await this.prisma.cashier.findUnique({ where: { id: cashierId } });
    if (!cashier) throw new NotFoundException('Caixa não encontrado');

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { cashierId },
    });
  }
}
