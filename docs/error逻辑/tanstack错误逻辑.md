这个项目当前的处理方式可以概括成一句话：

请求函数抛错 -> React Query / Router 往上冒 -> mutation 在组件里 toast 提示，但 query/loader 这条链路没有做统一的自定义错误页。

你问的“后端请求没有发送到”一般分两种：

1. 网络层失败，请求根本没成功发到后端
   例如断网、DNS、跨域、服务没起。fetch() 会直接 reject，连 res.ok 都进不去。
2. 请求发到了后端，但后端返回 4xx/5xx
   这时 fetch() 本身不会报错，要你自己判断 res.ok，不满足时手动 throw。

这个项目在请求层就是这么处理的，代码在 src/lib/api-client.ts:1：

- 第 4 行调用 fetch
- 第 9-10 行判断 !res.ok 就 throw new Error(...)
- 但是没有 try/catch
  所以：
- “没发出去”的网络异常会直接从 fetch 抛出
- “后端返回错误码”的异常会在这里手动抛出
- 两者都会继续往上冒

不过要注意，这个项目大部分业务数据现在还不是走真实后端，而是本地 mock。真正的 users/products service 目前是假的：

- src/features/users/api/service.ts:33
- src/features/products/api/service.ts:38

这里现在调用的是 fakeUsers / fakeProducts，不是 apiClient。文件注释已经写明了，以后接真实后端时应该把这里替换成 apiClient(...)。

这个项目现在“报错后怎么处理”，分两条：

1. 查询类请求
   列表/详情页主要走 useSuspenseQuery，比如：

- src/features/users/components/users-table/index.tsx:30
- src/features/products/components/product-tables/index.tsx:30
- src/features/products/components/product-view-page.tsx:20

查询选项定义在：

- src/features/users/api/queries.ts:13
- src/features/products/api/queries.ts:13

这些 query 本身没有 onError。也就是说：

- 加载时由 Suspense fallback 兜底
  - src/features/users/components/user-listing.tsx:6
  - src/features/products/components/product-listing.tsx:6
- 但一旦报错，不会在这里 toast，也没有局部 catch
- 错误会继续抛给 TanStack Router / React 的错误边界

路由层还有 loader 预取：

- src/routes/dashboard/react-query.tsx:11
- src/routes/dashboard/product/$productId.tsx:8

这里的 ensureQueryData(...) 如果失败，也会直接抛出。

2. 变更类请求
   新增/编辑/删除走 useMutation，错误在组件本地处理，直接弹 toast：

- 用户表单 src/features/users/components/user-form-sheet.tsx:36
- 用户删除 src/features/users/components/users-table/cell-action.tsx:26
- 产品表单 src/features/products/components/product-form.tsx:23
- 产品删除 src/features/products/components/product-tables/cell-action.tsx:26

这些组件里的行为很一致：

- 成功：toast.success(...)
- 失败：toast.error(...)

toast 容器挂在根路由里：

- src/routes/\_\_root.tsx:95
- src/components/ui/sonner.tsx:4

还有一个单独的 React ErrorBoundary：

- src/components/error-boundary.tsx:12

但我看下来，这个组件目前基本没接到主请求链路里，属于“有定义，没成为全局统一请求错误处理入口”。

所以准确地说，这个项目现在的现状是：

- mutation 失败：本地 onError + toast.error
- query/loader 失败：往上抛
- 没有统一区分“网络没发出去” vs “后端返回 500”
- 没有统一的全局错误页/错误文案映射
- users/products 业务接口目前还是 mock，真实后端异常链路还没完全接上

如果你问“应该怎么处理”，按这个项目结构，比较合理的是：

1. 在 src/lib/api-client.ts:3 统一包装错误对象，区分网络错误、4xx、5xx。
2. mutation 继续在组件里 onError toast，但 toast 文案别只写固定的 “Failed to ...”，最好读服务端 message。
3. query/loader 增加统一 errorComponent 或根路由错误边界，不然查询失败体验不完整。
4. 真正接后端时，优先改 service.ts，不要在组件里直接写 fetch。
