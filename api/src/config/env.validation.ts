import { plainToInstance } from 'class-transformer'
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator'

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/**
 * 环境变量契约。缺少必填项时服务在启动阶段直接失败，而不是运行时报错。
 */
export class EnvironmentVariables {
  @IsEnum(NodeEnv)
  @IsOptional()
  NODE_ENV: NodeEnv = NodeEnv.Development

  @IsInt()
  @Min(1)
  @Max(65535)
  @IsOptional()
  PORT: number = 3000

  @IsString({ message: 'DATABASE_URL 必须是字符串' })
  @IsNotEmpty({ message: 'DATABASE_URL 不能为空（参考 .env.example）' })
  DATABASE_URL!: string

  @IsString({ message: 'JWT_SECRET 必须是字符串' })
  @IsNotEmpty({ message: 'JWT_SECRET 不能为空（参考 .env.example）' })
  JWT_SECRET!: string

  @IsString()
  @IsOptional()
  REDIS_URL: string = 'redis://localhost:6379'

  /** 内存版用户仓储的种子条数（M2 用；M4 接 Prisma 后该变量失效） */
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  USER_SEED_SIZE: number = 3
}

export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  })

  const errors = validateSync(validated, { skipMissingProperties: false })

  if (errors.length > 0) {
    const details = errors
      .map(
        (error) =>
          `  - ${error.property}: ${Object.values(error.constraints ?? {}).join('；')}`,
      )
      .join('\n')
    throw new Error(`环境变量校验失败，服务启动终止：\n${details}`)
  }

  // 合并回原始 config，避免未声明的变量（如 PATH）在 ConfigService 中丢失。
  return { ...config, ...validated }
}
