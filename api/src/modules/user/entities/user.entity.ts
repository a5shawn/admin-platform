export enum UserStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
}

/**
 * 用户实体（内存版）。
 * 字段设计对齐 M4 的 Prisma `User` 模型：用户名 / 邮箱 / 密码哈希 / 昵称 / 状态 / 时间戳。
 */
export interface UserEntity {
  id: number
  username: string
  email: string
  nickname: string
  /** 密码哈希：只在仓储与 Service 内部流转，绝不出现在响应体里 */
  passwordHash: string
  status: UserStatus
  createdAt: Date
  updatedAt: Date
}

/** 新建用户时由仓储补齐 id 与时间戳 */
export type UserCreateInput = Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>
