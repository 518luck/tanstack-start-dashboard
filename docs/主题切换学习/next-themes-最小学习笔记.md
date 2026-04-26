# next-themes 最小学习笔记

这份笔记只讲这个项目里和黑白主题切换直接相关的部分。

目标：

1. 先看懂 `next-themes` 最小实现
2. 再看懂常用 API 和常见写法
3. 最后映射回本项目

---

## 1. 最小实现

### 1.1 最小 Provider

```tsx
import { ThemeProvider } from "next-themes";

export default function App({ children }: { children: React.ReactNode }) {
  return <ThemeProvider attribute="class">{children}</ThemeProvider>;
}
```

• 这里的 attribute 是在告诉 next-themes：

“你切换主题后，要把主题状态写到 HTML 的哪个属性上。”

比如你这里写的是：

  <ThemeProvider attribute='class'>

意思就是：

- 不要写到 data-theme
- 而是写到 class

所以当你执行：

- setTheme('dark')

next-themes 会把根节点变成近似这样：

  <html class="dark">

如果你执行：

- setTheme('light')

就会去掉这个 dark 状态。

---

作用：

- 提供主题上下文
- 让内部组件可以用 `useTheme()`
- 把主题状态同步到 `html` 元素

### 自定义属性讲解

data-theme 不是 HTML 内置的标准语义属性，它是合法的自定义 data 属性。
HTML 里允许你写任意 data-\* 属性，比如：

```html
<div data-id="123"></div>
<div data-role="dialog"></div>
<html data-theme="dark"></html>
```

然后你就可以在 CSS 里这样写：

```css
[data-theme="dark"] {
  background: black;
  color: white;
}
```

这就是它的用途。

这些都合法。

### 1.2 最小切换按钮

```tsx
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <>
      <button onClick={() => setTheme("light")}>light</button>
      <button onClick={() => setTheme("dark")}>dark</button>
      <button onClick={() => setTheme("system")}>system</button>
    </>
  );
}
```

作用：

- `setTheme('light')` 切浅色
- `setTheme('dark')` 切深色
- `setTheme('system')` 跟随系统

最小心智模型：

setTheme('dark')

约等于：

1. 记住当前主题是 dark
2. 存到 localStorage
3. 给 html 加上 dark 标记
4. 让 CSS 重新生效
5. 让用到主题的组件重新渲染

### 1.3 最小样式

如果使用 Tailwind 的 `dark:`：

```tsx
<div className="bg-white text-black dark:bg-black dark:text-white">hello</div>
```

如果使用 CSS 变量：

```css
:root {
  --background: white;
  --foreground: black;
}

.dark {
  --background: black;
  --foreground: white;
}
```

---

## 2. 这个项目里的最小链路

### 2.1 根布局注册 Provider

项目位置：[src/routes/\_\_root.tsx](/home/duoyun/idea/open-source/tanstack-start-dashboard/src/routes/__root.tsx:85)

```tsx
<ThemeProvider
  attribute="class"  //把当前主题状态写到 html 元素的 class 属性上
  defaultTheme="system"  //用户第一次打开页面、且本地没有保存过主题时，默认使用 system
  enableSystem  //允许 system 这种主题模式存在  并监听系统的 prefers-color-scheme
  disableTransitionOnChange  // 切换主题时，临时禁用页面上的普通 CSS transition
  enableColorScheme  // 告诉浏览器当前页面是浅色还是深色    浏览器自己内建的 UI 要不要也按深浅模式来画。
>
```

这里的意思是：

- 用 `class` 形式表达主题
- 默认跟随系统
- 允许 `system`
- 切换时临时关闭普通 CSS 过渡
- 告诉浏览器当前深浅模式

### 2.2 按钮触发切换

项目位置：[src/components/themes/theme-mode-toggle.tsx](/home/duoyun/idea/open-source/tanstack-start-dashboard/src/components/themes/theme-mode-toggle.tsx:9)

```tsx
const { setTheme, resolvedTheme } = useTheme();

const newMode = resolvedTheme === "dark" ? "light" : "dark";
setTheme(newMode);
```

这里的意思是：

- 先读取当前实际主题 `resolvedTheme`
- 如果现在是深色，就切浅色
- 如果现在是浅色，就切深色

常用值

- theme：你选了什么
- resolvedTheme：最后显示成什么
- setTheme：切换主题
- systemTheme：系统是什么
- forcedTheme：页面有没有被强制锁定主题
- themes：可选主题列表

### 2.3 DOM 最终会发生什么

当执行：

```tsx
setTheme("dark");
```

因为这里配置了：

