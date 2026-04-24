# TanStack Router 基础知识

这份文档是按 `React / Next.js` 使用者的视角写的，目标不是讲全，而是帮你先看懂这个项目里的路由层。

## 1. TanStack Router 是什么

`TanStack Router` 是一个 React 路由库，核心能力是：

- 文件路由或代码路由
- 嵌套路由
- 布局路由
- 动态路由
- 类型安全导航
- 类型安全 search params
- loader / 预加载

如果用 Next 的脑子理解：

- `Link`、页面切换、布局嵌套，这些和 Next 很像
- 但它不是完整框架，只是路由系统
- `TanStack Start` 才更接近 Next 这种“框架层”

## 2. 在这个项目里它负责什么

这个仓库里，`TanStack Router` 主要负责：

- 定义页面和嵌套结构：`src/routes/`
- 根布局和仪表盘布局：`src/routes/__root.tsx`、`src/routes/dashboard.tsx`
- 页面出口：`<Outlet />`
- 页面跳转：`<Link />`
- 当前路由信息：`useLocation()`、`useRouter()`
- 路由树注册：`src/router.tsx`

可以先看这几个文件：

- `src/router.tsx`
- `src/routes/__root.tsx`
- `src/routes/dashboard.tsx`
- `src/routes/dashboard/overview.tsx`

## 3. 最小实现

下面是一个非常小的 TanStack Router 示例，只保留核心结构。

### 3.1 根入口

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet, Link } from '@tanstack/react-router'

const rootRoute = createRootRoute({
  component: () => (
    <div>
      <nav style={{ display: 'flex', gap: 12 }}>
        <Link to='/'>Home</Link>
        <Link to='/about'>About</Link>
      </nav>
      <hr />
      <Outlet />
    </div>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <div>Home Page</div>,
})

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: () => <div>About Page</div>,
})

const routeTree = rootRoute.addChildren([indexRoute, aboutRoute])

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
```

你可以先把它理解成三件事：

- 先定义根路由 `rootRoute`
- 再把子页面挂到根路由下面
- 最后把 `router` 交给 `<RouterProvider />`

### 3.2 文件路由思维

这个项目用的是文件路由，核心思路是：

- `src/routes/__root.tsx`：根布局
- `src/routes/dashboard.tsx`：`/dashboard` 布局
- `src/routes/dashboard/overview.tsx`：`/dashboard/overview` 页面
- `src/routes/dashboard/product/$productId.tsx`：动态路由页面

如果你熟悉 Next：

- `__root.tsx` 有点像最外层应用壳
- `dashboard.tsx` 很像某个 segment 的 layout
- 具体页面文件就是 page

## 4. 核心概念

### 4.1 `createRootRoute`

定义整个应用最顶层路由。

它通常放：

- 全局布局
- 全局 provider
- 全局 `<Outlet />`
- `head`
- 根级 loader

这个项目里就是 `src/routes/__root.tsx`。

### 4.2 `createFileRoute`

文件路由模式下最常见的 API。每个路由文件通常都会导出：

```tsx
export const Route = createFileRoute('/dashboard/overview')({
  component: OverviewPage,
})
```

它表示：

- 这个文件对应哪个路由路径
- 这个路径的组件、loader、search 校验等配置

### 4.3 `<Outlet />`

`<Outlet />` 表示子路由渲染出口。

例如：

```tsx
function DashboardLayout() {
  return (
    <div>
      <aside>Sidebar</aside>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
```

当你访问 `/dashboard/overview` 时：

- `DashboardLayout` 会先渲染
- `overview` 页面会被放进 `<Outlet />`

### 4.4 `<Link />`

用于页面跳转。

```tsx
<Link to='/dashboard/overview'>Overview</Link>
```

常见特点：

- 不刷新整页
- 有类型提示
- 可以配合 params / search 使用

### 4.5 loader

loader 用来在进入页面前准备数据。

```tsx
export const Route = createFileRoute('/posts')({
  loader: async () => {
    const res = await fetch('/api/posts')
    return res.json()
  },
  component: PostsPage,
})

function PostsPage() {
  const data = Route.useLoaderData()
  return <div>{data.length}</div>
}
```

你可以把它先理解成：

- 在页面渲染前取数据
- 取完后组件里再读

在这个项目里，loader 经常和 `React Query` 配合，用来预取数据。

### 4.6 search params

TanStack Router 对 query string 支持很好，尤其适合后台系统里的：

- 搜索
- 筛选
- 分页
- 排序

常见写法：

```tsx
export const Route = createFileRoute('/dashboard/users')({
  validateSearch: (search) => ({
    page: Number(search.page ?? 1),
    q: String(search.q ?? ''),
  }),
  component: UsersPage,
})

function UsersPage() {
  const search = Route.useSearch()

  return <div>page: {search.page}</div>
}
```

它的价值是：

- URL 就是状态
- 刷新后状态不丢
- 参数有类型

### 4.7 动态路由 params

动态参数一般长这样：

```tsx
export const Route = createFileRoute('/dashboard/product/$productId')({
  component: ProductDetailPage,
})

function ProductDetailPage() {
  const params = Route.useParams()
  return <div>ID: {params.productId}</div>
}
```

这里的 `$productId` 就是动态段。

## 5. 常见 API

下面这些是你看这个项目时最常碰到的。

### 5.1 `createRouter`

创建 router 实例。

```tsx
const router = createRouter({ routeTree })
```

这个项目在 `src/router.tsx` 里创建，并把 `queryClient` 放进了 router context。

### 5.2 `RouterProvider`

把 router 挂到 React 应用里。

```tsx
<RouterProvider router={router} />
```

### 5.3 `createRootRouteWithContext`

当你想在路由系统里共享上下文时使用。

这个项目里给路由上下文注入了 `queryClient`：

```tsx
export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootDocument,
})
```

然后在创建 router 时传入：

```tsx
const router = createTanStackRouter({
  routeTree,
  context: { queryClient },
})
```

这个模式在和 `React Query` 结合时很常见。

### 5.4 `useRouter`

拿到 router 实例，做编程式跳转。

```tsx
const router = useRouter()

