import { Logger, OnApplicationShutdown, OnModuleInit } from '@nestjs/common'
import { UserSearchableField } from './constants'
import { UserCreateInput, UserEntity, UserStatus } from './entities/user.entity'
import { PasswordHasher } from './password-hasher'

/**
 * 仓储契约。Service 只依赖这个接口，因此 M4 换成 Prisma 实现时，
 * Service / Controller 都不需要改动。
 */
export interface UserRepository {
  findAll(keyword?: string, fields?: UserSearchableField[]): UserEntity[]
  findById(id: number): UserEntity | undefined
  findByUsername(username: string): UserEntity | undefined
  findByEmail(email: string): UserEntity | undefined
  create(input: UserCreateInput): UserEntity
  update(
    id: number,
    patch: Partial<Omit<UserEntity, 'id' | 'createdAt'>>,
  ): UserEntity | undefined
  remove(id: number): boolean
  count(): number
}

/** 种子数据模板：seedSize 决定取前几条，保证可重复（不用随机数） */
const SEED_PRESETS: Array<Omit<UserCreateInput, 'passwordHash'>> = [
  {
    username: 'admin',
    email: 'admin@example.com',
    nickname: '超级管理员',
    status: UserStatus.ACTIVE,
  },
  {
    username: 'operator',
    email: 'operator@example.com',
    nickname: '运营',
    status: UserStatus.ACTIVE,
  },
  {
    username: 'viewer',
    email: 'viewer@example.com',
    nickname: '只读用户',
    status: UserStatus.DISABLED,
  },
  {
    username: 'auditor',
    email: 'auditor@example.com',
    nickname: '审计员',
    status: UserStatus.ACTIVE,
  },
]

/**
 * 内存实现：数据存在 Map 里，**进程一重启就没了**（M2 的预期行为，M4 换 Prisma）。
 *
 * 注意两点：
 * 1. 它由 useFactory 创建，所以不需要 `@Injectable()`——只有需要 Nest 帮忙解析构造参数的类才需要。
 * 2. 即便是工厂创建的实例，Nest 依然会调用它的生命周期钩子（见 onModuleInit）。
 */
export class InMemoryUserRepository
  implements UserRepository, OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(InMemoryUserRepository.name)
  private readonly users = new Map<number, UserEntity>()
  private sequence = 0

  constructor(
    private readonly seedSize: number,
    private readonly hasher: PasswordHasher,
  ) {}

  onModuleInit(): void {
    this.seed()
    this.logger.log(
      `内存用户仓储就绪：${this.users.size} 条种子数据（重启即清空；M4 换成 Prisma）`,
    )
  }

  onApplicationShutdown(signal?: string): void {
    const total = this.users.size
    this.users.clear()
    this.logger.log(
      `内存用户仓储已释放 ${total} 条数据（signal=${signal ?? 'unknown'}）`,
    )
  }

  findAll(
    keyword?: string,
    fields: UserSearchableField[] = ['username'],
  ): UserEntity[] {
    const list = [...this.users.values()].sort((a, b) => a.id - b.id)
    const needle = keyword?.trim().toLowerCase()
    if (!needle) {
      return list
    }
    return list.filter((user) =>
      fields.some((field) => user[field].toLowerCase().includes(needle)),
    )
  }

  findById(id: number): UserEntity | undefined {
    return this.users.get(id)
  }

  findByUsername(username: string): UserEntity | undefined {
    return this.findBy((user) => user.username === username)
  }

  findByEmail(email: string): UserEntity | undefined {
    return this.findBy((user) => user.email === email)
  }

  create(input: UserCreateInput): UserEntity {
    const now = new Date()
    const entity: UserEntity = {
      ...input,
      id: ++this.sequence,
      createdAt: now,
      updatedAt: now,
    }
    this.users.set(entity.id, entity)
    return entity
  }

  update(
    id: number,
    patch: Partial<Omit<UserEntity, 'id' | 'createdAt'>>,
  ): UserEntity | undefined {
    const current = this.users.get(id)
    if (!current) {
      return undefined
    }
    // spread 会覆盖同名字段，所以调用方必须先把 undefined 剔除掉
    const next: UserEntity = {
      ...current,
      ...patch,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: new Date(),
    }
    this.users.set(id, next)
    return next
  }

  remove(id: number): boolean {
    return this.users.delete(id)
  }

  count(): number {
    return this.users.size
  }

  private findBy(
    predicate: (user: UserEntity) => boolean,
  ): UserEntity | undefined {
    for (const user of this.users.values()) {
      if (predicate(user)) {
        return user
      }
    }
    return undefined
  }

  private seed(): void {
    const presets = SEED_PRESETS.slice(0, Math.max(0, this.seedSize))
    for (const preset of presets) {
      this.create({ ...preset, passwordHash: this.hasher.hash('123456') })
    }
  }
}
