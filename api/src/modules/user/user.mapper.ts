import { UserResponseDto } from './dto/user-response.dto'
import { UserEntity } from './entities/user.entity'

/**
 * 实体 → 响应体。所有对外输出都必须经过这里，确保 passwordHash 不会外泄。
 * 逐字段显式赋值而不是解构剔除，是为了新增字段时编译器能提醒你补上映射。
 */
export function toUserResponse(entity: UserEntity): UserResponseDto {
  return {
    id: entity.id,
    username: entity.username,
    email: entity.email,
    nickname: entity.nickname,
    status: entity.status,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  }
}
