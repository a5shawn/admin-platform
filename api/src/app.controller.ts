import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AppService } from './app.service'

@ApiTags('系统')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: '服务标识' })
  getHello(): string {
    return this.appService.getHello()
  }

  @Get('health')
  @ApiOperation({
    summary: '存活探针（M13 起由 HealthModule 提供 /health 与 /ready）',
  })
  @ApiOkResponse({ schema: { example: { status: 'ok' } } })
  getHealth(): { status: string } {
    return this.appService.getHealth()
  }
}
