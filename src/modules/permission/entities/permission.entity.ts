import { Role } from 'src/modules/role/entities/role.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';

export enum PermissionType {
  Directory = 1, // 目录
  Menu = 2,      // 菜单
  Api = 3,       // 接口
}

/**
 * 权限实体类
 * 对应数据库中的 permission 表
 */
@Entity('permission')
export class Permission {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true, comment: '权限ID' })
  id: number;

  @Column({ length: 100, unique: true, comment: '权限代码（如 user:create）' })
  code: string;

  @Column({ length: 50, comment: '权限名称（如 创建用户）' })
  name: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  // @Column({ length: 50, comment: '资源（如 user）' })
  // resource: string;

  // @Column({ length: 20, comment: '操作（如 create）' })
  // action: string;

  @Column({ name: 'parent_id', type: 'int', default: 0, comment: '父级ID' })
  parentId: number;

  @Column({ length: 200, nullable: true, comment: '前端路由' })
  path: string;

  @Column({ length: 50, nullable: true, comment: '菜单图标' })
  icon: string;

  @Column({
    type: 'tinyint',
    default: PermissionType.Api,
    comment: '类型：1-目录，2-菜单，3-接口',
  })
  type: PermissionType;

  @Column({ name: 'sort_order', type: 'int', default: 0, comment: '排序' })
  sortOrder: number;

  // @Column({ type: 'tinyint', default: 1, comment: '状态：1-启用，2-禁用' })
  // status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}