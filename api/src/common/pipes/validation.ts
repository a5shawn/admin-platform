import { BadRequestException, type ValidationPipeOptions } from '@nestjs/common'
import type { ValidationError } from 'class-validator'

/** 字段 → 该字段的全部错误消息（按扁平路径，嵌套对象用 `parent.child` 表示） */
export type FieldErrors = Record<string, string[]>

/** class-validator 在 `forbidNonWhitelisted` 时使用的约束名 */
const WHITELIST_CONSTRAINT = 'whitelistValidation'

/**
 * 把 class-validator 的 `ValidationError` 树拍平成「字段 → 消息」。
 *
 * 递归 `children` 是为了嵌套 DTO（`@ValidateNested`）也能定位到具体字段，
 * 而不是只报父字段。
 */
export function collectFieldErrors(
  errors: ValidationError[],
  parentPath = '',
): FieldErrors {
  const result: FieldErrors = {}

  for (const error of errors) {
    const path = parentPath ? `${parentPath}.${error.property}` : error.property

    const messages = Object.entries(error.constraints ?? {}).map(
      ([constraint, message]) =>
        // 多传字段的默认消息是英文的 "property x should not exist"，
        // 这里按约束名识别（而不是匹配英文原文，避免跟着 class-validator 改文案而失效）
        constraint === WHITELIST_CONSTRAINT
          ? `不存在的字段：${error.property}`
          : message,
    )
    if (messages.length > 0) {
      result[path] = messages
    }

    if (error.children && error.children.length > 0) {
      Object.assign(result, collectFieldErrors(error.children, path))
    }
  }

  return result
}

/**
 * 全局 `ValidationPipe` 的配置。
 *
 * 三个开关的分工：
 * - `whitelist`：没有校验装饰器的字段不进 DTO —— 保证「进入 Service 的对象形状可控」；
 * - `forbidNonWhitelisted`：**多传字段直接 400**，而不是静默丢弃。字段名拼错会立刻暴露，
 *   代价是客户端不能顺手多塞字段（本项目取严格口径）；
 * - `transform`：把 `@Query()` / `@Body()` 的普通对象转成 DTO **实例**，`@Type(() => Number)`
 *   这类转换与默认值才会生效（不开启时拿到的是字面量对象，方法与转换全部失效）。
 */
export const VALIDATION_PIPE_OPTIONS: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  // 默认工厂只返回 message 数组，前端拿不到「哪个字段错了」。
  // 这里换成按字段分组的结构；M5 会把它套进全站统一的 { code, message, data } 信封。
  exceptionFactory: (errors: ValidationError[]) =>
    new BadRequestException({
      statusCode: 400,
      message: '请求参数校验失败',
      errors: collectFieldErrors(errors),
    }),
}
