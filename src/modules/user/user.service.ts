import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { loginDto } from './dto/login.dto';
import { Role } from '../role/entities/role.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const { username, password } = createUserDto;

    const existingUser = await this.userRepository.findOneBy({
      username,
    });

    if (existingUser) throw new ConflictException('该用户名已存在');

    const user = this.userRepository.create(createUserDto);

    const roloUser = await this.roleRepository.findOneBy({ code: 'ROLE_USER' });

    user.roles = [roloUser];

    await user.setPassword(password);

    return this.userRepository.save(user);
  }

  async login(loginDto: loginDto) {
    const { username, password } = loginDto;

    const user = await this.userRepository.findOneBy({ username });

    if (!user) throw new ConflictException(`该用户不存在`);

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) throw new ConflictException(`密码错误`);

    return {
      code: 200,
      message: `登录成功`,
    };
  }

  findAll() {
    return `This action returns all user`;
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

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