```tsx
attribute = "class";
```

所以根节点会变成近似这样：

```html
<html class="dark"></html>
```

当执行：

```tsx
setTheme("light");
```

根节点会回到非 dark 状态。

这就是 `dark:` 类为什么能生效。

---

## 3. 常用 API

### 3.1 `ThemeProvider`

最常用属性：

- `attribute`
- `defaultTheme`
- `enableSystem`
- `disableTransitionOnChange`
- `enableColorScheme`
- `themes`
- `forcedTheme`

#### `attribute`

常见写法：

```tsx
<ThemeProvider attribute='class'>
```

作用：

- 决定把主题状态写到哪个 HTML 属性上

常见值：

- `class`
- `data-theme`
- `data-mode`

如果是：

```tsx
attribute = "class";
```

那么深色时近似是：

```html
<html class="dark"></html>
```

如果是：

```tsx
attribute = "data-theme";
```

那么深色时近似是：

```html
<html data-theme="dark"></html>
```

#### `defaultTheme`

```tsx
<ThemeProvider defaultTheme='system'>
```

作用：

- 第一次进入页面，且本地没有缓存主题时，用哪个默认主题

常见值：

- `'light'`
- `'dark'`
- `'system'`

#### `enableSystem`

```tsx
<ThemeProvider enableSystem>
```

作用：

- 允许 `system` 模式
- 让主题跟随系统的 `prefers-color-scheme`

#### `disableTransitionOnChange`

```tsx
<ThemeProvider disableTransitionOnChange>
```

作用：

- 切主题时短暂关闭 CSS transition
- 避免很多元素一起闪烁

#### `enableColorScheme`

```tsx
<ThemeProvider enableColorScheme>
```

作用：

- 让浏览器原生控件也更符合当前深浅模式
- 比如滚动条、输入框、系统控件观感

#### `forcedTheme`

```tsx
<ThemeProvider forcedTheme='dark'>
```

作用：

- 强制当前页面只使用某个主题
- 此时 `setTheme()` 基本不会改变页面外观

#### `themes`

```tsx
<ThemeProvider themes={['light', 'dark', 'brand']}>
```

作用：

- 自定义允许切换的主题名称列表

注意：

- 如果你显式传了 `themes`
- 默认的 `light` 和 `dark` 会被覆盖
- 还想要黑白主题就要自己写回去

### 3.2 `useTheme`

最常用返回值：

- `theme`
- `setTheme`
- `resolvedTheme`
- `systemTheme`
- `forcedTheme`
- `themes`

#### `theme`

```tsx
const { theme } = useTheme();
```

作用：

- 当前选择的主题名
- 可能是 `'light'`、`'dark'`、`'system'`

注意：

- 如果当前就是 `system`
- 那 `theme` 仍然是 `'system'`
- 它不是最终计算后的结果

#### `resolvedTheme`

```tsx
const { resolvedTheme } = useTheme();
```

作用：

- 当前真正生效的主题

例子：

- `theme === 'system'`
- 系统实际是 dark
- 那么 `resolvedTheme === 'dark'`

这个项目切黑白时用的就是它。

#### `setTheme`

```tsx
const { setTheme } = useTheme();
```

常用写法：

```tsx
setTheme("light");
setTheme("dark");
setTheme("system");
```

作用：

- 修改主题
- `next-themes` 会同步到 DOM 和本地存储

#### `systemTheme`

```tsx
const { systemTheme } = useTheme();
```

作用：

- 只表示系统当前偏好是 `light` 还是 `dark`
- 不代表你的应用最终一定使用它

---

## 4. 常用方法和常见写法

### 4.1 二元切换

```tsx
const { setTheme, resolvedTheme } = useTheme();

const toggleTheme = () => {
  setTheme(resolvedTheme === "dark" ? "light" : "dark");
};
```

这是最常见的深浅切换写法。

### 4.2 三态切换

```tsx
const { setTheme } = useTheme();

setTheme("light");
setTheme("dark");
setTheme("system");
```

适合下拉框、设置页。

### 4.3 根据当前主题显示不同内容

```tsx
const { resolvedTheme } = useTheme();

return <div>{resolvedTheme === "dark" ? "深色" : "浅色"}</div>;
```

注意：

- 这种写法在 SSR 场景里容易遇到 hydration 问题
- 最稳妥的办法是挂载后再渲染

### 4.4 挂载后再渲染

```tsx
const [mounted, setMounted] = useState(false);
const { theme, setTheme } = useTheme();

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return null;
```

这样做的原因：

