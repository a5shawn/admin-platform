import request from '@/common/http/request'
import type { User, UserStatus } from '@/common/types/user'

/** 用户列表；keyword 会模糊匹配用户名 / 邮箱 / 昵称 */
export async function listUsers(keyword?: string): Promise<User[]> {
  const { data } = await request.get<User[]>('/users', {
    params: keyword ? { keyword } : undefined,
  })
  return data
}

/** 启用 / 禁用 */
export async function updateUserStatus(id: number, status: UserStatus): Promise<User> {
  const { data } = await request.patch<User>(`/users/${id}/status`, { status })
  return data
}

/** 删除（M4 改为软删除） */
export async function removeUser(id: number): Promise<{ success: boolean }> {
  const { data } = await request.delete<{ success: boolean }>(`/users/${id}`)
  return data
}
