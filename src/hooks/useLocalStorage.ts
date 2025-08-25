// useLocalStorage.ts
import { useSyncExternalStore, useCallback } from "react";

// 使用泛型提升类型安全
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  // 获取存储的值，若没有则使用初始值
  const getSnapshot = useCallback(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : initialValue;
    } catch (e) {
      // 如果 JSON.parse 失败，则返回初始值
      return initialValue;
    }
  }, [key, initialValue]);

  // 订阅 localStorage 的变化
  const subscribe = useCallback((onStoreChange: () => void) => {
    window.addEventListener("storage", onStoreChange);
    return () => window.removeEventListener("storage", onStoreChange);
  }, []);

  const storedValue = useSyncExternalStore(subscribe, getSnapshot);

  // 更新 localStorage
  const setStoredValue = useCallback(
    (value: T) => {
      try {
        const newValue = JSON.stringify(value);
        // 只有在值发生变化时才更新 localStorage 和触发事件
        if (window.localStorage.getItem(key) !== newValue) {
          window.localStorage.setItem(key, newValue);
          // 触发 storage 事件，通知其他页面更新
          window.dispatchEvent(new Event("storage"));
        }
      } catch (e) {
        console.error("Failed to set item in localStorage", e);
      }
    },
    [key]
  );

  return [storedValue, setStoredValue];
}
