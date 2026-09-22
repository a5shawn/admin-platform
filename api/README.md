# admin-platform-api

admin-platform 的后端服务（NestJS 11 + Prisma 7，**CommonJS**）。

## 技术栈基线

| 项 | 选型 |
| --- | --- |
| 框架 | NestJS 11.2.x（`@nestjs/cli` 11.0.x、`@nestjs/schematics` 11.1.x） |
| 模块系统 | CommonJS（`package.json` **不写** `"type": "module"`，相对导入不带 `.js` 后缀） |
| 语言 | TypeScript 5.9 |
| HTTP | Express 5（`@nestjs/platform-express`） |
| 配置 | `@nestjs/config` + `class-validator` 启动期校验 |
| 接口文档 | `@nestjs/swagger`，挂载在 `/api/docs` |
| 测试 | Jest 30 + ts-jest（单测 `*.spec.ts`，e2e `*.e2e-spec.ts`） |
| 静态检查 | ESLint 9 + typescript-eslint 8 + Prettier 3 |

> ⚠️ 模块形态由 `package.json` 的 `type` 字段单点决定：一旦写入 `"type": "module"`，`nest g`
> 会改为生成带 `.js` 后缀的 ESM 风格导入，与当前 CommonJS 构建不一致。

## 常用命令

```bash
pnpm install          # 安装依赖
pnpm dev              # 开发模式（= nest start --watch）
pnpm build            # 构建到 dist/
pnpm start:prod       # 运行构建产物
pnpm lint             # ESLint（--fix）
pnpm test             # 单元测试
pnpm test:e2e         # e2e 测试
```

## 环境变量

复制 `.env.example` 为 `.env`。`DATABASE_URL` 与 `JWT_SECRET` 为必填，缺失时服务**启动即失败**
（校验逻辑见 `src/config/env.validation.ts`）。

## 约定接口

| 路径 | 说明 |
| --- | --- |
| `/api/docs` | Swagger 文档 |
| `/health` | 存活探针（M13 起细分 `/health` 与 `/ready`） |
| `/sse/ping` | SSE 心跳（M12 提供） |
