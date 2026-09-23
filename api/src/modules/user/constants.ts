import { UserStatus } from './entities/user.entity'

/**
 * 用户仓储令牌。Service 只依赖这个令牌，不关心背后是内存数组还是 Prisma。
 */
export const USER_REPOSITORY = Symbol('USER_REPOSITORY')

/**
 * 只读仓储令牌：通过 useExisting 指向 USER_REPOSITORY 的**同一个实例**，
 * 让读路径依赖更窄的契约（见 user.module.ts）。
 */
export const USER_READER = Symbol('USER_READER')

/**
 * 密码哈希器令牌。M2 用占位实现，M6 接入认证时换成 bcrypt，使用者无需改动。
 */
export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER')

/**
 * 用户模块策略令牌：用 useValue 注册的纯配置对象（无依赖、可直接替换）。
 */
export const USER_POLICY = Symbol('USER_POLICY')

/** 可参与关键字搜索的字段 */
export type UserSearchableField = 'username' | 'email' | 'nickname'

export interface UserPolicy {
  /** 新建用户未指定状态时使用的默认值 */
  defaultStatus: UserStatus
  /** 列表关键字搜索命中的字段 */
  searchableFields: UserSearchableField[]
}

export const DEFAULT_USER_POLICY: UserPolicy = {
  defaultStatus: UserStatus.ACTIVE,
  searchableFields: ['username', 'email', 'nickname'],
}
