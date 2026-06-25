import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    // 1. 从接口上的装饰器取到需要的权限码
    const requiredCodes = this.reflector.get<string[]>(
      'permissions', // 找 key 为 'permissions' 的元数据
      context.getHandler(), // 锁定具体处理方法，然后从那个方法上取出对应 'permissions' 标记的值
    );
    if (!requiredCodes) return true; // 没加装饰器则直接放行

    // 2. 从请求里拿到当前登录用户（假设前面有 JWT 守卫已经挂载了 user）
    const { user } = context.switchToHttp().getRequest();
    // 3. 取用户的所有权限码（需要在JWT策略里提前查好放到 user.xx 里）
    const userPermissions = user.permissionCodes ?? [];

    // 4. 检查用户是否拥有任意一个所需权限
    const hasPermission = requiredCodes.some((code) =>
      userPermissions.includes(code),
    );

    if (!hasPermission) throw new ForbiddenException('权限不足perm');
    return true;
  }
}
