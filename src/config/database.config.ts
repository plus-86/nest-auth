import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
/**
 * 数据库配置函数
 * @param configService 配置服务，用于读取环境变量
 * @returns TypeORM 配置对象
 */
export const getDataBaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'mysql', // 数据库类型
  host: configService.get('DB_HOST'), // 数据库主机
  port: configService.get('DB_PORT'), // 数据库端口
  username: configService.get('DB_USERNAME'), // 用户名
  password: configService.get('DB_PASSWORD'), // 密码
  database: configService.get('DB_DATABASE'), // 数据库名
  //  如果entities写在跟模块里，这样写[__dirname + '/**/*.entity{.ts,.js}']
  entities: [__dirname + '/../**/*.entity{.ts,.js}'], // 实体类列表
  synchronize: configService.get('NODE_ENV') === 'development', // 自动同步表结构（仅开发环境）
  logging: configService.get('NODE_ENV') === 'development', // 打印SQL日志
  timezone: '+08:00', // 时区设置
});
