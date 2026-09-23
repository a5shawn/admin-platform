/** 与后端 UserResponseDto 对应 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
}

export interface User {
  id: number
  username: string
  email: string
  nickname: string
  status: UserStatus
  /** 后端返回 ISO 字符串（JSON 序列化后的 Date） */
  createdAt: string
  updatedAt: string
}