router.navigate({ to: '/dashboard/overview' })
```

这个项目的侧边栏菜单里就有类似用法。

### 5.5 `useLocation`

读取当前 URL 信息。

```tsx
const { pathname } = useLocation()
```

常用于：

- 高亮当前菜单
- 判断当前是否在某个页面

### 5.6 `Route.useLoaderData()`

读取当前路由 loader 返回的数据。

```tsx
const data = Route.useLoaderData()
```

### 5.7 `Route.useParams()`

读取动态参数。

```tsx
const params = Route.useParams()
```

### 5.8 `Route.useSearch()`

读取 search params。

```tsx
const search = Route.useSearch()
```

### 5.9 `Link`

最常见的跳转组件。

```tsx
<Link to='/dashboard/users'>Users</Link>
```

也可以带参数：

```tsx
<Link to='/dashboard/product/$productId' params={{ productId: '123' }}>
  Product
</Link>
```

### 5.10 `navigate`

编程式跳转：

```tsx
router.navigate({
  to: '/dashboard/users',
  search: { page: 2, q: 'tom' },
})
```

## 6. 这个项目里最值得你学的路由模式

### 6.1 根布局 + 子布局

结构大致是：

```txt
__root.tsx
  -> dashboard.tsx
    -> dashboard/overview.tsx
    -> dashboard/users.tsx
    -> dashboard/product/index.tsx
```

理解方式：

- `__root.tsx` 管全局壳子
- `dashboard.tsx` 管后台壳子
- 具体页面只关心自己的内容

这是后台项目里非常值得学的组织方式。

### 6.2 路由和业务模块分离

这个仓库没有把所有业务代码都塞进 `routes/`，而是：

- `routes/` 只做页面入口和路由配置
- `features/` 放业务实现
- `components/` 放共享组件

这比很多 Next 项目把东西全塞进 `app/` 更清晰。

### 6.3 URL 状态驱动列表页

后台页面常见需求：

- 当前是第几页
- 搜索关键词是什么
- 筛选条件是什么

这些信息非常适合放进 search params，而 TanStack Router 在这块体验很好。

## 7. 和 Next.js 的对照

你可以先这样记：

| Next.js | TanStack Router / Start |
| --- | --- |
| `app/layout.tsx` | `__root.tsx` 或某个布局路由 |
| 嵌套路由 layout | 带 `<Outlet />` 的父路由 |
| `next/link` | `Link` |
| `useRouter()` | `useRouter()` |
| 动态路由 `[id]` | `$id` |
| `searchParams` | `useSearch()` |
| 页面数据预处理 | `loader` |

## 8. 推荐你先掌握到什么程度

对当前这个项目，你先学到下面这一步就够了：

- 能看懂 `__root.tsx`
- 能看懂 `dashboard.tsx`
- 知道 `<Outlet />` 是子页面出口
- 知道 `Link` 怎么跳转
- 知道 `$productId` 是动态路由
- 知道 `useLocation()` 用来做菜单高亮
- 知道 `useSearch()` 适合做后台列表页 URL 状态

学到这里，你已经能读懂这个项目大部分布局和页面关系了。

## 9. 一个最小学习顺序

建议按这个顺序看：

1. `src/router.tsx`
2. `src/routes/__root.tsx`
3. `src/routes/dashboard.tsx`
4. `src/components/layout/app-sidebar.tsx`
5. `src/routes/dashboard/overview.tsx`
6. `src/routes/dashboard/product/$productId.tsx`

## 10. 你暂时可以先不学的

先别急着深挖这些：

- SSR 细节
- `TanStack Start` 的 server functions
- 路由中更复杂的 context 传递
- 太完整的代码路由写法

你当前重点应该是：

- 看懂布局
- 看懂嵌套路由
- 看懂导航和 URL 状态

这三件事先吃透，后面再补 Start 才顺。
