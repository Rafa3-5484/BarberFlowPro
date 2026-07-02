import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmployeesService } from './employees.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('employees')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class EmployeesController {
  constructor(private employeesService: EmployeesService) {}

  @Post()
  @Roles('OWNER', 'MANAGER')
  create(@Body() data: any) {
    return this.employeesService.create(data);
  }

  @Get()
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  findAll(@Query('active') active?: string) {
    return this.employeesService.findAll(active);
  }

  @Get('commission-ranking')
  @Roles('OWNER', 'MANAGER')
  getCommissionRanking(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.employeesService.getCommissionRanking(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get(':id/availability')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  checkAvailability(
    @Param('id') id: string,
    @Query('date') date: string,
    @Query('duration') duration: string,
  ) {
    return this.employeesService.checkAvailability(id, new Date(date), Number(duration));
  }

  @Get(':id')
  @Roles('OWNER', 'MANAGER', 'BARBER', 'RECEPTIONIST')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Put(':id')
  @Roles('OWNER', 'MANAGER')
  update(@Param('id') id: string, @Body() data: any) {
    return this.employeesService.update(id, data);
  }

  @Delete(':id')
  @Roles('OWNER')
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }

  @Post(':id/services')
  @Roles('OWNER', 'MANAGER')
  assignServices(@Param('id') id: string, @Body() body: { serviceIds: string[] }) {
    return this.employeesService.assignServices(id, body.serviceIds);
  }

  @Post(':id/schedule')
  @Roles('OWNER', 'MANAGER')
  updateSchedule(
    @Param('id') id: string,
    @Body() body: { schedule: { dayOfWeek: number; startTime: string; endTime: string; active?: boolean }[] },
  ) {
    return this.employeesService.updateSchedule(id, body.schedule);
  }
}
