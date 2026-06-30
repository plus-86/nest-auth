import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {
    super({
      // 从请求头的 Authorization 里提取 Token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 不忽略过期时间（过期自动失效）
      ignoreExpiration: false,
      // 密钥（必须和生成 Token 时用的一样）
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }
  // 这个方法名是固定的，只有叫validate passport才会调用它
  // 默认两个参数
  // Token 验证通过后，自动调用这个方法
  async validate(payload: any) {
    // payload 就是 Token 里存的数据 { userId, username }
    const { passwordHash, ...user } = await this.userService.findById(
      payload.userId,
    );

    // 返回的用户信息会挂到 req.user 上
    return user
  }
}
