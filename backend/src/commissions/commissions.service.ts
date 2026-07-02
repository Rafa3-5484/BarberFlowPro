import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommissionsService {
  constructor(private prisma: PrismaService) {}

  async calculateCommission(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { employee: true, service: true },
    });
    if (!appointment) throw new NotFoundException('Agendamento não encontrado');

    if (appointment.status !== 'COMPLETED') {
      return null;
    }

    const commissionPercent = appointment.employee.commission;
    const commissionValue = (appointment.totalValue * commissionPercent) / 100;

    const existing = await this.prisma.commissionRecord.findUnique({
      where: { appointmentId },
    });

    if (existing) {
      return this.prisma.commissionRecord.update({
        where: { appointmentId },
        data: {
          serviceValue: appointment.totalValue,
          commissionPercent,
          commissionValue,
        },
        include: { employee: { select: { id: true, name: true } } },
      });
    }

    return this.prisma.commissionRecord.create({
      data: {
        employeeId: appointment.employeeId,
        appointmentId: appointment.id,
        serviceValue: appointment.totalValue,
        commissionPercent,
        commissionValue,
        date: appointment.date,
      },
      include: { employee: { select: { id: true, name: true } } },
    });
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    employeeId?: string;
    startDate?: string;
    endDate?: string;
    paid?: string;
  }) {
    const { page = 1, limit = 50, employeeId, startDate, endDate, paid } = params;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (employeeId) where.employeeId = employeeId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (paid !== undefined) where.paid = paid === 'true';

    const [data, total] = await Promise.all([
      this.prisma.commissionRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          employee: { select: { id: true, name: true } },
          appointment: {
            include: {
              client: { select: { id: true, name: true } },
              service: { select: { id: true, name: true } },
            },
          },
        },
      }),
      this.prisma.commissionRecord.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const record = await this.prisma.commissionRecord.findUnique({
      where: { id },
      include: {
        employee: { select: { id: true, name: true, commission: true } },
        appointment: {
          include: {
            client: { select: { id: true, name: true } },
            service: true,
          },
        },
      },
    });
    if (!record) throw new NotFoundException('Comissão não encontrada');
    return record;
  }

  async markAsPaid(id: string) {
    const record = await this.prisma.commissionRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Comissão não encontrada');

    return this.prisma.commissionRecord.update({
      where: { id },
      data: { paid: true, paidDate: new Date() },
      include: { employee: { select: { id: true, name: true } } },
    });
  }

  async markAsUnpaid(id: string) {
    const record = await this.prisma.commissionRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Comissão não encontrada');

    return this.prisma.commissionRecord.update({
      where: { id },
      data: { paid: false, paidDate: null },
      include: { employee: { select: { id: true, name: true } } },
    });
  }

  async getSummary(params: { employeeId?: string; startDate?: string; endDate?: string }) {
    const { employeeId, startDate, endDate } = params;
    const where: any = {};

    if (employeeId) where.employeeId = employeeId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const records = await this.prisma.commissionRecord.findMany({
      where,
      include: { employee: { select: { id: true, name: true } } },
    });

    const totalCommission = records.reduce((sum, r) => sum + r.commissionValue, 0);
    const totalPaid = records.filter(r => r.paid).reduce((sum, r) => sum + r.commissionValue, 0);
    const totalPending = totalCommission - totalPaid;

    return {
      totalCommission,
      totalPaid,
      totalPending,
      totalRecords: records.length,
    };
  }

  async getByEmployee(employeeId: string, startDate?: string, endDate?: string) {
    const where: any = { employeeId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const records = await this.prisma.commissionRecord.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        appointment: {
          include: {
            client: { select: { id: true, name: true } },
            service: true,
          },
        },
      },
    });

    const total = records.reduce((sum, r) => sum + r.commissionValue, 0);
    const paid = records.filter(r => r.paid).reduce((sum, r) => sum + r.commissionValue, 0);

    return { records, total, paid, pending: total - paid };
  }
}
