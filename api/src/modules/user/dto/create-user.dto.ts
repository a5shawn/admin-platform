import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { UserStatus } from '../entities/user.entity'

/**
 * 创建用户入参。
 * M2 只描述结构与 Swagger 文档，字段校验（class-validator + 全局 ValidationPipe）在 M3 加入。
 */
export class CreateUserDto {
  @ApiProperty({ description: '用户名（唯一）', example: 'zhangsan' })
  username!: string

  @ApiProperty({ description: '邮箱（唯一）', example: 'zhangsan@example.com' })
  email!: string

  @ApiProperty({ description: '昵称', example: '张三' })
  nickname!: string

  @ApiProperty({
    description: '明文密码（M3 起校验强度，M6 起改用 bcrypt 存储）',
    example: '123456',
  })
  password!: string

  @ApiPropertyOptional({
    description: '状态；不传则取用户模块策略里的默认值',
    enum: UserStatus,
    enumName: 'UserStatus',
  })
  status?: UserStatus
}
