# 第一步

流程

1. npm install kbar
2. 自己封装一个 src/components/kbar/index.tsx
3. 在页面根部用 <KBar>...</KBar> 包起来
4. 在子组件或 hook 里注册 actions 和快捷键

```jsx
<KBar>
  <SidebarProvider>...</SidebarProvider>
</KBar>
```

> “这个区域启用命令面板系统，里面的子组件以后都可以接入这个系统。”
