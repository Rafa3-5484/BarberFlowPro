import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClientsService } from './clients.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('clients')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Post()
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  create(@Body() data: any) {
    return this.clientsService.create(data);
  }

  @Get()
  @Roles('OWNER', 'MANAGER', 'BARBER', 'RECEPTIONIST')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.clientsService.findAll(Number(page) || 1, Number(limit) || 50, search);
  }

  @Get('search')
  @Roles('OWNER', 'MANAGER', 'BARBER', 'RECEPTIONIST')
  search(@Query('q') query: string) {
    return this.clientsService.search(query);
  }

  @Get('top')
  @Roles('OWNER', 'MANAGER')
  getTop(@Query('limit') limit?: string) {
    return this.clientsService.getTopClients(Number(limit) || 10);
  }

  @Get('export/csv')
  @Roles('OWNER', 'MANAGER')
  exportCSV() {
    return this.clientsService.exportCSV();
  }

  @Get(':id')
  @Roles('OWNER', 'MANAGER', 'BARBER', 'RECEPTIONIST')
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Put(':id')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  update(@Param('id') id: string, @Body() data: any) {
    return this.clientsService.update(id, data);
  }

  @Delete(':id')
  @Roles('OWNER')
  remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }
}
