import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CashierService } from './cashier.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('cashier')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CashierController {
  constructor(private cashierService: CashierService) {}

  @Post('register/open')
  @Roles('OWNER', 'MANAGER')
  openRegister(@Req() req: any, @Body() body: { initialAmount: number; notes?: string }) {
    return this.cashierService.openRegister(req.user.id, body.initialAmount, body.notes);
  }

  @Post('register/:id/close')
  @Roles('OWNER', 'MANAGER')
  closeRegister(@Param('id') id: string, @Body() body: { finalAmount: number; notes?: string }) {
    return this.cashierService.closeRegister(id, body.finalAmount, body.notes);
  }

  @Get('register/current')
  @Roles('OWNER', 'MANAGER')
  getCurrentRegister() {
    return this.cashierService.getCurrentRegister();
  }

  @Get('register/history')
  @Roles('OWNER', 'MANAGER')
  getRegisterHistory(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.cashierService.getRegisterHistory(Number(page) || 1, Number(limit) || 20);
  }

  @Post('movements')
  @Roles('OWNER', 'MANAGER')
  addMovement(@Req() req: any, @Body() body: any) {
    return this.cashierService.addMovement({ ...body, userId: req.user.id });
  }

  @Get('movements')
  @Roles('OWNER', 'MANAGER')
  getMovements(
    @Query('cashRegisterId') cashRegisterId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.cashierService.getMovements(
      cashRegisterId,
      Number(page) || 1,
      Number(limit) || 50,
    );
  }

  @Get('day-summary')
  @Roles('OWNER', 'MANAGER')
  getDaySummary(@Query('date') date?: string) {
    return this.cashierService.getDaySummary(date);
  }

  @Post('open')
  @Roles('OWNER', 'MANAGER')
  openCashier(@Req() req: any) {
    return this.cashierService.openCashier(req.user.id);
  }

  @Post(':id/close')
  @Roles('OWNER', 'MANAGER')
  closeCashier(@Param('id') id: string, @Body() body: { notes?: string }) {
    return this.cashierService.closeCashier(id, body.notes);
  }

  @Get('today')
  @Roles('OWNER', 'MANAGER')
  getTodayCashier() {
    return this.cashierService.getTodayCashier();
  }

  @Get('history')
  @Roles('OWNER', 'MANAGER')
  getCashierHistory(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.cashierService.getCashierHistory(Number(page) || 1, Number(limit) || 30);
  }

  @Post('link-appointment')
  @Roles('OWNER', 'MANAGER')
  linkAppointment(@Body() body: { appointmentId: string; cashierId: string }) {
    return this.cashierService.linkAppointmentToCashier(body.appointmentId, body.cashierId);
  }
}
