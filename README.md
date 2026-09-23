# admin-platform

面向企业中后台的**权限管理平台**，同时作为后续四个 AI 项目（customer-service、knowledge-base、
hr-agent、ai-workspace）的认证、权限、审计、文件、SSE 与部署底座。

> 阶段一目标：用一个项目把 NestJS 打穿。模块拆解、21 天日程与验收标准见
> [`../admin-platform.md`](../admin-platform.md)。

## 技术栈

| 层 | 选型 |
| --- | --- |
| 前端 | Vue 3.5、TypeScript 5.9、Vite 7、Pinia 3、Vue Router 4、Element Plus 2.14、axios |
| 后端 | NestJS 11（**CommonJS**）、TypeScript 5.9、Prisma 7、Express 5 |
| 数据 | PostgreSQL 16（pgvector 0.8.6）、Redis 7 |
| 质量 | ESLint 9 + Prettier 3（两端一致，不用 oxlint）；验证靠 Swagger + `curl` + 构建（**本项目不写测试**，见下） |
| 交付 | Docker、Docker Compose |
| 运行基线 | Node.js 24 LTS、pnpm 11.24.0（`.nvmrc` + `packageManager` 固定） |

> 各工程锁定的**大版本**一致；具体补丁版本由各工程的 lockfile 固定。

## 架构

```txt
admin-platform/                 # 独立 Git 仓库，clone 即可构建、部署、演示
├── web/                        # Vue3 前端（独立 package.json）
│   ├── src/
│   │   ├── common/             # 复制沉淀：请求封装、权限指令、AI 组件
│   │   ├── layouts/            # 中后台布局壳
│   │   ├── views/              # 页面
│   │   ├── stores/             # Pinia 状态
│   │   └── router/             # 静态路由（M8 起按角色动态注册）
│   └── vite.config.ts          # 开发期 /api 各前缀代理到后端 3000
├── api/                        # NestJS 后端（独立 package.json，含 src/common/ 沉淀层）
│   ├── src/
│   │   ├── common/             # 统一响应、异常过滤器、守卫、拦截器
│   │   ├── config/             # 环境变量契约与启动期校验
│   │   └── app.module.ts
│   └── prisma/                 # schema 与迁移（M4）
├── docker-compose.yml          # postgres + redis（web/api 由 M15 加入）
├── .env.example                # compose 使用的环境变量样例
└── .nvmrc
```

数据流（M1 现状）：浏览器 → Vite dev server（5173）→ 代理 → NestJS（3000）→ `/health`；
业务请求后续接入 PostgreSQL 与 Redis。

## 快速开始

前置：Node.js 24、pnpm 11、Docker。

```bash
# 1. 依赖服务（PostgreSQL + Redis）
cp .env.example .env
docker compose up -d
docker compose ps            # 两个服务应为 healthy

# 2. 后端
cd api
cp .env.example .env
pnpm install
pnpm dev                     # http://localhost:3000

# 3. 前端（另开终端）
cd web
pnpm install
pnpm dev                     # http://localhost:5173
```

| 地址 | 说明 |
| --- | --- |
| <http://localhost:5173> | 前端页面（概览页会探测后端 `/health`） |
| <http://localhost:3000/api/docs> | Swagger 文档 |
| <http://localhost:3000/health> | 存活探针 |

## 常用命令

在 `web/` 或 `api/` 目录下执行：

```bash
pnpm install          # 安装依赖
pnpm dev              # 开发模式
pnpm build            # 构建
pnpm lint             # 静态检查
```

> **本项目不写测试代码**（2026-09 决定，M14「测试补齐」跳过）。接口改动靠 Swagger 自测，
> 服务端行为靠 `pnpm build` 后 `node dist/main` + `curl` 观察响应体与日志。

## 约定

- **接口路径**：Swagger `/api/docs`；探针 `/health`、`/ready`（M13）；SSE `/sse/ping`（M12）；
  业务路由不带全局前缀。
- **模块形态**：`api` 使用 CommonJS（`package.json` 不写 `"type": "module"`，相对导入不带 `.js`
  后缀）；`web` 使用 ESM（Vite 约定）。该字段同时决定 `nest g` 生成的导入风格。
- **环境变量**：`api` 缺少 `DATABASE_URL` / `JWT_SECRET` 时**启动即失败**。
- **参数校验**：全局 `ValidationPipe` 为**严格口径**（`whitelist` + `forbidNonWhitelisted` +
  `transform`）。多传字段（含未知查询参数）返回 400，校验失败的响应体为
  `{ statusCode, message, errors: { 字段: [消息] } }`。入参 DTO 的每个字段都必须带校验装饰器，
  否则会被 `whitelist` 剥离。
- **响应格式**：M5 起统一为 `{ code, message, data }`。
- **依赖构建审批**：pnpm 11 默认阻止依赖执行安装脚本，各工程的 `pnpm-workspace.yaml`
  用 `allowBuilds` 逐包声明（该文件不含 `packages` 字段，不构成 workspace）。

## 状态

| 模块 | 内容 | 状态 |
| --- | --- | --- |
| M1 | 工程骨架与开发环境 | ✅ |
| M2 | NestJS 核心机制：用户 CRUD（内存版） | ✅ |
| M3 | 请求生命周期与数据校验 | ✅ |
| M4–M15 | 见 `../admin-platform.md` | ⬜ |
