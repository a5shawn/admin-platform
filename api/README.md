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
| `/users` | 用户列表（`keyword` 过滤）、创建 |
| `/users/:id` | 详情、更新（`PATCH`）、删除（`DELETE`） |
| `/users/:id/status` | 启用 / 禁用 |
| `/sse/ping` | SSE 心跳（M12 提供） |

## 模块说明

`src/modules/user/` 是 M2 的产出：Controller 只做参数编排，业务规则在
`UserService`（写）/ `UserQueryService`（读），数据访问经 `UserRepository` 令牌注入——
M4 换成 Prisma 实现时 Service 不需要改动。Provider 的四种注册方式集中在
`user.module.ts`，对应的断言见 `provider-registration.spec.ts`。

> 当前是**内存版**：数据存在 Map 里，进程重启即清空（M4 接 PostgreSQL）。
