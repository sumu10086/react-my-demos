import React from "react";
import { MovableBox, ESnapMode } from "./components/MovableBox copy";

const App = () => {
  const containerBoxSize = { width: 500, height: 500 }; // container的尺寸
  const moveBoxSize = { width: 64, height: 64 }; // moveBox的尺寸

  const handleClick = (e: React.MouseEvent) => {
    console.log("点击事件", e);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    console.log("双击事件", e);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("右键菜单事件", e);
  };

  const handleDragStart = (position: any) => {
    console.log("拖拽开始位置:", position);
  };

  const handleDragEnd = (position: any) => {
    console.log("拖拽结束位置:", position);
    localStorage.setItem("boxPosition", JSON.stringify(position));
  };

  const initialPosition = JSON.parse(localStorage.getItem("boxPosition") || '{"x":0,"y":0}');

  const [snapMode, setSnapMode] = React.useState<ESnapMode>(ESnapMode.Smart);
  const [snapThreshold, setSnapThreshold] = React.useState<number>(100);
  const onSnapModeToggle = () => {
    setSnapMode(snapMode === ESnapMode.Smart ? ESnapMode.Always : ESnapMode.Smart);
  };
  const onSnapThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    const minVal = 0;
    const maxVal = Math.min(containerBoxSize.width, containerBoxSize.height) / 2;
    if (val <= minVal) {
      setSnapThreshold(minVal);
    } else if (val > maxVal) {
      setSnapThreshold(maxVal);
    } else {
      setSnapThreshold(val);
    }
  };

  return (
    <>
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button onClick={onSnapModeToggle}>贴边模式切换 当前模式：（{snapMode === ESnapMode.Smart ? "延边时贴边" : "始终贴边"}）</button>
        {snapMode === ESnapMode.Smart && (
          <label>
            阈值设置：
            <input
              type="number"
              placeholder="请输入阈值"
              title="设置贴边阈值"
              value={snapThreshold}
              onChange={onSnapThresholdChange}
            />
          </label>
        )}
      </div>
      <MovableBox
        containerSize={{
          width: containerBoxSize.width,
          height: containerBoxSize.height,
        }}
        containerStyle={{ background: "#f0f0f0", margin: "20px auto" }}
        boxSize={moveBoxSize}
        snapMode={snapMode}
        snapThreshold={snapThreshold}
        initialPosition={initialPosition}
        style={{
          backgroundColor: "#4285f4",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <span>拖拽我</span>
      </MovableBox>
    </>
  );
};

export default App;
