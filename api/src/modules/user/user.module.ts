import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  DEFAULT_USER_POLICY,
  PASSWORD_HASHER,
  USER_POLICY,
  USER_READER,
  USER_REPOSITORY,
} from './constants'
import { PasswordHasher, PlainTextPasswordHasher } from './password-hasher'
import { UserController } from './user.controller'
import { UserQueryService } from './user-query.service'
import { InMemoryUserRepository } from './user.repository'
import { UserService } from './user.service'

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    UserQueryService,

    // ① useValue：直接把现成对象当 Provider。适合无依赖的配置/常量。
    { provide: USER_POLICY, useValue: DEFAULT_USER_POLICY },

    // ② useClass：令牌 → 类，由 Nest 负责实例化。M6 换成 BcryptPasswordHasher 即可。
    { provide: PASSWORD_HASHER, useClass: PlainTextPasswordHasher },

    // ③ useFactory：自己决定怎么构造，并且能注入别的 Provider。
    //    这里把 ConfigService 注入工厂读 USER_SEED_SIZE——改 .env 里的值就能看到种子
    //    条数变化，是「DI 真的生效」最直接的证据；换实现时也只动这一处。
    {
      provide: USER_REPOSITORY,
      inject: [ConfigService, PASSWORD_HASHER],
      useFactory: (config: ConfigService, hasher: PasswordHasher) =>
        new InMemoryUserRepository(
          config.get<number>('USER_SEED_SIZE', 3),
          hasher,
        ),
    },

    // ④ useExisting：给同一个实例再起一个别名（不会创建新实例）。
    //    读路径依赖更窄的 USER_READER，写路径依赖 USER_REPOSITORY。
    { provide: USER_READER, useExisting: USER_REPOSITORY },
  ],
  exports: [UserService, UserQueryService],
})
export class UserModule {}
