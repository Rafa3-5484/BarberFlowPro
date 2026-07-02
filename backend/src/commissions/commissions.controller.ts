import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommissionsService } from './commissions.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('commissions')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CommissionsController {
  constructor(private commissionsService: CommissionsService) {}

  @Get()
  @Roles('OWNER', 'MANAGER')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('employeeId') employeeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('paid') paid?: string,
  ) {
    return this.commissionsService.findAll({
      page: Number(page) || 1,
      limit: Number(limit) || 50,
      employeeId,
      startDate,
      endDate,
      paid,
    });
  }

  @Get('summary')
  @Roles('OWNER', 'MANAGER')
  getSummary(
    @Query('employeeId') employeeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.commissionsService.getSummary({ employeeId, startDate, endDate });
  }

  @Get('employee/:employeeId')
  @Roles('OWNER', 'MANAGER')
  getByEmployee(
    @Param('employeeId') employeeId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.commissionsService.getByEmployee(employeeId, startDate, endDate);
  }

  @Get(':id')
  @Roles('OWNER', 'MANAGER')
  findOne(@Param('id') id: string) {
    return this.commissionsService.findOne(id);
  }

  @Post(':id/pay')
  @Roles('OWNER', 'MANAGER')
  markAsPaid(@Param('id') id: string) {
    return this.commissionsService.markAsPaid(id);
  }

  @Post(':id/unpay')
  @Roles('OWNER', 'MANAGER')
  markAsUnpaid(@Param('id') id: string) {
    return this.commissionsService.markAsUnpaid(id);
  }

  @Post('calculate/:appointmentId')
  @Roles('OWNER', 'MANAGER')
  calculate(@Param('appointmentId') appointmentId: string) {
    return this.commissionsService.calculateCommission(appointmentId);
  }
}
