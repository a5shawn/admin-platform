import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger'
import { CreateUserDto } from './dto/create-user.dto'
import { QueryUserDto } from './dto/query-user.dto'
import { UpdateUserStatusDto } from './dto/update-user-status.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserResponseDto } from './dto/user-response.dto'
import { UserQueryService } from './user-query.service'
import { UserService } from './user.service'

/**
 * Controller 只做「参数编排 + 调用 Service」：
 * 不写业务规则、不碰数据、不 new 任何依赖——依赖全部由 DI 容器注入。
 */
@ApiTags('用户管理')
@Controller('users')
export class UserController {
  constructor(
    private readonly userQueryService: UserQueryService,
    private readonly userService: UserService,
  ) {}

  @Get()
  @ApiOperation({ summary: '用户列表（M3 补参数校验，M4 补分页）' })
  @ApiOkResponse({ type: UserResponseDto, isArray: true })
  list(@Query() query: QueryUserDto): UserResponseDto[] {
    return this.userQueryService.list(query)
  }

  @Get(':id')
  @ApiOperation({ summary: '用户详情' })
  @ApiParam({ name: 'id', description: '用户 ID', example: 1 })
  @ApiOkResponse({ type: UserResponseDto })
  detail(@Param('id', ParseIntPipe) id: number): UserResponseDto {
    return this.userQueryService.detail(id)
  }

  @Post()
  @ApiOperation({ summary: '创建用户' })
  @ApiCreatedResponse({ type: UserResponseDto })
  create(@Body() dto: CreateUserDto): UserResponseDto {
    return this.userService.create(dto)
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新用户（邮箱 / 昵称）' })
  @ApiParam({ name: 'id', description: '用户 ID', example: 1 })
  @ApiOkResponse({ type: UserResponseDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ): UserResponseDto {
    return this.userService.update(id, dto)
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '启用 / 禁用用户' })
  @ApiParam({ name: 'id', description: '用户 ID', example: 1 })
  @ApiOkResponse({ type: UserResponseDto })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserStatusDto,
  ): UserResponseDto {
    return this.userService.updateStatus(id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户（M4 改为软删除）' })
  @ApiParam({ name: 'id', description: '用户 ID', example: 1 })
  @ApiOkResponse({ schema: { example: { success: true } } })
  remove(@Param('id', ParseIntPipe) id: number): { success: boolean } {
    return this.userService.remove(id)
  }
}
