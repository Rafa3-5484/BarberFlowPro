import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    phone?: string;
    cpf?: string;
    role?: string;
    commission?: number;
    workStartTime?: string;
    workEndTime?: string;
    workDays?: string;
  }) {
    if (data.cpf) {
      const existing = await this.prisma.employee.findUnique({ where: { cpf: data.cpf } });
      if (existing) throw new BadRequestException('CPF já cadastrado');
    }

    return this.prisma.employee.create({ data });
  }

  async findAll(active?: string) {
    const where: any = {};
    if (active !== undefined) where.active = active === 'true';

    return this.prisma.employee.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { appointments: true } },
        employeeServices: { include: { service: true } },
        workSchedule: { orderBy: { dayOfWeek: 'asc' } },
      },
    });
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        employeeServices: { include: { service: true } },
        workSchedule: { orderBy: { dayOfWeek: 'asc' } },
        appointments: {
          include: { client: true, service: true },
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });
    if (!employee) throw new NotFoundException('Funcionário não encontrado');
    return employee;
  }

  async update(id: string, data: any) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) throw new NotFoundException('Funcionário não encontrado');

    if (data.cpf) {
      const existing = await this.prisma.employee.findFirst({
        where: { cpf: data.cpf, id: { not: id } },
      });
      if (existing) throw new BadRequestException('CPF já está em uso');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.cpf !== undefined) updateData.cpf = data.cpf;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.commission !== undefined) updateData.commission = data.commission;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.workStartTime !== undefined) updateData.workStartTime = data.workStartTime;
    if (data.workEndTime !== undefined) updateData.workEndTime = data.workEndTime;
    if (data.workDays !== undefined) updateData.workDays = data.workDays;

    return this.prisma.employee.update({ where: { id }, data: updateData });
  }

  async remove(id: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) throw new NotFoundException('Funcionário não encontrado');

    const appointmentsCount = await this.prisma.appointment.count({ where: { employeeId: id } });
    if (appointmentsCount > 0) {
      throw new BadRequestException('Não é possível excluir funcionário com agendamentos');
    }

    await this.prisma.employeeService.deleteMany({ where: { employeeId: id } });
    await this.prisma.workSchedule.deleteMany({ where: { employeeId: id } });
    return this.prisma.employee.delete({ where: { id } });
  }

  async assignServices(employeeId: string, serviceIds: string[]) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Funcionário não encontrado');

    await this.prisma.employeeService.deleteMany({ where: { employeeId } });

    if (serviceIds.length > 0) {
      const data = serviceIds.map(serviceId => ({ employeeId, serviceId }));
      await this.prisma.employeeService.createMany({ data });
    }

    return this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { employeeServices: { include: { service: true } } },
    });
  }

  async updateSchedule(employeeId: string, schedule: { dayOfWeek: number; startTime: string; endTime: string; active?: boolean }[]) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Funcionário não encontrado');

    await this.prisma.workSchedule.deleteMany({ where: { employeeId } });

    if (schedule.length > 0) {
      const data = schedule.map(s => ({
        employeeId,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        active: s.active ?? true,
      }));
      await this.prisma.workSchedule.createMany({ data });
    }

    return this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { workSchedule: { orderBy: { dayOfWeek: 'asc' } } },
    });
  }

  async getCommissionRanking(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const records = await this.prisma.commissionRecord.findMany({
      where,
      include: { employee: true },
    });

    const ranking: Record<string, { name: string; totalCommission: number; totalServices: number }> = {};
    for (const r of records) {
      if (!ranking[r.employeeId]) {
        ranking[r.employeeId] = { name: r.employee.name, totalCommission: 0, totalServices: 0 };
      }
      ranking[r.employeeId].totalCommission += r.commissionValue;
      ranking[r.employeeId].totalServices++;
    }

    return Object.entries(ranking)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.totalCommission - a.totalCommission);
  }

  async checkAvailability(employeeId: string, date: Date, duration: number) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Funcionário não encontrado');

    const dayOfWeek = date.getDay();
    const schedules = await this.prisma.workSchedule.findMany({
      where: { employeeId, dayOfWeek, active: true },
    });

    if (schedules.length === 0) {
      return { available: false, reason: 'Funcionário não trabalha neste dia' };
    }

    const appointments = await this.prisma.appointment.findMany({
      where: {
        employeeId,
        date: {
          gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
          lte: new Date(new Date(date).setHours(23, 59, 59, 999)),
        },
        status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
      },
      include: { service: true },
    });

    const appointmentStart = date.getTime();
    const appointmentEnd = appointmentStart + duration * 60000;

    for (const apt of appointments) {
      const aptStart = apt.date.getTime();
      const aptEnd = aptStart + apt.service.duration * 60000;

      if (appointmentStart < aptEnd && appointmentEnd > aptStart) {
        return {
          available: false,
          reason: 'Funcionário já possui agendamento neste horário',
          conflictingAppointment: apt,
        };
      }
    }

    return { available: true };
  }
}
