import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    photo?: string;
    birthDate?: string;
    birthDateStr?: string;
    notes?: string;
  }) {
    const existing = data.email ? await this.prisma.client.findFirst({ where: { email: data.email } }) : null;
    if (existing) {
      throw new BadRequestException('Já existe um cliente com este email');
    }

    const createData: any = { name: data.name };

    if (data.phone) createData.phone = data.phone;
    if (data.whatsapp) createData.whatsapp = data.whatsapp;
    if (data.email) createData.email = data.email;
    if (data.photo) createData.photo = data.photo;
    if (data.birthDate) createData.birthDate = new Date(data.birthDate);
    if (data.birthDateStr) createData.birthDateStr = data.birthDateStr;
    if (data.notes) createData.notes = data.notes;

    return this.prisma.client.create({ data: createData });
  }

  async findAll(page = 1, limit = 50, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: { _count: { select: { appointments: true } } },
      }),
      this.prisma.client.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        appointments: {
          include: { service: true, employee: true },
          orderBy: { date: 'desc' },
          take: 20,
        },
        favoriteServices: { include: { service: true } },
      },
    });
    if (!client) throw new NotFoundException('Cliente não encontrado');
    return client;
  }

  async update(id: string, data: any) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException('Cliente não encontrado');

    if (data.email) {
      const existing = await this.prisma.client.findFirst({
        where: { email: data.email, id: { not: id } },
      });
      if (existing) throw new BadRequestException('Email já está em uso por outro cliente');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.photo !== undefined) updateData.photo = data.photo;
    if (data.birthDate !== undefined) updateData.birthDate = data.birthDate ? new Date(data.birthDate) : null;
    if (data.birthDateStr !== undefined) updateData.birthDateStr = data.birthDateStr;
    if (data.notes !== undefined) updateData.notes = data.notes;

    return this.prisma.client.update({ where: { id }, data: updateData });
  }

  async remove(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException('Cliente não encontrado');

    const appointmentsCount = await this.prisma.appointment.count({ where: { clientId: id } });
    if (appointmentsCount > 0) {
      throw new BadRequestException('Não é possível excluir cliente com agendamentos');
    }

    await this.prisma.favoriteService.deleteMany({ where: { clientId: id } });
    return this.prisma.client.delete({ where: { id } });
  }

  async search(query: string) {
    return this.prisma.client.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { name: 'asc' },
    });
  }

  async getTopClients(limit = 10) {
    return this.prisma.client.findMany({
      orderBy: { totalSpent: 'desc' },
      take: limit,
      include: { _count: { select: { appointments: true } } },
    });
  }

  async getNewVsRecurring(startDate: Date, endDate: Date) {
    const clients = await this.prisma.client.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
    });

    const newClients = clients.filter(c => c.totalVisits <= 1).length;
    const recurringClients = clients.filter(c => c.totalVisits > 1).length;

    return { newClients, recurringClients };
  }

  async exportCSV() {
    const clients = await this.prisma.client.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { appointments: true } } },
    });

    const header = 'Nome;Telefone;Email;Total de Visitas;Total Gasto;Data de Cadastro\n';
    const rows = clients.map(c =>
      `${c.name};${c.phone || ''};${c.email || ''};${c.totalVisits};${c.totalSpent};${c.createdAt.toISOString()}`
    ).join('\n');

    return header + rows;
  }
}
