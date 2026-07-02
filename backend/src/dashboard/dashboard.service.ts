import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardData() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [todayAppointments, monthAppointments, topServicesRaw, products, recentClients, allClients] = await Promise.all([
      this.prisma.appointment.findMany({
        where: { date: { gte: startOfDay, lte: endOfDay } },
        include: { client: true, employee: true, service: true },
        orderBy: { date: 'asc' },
      }),
      this.prisma.appointment.findMany({
        where: { date: { gte: startOfMonth } },
      }),
      this.prisma.appointment.findMany({
        where: { status: 'COMPLETED' },
        include: { service: true },
      }),
      this.prisma.product.findMany({
        where: { active: true },
        orderBy: { stock: 'asc' },
      }),
      this.prisma.client.findMany({
        where: { createdAt: { gte: startOfMonth } },
      }),
      this.prisma.client.findMany(),
    ]);

    const todayCompleted = todayAppointments.filter(a => a.status === 'COMPLETED').length;
    const todayRevenue = todayAppointments
      .filter(a => a.status === 'COMPLETED')
      .reduce((sum, a) => sum + a.totalValue, 0);

    const monthRevenue = monthAppointments
      .filter(a => a.status === 'COMPLETED')
      .reduce((sum, a) => sum + a.totalValue, 0);

    const serviceMap: Record<string, { name: string; count: number; revenue: number }> = {};
    for (const apt of topServicesRaw) {
      if (!serviceMap[apt.serviceId]) {
        serviceMap[apt.serviceId] = { name: apt.service.name, count: 0, revenue: 0 };
      }
      serviceMap[apt.serviceId].count++;
      serviceMap[apt.serviceId].revenue += apt.totalValue;
    }
    const topServices = Object.values(serviceMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const productSales = await this.prisma.stockMovement.findMany({
      where: { type: 'OUT' },
      include: { product: true },
    });
    const productMap: Record<string, { name: string; quantity: number }> = {};
    for (const m of productSales) {
      if (!productMap[m.productId]) {
        productMap[m.productId] = { name: m.product.name, quantity: 0 };
      }
      productMap[m.productId].quantity += m.quantity;
    }
    const topProducts = Object.values(productMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const newClients = recentClients.length;
    const recurringClients = allClients.filter(c => c.totalVisits > 1).length;

    const appointmentsByHour: Record<string, number> = {};
    for (let h = 6; h <= 22; h++) {
      appointmentsByHour[`${h.toString().padStart(2, '0')}:00`] = 0;
    }
    for (const apt of todayAppointments) {
      const hour = apt.date.getHours().toString().padStart(2, '0') + ':00';
      if (appointmentsByHour[hour] !== undefined) appointmentsByHour[hour]++;
    }

    const monthlyRevenue: { month: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthLabel = d.toLocaleDateString('pt-BR', { month: 'short' });
      monthlyRevenue.push({ month: monthLabel, revenue: 0 });
    }
    for (const apt of monthAppointments) {
      if (apt.status === 'COMPLETED') {
        const monthIdx = 5 - (new Date().getMonth() - apt.date.getMonth());
        if (monthIdx >= 0 && monthIdx < 6) {
          monthlyRevenue[monthIdx].revenue += apt.totalValue;
        }
      }
    }

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const weeklyAppointments = weekDays.map((day, i) => ({ day, count: 0 }));
    for (const apt of todayAppointments) {
      const dayOfWeek = apt.date.getDay();
      weeklyAppointments[dayOfWeek].count++;
    }

    const commissionsTotal = await this.prisma.commissionRecord.aggregate({
      where: { paid: false },
      _sum: { commissionValue: true },
    });

    const lowStockProducts = products.filter(p => p.stock <= p.minStock).map(p => ({
      id: p.id,
      name: p.name,
      stock: p.stock,
      minStock: p.minStock,
      category: p.category,
    }));

    return {
      todayAppointments: todayAppointments.length,
      todayCompleted,
      todayPending: todayAppointments.filter(a => a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS').length,
      todayRevenue,
      monthRevenue,
      topServices,
      topProducts,
      newClients,
      recurringClients,
      appointmentsByHour: Object.entries(appointmentsByHour).map(([hour, count]) => ({ hour, count })),
      monthlyRevenue,
      weeklyAppointments,
      recentAppointments: todayAppointments.slice(0, 10),
      commissionsTotal: commissionsTotal._sum.commissionValue || 0,
      lowStockProducts,
    };
  }
}
