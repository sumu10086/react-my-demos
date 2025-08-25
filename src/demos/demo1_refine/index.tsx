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
  };

  return (
    <MovableBox
      containerSize={{
        width: containerBoxSize.width,
        height: containerBoxSize.height,
      }}
      containerStyle={{ background: "#f0f0f0", margin: "200px auto" }}
      boxSize={moveBoxSize}
      snapMode={ESnapMode.Smart}
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
  );
};

export default App;
