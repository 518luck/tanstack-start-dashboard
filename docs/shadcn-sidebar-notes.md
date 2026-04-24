# shadcn Sidebar 阅读笔记

## 你应该怎么读 shadcn 文档

不要从头到尾看完整篇。

只看 3 块：

1. `Usage`
   先看最小使用示例，知道怎么挂起来

```tsx
<SidebarProvider>
  <AppSidebar />
  <main>{children}</main>
</SidebarProvider>
```

2. `Composition`
   这部分最重要，但不要逐个背，先只记树结构

```text
SidebarProvider
├── Sidebar
├── SidebarInset
└── SidebarTrigger
```

你先只理解：

- `Provider` 提供状态
- `Sidebar` 是左栏
- `Inset` 是主内容区
- `Trigger` 是开关按钮

3. `Structure`
   这里只看一句话定义，不看后面所有细节 props

比如：

- `SidebarProvider`：管理 sidebar 状态
- `Sidebar`：侧边栏本体
- `SidebarInset`：主内容区容器

这样就够你理解 70% 了。

## 用 Antd 的脑子翻译 shadcn

你可以先粗暴类比：

- `SidebarProvider` ≈ 全局 sidebar 状态管理层
- `Sidebar` ≈ `Sider`
- `SidebarInset` ≈ `Layout.Content`
- `SidebarMenu` ≈ `Menu`
- `SidebarMenuItem` ≈ `Menu.Item`
- `SidebarTrigger` ≈ 手写折叠按钮

所以它不是你完全陌生的东西，只是它拆得更细。

Antd 是：

```tsx
<Layout>
  <Sider>
    <Menu />
  </Sider>
  <Content />
</Layout>
```

shadcn Sidebar 是：

```tsx
<SidebarProvider>
  <Sidebar>
    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem />
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
  <SidebarInset>
    <main />
  </SidebarInset>
</SidebarProvider>
```

本质都是左栏 + 内容区。  
只是 shadcn 拆得更细、更可改。

## 为什么你会觉得“文档很难”

因为 shadcn 文档默认假设你接受这几个前提：

- 你愿意看 JSX 组合结构
- 你愿意改源码
- 你愿意自己搭 UI
- 你不期待一个高度封装的黑盒组件

而你之前更熟悉的是：

- 高度封装
- 看 props 即可
- 组件直接可用

这两种学习模式完全不同。

## 你现在最该怎么做

不要学整套 shadcn 思维，成本太高。

只要记住：

1. `shadcn/ui` 更像“组件源码模板”，不是 Antd 那种成品库
2. 读文档时先看最小 `usage`，不要全看
3. 遇到复杂组件，只理解“最外层怎么接”和“主结构怎么拼”
4. 不想深挖时，直接拿官方 demo 改，比读文档更有效

## 对你最实用的建议

如果你平时主要用：

- Antd
- Next
- React + Vite

只需要会两件事：

- 看懂它的基本结构
- 需要时复制官方 demo 改成自己的业务

这就够了。

一句话总结：

你不是看不懂组件，而是 shadcn 根本不是按“传统组件库文档”在写。  
把它当“源码拼装说明书”看，而不是当 Antd 文档看，就顺了。
