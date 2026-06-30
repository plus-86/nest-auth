import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { PermissionService } from '../permission/permission.service';
import { PermissionType } from '../permission/entities/permission.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private permissionService: PermissionService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.userService.findByUsername(username);

    if (!user) throw new UnauthorizedException(`请输入正确的用户名或密码`);

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) throw new UnauthorizedException(`密码错误`);

    const { passwordHash, ...result } = user;

    return result;
  }

  async login(user: User) {
    const payload = { username: user.username, userId: user.id };
    return {
      access_token: await this.jwtService.signAsync(payload), // 生成 Token
    };
  }

  async getMenuTreeByUserId(userId: number) {
    const user = await this.userService.findByIdWithPermissions(userId)

    const menuPerms = user.role.permissions.filter(p =>
      [PermissionType.Directory, PermissionType.Menu].includes(p.type),
    )

    return this.permissionService.buildTree(menuPerms);
  }
}
