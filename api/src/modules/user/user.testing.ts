import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { UserModule } from './user.module'

/** 单测默认种子条数，对应 SEED_PRESETS 的前 3 条 */
export const USER_SEED_SIZE_FOR_TEST = 3

/**
 * 单测装配。
 *
 * 只 import UserModule 时容器里没有全局的 ConfigService（应用里是 AppModule 注册的），
 * 所以这里显式注册一个：`ignoreEnvFile` 避免读磁盘上的 .env，`load` 固定种子条数，
 * 让用例不受本机环境变量影响。
 *
 * 注意必须 `await init()`：`compile()` 只装配容器，**不会**触发 onModuleInit，
 * 而内存仓储正是在 onModuleInit 里灌种子数据的。
 */
export async function createUserTestingModule(
  seedSize: number = USER_SEED_SIZE_FOR_TEST,
): Promise<TestingModule> {
  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: true,
        load: [() => ({ USER_SEED_SIZE: seedSize })],
      }),
      UserModule,
    ],
  }).compile()

  await moduleRef.init()
  return moduleRef
}
