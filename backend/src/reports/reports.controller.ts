import { Controller, Get, Query, Res, UseGuards, Header } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Response } from 'express';

@Controller('reports')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('financial')
  @Roles('OWNER', 'MANAGER')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename=relatorio-financeiro.xlsx')
  async getFinancialReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res?: Response,
  ) {
    const buffer = await this.reportsService.generateFinancialReport(startDate, endDate);
    if (res) {
      res.send(buffer);
    }
    return buffer;
  }

  @Get('clients')
  @Roles('OWNER', 'MANAGER')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename=relatorio-clientes.xlsx')
  async getClientsReport(@Res() res?: Response) {
    const buffer = await this.reportsService.generateClientsReport();
    if (res) {
      res.send(buffer);
    }
    return buffer;
  }

  @Get('stock')
  @Roles('OWNER', 'MANAGER')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename=relatorio-estoque.xlsx')
  async getStockReport(@Res() res?: Response) {
    const buffer = await this.reportsService.generateStockReport();
    if (res) {
      res.send(buffer);
    }
    return buffer;
  }

  @Get('services')
  @Roles('OWNER', 'MANAGER')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename=relatorio-servicos.xlsx')
  async getServicesReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res?: Response,
  ) {
    const buffer = await this.reportsService.generateServicesReport(startDate, endDate);
    if (res) {
      res.send(buffer);
    }
    return buffer;
  }

  @Get('employees')
  @Roles('OWNER', 'MANAGER')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename=relatorio-funcionarios.xlsx')
  async getEmployeesReport(@Res() res?: Response) {
    const buffer = await this.reportsService.generateEmployeesReport();
    if (res) {
      res.send(buffer);
    }
    return buffer;
  }

  @Get('commissions')
  @Roles('OWNER', 'MANAGER')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename=relatorio-comissoes.xlsx')
  async getCommissionsReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res?: Response,
  ) {
    const buffer = await this.reportsService.generateCommissionsReport(startDate, endDate);
    if (res) {
      res.send(buffer);
    }
    return buffer;
  }

  @Get('pdf')
  @Roles('OWNER', 'MANAGER')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename=relatorio-geral.pdf')
  async getPDFReport(
    @Query('type') type: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res?: Response,
  ) {
    const buffer = await this.reportsService.generatePDFReport(type, startDate, endDate);
    if (res) {
      res.send(buffer);
    }
    return buffer;
  }
}
