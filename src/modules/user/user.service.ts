import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RoleService } from '../role/role.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private roleService: RoleService,
  ) { }
  async findByUsername(username: string) {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: {
        role: true,
      },
    });
    return user;
  }

  async findById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) throw new UnauthorizedException('用户不存在');

    return user;
  }

  async findByIdWithPermissions(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        role: {
          permissions: true,
        },
      },
    });

    if (!user) throw new UnauthorizedException('用户不存在');

    return user;
  }

  async create(createUserDto: CreateUserDto) {
    // if (currentUser.role.code !== 'ROLE_ADMIN')
    //   throw new ForbiddenException('仅超级管理员可创建用户');

    const { username, password, roleId } = createUserDto;

    // ✅ 并行查询，提升性能
    const [existingUser, role] = await Promise.all([
      this.userRepository.findOneBy({ username }),
      this.roleService.findOne(roleId),
    ]);

    if (existingUser) throw new ConflictException('该用户名已存在');

    if (!role) throw new BadRequestException('角色不存在');

    const user = this.userRepository.create({
      username,
      role,
    });

    await user.setPassword(password);

    return this.userRepository.save(user);
  }

  // async login(loginDto: loginDto) {
  //   const { username, password } = loginDto;

  //   const user = await this.userRepository.findOneBy({ username });

  //   if (!user) throw new ConflictException(`该用户不存在`);

  //   const isPasswordValid = await user.validatePassword(password);

  //   if (!isPasswordValid) throw new ConflictException(`密码错误`);

  //   return {
  //     code: 200,
  //     message: `登录成功`,
  //   };
  // }

  async findAll() {
    return await this.userRepository.find({
      relations: { role: { permissions: true } },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async update(updateUserDto: UpdateUserDto) {
    const { id, oldPassword, newPassword, username } = updateUserDto;

    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new ConflictException(`该用户不存在`);

    if (username && user.username !== username) {
      const existingUser = await this.userRepository.findOneBy({ username });

      if (existingUser) throw new ConflictException('该用户名已存在');

      user.username = username;
    }

    const isPasswordValid = await user.validatePassword(oldPassword);
    if (!isPasswordValid) {
      throw new ConflictException('旧密码错误');
    }

    await user.setPassword(newPassword);

    return this.userRepository.save(user);
  }

  async delete(id: number) {
    const result = await this.userRepository.softDelete({ id });
    if (result.affected === 0)
      throw new NotFoundException(`用户 ID ${id} 不存在`);
    return { code: 200, message: '操作成功' };
  }
}
