import React from "react";
import { Heading } from "../ui/heading";
import type { InfobarContent } from "@/components/ui/infobar";

function PageSkeleton() {
  return (
    <div className="flex flex-1 animate-pulse flex-col gap-4 p-4 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="bg-muted mb-2 h-8 w-48 rounded" />
          <div className="bg-muted h-4 w-96 rounded" />
        </div>
      </div>
      <div className="bg-muted mt-6 h-40 w-full rounded-lg" />
      <div className="bg-muted h-40 w-full rounded-lg" />
    </div>
  );
}

export default function PageContainer({
  children, //    真正的页面内容
  isLoading = false, //   当前页面是否处于加载态
  access = true, //  当前用户是否有权限访问这个页面
  accessFallback, //没权限时显示什么
  pageTitle, // 页面标题
  pageDescription, // 页面描述
  infoContent, // 右侧信息栏内容
  pageHeaderAction, // 页面头部操作区
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  access?: boolean;
  accessFallback?: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  infoContent?: InfobarContent;
  pageHeaderAction?: React.ReactNode;
}) {
  //先处理“无权限”分支
  if (!access) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 md:px-6">
        {accessFallback ?? (
          <div className="text-muted-foreground text-center text-lg">
            You do not have access to this page.
          </div>
        )}
      </div>
    );
  }

  //再决定正文显示 skeleton 还是 children
  const content = isLoading ? <PageSkeleton /> : children;

  // 判断要不要渲染页面头部
  const hasHeader = pageTitle || pageHeaderAction;

  return (
    <div className="flex flex-1 flex-col p-4 md:px-6">
      {hasHeader && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <Heading
            title={pageTitle ?? ""}
            description={pageDescription ?? ""}
            infoContent={infoContent}
          />
          {pageHeaderAction && (
            <div className="shrink-0">{pageHeaderAction}</div>
          )}
        </div>
      )}
      {content}
    </div>
  );
}
