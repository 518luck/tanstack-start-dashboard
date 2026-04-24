import { createFileRoute, Outlet } from "@tanstack/react-router";
import KBar from "@/components/kbar";
import AppSidebar from "@/components/layout/app-sidebar";
import Header from "@/components/layout/header";
import { InfoSidebar } from "@/components/layout/info-sidebar";
import { InfobarProvider } from "@/components/ui/infobar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "TanStack Dashboard Starter" },
      {
        name: "description",
        content: "Dashboard with TanStack Start and Shadcn",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    // 全局命令面板容器，提供类似 Cmd/Ctrl + K 的快捷搜索与跳转能力。
    <KBar>
      {/* // 侧边栏状态上下文，统一管理展开、收起、响应式行为。 */}
      <SidebarProvider>
        {/* // 左侧主导航栏，负责展示后台菜单。 */}
        <AppSidebar />
        {/* // 主内容区域容器，与左侧 Sidebar 配套使用。 */}
        <SidebarInset>
          {/* // 页面顶部栏，包含面包屑、主题切换、搜索等全局操作。 */}
          <Header />
          {/* // 右侧信息栏的状态上下文，控制信息面板是否打开。 */}
          <InfobarProvider defaultOpen={false}>
            {/* // 后台子页面出口，例如 overview、users、product
            等页面都会渲染在这里。 */}
            <Outlet />
            {/* // 右侧信息栏组件，用来展示说明、提示或补充信息。 */}
            <InfoSidebar side="right" />
          </InfobarProvider>
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}
