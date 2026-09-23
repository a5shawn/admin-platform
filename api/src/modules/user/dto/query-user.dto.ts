import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

/**
 * 列表查询入参。M4 接 Prisma 时会补上 page / pageSize 分页字段。
 *
 * 注意：查询串里的值天生都是字符串，`@Query()` 的 DTO 因此比 `@Body()` 更需要
 * `transform: true` —— 加数字字段时要配 `@Type(() => Number)` 才能拿到 number。
 */
export class QueryUserDto {
  @ApiPropertyOptional({
    description: '关键字：模糊匹配用户名 / 邮箱 / 昵称',
    example: 'zhang',
  })
  @IsOptional()
  @IsString({ message: '关键字必须是字符串' })
  @MaxLength(50, { message: '关键字长度不能超过 50 个字符' })
  keyword?: string
}
