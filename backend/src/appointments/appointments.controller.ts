import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppointmentsService } from './appointments.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('appointments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Post()
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  create(@Body() data: any) {
    return this.appointmentsService.create(data);
  }

  @Get()
  @Roles('OWNER', 'MANAGER', 'BARBER', 'RECEPTIONIST')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Query('employeeId') employeeId?: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.appointmentsService.findAll({
      page: Number(page) || 1,
      limit: Number(limit) || 50,
      startDate,
      endDate,
      status,
      employeeId,
      clientId,
    });
  }

  @Get('today')
  @Roles('OWNER', 'MANAGER', 'BARBER', 'RECEPTIONIST')
  getToday() {
    return this.appointmentsService.getToday();
  }

  @Get('upcoming')
  @Roles('OWNER', 'MANAGER', 'BARBER', 'RECEPTIONIST')
  getUpcoming(@Query('limit') limit?: string) {
    return this.appointmentsService.getUpcoming(Number(limit) || 10);
  }

  @Get('calendar')
  @Roles('OWNER', 'MANAGER', 'BARBER', 'RECEPTIONIST')
  getCalendar(
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.appointmentsService.getCalendar(Number(year), Number(month));
  }

  @Get('by-date')
  @Roles('OWNER', 'MANAGER', 'BARBER', 'RECEPTIONIST')
  getByDate(@Query('date') date: string) {
    return this.appointmentsService.getByDate(date);
  }

  @Get('by-week')
  @Roles('OWNER', 'MANAGER', 'BARBER', 'RECEPTIONIST')
  getByWeek(@Query('startDate') startDate: string) {
    return this.appointmentsService.getByWeek(startDate);
  }

  @Get('by-month')
  @Roles('OWNER', 'MANAGER', 'BARBER', 'RECEPTIONIST')
  getByMonth(
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.appointmentsService.getByMonth(Number(year), Number(month));
  }

  @Get(':id')
  @Roles('OWNER', 'MANAGER', 'BARBER', 'RECEPTIONIST')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Put(':id')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  update(@Param('id') id: string, @Body() data: any) {
    return this.appointmentsService.update(id, data);
  }

  @Put(':id/status')
  @Roles('OWNER', 'MANAGER', 'BARBER', 'RECEPTIONIST')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.appointmentsService.updateStatus(id, body.status);
  }

  @Delete(':id')
  @Roles('OWNER', 'MANAGER')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
