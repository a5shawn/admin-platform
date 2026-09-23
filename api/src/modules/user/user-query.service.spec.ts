import { NotFoundException } from '@nestjs/common'
import { TestingModule } from '@nestjs/testing'
import { createUserTestingModule } from './user.testing'
import { UserQueryService } from './user-query.service'

describe('UserQueryService（读路径）', () => {
  let moduleRef: TestingModule
  let service: UserQueryService

  beforeEach(async () => {
    moduleRef = await createUserTestingModule()
    service = moduleRef.get(UserQueryService)
  })

  afterEach(async () => {
    await moduleRef.close()
  })

  describe('list', () => {
    it('返回全部种子用户，按 id 升序', () => {
      const list = service.list({})

      expect(list).toHaveLength(3)
      expect(list.map((user) => user.id)).toEqual([1, 2, 3])
      expect(list.map((user) => user.username)).toEqual([
        'admin',
        'operator',
        'viewer',
      ])
    })

    it('响应体不含 passwordHash', () => {
      for (const user of service.list({})) {
        expect(user).not.toHaveProperty('passwordHash')
      }
    })

    it('关键字可命中用户名', () => {
      const list = service.list({ keyword: 'oper' })

      expect(list.map((user) => user.username)).toEqual(['operator'])
    })

    it('关键字可命中邮箱', () => {
      const list = service.list({ keyword: 'viewer@example.com' })

      expect(list.map((user) => user.username)).toEqual(['viewer'])
    })

    it('关键字可命中昵称', () => {
      const list = service.list({ keyword: '只读' })

      expect(list.map((user) => user.username)).toEqual(['viewer'])
    })

    it('关键字忽略大小写与首尾空格', () => {
      expect(service.list({ keyword: '  ADMIN ' })).toHaveLength(1)
    })

    it('无命中时返回空数组', () => {
      expect(service.list({ keyword: '不存在的关键字' })).toEqual([])
    })

    it('关键字为空串时返回全部', () => {
      expect(service.list({ keyword: '   ' })).toHaveLength(3)
    })
  })

  describe('detail', () => {
    it('按 id 返回用户', () => {
      const user = service.detail(1)

      expect(user).toMatchObject({
        id: 1,
        username: 'admin',
        nickname: '超级管理员',
      })
      expect(user).not.toHaveProperty('passwordHash')
    })

    it('用户不存在时抛 404', () => {
      expect(() => service.detail(9999)).toThrow(NotFoundException)
    })
  })
})
