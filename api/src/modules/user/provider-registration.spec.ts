import { Scope } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import {
  DEFAULT_USER_POLICY,
  PASSWORD_HASHER,
  USER_POLICY,
  USER_READER,
  USER_REPOSITORY,
  UserPolicy,
} from './constants'
import { PasswordHasher, PlainTextPasswordHasher } from './password-hasher'
import { createUserTestingModule } from './user.testing'
import { InMemoryUserRepository, UserRepository } from './user.repository'

/**
 * M2 学习用规格：把 Provider 的四种注册方式与作用域落成可执行的断言。
 * 这些结论直接对应「自测问题」，改动注册方式时这里会先失败。
 */
describe('Provider 四种注册方式', () => {
  it('useValue：令牌解析到的就是那个现成对象（同一个引用）', async () => {
    const moduleRef = await createUserTestingModule()

    expect(moduleRef.get<UserPolicy>(USER_POLICY)).toBe(DEFAULT_USER_POLICY)

    await moduleRef.close()
  })

  it('useClass：由 Nest 负责实例化，得到的是该类实例', async () => {
    const moduleRef = await createUserTestingModule()

    const hasher = moduleRef.get<PasswordHasher>(PASSWORD_HASHER)
    expect(hasher).toBeInstanceOf(PlainTextPasswordHasher)
    expect(hasher.hash('123456')).toBe('plain$123456')

    await moduleRef.close()
  })

  it('useFactory：工厂能拿到注入的配置，种子条数随 USER_SEED_SIZE 变化', async () => {
    const moduleRef = await createUserTestingModule(2)

    const repository = moduleRef.get<InMemoryUserRepository>(USER_REPOSITORY)
    expect(repository).toBeInstanceOf(InMemoryUserRepository)
    expect(repository.count()).toBe(2)

    await moduleRef.close()
  })

  it('useExisting：别名与目标令牌是同一个实例，不会新建', async () => {
    const moduleRef = await createUserTestingModule()

    const viaAlias = moduleRef.get<UserRepository>(USER_READER)
    const viaTarget = moduleRef.get<UserRepository>(USER_REPOSITORY)
    expect(viaAlias).toBe(viaTarget)

    await moduleRef.close()
  })
})

describe('Provider 作用域', () => {
  const DEFAULT_SCOPED = Symbol('DEFAULT_SCOPED')
  const REQUEST_SCOPED = Symbol('REQUEST_SCOPED')
  type ScopedProbe = { scope: string }

  it('默认作用域是单例，REQUEST 作用域每次解析都是新实例', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        { provide: DEFAULT_SCOPED, useFactory: () => ({ scope: 'default' }) },
        {
          provide: REQUEST_SCOPED,
          scope: Scope.REQUEST,
          useFactory: () => ({ scope: 'request' }),
        },
      ],
    }).compile()

    // DEFAULT：整个应用共享一个实例
    expect(moduleRef.get<ScopedProbe>(DEFAULT_SCOPED)).toBe(
      moduleRef.get<ScopedProbe>(DEFAULT_SCOPED),
    )

    // REQUEST：没有请求上下文时每次解析都会新建，这正是「按请求隔离」的代价来源
    const first = await moduleRef.resolve<ScopedProbe>(REQUEST_SCOPED)
    const second = await moduleRef.resolve<ScopedProbe>(REQUEST_SCOPED)
    expect(first).not.toBe(second)

    await moduleRef.close()
  })
})
