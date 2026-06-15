# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# 安装依赖
npm install

# 开发启动（带热重载）
npm run start:dev

# 生产构建与启动
npm run build
npm run start:prod

# 代码检查（ESLint + Prettier 自动修复）
npm run lint

# 格式化代码
npm run format

# 运行所有单元测试
npm run test

# 监听模式运行单元测试
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:cov

# 运行端到端测试
npm run test:e2e

# 运行单个测试文件
npx jest -- src/modules/user/user.service.spec.ts

# 调试模式启动
npm run start:debug
```

## 项目架构

这是一个基于 **NestJS 11 + TypeORM + MySQL** 的 RBAC（基于角色的访问控制）管理员后台系统。

### 模块结构

```
src/
├── main.ts                        # 应用入口，监听端口（默认 3000）
├── app.module.ts                  # 根模块，导入 ConfigModule、TypeOrmModule、业务模块
├── app.service.ts                 # 根服务，返回 "Hello World!"
├── config/
│   └── database.config.ts         # TypeORM 数据库配置工厂（读取 .env）
└── modules/
    ├── user/                      # 用户管理（路由前缀 /user）
    │   ├── user.module.ts
    │   ├── user.controller.ts     # CRUD: find, findOne, create, update, remove
    │   ├── user.service.ts
    │   ├── dto/
    │   │   ├── create-user.dto.ts
    │   │   └── update-user.dto.ts # PartialType(CreateUserDto)
    │   └── entities/
    │       └── user.entity.ts     # User 实体，多对多关联 Role
    ├── role/                      # 角色管理（路由前缀 /role）
    │   ├── role.module.ts
    │   ├── role.controller.ts
    │   ├── role.service.ts
    │   ├── dto/                   # CreateRoleDto, UpdateRoleDto
    │   └── entities/
    │       └── role.entity.ts     # Role 实体，多对多关联 User 和 Permission
    └── permission/                # 权限管理（路由前缀 /permission）
        ├── permission.module.ts
        ├── permission.controller.ts
        ├── permission.service.ts
        ├── dto/                   # CreatePermissionDto, UpdatePermissionDto
        └── entities/
            └── permission.entity.ts  # Permission 实体，支持 parentId 层级菜单树
```

### RBAC 实体关系

```
User ──<many-to-many>── Role ──<many-to-many>── Permission
  │                         │
  └─ 中间表: user_role      └─ 中间表: role_permission
```

- **User**: bigint 主键，username（唯一），passwordHash（bcrypt），email，phone，status（1=正常，2=禁用）
- **Role**: code（唯一，如 "admin"），name，status，isSystem，sortOrder
- **Permission**: code（唯一，如 "user:create"），resource，action，type（1=菜单，2=按钮），支持 parentId 层级结构

User 实体内置 `setPassword()` 和 `validatePassword()` 方法（bcrypt，saltRounds=10）。

### 当前状态与待办事项

- ✅ 完整的数据表结构定义与实体关系
- ✅ 基础 CRUD 路由（Controller + DTO 骨架）
- ✅ 数据库连接配置（MySQL + TypeORM）
- ✅ JWT/Passport/bcrypt 依赖已安装
- ❌ **Service 层方法目前仅返回占位字符串**（如 `'This action adds a new user'`），未实现真实数据库操作
- ❌ **认证模块缺失**：没有 `AuthModule`、JWT Strategy、登录端点、AuthGuard
- ❌ **DTO 验证器装饰器未添加**：class-validator 装饰器尚未应用到 DTO 字段
- ❌ **权限/角色守卫未实现**：没有 `RolesGuard`、`PermissionsGuard` 或自定义装饰器
- ❌ 单元测试仅验证模块已定义，无业务逻辑测试

### 编码约定

- 每个模块独立目录，含 controller/service/dto/entities
- Controller 路由方法顺序：find(Get) → findOne(Get/:id) → create(Post) → update(Patch/:id) → remove(Delete/:id)
- DTO 命名：`Create*Dto`，`Update*Dto` 通过 `PartialType()` 继承
- Controller 参数中 id 用 `+id` 转换为数字
- `.env` 存放数据库和 JWT 配置

### 环境变量（.env）

```
PORT=3000
DB_HOST=localhost / DB_PORT=3306 / DB_USERNAME=root / DB_PASSWORD=root / DB_DATABASE=admin_system
JWT_SECRET / JWT_EXPIRES_IN=7d
```

### 数据库配置

`src/config/database.config.ts` 使用 TypeORM `forRootAsync`：
- 开发环境启用 `synchronize: true` 和 `logging: true`
- 时区 `+08:00`（北京时间）
- 自动扫描 `**/*.entity{.ts,.js}`
