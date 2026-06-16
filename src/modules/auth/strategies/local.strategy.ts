import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport'; // NestJS 包装器，将 Passport 集成到 NestJS
import { Strategy } from 'passport-local'; // Passport 具体策略，实现认证逻辑
import { AuthService } from '../auth.service';

@Injectable()
// Passport 的 passport-local 策略会自动：
// 1.从 request.body 里提取 username 和 password
// 2.调用 LocalStrategy 的 validate(username, password) 方法
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // super是调用父类PassportStrategy(Strategy)的构造函数
    // 相当于PassportStrategy(Strategy).constructor({ usernameField: 'username' });
    // 告诉 Passport：从 request.body.username 提取用户名
    // { usernameField: 'username', passwordField: 'password' }是这个父类的默认值，可以直接在super里写个空对象{}
    super({ usernameField: 'username' });
  }
  // 这个方法名是固定的，只有叫validate passport才会调用它
  // 默认两个参数
  // 如果在父类里传入sueper({passReqToCallback: true}),
  // 则validate有3个参数第一个参数可以拿到request  validate(req: Request, username: string, password: string)
  async validate(username: string, password: string): Promise<any> {
    return await this.authService.validateUser(username, password);
  }
}
