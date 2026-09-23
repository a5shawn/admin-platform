import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PASSWORD_HASHER, USER_POLICY, USER_REPOSITORY } from './constants'
// 接口只作为类型使用，且出现在被装饰的构造函数签名里：
// isolatedModules + emitDecoratorMetadata 下必须用 import type（否则 TS1272）
import type { UserPolicy } from './constants'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserStatusDto } from './dto/update-user-status.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserResponseDto } from './dto/user-response.dto'
import type { UserEntity } from './entities/user.entity'
import type { PasswordHasher } from './password-hasher'
import { toUserResponse } from './user.mapper'
import type { UserRepository } from './user.repository'

/**
 * 写路径。Controller 只做参数编排，校验唯一性、取默认状态、哈希密码这些业务规则都在这里。
 */
@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly repository: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    @Inject(USER_POLICY) private readonly policy: UserPolicy,
  ) {}

  create(dto: CreateUserDto): UserResponseDto {
    this.assertUsernameAvailable(dto.username)
    this.assertEmailAvailable(dto.email)

    const created = this.repository.create({
      username: dto.username,
      email: dto.email,
      nickname: dto.nickname,
      passwordHash: this.hasher.hash(dto.password),
      status: dto.status ?? this.policy.defaultStatus,
    })
    return toUserResponse(created)
  }

  update(id: number, dto: UpdateUserDto): UserResponseDto {
    const current = this.mustFind(id)

    if (dto.email !== undefined && dto.email !== current.email) {
      this.assertEmailAvailable(dto.email)
    }

    // 只把显式传入的字段放进 patch：spread 时 undefined 会覆盖掉原值
    const patch: Partial<Pick<UserEntity, 'email' | 'nickname'>> = {}
    if (dto.email !== undefined) {
      patch.email = dto.email
    }
    if (dto.nickname !== undefined) {
      patch.nickname = dto.nickname
    }

    const updated = this.repository.update(id, patch)
    if (!updated) {
      throw new NotFoundException(`用户 ${id} 不存在`)
    }
    return toUserResponse(updated)
  }

  updateStatus(id: number, dto: UpdateUserStatusDto): UserResponseDto {
    const updated = this.repository.update(id, { status: dto.status })
    if (!updated) {
      throw new NotFoundException(`用户 ${id} 不存在`)
    }
    return toUserResponse(updated)
  }

  remove(id: number): { success: boolean } {
    if (!this.repository.remove(id)) {
      throw new NotFoundException(`用户 ${id} 不存在`)
    }
    return { success: true }
  }

  private mustFind(id: number): UserEntity {
    const user = this.repository.findById(id)
    if (!user) {
      throw new NotFoundException(`用户 ${id} 不存在`)
    }
    return user
  }

  private assertUsernameAvailable(username: string): void {
    if (this.repository.findByUsername(username)) {
      throw new ConflictException(`用户名 ${username} 已存在`)
    }
  }

  private assertEmailAvailable(email: string): void {
    if (this.repository.findByEmail(email)) {
      throw new ConflictException(`邮箱 ${email} 已被占用`)
    }
  }
}
