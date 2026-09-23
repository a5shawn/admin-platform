# admin-platform-web

admin-platform 的前端（Vue 3 + TypeScript + Vite）。

## 技术栈基线

| 项 | 选型 |
| --- | --- |
| 框架 | Vue 3.5 |
| 构建 | Vite 7.3（`@vitejs/plugin-vue` 6.x） |
| 语言 | TypeScript 5.9 + vue-tsc 3.3 |
| 路由 | Vue Router 4.5（M8 起按角色动态注册） |
| 状态 | Pinia 3.0 |
| UI | Element Plus 2.14 |
| 请求 | axios 1.x（统一实例见 `src/common/http/request.ts`） |
| 静态检查 | ESLint 9 + eslint-plugin-vue + Prettier 3（不用 oxlint） |

> **本项目不写测试代码**（2026-09 决定）：原本的 vitest 单测与配置已移除，
> `pnpm test:unit` 脚本随之删除。

> `web` 使用 ESM（Vite 约定），与 `api` 的 CommonJS 无关；两者互不影响。

## 常用命令

```bash
pnpm install     # 安装依赖
pnpm dev         # 开发服务器 http://localhost:5173
pnpm build       # 类型检查 + 生产构建
pnpm type-check  # 仅类型检查（vue-tsc）
pnpm lint        # eslint --fix + prettier --write（见下）
pnpm format      # prettier --write src/
```

## 目录约定

```txt
src/
├── common/      # 跨模块复用：请求封装、权限指令、通用组件（复制沉淀层）
├── layouts/     # 中后台布局壳
├── views/       # 路由页面
├── stores/      # Pinia 状态
├── router/      # 路由表
└── assets/      # 全局样式与静态资源
```

## 与后端的联调

开发期由 Vite 代理转发到 `http://localhost:3000`，前缀清单见 `vite.config.ts` 的
`API_PREFIXES`——**新增后端模块时需同步补充**。请求默认走代理（`baseURL` 为空）；
如需直连后端，设置 `VITE_API_BASE_URL=http://localhost:3000`。
