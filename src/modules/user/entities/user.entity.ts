import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt'; // 导入bcrypt库的所有功能，并将其赋值给名为bcrypt的变量
import { Role } from 'src/modules/role/entities/role.entity';
import { Exclude } from 'class-transformer';
@Entity('user')
export class User {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true, comment: '用户ID' }) // unsigned 是 MySQL/数据库中的**无符号整数**概念，意思是只能存储非负数（0 和正整数）。
  id: number;

  @Column({ length: 50, unique: true, comment: '用户名' })
  username: string;

  @Column({ name: 'password_hash', length: 255, comment: '密码哈希值' })
  @Exclude()
  passwordHash: string;

  @Column({ length: 100, nullable: true, unique: true, comment: '邮箱' })
  email: string;

  @Column({ length: 20, nullable: true, comment: '手机号' })
  phone: string;

  @Column({ length: 200, nullable: true, comment: '头像URL' })
  avatar: string;

  @Column({ length: 50, nullable: true, comment: '昵称' })
  nickname: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-正常，2-禁用' }) // 当你设置了 default: 1，在插入数据时可以不传这个字段，数据库会自动使用默认值。
  status: number;

  @Column({
    name: 'last_login_at',
    type: 'datetime',
    nullable: true,
    comment: '最后登录时间',
  })
  lastLoginAt: Date;

  @Column({
    name: 'last_login_ip',
    length: 45,
    nullable: true,
    comment: '最后登录IP',
  })
  lastLoginIp: string;
  // 会在创建时自动写入时间
  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;
  // 会在创建/更新时自动写入时间
  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'delete_at', comment: '删除时间' })
  deleteAt: Date;
  /**
   * 多对多关联角色
   * 通过中间表 user_role 关联
   * 1.@ManyToMany 装饰器
   * () => Role：指定关联的实体是 Role（角色实体）
   * { eager: false }：懒加载模式，只有真正访问 user.roles 时才会查询数据库
   * 2.@JoinTable 装饰器
   * 这是多对多关系的必需配置，告诉 TypeORM 使用哪张中间表来维护关系。
   * 3.中间表结构
   * 配置会生成一张叫 user_role 的中间表：
   */
  // @ManyToMany(() => Role, { eager: false })
  // @JoinTable({
  //   name: 'user_role', // 中间表名
  //   // joinColumn.name 当前实体（User）在中间表的字段名
  //   // joinColumn.referencedColumnName 当前实体主键在中间表引用的列（就是当前实体在这个中间表名里的字段名是user_id，拿自己主表里的id列填入user_id）
  //   joinColumn: { name: 'user_id', referencedColumnName: 'id' },
  //   // inverseJoinColumn.name 关联实体（Role）在中间表的字段名
  //   // inverseJoinColumn.referencedColumnName 关联实体主键在中间表引用的列 (就是关联实体在这个中间表明里的字段名是role_id，拿自己主表里的id列填入role_id)
  //   inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  // })
  // roles: Role[];

  // -- //
  @ManyToOne(() => Role, (role) => role.users, {
    nullable: false,
    eager: false, // 默认不自动加载，要用relations
  })
  @JoinColumn({ name: 'role_id' }) // 自动加一行role_id字段到表里，不用@Column显示声明了
  role: Role;
  /**
   * 保存前自动哈希密码
   * 注意：这个钩子只在调用 save() 且设置了 password 字段时触发
   */
  //   @BeforeInsert()
  //   @BeforeUpdate()
  //   async hashPassword() {
  //     // 注意：这里需要单独处理密码字段，因为实际存的是 passwordHash
  //     // 通常我们会单独写一个 setPassword 方法
  //   }

  /**
   * 设置密码（自动加密）
   * @param plainPassword 明文密码
   */
  async setPassword(plainPassword: string) {
    const saltRounds = 10;
    this.passwordHash = await bcrypt.hash(plainPassword, saltRounds);
  }

  /**
   * 验证密码是否正确
   * @param plainPassword 输入的明文密码
   * @returns 是否匹配
   */
  async validatePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.passwordHash);
  }
}
