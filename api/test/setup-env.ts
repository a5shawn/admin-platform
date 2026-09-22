// e2e 运行所需的最小环境变量，使测试不依赖本地 .env 文件。
// 注意：必须在 AppModule 被编译（ConfigModule 校验）之前执行，故放在 setupFiles。
process.env.NODE_ENV ??= 'test'
process.env.DATABASE_URL ??=
  'postgresql://admin:admin123456@localhost:5432/admin_platform?schema=public'
process.env.JWT_SECRET ??= 'e2e-test-secret'
