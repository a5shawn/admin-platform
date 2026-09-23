import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
  ValidationPipe,
} from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TimingInterceptor } from './common/interceptors/timing.interceptor'
import { LoggingMiddleware } from './common/middleware/logging.middleware'
import { VALIDATION_PIPE_OPTIONS } from './common/pipes/validation'
import { validateEnv } from './config/env.validation'
import { UserModule } from './modules/user/user.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: validateEnv,
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // 全局管道与拦截器用 APP_* 令牌注册，而不是 main.ts 里的 app.useGlobalPipes()。
    // 原因有两条：
    //   1. 写在 main.ts 里的全局构件**只对经过 main.ts 启动的应用生效**——任何用
    //      Test.createTestingModule({ imports: [AppModule] }) 起的实例都拿不到它；
    //   2. APP_* 是 Provider，可以注入依赖（M5 的异常过滤器、M6 的守卫都要用 ConfigService）。
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe(VALIDATION_PIPE_OPTIONS),
    },
    { provide: APP_INTERCEPTOR, useClass: TimingInterceptor },
  ],
})
export class AppModule implements NestModule {
  /**
   * 中间件**只能**通过模块的 configure 绑定（没有 APP_MIDDLEWARE 令牌）。
   * 绑在根模块上即全局生效，且不依赖 main.ts。
   */
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggingMiddleware).forRoutes('*')
  }
}
