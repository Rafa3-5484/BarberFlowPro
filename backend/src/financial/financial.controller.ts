import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FinancialService } from './financial.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('financial')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class FinancialController {
  constructor(private financialService: FinancialService) {}

  @Post()
  @Roles('OWNER', 'MANAGER')
  create(@Body() data: any) {
    return this.financialService.create(data);
  }

  @Get()
  @Roles('OWNER', 'MANAGER')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financialService.findAll({
      page: Number(page) || 1,
      limit: Number(limit) || 50,
      type,
      status,
      category,
      startDate,
      endDate,
    });
  }

  @Get('summary')
  @Roles('OWNER', 'MANAGER')
  getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financialService.getSummary({ startDate, endDate });
  }

  @Get('monthly/:year')
  @Roles('OWNER', 'MANAGER')
  getMonthlySummary(@Param('year') year: string) {
    return this.financialService.getMonthlySummary(Number(year));
  }

  @Get('categories')
  @Roles('OWNER', 'MANAGER')
  getCategories() {
    return this.financialService.getCategories();
  }

  @Get(':id')
  @Roles('OWNER', 'MANAGER')
  findOne(@Param('id') id: string) {
    return this.financialService.findOne(id);
  }

  @Put(':id')
  @Roles('OWNER', 'MANAGER')
  update(@Param('id') id: string, @Body() data: any) {
    return this.financialService.update(id, data);
  }

  @Delete(':id')
  @Roles('OWNER')
  remove(@Param('id') id: string) {
    return this.financialService.remove(id);
  }
}
