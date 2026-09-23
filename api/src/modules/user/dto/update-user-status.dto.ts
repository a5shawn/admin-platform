import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'
import { UserStatus } from '../entities/user.entity'

/** 启用 / 禁用入参 */
export class UpdateUserStatusDto {
  @ApiProperty({
    description: '目标状态',
    enum: UserStatus,
    enumName: 'UserStatus',
    example: UserStatus.DISABLED,
  })
  @IsEnum(UserStatus, { message: '状态只能是 ACTIVE 或 DISABLED' })
  status!: UserStatus
}
