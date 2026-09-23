import { ApiPropertyOptional } from '@nestjs/swagger'

/**
 * 更新用户入参。
 * 用户名是登录凭据的一部分，M2 起即不允许修改；状态走独立的 PATCH /users/:id/status。
 */
export class UpdateUserDto {
  @ApiPropertyOptional({
    description: '邮箱（唯一）',
    example: 'zhangsan@example.com',
  })
  email?: string

  @ApiPropertyOptional({ description: '昵称', example: '张三' })
  nickname?: string
}
