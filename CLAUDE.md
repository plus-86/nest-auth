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
```

## 项目架构

基于 **NestJS 11 + TypeORM + MySQL** 的 RBAC 管理员后台系统。已实现完整的 JWT 认证、权限守卫和菜单树接口。

### 模块与路由

```
src/
├── main.ts                                  # 入口：ValidationPipe + ClassSerializerInterceptor 全局注册
├── app.module.ts                            # 根模块，导入业务模块
├── app.service.ts                           # GET / -> "Hello World!"
├── config/
│   └── database.config.ts                   # TypeORM 配置工厂（开发环境 synchronize+logging 开启）
├── common/
│   ├── decorators/
│   │   ├── current-user.decorator.ts        # @CurrentUser() 提取 req.user，支持取指定字段
│   │   └── permission.decorator.ts          # @RequirePermissions('user:create') 声明所需权限码
│   └── guards/
│       ├── permission.guard.ts              # PermissionsGuard：匹配任意一个所需权限码即放行
│       └── role.guard.ts                    # RoleGuard：检查 role.code === 'ROLE_SUPER_ADMIN'
├── modules/
│   ├── auth/                                # 路由前缀 /auth，无需守卫（login 用 LocalGuard）
│   │   ├── auth.module.ts                   # 导入 PassportModule + JwtModule + UserModule
│   │   ├── auth.controller.ts               # POST /login -> JWT | GET /menus -> 菜单树
│   │   ├── auth.service.ts                  # validateUser + login（签发JWT）+ getMenus
│   │   └── strategies/
│   │       ├── local.strategy.ts            # passport-local，body 取 username 字段
│   │       └── jwt.strategy.ts              # passport-jwt，Bearer header 提取；validate 中查出完整用户及权限码
│   ├── user/                                # 路由前缀 /user，类级守卫：JwtAuth + PermissionsGuard
│   │   ├── user.controller.ts               # POST create | GET list | POST update（改密码）| POST delete
│   │   ├── user.service.ts                  # 真实实现：查重、级联加载角色、软删除、密码校验
│   │   ├── dto/                             # CreateUserDto + UpdateUserDto（含 oldPassword/newPassword）
│   │   └── entities/
│   │       └── user.entity.ts               # 表 user，password_hash 用 @Exclude()
│   ├── role/                                # 路由前缀 /role，无类级守卫
│   │   ├── role.controller.ts               # POST create | GET list | GET :id | POST update | DELETE :id
│   │   ├── role.service.ts                  # create/update/findOne 已实现; findAll/remove 仍为占位符
│   │   ├── dto/                             # CreateRoleDto + UpdateRoleDto（permissionCodes 字符串数组）
│   │   └── entities/
│   │       └── role.entity.ts               # 表 role，多对多关联 permission（中间表 role_permission）
│   └── permission/                          # 路由前缀 /permission，无类级守卫
│       ├── permission.controller.ts         # POST create | GET list | GET :id | PATCH :id | DELETE :id
│       ├── permission.service.ts            # getMenuByPermCodes（递归构建菜单树）已实现; 其余为占位符
│       ├── dto/                             # CreatePermissionDto + UpdatePermissionDto
│       └── entities/
│           └── permission.entity.ts         # 表 permission，支持 parentId 层级
```

### RBAC 模型

```
User ──<many-to-one>── Role ──<many-to-many>── Permission
                           │
                           └─ 中间表: role_permission
```

- **User**: int unsigned PK，username（唯一），passwordHash（bcrypt），email，phone，status（1=正常，2=禁用），role_id 外键。内置 `setPassword()` 和 `validatePassword()`（saltRounds=10）
- **Role**: code（唯一，如"admin"），name，status，isSystem，roleLevel，sortOrder
- **Permission**: code（唯一，如"user:create"），name，parentId（支持树形菜单），path（前端路由），icon，type（1=目录，2=菜单，3=API），sortOrder

### 认证与授权流程

1. `POST /auth/login` → `LocalStrategy.validate()` → `AuthService.validateUser()` 校验密码 → `AuthService.login()` 签发 JWT（payload: `{ userId, username }`）
2. 后续请求携带 `Authorization: Bearer <token>` → `JwtStrategy.validate()` 中通过 userId 查出完整 User（含 `role.permissions`），将权限码数组挂到 `user.permissionCodes` 上
3. 接口上的 `@RequirePermissions('user:create')` → `PermissionsGuard` 读取元数据，与 `user.permissionCodes` 用 `some()` 匹配（OR 逻辑），任一匹配即放行
4. `GET /auth/menus` → `PermissionService.getMenuByPermCodes()` 根据用户权限码查询 type=1/2 的权限，`buildTree()` 递归构建嵌套树

### 编码约定

- Controller 方法顺序：find(Get) → findOne(Get/:id) → create(Post) → update(Patch/:id) → remove(Delete/:id)
- DTO 命名：`Create*Dto`，`Update*Dto` 通过 `PartialType()` 继承
- Controller 参数中 id 用 `+id` 转换为数字
- 路由统一用 POST（除角色和权限模块外），而非 RESTful 语义动词
- `.env` 存放数据库和 JWT 配置

### 环境变量

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

### 待完善部分

- `RoleService.findAll()` 和 `remove()`、`PermissionService` 大部分方法仍是占位符
- Role 和 Permission 模块的 Controller 未加 AuthGuard/PermissionsGuard
- 单元测试仅验证模块可编译，无业务逻辑测试
- `.http` 文件中的 JWT token 是硬编码的示例值