- 服务端拿不到浏览器的 `localStorage`
- 也拿不到客户端真实系统主题
- 所以直接在首屏渲染 `theme` 相关 UI 可能导致水合不一致

---

## 5. 官方结论 + 白话解释

这一节保留官方文档的核心结论，再补一个更容易理解的解释。

### 5.1 关于 `ThemeProvider`

官方结论：

- All your theme configuration is passed to `ThemeProvider`.

白话解释：

- 所有主题配置都交给这个 Provider 管。
- 你想控制主题怎么落到 DOM、默认值是什么、是否跟随系统，都是在这里配。

### 5.2 关于 `attribute`

官方结论：

- `attribute = 'data-theme'`
- accepts `class` and `data-*`

白话解释：

- 主题状态最终要写到 `html` 的某个属性上。
- 默认写到 `data-theme`。
- 你也可以改成写到 `class`。
- Tailwind 深色模式通常就喜欢用 `.dark`，所以经常会写成 `attribute='class'`。

### 5.3 关于 `attribute="class"`

官方结论：

- setting the theme to `dark` will set `class="dark"` on the `html` element

白话解释：

- 这句话最关键。
- 它说明切成 dark 后，不是改 `body`，也不是改某个组件。
- 而是直接改最外层 `html`。
- 所以整个页面都能感知到 dark 状态。

### 5.4 关于 `defaultTheme="system"`

官方结论：

- `defaultTheme = 'system'`

白话解释：

- 用户第一次打开页面时，如果之前没选过主题，就先参考系统设置。
- 系统黑，你就黑；系统白，你就白。

### 5.5 关于 `enableSystem`

官方结论：

- Whether to switch between `dark` and `light` based on `prefers-color-scheme`

白话解释：

- 是否允许“跟随系统”这件事存在。
- 它本质上就是读浏览器的系统深浅偏好。

### 5.6 关于 `enableColorScheme`

官方结论：

- indicate to browsers which color scheme is used

白话解释：

- 不只是你自己写的组件要切黑白。
- 浏览器自己的原生控件也需要知道当前是深色还是浅色。

### 5.7 关于 `disableTransitionOnChange`

官方结论：

- disable all CSS transitions when switching themes

白话解释：

- 切主题那一瞬间，先把普通 CSS 过渡关掉。
- 不然页面很多地方可能一起闪。

### 5.8 关于 `resolvedTheme`

官方结论：

- If `enableSystem` is true and the active theme is `system`, this returns whether the system preference resolved to `dark` or `light`.

白话解释：

- `theme` 表示你选了什么。
- `resolvedTheme` 表示页面最后到底显示成什么。
- 如果你选的是 `system`，那真正判断按钮该切向哪里时，要看 `resolvedTheme`。

---

## 6. 这个项目里要重点记住的点

### 6.1 黑白主题只有一套

这里真正负责黑白主题的是 `next-themes`：

- Provider 配置在 [src/routes/\_\_root.tsx](/home/duoyun/idea/open-source/tanstack-start-dashboard/src/routes/__root.tsx:85)
- 切换动作在 [src/components/themes/theme-mode-toggle.tsx](/home/duoyun/idea/open-source/tanstack-start-dashboard/src/components/themes/theme-mode-toggle.tsx:10)

### 6.2 `theme-provider.tsx` 只是薄封装

位置：[src/components/themes/theme-provider.tsx](/home/duoyun/idea/open-source/tanstack-start-dashboard/src/components/themes/theme-provider.tsx:1)

它只是转发：

```tsx
return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
```

所以学习黑白主题时，不要把重点放在这个文件上。

### 6.3 这个项目还有第二套“皮肤主题”

位置：[src/components/themes/active-theme.tsx](/home/duoyun/idea/open-source/tanstack-start-dashboard/src/components/themes/active-theme.tsx:20)

这套不是黑白模式，而是：

- `vercel`
- `mono`
- `notebook`
- `claude`

它们通过 `data-theme` 切换皮肤。

所以要分清：

- `next-themes`：控制 `light / dark / system`
- `activeTheme`：控制 `vercel / mono / ...`

---

## 7. 一句话总结

黑白主题最核心的链路是：

1. 根组件用 `ThemeProvider` 包住应用
2. 组件里通过 `useTheme()` 拿到 `setTheme`
3. 调用 `setTheme('dark')` 或 `setTheme('light')`
4. `next-themes` 把结果写到 `html`
5. `dark:` 样式或主题变量开始生效

在这个项目里，因为用了：

```tsx
attribute = "class";
```

所以 dark 模式最终体现为：

```html
<html class="dark"></html>
```
