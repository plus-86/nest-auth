import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PermissionModule } from '../permission/permission.module';

@Module({
  imports: [
    // PassportModule,
    // 让 NestJS 集成 Passport。相当于给项目安装 Passport 的"桥梁"，后面才能用 AuthGuard() 和策略。
    // - 不写它 → AuthGuard('jwt') 会报错
    // - 没传参数 → 默认策略名 'jwt'（和 JwtStrategy 的名称对应）
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      // 工厂函数，返回配置对象
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'), // secret → JWT 签名/验签用的密钥，AuthService 签发和 JwtStrategy 验证用的是同一个
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') }, // expiresIn → token 有效期
      }),
      inject: [ConfigService], // 把 ConfigService 注入到工厂函数里，这样才能用 configService.get() 读取 .env
    }),
    UserModule,
    PermissionModule
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
