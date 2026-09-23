import { Injectable, Logger, type NestMiddleware } from '@nestjs/common'
import type { NextFunction, Request, Response } from 'express'

/**
 * 请求日志中间件：记录方法、路径、状态码与耗时。
 *
 * 生命周期日志约定（M3 建立，M13 在此基础上加 requestId）：
 * 每个构件用**自己的 Logger context**，行首用 `[before]` / `[after]` / `[error]` / `[catch]` 标记阶段。
 * 全部构件的日志拼起来就是请求在链路里的行进轨迹，排查时按时间顺序看即可。
 *
 * 位置：**链路最外层**（在 Guard / Pipe / Interceptor 之前，在响应写出之后结束），
 * 所以它打出的耗时是整条请求的总耗时，比 TimingInterceptor 的耗时要大或相等。
 */
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP')

  use(req: Request, res: Response, next: NextFunction): void {
    const startedAt = Date.now()
    const { method, originalUrl } = req

    this.logger.log(`[before] ${method} ${originalUrl}`)

    // 用 finish 而不是 close：finish 表示响应已经完整写出，此时才拿得到最终状态码
    res.on('finish', () => {
      const elapsed = Date.now() - startedAt
      this.logger.log(
        `[after] ${method} ${originalUrl} ${res.statusCode} ${elapsed}ms`,
      )
    })

    next()
  }
}
