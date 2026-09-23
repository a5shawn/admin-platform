import { ConflictException, NotFoundException } from '@nestjs/common'
import { TestingModule } from '@nestjs/testing'
import { USER_REPOSITORY } from './constants'
import { UserStatus } from './entities/user.entity'
import { createUserTestingModule } from './user.testing'
import { UserRepository } from './user.repository'
import { UserService } from './user.service'

describe('UserService（写路径）', () => {
  let moduleRef: TestingModule
  let service: UserService
  let repository: UserRepository

  beforeEach(async () => {
    moduleRef = await createUserTestingModule()
    service = moduleRef.get(UserService)
    repository = moduleRef.get(USER_REPOSITORY)
  })

  afterEach(async () => {
    await moduleRef.close()
  })

  describe('create', () => {
    it('返回脱敏后的响应体，且不包含 passwordHash', () => {
      const created = service.create({
        username: 'newbie',
        email: 'newbie@example.com',
        nickname: '新人',
        password: '123456',
      })

      expect(created).toMatchObject({
        username: 'newbie',
        email: 'newbie@example.com',
        nickname: '新人',
        status: UserStatus.ACTIVE,
      })
      expect(created.id).toBeGreaterThan(0)
      expect(created).not.toHaveProperty('passwordHash')
    })

    it('密码经 PasswordHasher 处理后才落库', () => {
      const created = service.create({
        username: 'hashed',
        email: 'hashed@example.com',
        nickname: '哈希',
        password: '123456',
      })

      const stored = repository.findById(created.id)
      expect(stored?.passwordHash).toBe('plain$123456')
    })

    it('未指定状态时取用户模块策略里的默认值', () => {
      const created = service.create({
        username: 'defaulted',
        email: 'defaulted@example.com',
        nickname: '默认',
        password: '123456',
      })

      expect(created.status).toBe(UserStatus.ACTIVE)
    })

    it('显式传入状态时以传入值为准', () => {
      const created = service.create({
        username: 'explicit',
        email: 'explicit@example.com',
        nickname: '显式',
        password: '123456',
        status: UserStatus.DISABLED,
      })

      expect(created.status).toBe(UserStatus.DISABLED)
    })

    it('用户名重复时抛 409', () => {
      expect(() =>
        service.create({
          username: 'admin',
          email: 'another@example.com',
          nickname: '撞名',
          password: '123456',
        }),
      ).toThrow(ConflictException)
    })

    it('邮箱重复时抛 409', () => {
      expect(() =>
        service.create({
          username: 'another',
          email: 'admin@example.com',
          nickname: '撞邮箱',
          password: '123456',
        }),
      ).toThrow(ConflictException)
    })
  })

  describe('update', () => {
    it('只更新传入的字段，其余字段保持原值', () => {
      const updated = service.update(1, { nickname: '改名了' })

      expect(updated.nickname).toBe('改名了')
      expect(updated.email).toBe('admin@example.com')
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
        updated.createdAt.getTime(),
      )
    })

    it('邮箱改成一个已被占用的值时抛 409', () => {
      expect(() =>
        service.update(1, { email: 'operator@example.com' }),
      ).toThrow(ConflictException)
    })

    it('邮箱保持自身原值时不算冲突', () => {
      expect(() =>
        service.update(1, { email: 'admin@example.com' }),
      ).not.toThrow()
    })

    it('用户不存在时抛 404', () => {
      expect(() => service.update(9999, { nickname: 'x' })).toThrow(
        NotFoundException,
      )
    })
  })

  describe('updateStatus', () => {
    it('可把用户禁用再启用', () => {
      expect(
        service.updateStatus(1, { status: UserStatus.DISABLED }).status,
      ).toBe(UserStatus.DISABLED)
      expect(
        service.updateStatus(1, { status: UserStatus.ACTIVE }).status,
      ).toBe(UserStatus.ACTIVE)
    })

    it('用户不存在时抛 404', () => {
      expect(() =>
        service.updateStatus(9999, { status: UserStatus.ACTIVE }),
      ).toThrow(NotFoundException)
    })
  })

  describe('remove', () => {
    it('删除后仓储里不再有该用户', () => {
      const before = repository.count()
      expect(service.remove(1)).toEqual({ success: true })
      expect(repository.count()).toBe(before - 1)
      expect(repository.findById(1)).toBeUndefined()
    })

    it('重复删除同一个用户抛 404', () => {
      service.remove(1)
      expect(() => service.remove(1)).toThrow(NotFoundException)
    })
  })
})
