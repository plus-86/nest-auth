import { Permission } from 'src/modules/permission/entities/permission.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

/**
 * 角色实体类
 * 对应数据库中的 role 表
 */
@Entity('role')
export class Role {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true, comment: '角色ID' })
  id: number;

  @Column({ length: 50, unique: true, comment: '角色代码（如 admin）' })
  code: string;

  @Column({ length: 50, comment: '角色名称（如 管理员）' })
  name: string;

  @Column({ type: 'text', nullable: true, comment: '角色描述' })
  description: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-启用，2-禁用' })
  status: number;

  @Column({
    name: 'is_system',
    type: 'tinyint',
    default: 0,
    comment: '是否系统内置角色',
  })
  isSystem: number;

  @Column({ name: 'sort_order', type: 'int', default: 0, comment: '排序' })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * 多对多关联权限
   * 通过中间表 role_permission 关联
   */
  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'role_permission',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];
}
