import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    description?: string;
    price: number;
    duration: number;
    category?: string;
  }) {
    const existing = await this.prisma.service.findFirst({
      where: { name: { equals: data.name, mode: 'insensitive' } },
    });
    if (existing) {
      throw new BadRequestException('Já existe um serviço com este nome');
    }

    return this.prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        duration: data.duration,
        category: data.category,
      },
    });
  }

  async findAll(category?: string, active?: string) {
    const where: any = {};
    if (category) where.category = category;
    if (active !== undefined) where.active = active === 'true';

    return this.prisma.service.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { appointments: true } },
        employeeServices: { include: { employee: true } },
      },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        _count: { select: { appointments: true } },
        employeeServices: { include: { employee: { select: { id: true, name: true } } } },
      },
    });
    if (!service) throw new NotFoundException('Serviço não encontrado');
    return service;
  }

  async update(id: string, data: any) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Serviço não encontrado');

    if (data.name) {
      const existing = await this.prisma.service.findFirst({
        where: { name: { equals: data.name, mode: 'insensitive' }, id: { not: id } },
      });
      if (existing) throw new BadRequestException('Nome já está em uso por outro serviço');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.active !== undefined) updateData.active = data.active;

    return this.prisma.service.update({ where: { id }, data: updateData });
  }

  async remove(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Serviço não encontrado');

    const appointmentsCount = await this.prisma.appointment.count({ where: { serviceId: id } });
    if (appointmentsCount > 0) {
      throw new BadRequestException('Não é possível excluir serviço com agendamentos');
    }

    await this.prisma.employeeService.deleteMany({ where: { serviceId: id } });
    return this.prisma.service.delete({ where: { id } });
  }

  async getCategories() {
    const services = await this.prisma.service.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ['category'],
    });
    return services.map(s => s.category).filter(Boolean);
  }

  async getTopServices(startDate?: Date, endDate?: Date, limit = 10) {
    const where: any = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const appointments = await this.prisma.appointment.findMany({
      where,
      include: { service: true },
    });

    const serviceCount: Record<string, { name: string; count: number; total: number }> = {};
    for (const apt of appointments) {
      if (!serviceCount[apt.serviceId]) {
        serviceCount[apt.serviceId] = { name: apt.service.name, count: 0, total: 0 };
      }
      serviceCount[apt.serviceId].count++;
      serviceCount[apt.serviceId].total += apt.totalValue;
    }

    return Object.entries(serviceCount)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}
