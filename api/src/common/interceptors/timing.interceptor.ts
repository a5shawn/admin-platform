import {
  Injectable,
  Logger,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common'
import { tap, type Observable } from 'rxjs'

/**
 * 耗时拦截器：记录 handler 的执行区间与耗时。
 *
 * 位置：**在 Guard 之后、Pipe 之前**，并把 handler 包在里面——这一点与直觉相反，
 * 常被记成「Pipe 之后」。官方生命周期是 Guard → Interceptor(pre) → Pipe → Handler
 * （`faq/request-lifecycle`），M3 时用日志实测确认过。
 * 因此这里测到的是「参数校验 + 业务处理」的耗时，不含鉴权，也不含响应写出——
 * 与 LoggingMiddleware 的耗时形成对照。
 *
 * 日志约定见 `logging.middleware.ts`。额外注意 `[error]` 这一行：
 * Pipe 抛出的 400 会以错误的形式穿过拦截器（next 分支不执行），
 * 所以「有 [before]、随后是 [error] 而不是 [after]」正是「管道阶段就失败了」的证据。
 */
@Injectable()
export class TimingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Timing')

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const handlerName = `${context.getClass().name}.${context.getHandler().name}`
    const startedAt = Date.now()

    this.logger.log(`[before] ${handlerName}`)

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(`[after] ${handlerName} ${Date.now() - startedAt}ms`)
        },
        error: (error: unknown) => {
          const reason = error instanceof Error ? error.message : String(error)
          this.logger.log(
            `[error] ${handlerName} ${Date.now() - startedAt}ms ${reason}`,
          )
        },
      }),
    )
  }
}
