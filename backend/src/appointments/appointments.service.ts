import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    date: string;
    clientId: string;
    employeeId: string;
    serviceId: string;
    notes?: string;
  }) {
    const client = await this.prisma.client.findUnique({ where: { id: data.clientId } });
    if (!client) throw new NotFoundException('Cliente não encontrado');

    const employee = await this.prisma.employee.findUnique({ where: { id: data.employeeId } });
    if (!employee) throw new NotFoundException('Funcionário não encontrado');

    const service = await this.prisma.service.findUnique({ where: { id: data.serviceId } });
    if (!service) throw new NotFoundException('Serviço não encontrado');

    const appointmentDate = new Date(data.date);

    const hasConflict = await this.checkTimeConflict(
      data.employeeId,
      appointmentDate,
      service.duration,
    );

    if (hasConflict) {
      throw new BadRequestException('Funcionário já possui agendamento neste horário');
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        date: appointmentDate,
        clientId: data.clientId,
        employeeId: data.employeeId,
        serviceId: data.serviceId,
        totalValue: service.price,
        notes: data.notes,
      },
      include: {
        client: true,
        employee: true,
        service: true,
      },
    });

    await this.prisma.client.update({
      where: { id: data.clientId },
      data: {
        lastVisit: appointmentDate,
        nextAppointment: appointmentDate,
        totalVisits: { increment: 1 },
        totalSpent: { increment: service.price },
      },
    });

    return appointment;
  }

  private async checkTimeConflict(employeeId: string, date: Date, duration: number): Promise<boolean> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        employeeId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
      },
      include: { service: true },
    });

    const newStart = date.getTime();
    const newEnd = newStart + duration * 60000;

    for (const apt of appointments) {
      const aptStart = apt.date.getTime();
      const aptEnd = aptStart + apt.service.duration * 60000;

      if (newStart < aptEnd && newEnd > aptStart) {
        return true;
      }
    }

    return false;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
    employeeId?: string;
    clientId?: string;
  }) {
    const { page = 1, limit = 50, startDate, endDate, status, employeeId, clientId } = params;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (status) where.status = status;
    if (employeeId) where.employeeId = employeeId;
    if (clientId) where.clientId = clientId;

    const [data, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          client: { select: { id: true, name: true, phone: true } },
          employee: { select: { id: true, name: true } },
          service: { select: { id: true, name: true, price: true, duration: true } },
        },
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        client: true,
        employee: { include: { workSchedule: true } },
        service: true,
      },
    });
    if (!appointment) throw new NotFoundException('Agendamento não encontrado');
    return appointment;
  }

  async update(id: string, data: any) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appointment) throw new NotFoundException('Agendamento não encontrado');

    const updateData: any = {};

    if (data.date !== undefined) {
      const newDate = new Date(data.date);
      const service = await this.prisma.service.findUnique({
        where: { id: appointment.serviceId },
      });

      if (service) {
        const hasConflict = await this.checkTimeConflict(
          appointment.employeeId,
          newDate,
          service.duration,
        );
        if (hasConflict) throw new BadRequestException('Funcionário já possui agendamento neste horário');
      }

      updateData.date = newDate;
    }

    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.clientId !== undefined) updateData.clientId = data.clientId;
    if (data.employeeId !== undefined) updateData.employeeId = data.employeeId;
    if (data.serviceId !== undefined) {
      updateData.serviceId = data.serviceId;
      const service = await this.prisma.service.findUnique({ where: { id: data.serviceId } });
      if (service) updateData.totalValue = service.price;
    }

    return this.prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        employee: true,
        service: true,
      },
    });
  }

  async updateStatus(id: string, status: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { service: true, employee: true },
    });
    if (!appointment) throw new NotFoundException('Agendamento não encontrado');

    const validTransitions: Record<string, string[]> = {
      CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
      NO_SHOW: [],
    };

    const allowed = validTransitions[appointment.status];
    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `Transição de ${appointment.status} para ${status} não permitida`,
      );
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status: status as any },
      include: { client: true, employee: true, service: true },
    });

    if (status === 'COMPLETED' || status === 'NO_SHOW') {
      const client = await this.prisma.client.findUnique({ where: { id: appointment.clientId } });
      if (client && (!client.lastVisit || appointment.date > client.lastVisit)) {
        await this.prisma.client.update({
          where: { id: appointment.clientId },
          data: { lastVisit: appointment.date },
        });
      }
    }

    return updated;
  }

  async remove(id: string) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appointment) throw new NotFoundException('Agendamento não encontrado');

    return this.prisma.appointment.delete({ where: { id } });
  }

  async getByDate(date: string) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    return this.prisma.appointment.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
      include: {
        client: { select: { id: true, name: true, phone: true } },
        employee: { select: { id: true, name: true } },
        service: { select: { id: true, name: true, price: true, duration: true } },
      },
    });
  }

  async getByWeek(startDate: string) {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    start.setHours(0, 0, 0, 0);

    return this.prisma.appointment.findMany({
      where: {
        date: { gte: start, lte: end },
      },
      orderBy: { date: 'asc' },
      include: {
        client: { select: { id: true, name: true, phone: true } },
        employee: { select: { id: true, name: true } },
        service: { select: { id: true, name: true, price: true, duration: true } },
      },
    });
  }

  async getByMonth(year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    return this.prisma.appointment.findMany({
      where: {
        date: { gte: start, lte: end },
      },
      orderBy: { date: 'asc' },
      include: {
        client: { select: { id: true, name: true, phone: true } },
        employee: { select: { id: true, name: true } },
        service: { select: { id: true, name: true, price: true, duration: true } },
      },
    });
  }

  async getCalendar(year: number, month: number) {
    const appointments = await this.getByMonth(year, month);

    const calendar: Record<string, any[]> = {};
    for (const apt of appointments) {
      const dateKey = apt.date.toISOString().split('T')[0];
      if (!calendar[dateKey]) calendar[dateKey] = [];
      calendar[dateKey].push(apt);
    }

    return calendar;
  }

  async getUpcoming(limit = 10) {
    return this.prisma.appointment.findMany({
      where: {
        date: { gte: new Date() },
        status: { in: ['CONFIRMED'] },
      },
      orderBy: { date: 'asc' },
      take: limit,
      include: {
        client: { select: { id: true, name: true, phone: true } },
        employee: { select: { id: true, name: true } },
        service: { select: { id: true, name: true, price: true, duration: true } },
      },
    });
  }

  async getToday() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return this.prisma.appointment.findMany({
      where: { date: { gte: start, lte: end } },
      orderBy: { date: 'asc' },
      include: {
        client: { select: { id: true, name: true, phone: true } },
        employee: { select: { id: true, name: true } },
        service: { select: { id: true, name: true, price: true, duration: true } },
      },
    });
  }
}
