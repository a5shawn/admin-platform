# M2 NestJS 核心机制：Module / Controller / Service / DI

> 产出模块：`api/src/modules/user/`（6 个接口，内存版）+ `web/src/views/UserListView.vue`
> 结论都落成了可执行断言，见 `provider-registration.spec.ts`

## 一、一个请求经过了哪些 Nest 构件

按官方文档的执行顺序（当前项目里已就位的用 ✅ 标注）：

| 顺序 | 构件 | 能拿到什么上下文 | 本项目位置 |
| --- | --- | --- | --- |
| 1 | Middleware | `req` / `res` / `next`，拿不到执行上下文 | M3 加入 |
| 2 | Guard | `ExecutionContext`（handler、class、args） | M6 / M8 加入 |
| 3 | Interceptor（前） | 同上，可拿到 RxJS 流 | M5 / M9 加入 |
| 4 | Pipe | 单个参数的值与元数据 | ✅ `ParseIntPipe`（`@Param('id')`） |
| 5 | Controller → Service → Repository | — | ✅ `user.controller.ts` |
| 6 | Interceptor（后） | 可改写返回值 | M5 加入 |
| 7 | ExceptionFilter | 异常与执行上下文 | M5 加入 |

一句话记忆：**Middleware 只认 HTTP，Guard 决定「能不能进」，Pipe 决定「参数合不合法」，
Interceptor 决定「进出前后做什么」，Filter 决定「出错怎么回」**。

## 二、Provider 的四种注册方式

| 方式 | 语义 | 本模块用例 |
| --- | --- | --- |
| `useValue` | 直接把现成对象当 Provider，解析到的是**同一个引用** | `USER_POLICY` → `DEFAULT_USER_POLICY` |
| `useClass` | 令牌指向一个类，由 Nest 负责实例化 | `PASSWORD_HASHER` → `PlainTextPasswordHasher` |
| `useFactory` | 工厂自己决定怎么造，**并且能注入别的 Provider** | `USER_REPOSITORY` → 读 `ConfigService` 的 `USER_SEED_SIZE` 造内存仓储 |
| `useExisting` | 给已有实例起个别名，**不会创建新实例** | `USER_READER` → `USER_REPOSITORY` |

`useFactory` 是四条里唯一能「带依赖地决定怎么造」的，所以换实现（M4 换 Prisma）只需要改这一处；
`useExisting` 常被误当成 `useClass` 用——后者会真的 new 一个新对象，两者语义完全不同，
本模块用 `expect(viaAlias).toBe(viaTarget)` 把这点钉死。

## 三、Provider 作用域

- `DEFAULT`：整个应用共享一个实例（默认）。
- `REQUEST`：每个请求一个新实例。
- `TRANSIENT`：每次被注入都新建一个。

代价：REQUEST 作用域会**向上冒泡**——任何注入了 REQUEST 级 Provider 的类也会变成请求级，
于是每个请求都要重建这条依赖链，开销和内存占用都上去了；这也是「能单例就别 REQUEST」的原因。

## 四、踩过的坑

1. **`isolatedModules` + `emitDecoratorMetadata` 下，接口不能直接 import。**
   构造函数参数类型是接口时（`@Inject(TOKEN) private reader: UserRepository`），
   TS 报 `TS1272`：必须写 `import type`。因为接口没有运行时值，编译器无法判断这个 import
   是不是类型——而 `emitDecoratorMetadata` 又要为被装饰的签名产出元数据。
   规则：**只作类型用的接口/别名一律 `import type`**。
2. **单测里 `compile()` 不会触发 `onModuleInit`。** 种子数据正是在 `onModuleInit` 里灌的，
   只 `compile()` 会得到 0 条数据（一开始 16 个用例全红就是这原因）。要显式 `await moduleRef.init()`。
3. **`{ ...current, ...patch }` 里 `undefined` 会覆盖原值。** 更新接口必须先把 undefined
   的字段从 patch 里剔除，否则「只改昵称」会把邮箱抹成 undefined。
4. **工厂创建的 Provider 不需要 `@Injectable()`**，因为构造参数由工厂自己负责；
   但它的生命周期钩子**依然会被调用**——`InMemoryUserRepository` 就是纯类 + `onModuleInit`。
5. `ParseIntPipe` 让 `/users/abc` 返回 400 而不是把字符串塞进 SQL/查询逻辑，属于「在边界上把数据管住」。

## 五、面试问答

**Q1：`@Injectable()` 标注的依赖是怎么被解析的？**
Nest 启动时扫描模块的 `providers`，为每个 Provider 建一个「令牌 → 实例」的容器记录。
被 `@Injectable()` 标注的类，其构造函数参数类型经 `emitDecoratorMetadata` 写进
`design:paramtypes` 元数据；容器按这些类型（或 `@Inject(TOKEN)` 指定的令牌）递归解析依赖，
再把实例缓存起来（默认单例）。这也是为什么「构造函数注入」在 Nest 里不需要写工厂代码——
元数据已经把依赖清单告诉容器了。注意：循环依赖要用 `forwardRef`，因为解析是深度优先的。

**Q2：REQUEST 作用域的代价是什么？**
每个请求都要新建实例，并且**作用域会向上冒泡**：注入了请求级 Provider 的 Service、
进而 Controller 都会变成请求级，整条链每请求重建一次——CPU 与内存开销都上升，
而且这类 Provider 不能用普通单例的方式缓存，性能敏感路径应尽量避免。
需要「每请求上下文」时更轻量的做法是用 `AsyncLocalStorage`（M13 的 requestId 就会这么做）。

**Q3：为什么业务逻辑不能写在 Controller 里？**
三个具体理由：① 无法复用——定时任务、消息消费、其他模块都会绕过 HTTP 层；
② 无法测试——Controller 依赖 HTTP 上下文，业务规则却被它绑住了；
③ 违反单一职责——Controller 的职责是「把 HTTP 入参翻译成方法调用，再把结果翻译成响应」，
一旦把唯一性校验、默认值、哈希这些规则写进去，加一个调用方就要复制一遍。
本模块的做法是 Controller 只做参数编排，规则全在 Service（含 409/404 的判定），
数据访问全在 Repository（M4 换成 Prisma 时 Service 一行不改）。

## 六、下一步

M3：把 DTO 换成 class-validator 校验、开启全局 `ValidationPipe`（`whitelist` + `forbidNonWhitelisted`
+ `transform`），并用 `LoggingMiddleware` + `TimingInterceptor` 把生命周期顺序用日志证明出来。
