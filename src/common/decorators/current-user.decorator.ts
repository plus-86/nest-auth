import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/modules/user/entities/user.entity';

export const CurrentUser = createParamDecorator(
  // keyof 是 TypeScript 中的类型操作符用于获取对象类型的所有键（key）组成的联合类型。
  //   interface User {
  //   id: number;
  //   name: string;
  //   age: number;
  //   email: string;
  // }
  // keyof User 的结果是: "id" | "name" | "age" | "email"
  // type UserKeys = keyof User;  // "id" | "name" | "age" | "email"


  // data是调用这个自定义装饰器传的参数，冒号后面是User实体里加上undefined声明的联合类型
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const user = request.user;
    // 如果传了key进来就返回指定key的值
    if (data) return user?.[data];

    return user;
  },
);
