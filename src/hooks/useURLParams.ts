// useURLParams.ts
import { useSyncExternalStore, useCallback } from "react";

export function useURLParams<T>(
  key: string,
  initialValue: T,
  useReplace: boolean = false // 是否使用 replaceState
): [T, (value: T) => void] {
  // 获取 URL 参数的值，若没有则使用初始值
  const getSnapshot = useCallback(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const storedValue = urlParams.get(key);
      return storedValue ? (JSON.parse(storedValue) as T) : initialValue;
    } catch (e) {
      return initialValue;
    }
  }, [key, initialValue]);

  // 订阅 URL 的变化
  const subscribe = useCallback((onStoreChange: () => void) => {
    // 使用 popstate 事件来监听 URL 变化
    window.addEventListener("popstate", onStoreChange);
    return () => window.removeEventListener("popstate", onStoreChange);
  }, []);

  const storedValue = useSyncExternalStore(subscribe, getSnapshot);

  // 更新 URL 参数
  const setStoredValue = useCallback(
    (value: T) => {
      try {
        const newValue = JSON.stringify(value);
        const urlParams = new URLSearchParams(window.location.search);

        // 更新 URL 参数
        urlParams.set(key, newValue);
        const newUrl = `${window.location.pathname}?${urlParams.toString()}`;

        if (useReplace) {
          // 使用 replaceState 替换当前的历史记录条目
          window.history.replaceState({}, "", newUrl);
        } else {
          // 使用 pushState 添加新的历史记录条目
          window.history.pushState({}, "", newUrl);
        }

        // 触发 popstate 事件，通知其他页面更新
        window.dispatchEvent(new Event("popstate"));
      } catch (e) {
        console.error("Failed to set URL param", e);
      }
    },
    [key, useReplace]
  );

  return [storedValue, setStoredValue];
}
