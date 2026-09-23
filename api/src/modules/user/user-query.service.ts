import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { USER_POLICY, USER_READER } from './constants'
// 接口只作为类型使用，且出现在被装饰的构造函数签名里：
// isolatedModules + emitDecoratorMetadata 下必须用 import type（否则 TS1272）
import type { UserPolicy } from './constants'
import { QueryUserDto } from './dto/query-user.dto'
import { UserResponseDto } from './dto/user-response.dto'
import { toUserResponse } from './user.mapper'
import type { UserRepository } from './user.repository'

/**
 * 读路径。注入的是更窄的 USER_READER 令牌，它与 USER_REPOSITORY 指向**同一个实例**
 * （见 user.module.ts 的 useExisting），这里刻意只声明自己需要的读方法。
 */
@Injectable()
export class UserQueryService {
  constructor(
    @Inject(USER_READER) private readonly reader: UserRepository,
    @Inject(USER_POLICY) private readonly policy: UserPolicy,
  ) {}

  list(query: QueryUserDto): UserResponseDto[] {
    return this.reader
      .findAll(query.keyword, this.policy.searchableFields)
      .map(toUserResponse)
  }

  detail(id: number): UserResponseDto {
    const user = this.reader.findById(id)
    if (!user) {
      throw new NotFoundException(`用户 ${id} 不存在`)
    }
    return toUserResponse(user)
  }
}
