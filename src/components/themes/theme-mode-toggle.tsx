import { Icons } from "@/components/icons";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";

export function ThemeModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  // 缓存一个函数，尽量让这个函数在组件重新渲染时保持同一个引用。

  // const fn = React.useCallback(
  //   () => {
  //     // 函数逻辑
  //   },
  //   [依赖项],
  // );
  const handleThemeToggle = React.useCallback(
    // e 是点击事件，React.MouseEvent 是 TypeScript 类型
    (e?: React.MouseEvent) => {
      const newMode = resolvedTheme === "dark" ? "light" : "dark";
      const root = document.documentElement;

      // document.startViewTransition 是浏览器 document 对象上的一个方法。只要浏览器支持，可以直接调用
      if (!document.startViewTransition) {
        setTheme(newMode);
        return;
      }

      //  这是把鼠标点击的位置存到 CSS 变量里。
      if (e) {
        // setProperty 是设置 CSS 属性的方法。
        root.style.setProperty("--x", `${e.clientX}px`);
        root.style.setProperty("--y", `${e.clientY}px`);
      }

      // document.startViewTransition 是浏览器 document 对象上的一个方法。只要浏览器支持，可以直接调用
      // 1. 浏览器先截一张“旧页面状态”的快照
      // 2. 执行你传进去的回调，比如这里切换主题
      // 3. 浏览器再截一张“新页面状态”的快照
      // 4. 然后用 CSS 控制旧快照和新快照之间怎么过渡
      document.startViewTransition(() => {
        setTheme(newMode);
      });
    },
    [resolvedTheme, setTheme],
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="group/toggle size-8"
          onClick={handleThemeToggle}
        >
          <Icons.brightness />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        Toggle theme <Kbd>D D</Kbd>
      </TooltipContent>
    </Tooltip>
  );
}
