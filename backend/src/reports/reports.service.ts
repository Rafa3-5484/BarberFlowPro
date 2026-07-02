import { Injectable, StreamableFile } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';
import { Readable } from 'stream';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generateFinancialReport(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const records = await this.prisma.financialRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Financeiro');

    sheet.columns = [
      { header: 'Data', key: 'date', width: 20 },
      { header: 'Tipo', key: 'type', width: 15 },
      { header: 'Descrição', key: 'description', width: 40 },
      { header: 'Valor', key: 'amount', width: 15 },
      { header: 'Forma Pagamento', key: 'paymentMethod', width: 18 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Categoria', key: 'category', width: 15 },
    ];

    for (const r of records) {
      sheet.addRow({
        date: r.createdAt.toISOString().split('T')[0],
        type: r.type === 'INCOME' ? 'Receita' : r.type === 'EXPENSE' ? 'Despesa' : 'Retirada',
        description: r.description,
        amount: r.amount,
        paymentMethod: r.paymentMethod || '',
        status: r.status === 'PAID' ? 'Pago' : 'Pendente',
        category: r.category || '',
      });
    }

    const totalIncome = records.filter(r => r.type === 'INCOME' && r.status === 'PAID')
      .reduce((s, r) => s + r.amount, 0);
    const totalExpenses = records.filter(r => r.type === 'EXPENSE' && r.status === 'PAID')
      .reduce((s, r) => s + r.amount, 0);

    sheet.addRow({});
    sheet.addRow({ description: 'Total Receitas', amount: totalIncome });
    sheet.addRow({ description: 'Total Despesas', amount: totalExpenses });
    sheet.addRow({ description: 'Saldo', amount: totalIncome - totalExpenses });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async generateClientsReport() {
    const clients = await this.prisma.client.findMany({
      orderBy: { totalSpent: 'desc' },
      include: { _count: { select: { appointments: true } } },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Clientes');

    sheet.columns = [
      { header: 'Nome', key: 'name', width: 30 },
      { header: 'Telefone', key: 'phone', width: 18 },
      { header: 'Email', key: 'email', width: 35 },
      { header: 'Total Visitas', key: 'visits', width: 15 },
      { header: 'Total Gasto', key: 'spent', width: 15 },
      { header: 'Última Visita', key: 'lastVisit', width: 20 },
      { header: 'Data Cadastro', key: 'createdAt', width: 20 },
    ];

    for (const c of clients) {
      sheet.addRow({
        name: c.name,
        phone: c.phone || '',
        email: c.email || '',
        visits: c.totalVisits,
        spent: c.totalSpent,
        lastVisit: c.lastVisit ? c.lastVisit.toISOString().split('T')[0] : '',
        createdAt: c.createdAt.toISOString().split('T')[0],
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async generateStockReport() {
    const products = await this.prisma.product.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Estoque');

    sheet.columns = [
      { header: 'Produto', key: 'name', width: 35 },
      { header: 'Categoria', key: 'category', width: 20 },
      { header: 'Preço', key: 'price', width: 12 },
      { header: 'Custo', key: 'cost', width: 12 },
      { header: 'Estoque', key: 'stock', width: 10 },
      { header: 'Estoque Mínimo', key: 'minStock', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    for (const p of products) {
      sheet.addRow({
        name: p.name,
        category: p.category || '',
        price: p.price,
        cost: p.cost || 0,
        stock: p.stock,
        minStock: p.minStock,
        status: p.stock <= p.minStock ? 'Estoque Baixo' : 'Normal',
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async generateServicesReport(startDate?: string, endDate?: string) {
    const where: any = { status: 'COMPLETED' };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const appointments = await this.prisma.appointment.findMany({
      where,
      include: { service: true, employee: true },
      orderBy: { date: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Serviços Realizados');

    sheet.columns = [
      { header: 'Data', key: 'date', width: 20 },
      { header: 'Serviço', key: 'service', width: 30 },
      { header: 'Profissional', key: 'employee', width: 25 },
      { header: 'Valor', key: 'value', width: 12 },
    ];

    for (const a of appointments) {
      sheet.addRow({
        date: a.date.toISOString().split('T')[0],
        service: a.service.name,
        employee: a.employee.name,
        value: a.totalValue,
      });
    }

    const total = appointments.reduce((s, a) => s + a.totalValue, 0);
    sheet.addRow({});
    sheet.addRow({ service: 'Total', value: total });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async generateEmployeesReport() {
    const employees = await this.prisma.employee.findMany({
      where: { active: true },
      include: {
        _count: { select: { appointments: true } },
        employeeServices: { include: { service: true } },
      },
      orderBy: { name: 'asc' },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Funcionários');

    sheet.columns = [
      { header: 'Nome', key: 'name', width: 30 },
      { header: 'Função', key: 'role', width: 20 },
      { header: 'Telefone', key: 'phone', width: 18 },
      { header: 'Comissão (%)', key: 'commission', width: 15 },
      { header: 'Total Serviços', key: 'services', width: 15 },
      { header: 'Serviços', key: 'serviceNames', width: 40 },
    ];

    for (const e of employees) {
      sheet.addRow({
        name: e.name,
        role: e.role,
        phone: e.phone || '',
        commission: e.commission,
        services: e._count.appointments,
        serviceNames: e.employeeServices.map(es => es.service.name).join(', '),
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async generateCommissionsReport(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const records = await this.prisma.commissionRecord.findMany({
      where,
      include: {
        employee: { select: { id: true, name: true } },
        appointment: {
          include: {
            client: { select: { id: true, name: true } },
            service: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Comissões');

    sheet.columns = [
      { header: 'Data', key: 'date', width: 20 },
      { header: 'Funcionário', key: 'employee', width: 25 },
      { header: 'Cliente', key: 'client', width: 25 },
      { header: 'Serviço', key: 'service', width: 30 },
      { header: 'Valor Serviço', key: 'serviceValue', width: 15 },
      { header: '% Comissão', key: 'percent', width: 12 },
      { header: 'Valor Comissão', key: 'commissionValue', width: 15 },
      { header: 'Pago', key: 'paid', width: 10 },
    ];

    for (const r of records) {
      sheet.addRow({
        date: r.date.toISOString().split('T')[0],
        employee: r.employee.name,
        client: r.appointment.client.name,
        service: r.appointment.service.name,
        serviceValue: r.serviceValue,
        percent: r.commissionPercent + '%',
        commissionValue: r.commissionValue,
        paid: r.paid ? 'Sim' : 'Não',
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async generatePDFReport(type: string, startDate?: string, endDate?: string): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        doc.fontSize(20).font('Helvetica-Bold').text('BarberFlow Pro', { align: 'center' });
        doc.fontSize(12).font('Helvetica').text('Relatório do Sistema', { align: 'center' });
        doc.moveDown();
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'right' });
        doc.text(`Período: ${startDate || 'Início'} - ${endDate || 'Hoje'}`, { align: 'right' });
        doc.moveDown();

        doc.fontSize(10).font('Helvetica');

        if (type === 'financial' || type === 'all') {
          doc.fontSize(14).font('Helvetica-Bold').text('Resumo Financeiro');
          doc.moveDown(0.5);

          const where: any = {};
          if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
          }

          const records = await this.prisma.financialRecord.findMany({ where });
          const income = records.filter(r => r.type === 'INCOME' && r.status === 'PAID')
            .reduce((s, r) => s + r.amount, 0);
          const expenses = records.filter(r => r.type === 'EXPENSE' && r.status === 'PAID')
            .reduce((s, r) => s + r.amount, 0);

          doc.fontSize(10).font('Helvetica');
          doc.text(`Total de Receitas: R$ ${income.toFixed(2)}`);
          doc.text(`Total de Despesas: R$ ${expenses.toFixed(2)}`);
          doc.text(`Saldo: R$ ${(income - expenses).toFixed(2)}`);
          doc.moveDown();
        }

        if (type === 'appointments' || type === 'all') {
          doc.fontSize(14).font('Helvetica-Bold').text('Agendamentos');
          doc.moveDown(0.5);

          const aptWhere: any = {};
          if (startDate || endDate) {
            aptWhere.date = {};
            if (startDate) aptWhere.date.gte = new Date(startDate);
            if (endDate) aptWhere.date.lte = new Date(endDate);
          }

          const appointments = await this.prisma.appointment.findMany({
            where: aptWhere,
            include: { client: true, employee: true, service: true },
            orderBy: { date: 'desc' },
            take: 50,
          });

          doc.fontSize(10).font('Helvetica');
          doc.text(`Total de Agendamentos: ${appointments.length}`);

          const completed = appointments.filter(a => a.status === 'COMPLETED').length;
          const cancelled = appointments.filter(a => a.status === 'CANCELLED').length;
          const revenue = appointments.filter(a => a.status === 'COMPLETED')
            .reduce((s, a) => s + a.totalValue, 0);

          doc.text(`Finalizados: ${completed}`);
          doc.text(`Cancelados: ${cancelled}`);
          doc.text(`Receita Total: R$ ${revenue.toFixed(2)}`);
          doc.moveDown();
        }

        if (type === 'clients' || type === 'all') {
          doc.fontSize(14).font('Helvetica-Bold').text('Clientes');
          doc.moveDown(0.5);

          const totalClients = await this.prisma.client.count();
          const topClient = await this.prisma.client.findFirst({
            orderBy: { totalSpent: 'desc' },
          });

          doc.fontSize(10).font('Helvetica');
          doc.text(`Total de Clientes: ${totalClients}`);
          if (topClient) {
            doc.text(`Cliente que mais gastou: ${topClient.name} (R$ ${topClient.totalSpent.toFixed(2)})`);
          }
          doc.moveDown();
        }

        if (type === 'stock' || type === 'all') {
          doc.fontSize(14).font('Helvetica-Bold').text('Estoque');
          doc.moveDown(0.5);

          const totalProducts = await this.prisma.product.count({ where: { active: true } });
          const lowStock = await this.prisma.product.count({
            where: { active: true, stock: { lte: this.prisma.product.fields.minStock } },
          });

          doc.fontSize(10).font('Helvetica');
          doc.text(`Total de Produtos: ${totalProducts}`);
          doc.text(`Produtos com Estoque Baixo: ${lowStock}`);
          doc.moveDown();
        }

        doc.fontSize(8).font('Helvetica').text(
          'BarberFlow Pro - Sistema de Gerenciamento para Barbearias',
          { align: 'center' },
        );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
