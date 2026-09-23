import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator'
import { UserStatus } from '../entities/user.entity'

/**
 * 创建用户入参。
 *
 * 这里的装饰器同时承担两件事：`@ApiProperty*` 描述 Swagger，`class-validator` 描述约束。
 * 约束由全局 `ValidationPipe` 执行（配置见 `src/common/pipes/validation.ts`）——
 * **没有校验装饰器的字段会被 whitelist 剥离**，所以每个入参字段都必须带约束。
 */
export class CreateUserDto {
  @ApiProperty({ description: '用户名（唯一）', example: 'zhangsan' })
  @IsString({ message: '用户名必须是字符串' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @Length(3, 20, { message: '用户名长度必须是 3–20 个字符' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: '用户名只能包含字母、数字和下划线',
  })
  username!: string

  @ApiProperty({ description: '邮箱（唯一）', example: 'zhangsan@example.com' })
  @IsString({ message: '邮箱必须是字符串' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  @MaxLength(50, { message: '邮箱长度不能超过 50 个字符' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email!: string

  @ApiProperty({ description: '昵称', example: '张三' })
  @IsString({ message: '昵称必须是字符串' })
  @IsNotEmpty({ message: '昵称不能为空' })
  @Length(1, 20, { message: '昵称长度必须是 1–20 个字符' })
  nickname!: string

  @ApiProperty({
    description: '明文密码（M6 起改用 bcrypt 存储）',
    example: '123456',
  })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度不能少于 6 个字符' })
  @MaxLength(64, { message: '密码长度不能超过 64 个字符' })
  password!: string

  @ApiPropertyOptional({
    description: '状态；不传则取用户模块策略里的默认值',
    enum: UserStatus,
    enumName: 'UserStatus',
  })
  @IsOptional()
  @IsEnum(UserStatus, { message: '状态只能是 ACTIVE 或 DISABLED' })
  status?: UserStatus
}
