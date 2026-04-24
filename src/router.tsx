import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { routerWithQueryClient } from '@tanstack/react-router-with-query';
import { getQueryClient } from '@/lib/query-client';
import { routeTree } from './routeTree.gen';

// 导出一个稳定的路由工厂引用，方便后面的 Register 类型注册
// 能正确拿到最终 router 的类型。
export const getRouter = createRouter;

export function createRouter() {
  // 创建或复用全局共享的 React Query Client。
  // 路由 loader 和页面里的查询都会复用这一个缓存实例。
  const queryClient = getQueryClient();

  // 基于自动生成的文件路由树创建 TanStack Router 实例。
  // 这里把 queryClient 注入到 router context，后续路由和 loader 可以直接使用。
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    context: { queryClient },
    // 路由切换中或 loader 还没完成时，显示的全局兜底加载态。
    defaultPendingComponent: () => (
      <div className='flex h-full items-center justify-center pt-8'>
        <div className='border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
      </div>
    ),
    // 当没有任何路由命中时，使用这个全局 404 页面。
    defaultNotFoundComponent: () => (
      <div className='absolute top-1/2 left-1/2 mb-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center'>
        <span className='from-foreground bg-linear-to-b to-transparent bg-clip-text text-[10rem] leading-none font-extrabold text-transparent'>
          404
        </span>
        <h2 className='font-heading my-2 text-2xl font-bold'>Something&apos;s missing</h2>
        <p>Sorry, the page you are looking for doesn&apos;t exist or has been moved.</p>
      </div>
    )
  });

  // 把 TanStack Router 和 React Query 连接起来。
  // 这样路由 loader 预取的数据会直接进入组件也会使用的同一份缓存。
  return routerWithQueryClient(router, queryClient);
}

// 全局注册 router 类型。
// 这样 Link、导航、params、search 等路由相关 API 都能获得基于当前路由树的类型推断。
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
