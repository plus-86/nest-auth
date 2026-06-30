import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport'; // NestJS 的守卫（Guard），用于在路由处理前执行认证逻辑。
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  // @UseGuards作用：告诉 NestJS，这个路由需要经过守卫验证
  // 守卫会在请求到达 Controller 之前执行

  // AuthGuard 是 @nestjs/passport 提供的工厂函数
  // AuthGuard('local') 告诉 Passport：「用名为 local 的策略来处理这个请求」
  // 返回值：一个实现了 CanActivate 接口的守卫类
  @UseGuards(AuthGuard('local'))
  async login(@CurrentUser() user: User) {
    return this.authService.login(user); // 生成并返回 Token
  }

  @Get('menus')
  @UseGuards(AuthGuard('jwt'))
  async getMenuTreeByUserId(@CurrentUser('id') userId: number) {
    return this.authService.getMenuTreeByUserId(userId);
  }
}
