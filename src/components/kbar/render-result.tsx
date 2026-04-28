import { KBarResults, useMatches } from "kbar";
import ResultItem from "./result-item";

//把 kbar 当前匹配到的结果渲染出来。
export default function RenderResults() {
  // 从 kbar 当前状态里，拿到“搜索后匹配出来的结果”。
  const { results, rootActionId } = useMatches();
  // kbar 会自动根据已注册的 actions 算出一批匹配项。
  // 这些匹配项就在 results 里。

  return (
    // 它是 kbar 提供的“结果列表组件”。
    // 作用是：
    // 接收一组结果
    // 管理列表交互
    // 处理高亮项、键盘上下移动、回车选中这些行为
    <KBarResults
      items={results}
      // 列表里的每一项，你交给我来决定怎么画。
      onRender={({ item, active }) =>
        typeof item === "string" ? (
          <div className="text-muted-foreground px-4 py-2 text-sm uppercase">
            {item}
          </div>
        ) : (
          <ResultItem
            action={item}
            active={active}
            currentRootActionId={rootActionId ?? ""}
          />
        )
      }
    />
  );
}
