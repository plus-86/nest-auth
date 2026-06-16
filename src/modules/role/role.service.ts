import { ConflictException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private roleRepository: Repository<Role>,
  ) {}
  async create(createRoleDto: CreateRoleDto) {
    const { code } = createRoleDto;

    const role = await this.roleRepository.findOneBy({ code });

    if (role) throw new ConflictException(`该角色已存在`);

    return this.roleRepository.save(createRoleDto);
  }

  findAll() {
    return `This action returns all role`;
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  async update(updateRoleDto: UpdateRoleDto) {
    const { code } = updateRoleDto;

    const role = await this.roleRepository.findOneBy({ code });

    Object.assign(role, updateRoleDto);

    return this.roleRepository.save(role);
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
