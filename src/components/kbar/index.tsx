import { navGroups } from "@/config/nav-config";
import {
  KBarAnimator, // 这是“动画容器”。
  KBarPortal, // 把命令面板渲染到页面其他位置，通常是 document.body
  KBarPositioner, //  这是“定位层 / 遮罩层”。
  KBarProvider, // 这是最外层的“上下文提供者”。
  KBarSearch, // 搜索框
} from "kbar";
import { useRouter } from "@tanstack/react-router";
import { useMemo } from "react";
import RenderResults from "./render-result";
import useThemeSwitching from "./use-theme-switching";
import { useFilteredNavGroups } from "@/hooks/use-nav";

/*
1. 把导航配置 navGroups 转成 kbar 需要的 actions 数据格式
2. 用 KBarProvider 把这些 actions 提供给整个命令面板系统
*/
export default function KBar({ children }: { children: React.ReactNode }) {
  // 从 TanStack Router 里拿到当前应用的路由控制器对象。
  const router = useRouter();
  // 过滤导航配置
  const filteredGroups = useFilteredNavGroups(navGroups);

  // 这些操作是用于导航的
  const actions = useMemo(() => {
    // 在useMemo回调中定义navigateTo以避免依赖数组问题
    const navigateTo = (url: string) => {
      router.navigate({ to: url });
    };

    // 扁平化所有导航项
    const allItems = filteredGroups.flatMap((group) => group.items);

    // 遍历所有导航项，生成 kbar action
    return allItems.flatMap((navItem) => {
      // 只包含 base action（如果 navItem 有真实 URL 且不只是容器）
      const baseAction =
        navItem.url !== "#"
          ? {
              id: `${navItem.title.toLowerCase()}Action`,
              name: navItem.title,
              shortcut: navItem.shortcut,
              keywords: navItem.title.toLowerCase(),
              section: "Navigation",
              subtitle: `Go to ${navItem.title}`,
              perform: () => navigateTo(navItem.url),
            }
          : null;

      // Map child items into actions
      const childActions =
        navItem.items?.map((childItem) => ({
          id: `${childItem.title.toLowerCase()}Action`,
          name: childItem.title,
          shortcut: childItem.shortcut,
          keywords: childItem.title.toLowerCase(),
          section: navItem.title,
          subtitle: `Go to ${childItem.title}`,
          perform: () => navigateTo(childItem.url),
        })) ?? [];

      // Return only valid actions (ignoring null base actions for containers)
      return baseAction ? [baseAction, ...childActions] : childActions;
    });
  }, [router, filteredGroups]);

  return (
    <KBarProvider actions={actions}>
      <KBarComponent>{children}</KBarComponent>
    </KBarProvider>
  );
}

// 1. 注册额外的 kbar actions
// 2. 把命令面板 UI 挂出来
const KBarComponent = ({ children }: { children: React.ReactNode }) => {
  //“额外注册 actions”。
  useThemeSwitching();

  return (
    <>
      <KBarPortal>
        <KBarPositioner className="bg-background/80 fixed inset-0 z-99999 p-0! backdrop-blur-sm">
          <KBarAnimator className="bg-card text-card-foreground relative mt-64! w-full max-w-[600px] -translate-y-12! overflow-hidden rounded-lg border shadow-lg">
            <div className="bg-card border-border sticky top-0 z-10 border-b">
              <KBarSearch className="bg-card w-full border-none px-6 py-4 text-lg outline-hidden focus:ring-0 focus:ring-offset-0 focus:outline-hidden" />
            </div>
            <div className="max-h-[400px]">
              <RenderResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};
