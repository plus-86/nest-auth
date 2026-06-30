import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission) private permRepo: Repository<Permission>,
  ) {}
  buildTree(list: Permission[], parentId = 0): any[] {
    return list
      .filter((item) => item.parentId === parentId)
      .map((item) => {
        const children = this.buildTree(list, item.id);

        const node: any = {
          id: item.id,
          name: item.name,
          // type: item.type,
          // sortOrder: item.sortOrder,
        };

        if (item.path !== null && item.path !== undefined) {
          node.path = item.path;
        }

        if (children.length > 0) {
          node.children = children;
        }

        return node;
      });
  }

  async create(createPermissionDto: CreatePermissionDto) {
    const perm = this.permRepo.create(createPermissionDto);

    return this.permRepo.save(perm);
  }

  findAll() {
    return `This action returns all permission`;
  }

  findOne(id: number) {
    return;
  }

  async findByCodes(codes: string[]) {
    const perms = await this.permRepo.find({
      where: {
        code: In(codes),
      },
    });

    return perms;
  }

  update(id: number, updatePermissionDto: UpdatePermissionDto) {
    return `This action updates a #${id} permission`;
  }

  remove(id: number) {
    return `This action removes a #${id} permission`;
  }
}
