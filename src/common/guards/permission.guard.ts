import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. 从接口上的装饰器取到需要的权限码
    const requiredCodes = this.reflector.get<string[]>(
      'permissions', // 找 key 为 'permissions' 的元数据
      context.getHandler(), // 锁定具体处理方法，然后从那个方法上取出对应 'permissions' 标记的值
    );
    if (!requiredCodes) return true; // 没加装饰器则直接放行

    // 2. 从请求里拿到当前登录用户
    const { user } = context.switchToHttp().getRequest();

    const fullUser = await this.userService.findByIdWithPermissions(user.id);

    // 3. 将返回的permission codes处理成数组
    const userPermissions = fullUser.role.permissions.map((p) => p.code) ?? [];

    // 4. 检查用户是否拥有任意一个所需权限
    const hasPermission = requiredCodes.some((code) =>
      userPermissions.includes(code),
    );

    if (!hasPermission) throw new ForbiddenException('权限不足');
    return true;
  }
}
