import React from "react";
import { SidebarTrigger } from "../ui/sidebar";
import { Separator } from "../ui/separator";
import { Breadcrumbs } from "../breadcrumbs";
import SearchInput from "../search-input";
import { ThemeSelector } from "../themes/theme-selector";
import { ThemeModeToggle } from "../themes/theme-mode-toggle";
import CtaGithub from "./cta-github";
import { NotificationCenter } from "@/features/notifications/components/notification-center";

//  - bg-background/60：背景色用主题里的 background，透明度 60%
//   - sticky top-0：吸顶，滚动时会粘在顶部
//   - z-20：层级较高，避免被普通内容盖住
//   - flex：用弹性布局
//   - h-14：高度 3.5rem
//   - shrink-0：空间不够时自己不要被压缩
//   - items-center：flex 交叉轴居中，这里是垂直居中
//   - justify-between：左右两边内容拉开，一边靠左一边靠右
//   - gap-2：内部项目之间间距 0.5rem
//   - rounded-t-xl：顶部两个角做较大的圆角
//   - border-b：底部加一条边框
//   - backdrop-blur-md：给背景后面的内容加中等模糊，常见于毛玻璃效果
//   - px-4：左右内边距 1rem
export default function Header() {
  return (
    <header className="bg-background/60 sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-2 rounded-t-xl border-b backdrop-blur-md px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-2">
        <CtaGithub />
        <div className="hidden md:flex">
          <SearchInput />
        </div>
        <ThemeModeToggle />
        <div className="hidden sm:block">
          <ThemeSelector />
        </div>
        <NotificationCenter />
      </div>
    </header>
  );
}
