import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('products')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  @Roles('OWNER', 'MANAGER')
  create(@Body() data: any) {
    return this.productsService.create(data);
  }

  @Get()
  @Roles('OWNER', 'MANAGER', 'BARBER', 'RECEPTIONIST')
  findAll(
    @Query('category') category?: string,
    @Query('active') active?: string,
    @Query('lowStock') lowStock?: string,
  ) {
    return this.productsService.findAll(category, active, lowStock);
  }

  @Get('categories')
  @Roles('OWNER', 'MANAGER', 'BARBER', 'RECEPTIONIST')
  getCategories() {
    return this.productsService.getCategories();
  }

  @Get('low-stock')
  @Roles('OWNER', 'MANAGER')
  getLowStock() {
    return this.productsService.getLowStock();
  }

  @Get('top-selling')
  @Roles('OWNER', 'MANAGER')
  getTopSelling(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    return this.productsService.getTopSelling(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      Number(limit) || 10,
    );
  }

  @Get(':id')
  @Roles('OWNER', 'MANAGER', 'BARBER', 'RECEPTIONIST')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  @Roles('OWNER', 'MANAGER')
  update(@Param('id') id: string, @Body() data: any) {
    return this.productsService.update(id, data);
  }

  @Delete(':id')
  @Roles('OWNER')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Post(':id/stock')
  @Roles('OWNER', 'MANAGER')
  adjustStock(
    @Param('id') id: string,
    @Body() body: { type: 'IN' | 'OUT'; quantity: number; notes?: string },
  ) {
    return this.productsService.adjustStock(id, body.type, body.quantity, body.notes);
  }
}
