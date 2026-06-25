import { IsNotEmpty, IsString } from "class-validator";

export class CreatePermissionDto {
    @IsNotEmpty()
    @IsString()
    code: string

    @IsNotEmpty()
    @IsString()
    name: string
}
