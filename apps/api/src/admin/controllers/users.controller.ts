import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  UseGuards,
  Body,
  Param,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../services/users.service';
import { Reflector } from '@nestjs/core';

@Controller('admin/users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(
    private usersService: UsersService,
    private reflector: Reflector,
  ) {}

  @Get()
  async listUsers(@Request() req: any) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can list users');
    }
    return this.usersService.listUsers();
  }

  @Post()
  async createUser(
    @Request() req: any,
    @Body() body: { username: string; password: string; role: string },
  ) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can create users');
    }
    return this.usersService.createUser(body.username, body.password, body.role);
  }

  @Patch(':id')
  async updateUser(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { role?: string; is_active?: boolean },
  ) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can update users');
    }
    return this.usersService.updateUser(Number(id), body);
  }

  @Delete(':id')
  async deleteUser(@Request() req: any, @Param('id') id: string) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can delete users');
    }
    if (Number(id) === req.user.sub) {
      throw new ForbiddenException('Cannot delete your own account');
    }
    await this.usersService.deleteUser(Number(id));
    return { success: true };
  }

  @Post(':id/change-password')
  async changePassword(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { password: string },
  ) {
    if (req.user.role !== 'ADMIN' && req.user.sub !== Number(id)) {
      throw new ForbiddenException('Cannot change other users passwords');
    }
    await this.usersService.changePassword(Number(id), body.password);
    return { success: true };
  }
}
