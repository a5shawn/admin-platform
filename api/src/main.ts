import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  app.enableCors()
  // 让 onApplicationShutdown 等钩子在收到 SIGTERM / SIGINT 时真正执行
  app.enableShutdownHooks()

  const swaggerConfig = new DocumentBuilder()
    .setTitle('admin-platform API')
    .setDescription('NestJS 企业级权限管理平台：认证、RBAC、审计、文件、SSE')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api/docs', app, document)

  const port = configService.get<number>('PORT', 3000)
  await app.listen(port)

  const logger = new Logger('Bootstrap')
  logger.log(`API 已启动：http://localhost:${port}`)
  logger.log(`Swagger 文档：http://localhost:${port}/api/docs`)
}

void bootstrap()
