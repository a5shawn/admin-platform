import { ApiProperty } from '@nestjs/swagger'
import { UserStatus } from '../entities/user.entity'

/** 启用 / 禁用入参 */
export class UpdateUserStatusDto {
  @ApiProperty({
    description: '目标状态',
    enum: UserStatus,
    enumName: 'UserStatus',
    example: UserStatus.DISABLED,
  })
  status!: UserStatus
}
