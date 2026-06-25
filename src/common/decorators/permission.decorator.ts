import { SetMetadata } from '@nestjs/common';
export const RequirePermissions = (...codes: string[]) =>
    SetMetadata('permissions', codes);