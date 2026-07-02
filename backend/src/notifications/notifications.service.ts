import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    title: string;
    message: string;
    type?: string;
    userId?: string;
  }) {
    return this.prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type || 'INFO',
        userId: data.userId || null,
      },
    });
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    userId?: string;
    read?: string;
    type?: string;
  }) {
    const { page = 1, limit = 50, userId, read, type } = params;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (userId) where.userId = userId;
    if (read !== undefined) where.read = read === 'true';
    if (type) where.type = type;

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Notificação não encontrada');
    return notification;
  }

  async markAsRead(id: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Notificação não encontrada');

    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { message: 'Todas as notificações foram marcadas como lidas' };
  }

  async getUnreadCount(userId?: string) {
    const where: any = { read: false };
    if (userId) where.userId = userId;

    const count = await this.prisma.notification.count({ where });
    return { count };
  }

  async remove(id: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Notificação não encontrada');

    return this.prisma.notification.delete({ where: { id } });
  }

  async createLowStockNotification(productId: string, productName: string, stock: number) {
    return this.prisma.notification.create({
      data: {
        title: 'Estoque Baixo',
        message: `O produto "${productName}" está com estoque baixo (${stock} unidades).`,
        type: 'WARNING',
      },
    });
  }

  async createNewAppointmentNotification(
    clientName: string,
    employeeName: string,
    serviceName: string,
    date: Date,
  ) {
    const formattedDate = date.toLocaleString('pt-BR');
    return this.prisma.notification.create({
      data: {
        title: 'Novo Agendamento',
        message: `${clientName} agendou ${serviceName} com ${employeeName} para ${formattedDate}.`,
        type: 'APPOINTMENT',
      },
    });
  }

  async createCancellationNotification(
    clientName: string,
    serviceName: string,
    date: Date,
  ) {
    const formattedDate = date.toLocaleString('pt-BR');
    return this.prisma.notification.create({
      data: {
        title: 'Agendamento Cancelado',
        message: `${clientName} cancelou o agendamento de ${serviceName} em ${formattedDate}.`,
        type: 'CANCELLATION',
      },
    });
  }

  async createSystemNotification(title: string, message: string) {
    return this.prisma.notification.create({
      data: {
        title,
        message,
        type: 'SYSTEM',
      },
    });
  }

  async cleanupOldNotifications(daysOld = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);

    const result = await this.prisma.notification.deleteMany({
      where: { createdAt: { lt: cutoff }, read: true },
    });

    return { deleted: result.count };
  }
}
