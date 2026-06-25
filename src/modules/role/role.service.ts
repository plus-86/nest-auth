import { ConflictException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { PermissionService } from '../permission/permission.service';

@Injectable()
export class RoleService {
  constructor(
    private permissionService: PermissionService,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
  ) { }
  async create(createRoleDto: CreateRoleDto) {
    const { code } = createRoleDto;

    const role = await this.roleRepository.findOneBy({ code });

    if (role) throw new ConflictException(`该角色已存在`);

    return this.roleRepository.save(createRoleDto);
  }

  findAll() {
    return `This action returns all role`;
  }

  async findOne(id: number) {
    return await this.roleRepository.findOneBy({ id });
  }

  async update(updateRoleDto: UpdateRoleDto) {
    const { code, permissionCodes } = updateRoleDto;
    
    const role = await this.roleRepository.findOneBy({ code });

    const perms = await this.permissionService.findByCodes(permissionCodes)
   
    role.permissions = perms

    Object.assign(role, updateRoleDto);

    return this.roleRepository.save(role);
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
