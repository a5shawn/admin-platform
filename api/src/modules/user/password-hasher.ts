/**
 * 密码哈希抽象。
 *
 * 业务代码只依赖这个接口，因此 M6 把实现换成 bcrypt / argon2 时，
 * UserService 一行都不用改——这正是「面向接口注入」的价值。
 */
export interface PasswordHasher {
  hash(plain: string): string
  verify(plain: string, hashed: string): boolean
}

/**
 * M2 占位实现：只加一个可辨识前缀，**不具备任何安全性**。
 * 用 `plain$` 前缀是为了让它在日志或数据里一眼可辨，避免被误当真实哈希。
 */
export class PlainTextPasswordHasher implements PasswordHasher {
  private static readonly PREFIX = 'plain$'

  hash(plain: string): string {
    return `${PlainTextPasswordHasher.PREFIX}${plain}`
  }

  verify(plain: string, hashed: string): boolean {
    return this.hash(plain) === hashed
  }
}
