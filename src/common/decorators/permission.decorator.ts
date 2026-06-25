// 这个自定义装饰器 RequirePermissions 的核心作用，就是为后续的 Guard（守卫） 通过 Reflector 读取元数据做准备。
import { SetMetadata } from '@nestjs/common';
export const RequirePermissions = (...codes: string[]) =>
    SetMetadata('permissions', codes);