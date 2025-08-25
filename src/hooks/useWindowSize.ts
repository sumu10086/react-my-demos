import { useRef, useCallback, useSyncExternalStore } from "react";

export function useWindowSize() {
  const cachedValueRef = useRef({
    width: window.innerWidth,
    height: window.innerHeight,
  }); // 用于缓存 getSnapshot 的返回值

  const getSnapshot = useCallback(() => {
    // 解决每次调用都返回了一个新对象，造成无限循环
    const windowObj = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    if (JSON.stringify(cachedValueRef.current) !== JSON.stringify(windowObj)) {
      cachedValueRef.current = windowObj;
    }
    return cachedValueRef.current;
  }, []);

  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener("resize", callback);
    return () => window.removeEventListener("resize", callback);
  }, []);

  const { width, height } = useSyncExternalStore(subscribe, getSnapshot);

  return { width, height };
}
