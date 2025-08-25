import "./App.css";

// import Page from "./demos/demo1"; // 元素拖拽
// import Page from "./demos/demo1_refine"; // 元素拖拽 优化
// import Page from "./demos/demo2"; // 滚动监听 和 tab 切换
// import Page from "./demos/demo3"; // forwardRef 和 useImperativeHandle
// import Page from "./demos/demo4"; // useTransition 和 useDeferredValue
// import Page from "./demos/demo5"; // useSyncExternalStore 封装 localStorage 实现状态共享
import Page from "./demos/demo6"; // 列表定时轮询刷新+滚动加载

if (process.env.NODE_ENV === "development") {
  require("./mockjs");
}

function App() {
  return (
    <div className='App'>
      <Page />
    </div>
  );
}

export default App;
