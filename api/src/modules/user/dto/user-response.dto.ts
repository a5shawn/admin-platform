import { ApiProperty } from '@nestjs/swagger'
import { UserStatus } from '../entities/user.entity'

/**
 * 用户响应体：**不含 passwordHash**。
 * 实体与响应体分开定义，避免哪天顺手把哈希返回出去。
 */
export class UserResponseDto {
  @ApiProperty({ description: '用户 ID', example: 1 })
  id!: number

  @ApiProperty({ description: '用户名', example: 'admin' })
  username!: string

  @ApiProperty({ description: '邮箱', example: 'admin@example.com' })
  email!: string

  @ApiProperty({ description: '昵称', example: '超级管理员' })
  nickname!: string

  @ApiProperty({
    description: '状态',
    enum: UserStatus,
    enumName: 'UserStatus',
    example: UserStatus.ACTIVE,
  })
  status!: UserStatus

  @ApiProperty({ description: '创建时间', example: '2026-09-22T14:00:00.000Z' })
  createdAt!: Date

  @ApiProperty({ description: '更新时间', example: '2026-09-22T14:00:00.000Z' })
  updatedAt!: Date
}
