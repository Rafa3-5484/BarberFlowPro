import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ServicesService } from './services.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('services')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Post()
  @Roles('OWNER', 'MANAGER')
  create(@Body() data: any) {
    return this.servicesService.create(data);
  }

  @Get()
  @Roles('OWNER', 'MANAGER', 'BARBER', 'RECEPTIONIST')
  findAll(
    @Query('category') category?: string,
    @Query('active') active?: string,
  ) {
    return this.servicesService.findAll(category, active);
  }

  @Get('categories')
  @Roles('OWNER', 'MANAGER', 'BARBER', 'RECEPTIONIST')
  getCategories() {
    return this.servicesService.getCategories();
  }

  @Get('top')
  @Roles('OWNER', 'MANAGER')
  getTop(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    return this.servicesService.getTopServices(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      Number(limit) || 10,
    );
  }

  @Get(':id')
  @Roles('OWNER', 'MANAGER', 'BARBER', 'RECEPTIONIST')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Put(':id')
  @Roles('OWNER', 'MANAGER')
  update(@Param('id') id: string, @Body() data: any) {
    return this.servicesService.update(id, data);
  }

  @Delete(':id')
  @Roles('OWNER')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
