import { ApiPropertyOptional } from '@nestjs/swagger'

/**
 * 列表查询入参。M4 接 Prisma 时会补上 page / pageSize 分页字段。
 */
export class QueryUserDto {
  @ApiPropertyOptional({
    description: '关键字：模糊匹配用户名 / 邮箱 / 昵称',
    example: 'zhang',
  })
  keyword?: string
}
