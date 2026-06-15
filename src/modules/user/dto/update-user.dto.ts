import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsNotEmpty({ message: '请提供ID' })
  @IsInt()
  id: number;

  @IsNotEmpty({ message: '请输入旧密码' })
  oldPassword: string;

  @IsNotEmpty({ message: '请输入新密码' })
  newPassword: string;
}
