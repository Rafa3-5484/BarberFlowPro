import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post()
  @Roles('OWNER', 'MANAGER')
  create(@Body() data: any) {
    return this.notificationsService.create(data);
  }

  @Get()
  @Roles('OWNER', 'MANAGER', 'BARBER', 'RECEPTIONIST')
  findAll(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('read') read?: string,
    @Query('type') type?: string,
  ) {
    return this.notificationsService.findAll({
      page: Number(page) || 1,
      limit: Number(limit) || 50,
      userId: req.user.role === 'OWNER' ? undefined : req.user.id,
      read,
      type,
    });
  }

  @Get('unread-count')
  @Roles('OWNER', 'MANAGER', 'BARBER', 'RECEPTIONIST')
  getUnreadCount(@Req() req: any) {
    return this.notificationsService.getUnreadCount(
      req.user.role === 'OWNER' ? undefined : req.user.id,
    );
  }

  @Post('mark-all-read')
  @Roles('OWNER', 'MANAGER', 'BARBER', 'RECEPTIONIST')
  markAllAsRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Get(':id')
  @Roles('OWNER', 'MANAGER', 'BARBER', 'RECEPTIONIST')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Post(':id/read')
  @Roles('OWNER', 'MANAGER', 'BARBER', 'RECEPTIONIST')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Delete(':id')
  @Roles('OWNER', 'MANAGER')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}
