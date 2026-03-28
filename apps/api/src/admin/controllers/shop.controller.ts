import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ShopService } from '../services/shop.service';

@Controller('admin/shop')
@UseGuards(AuthGuard('jwt'))
export class ShopController {
  constructor(private shopService: ShopService) {}

  @Get()
  async getItems() {
    return this.shopService.getItems();
  }

  @Post()
  async createItem(@Body() data: Record<string, unknown>) {
    return this.shopService.createItem(data);
  }

  @Put(':id')
  async updateItem(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    return this.shopService.updateItem(id, data);
  }

  @Delete(':id')
  async deleteItem(@Param('id') id: string) {
    return this.shopService.deleteItem(id);
  }
}
