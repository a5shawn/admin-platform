import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator'

/**
 * 更新用户入参。
 * 用户名是登录凭据的一部分，M2 起即不允许修改；状态走独立的 PATCH /users/:id/status。
 *
 * 两个字段都是可选的：`@IsOptional()` 让「没传」合法，但**传了就必须合法**
 * （空串会走 `@Length` 被判 400，不会被当成「没传」）。
 */
export class UpdateUserDto {
  @ApiPropertyOptional({
    description: '邮箱（唯一）',
    example: 'zhangsan@example.com',
  })
  @IsOptional()
  @IsString({ message: '邮箱必须是字符串' })
  @MaxLength(50, { message: '邮箱长度不能超过 50 个字符' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string

  @ApiPropertyOptional({ description: '昵称', example: '张三' })
  @IsOptional()
  @IsString({ message: '昵称必须是字符串' })
  @Length(1, 20, { message: '昵称长度必须是 1–20 个字符' })
  nickname?: string
}
