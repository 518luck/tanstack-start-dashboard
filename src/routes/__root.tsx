import type { QueryClient } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/react-start";

import { Toaster } from "@/components/ui/sonner";
import { ActiveThemeProvider } from "@/components/themes/active-theme";
import ThemeProvider from "@/components/themes/theme-provider";
import { DEFAULT_THEME, THEMES } from "@/components/themes/theme.config";

import appCss from "@/styles/globals.css?url";

const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
};

//  定义了一个“在服务端执行的取主题函数”
const getActiveTheme = createServerFn({ method: "GET" }).handler(async () => {
  const { getCookie } = await import("@tanstack/react-start/server");
  const cookieValue = getCookie("active_theme");
  if (cookieValue) {
    const isValid = THEMES.some((t) => t.value === cookieValue);
    if (isValid) return cookieValue;
  }
  return DEFAULT_THEME;
});

// 这段代码就是在注册整个应用最外层根路由，并告诉框架这个根路由怎么取数据、怎么配 head、最后渲染谁。
export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "TanStack Dashboard" },
      {
        name: "description",
        content: "Dashboard with TanStack Start and Shadcn",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  loader: async () => {
    const activeTheme = await getActiveTheme();
    return { activeTheme };
  },
  component: RootDocument,
});

function RootDocument() {
  const { activeTheme } = Route.useLoaderData();

  return (
    <html lang="en" suppressHydrationWarning data-theme={activeTheme}>
      {/* head 这个防止页面头信息 */}
      <head>
        <HeadContent />
        {/* 用来处理主题色,防止颜色闪烁一下 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      {/* - bg-background：全局背景色
          - overflow-x-hidden：防止横向滚动
          - overscroll-none：控制滚动回弹行为
          - font-sans：默认字体
          - antialiased：字体抗锯齿 */}
      <body className="bg-background overflow-x-hidden overscroll-none font-sans antialiased">
        {/* 这个是主题系统的提供者。 */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          enableColorScheme
        >
          {/* 这个是作者自己项目里的“当前主题皮肤”提供层。 */}
          <ActiveThemeProvider initialTheme={activeTheme}>
            {/* 这个是全局通知容器。 */}
            <Toaster />
            <Outlet />
          </ActiveThemeProvider>
        </ThemeProvider>
        <TanStackRouterDevtools position="bottom-left" />
        <Scripts />
      </body>
    </html>
  );
}
