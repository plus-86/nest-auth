import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDataBaseConfig } from './config/database.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { PermissionModule } from './modules/permission/permission.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: getDataBaseConfig,
      inject: [ConfigService],
    }),
    UserModule,
    RoleModule,
    PermissionModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
