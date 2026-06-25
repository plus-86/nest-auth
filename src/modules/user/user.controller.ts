import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { RoleGuard } from 'src/common/guards/role.guard';
import { PermissionsGuard } from 'src/common/guards/permission.guard';
import { RequirePermissions } from 'src/common/decorators/permission.decorator';

@Controller('user')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('/create')
  @RequirePermissions('user:create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('/list')
  @RequirePermissions('user:read')
  findAll() {
    return this.userService.findAll();
  }

  @Post('/update')
  @RequirePermissions('user:update')
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(updateUserDto);
  }

  @Post('/delete')
  @RequirePermissions('user:delete')
  remove(@Body('id') id: number) {
    return this.userService.delete(id);
  }
}
