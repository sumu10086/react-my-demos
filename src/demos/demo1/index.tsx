import React, { useState, useRef, useEffect } from "react";
import { useSpring, animated } from "@react-spring/web";

interface IPosition {
  x: number;
  y: number;
}

interface IBoxSize {
  width: number;
  height: number;
}

// 检查是否应该将窗口贴边或中间移动
const checkSnapPosition = (
  containerBoxSize: IBoxSize,
  moveBoxSize: IBoxSize,
  pos: IPosition
): IPosition => {
  const sideMargin = 21; // 边缘的最小间距
  const containerBoxWidth = containerBoxSize.width;
  const containerBoxHeight = containerBoxSize.height;
  const moveBoxWidth = moveBoxSize.width;
  const moveBoxHeight = moveBoxSize.height;

  // 计算窗口最大可以移动到的 X 坐标
  const maxX = containerBoxWidth - moveBoxWidth - sideMargin;
  // 确保鼠标的 X 坐标在合法范围内，左右不超过边缘
  const posX = Math.min(Math.max(pos.x, sideMargin), maxX);
  // 确保鼠标的 Y 坐标在合法范围内，上下不超过边缘
  const posY = Math.min(Math.max(pos.y, 0), containerBoxHeight - moveBoxHeight);

  // 设置中间区域阈值，只有当鼠标超过此阈值时才会触发贴边操作
  const SNAP_THRESHOLD = 100;

  // 计算左右上下来贴边的系数：用于判断鼠标位置的相对方向
  const posCoefficient = containerBoxHeight / containerBoxWidth;

  // 判断鼠标是否靠近屏幕左下角（左边区域的下部分）
  const isLeftDown = posY / posX > posCoefficient;
  // 判断鼠标是否靠近屏幕右下角（右边区域的下部分）
  const isRightDown = posY / (containerBoxWidth - posX) > posCoefficient;

  // 判断鼠标是否位于中间范围，若是，则不会进行贴边
  const isInMiddleRangeX =
    posX > SNAP_THRESHOLD && posX < maxX - SNAP_THRESHOLD;
  const isInMiddleRangeY =
    posY > SNAP_THRESHOLD &&
    posY < containerBoxHeight - moveBoxHeight - SNAP_THRESHOLD;

  // 如果鼠标位置在中间范围内，不进行贴边，直接返回当前鼠标位置
  if (isInMiddleRangeX && isInMiddleRangeY) {
    return { x: posX, y: posY };
  }

  // 如果鼠标位于左下和右下区域，吸附到屏幕底部
  if (isLeftDown && isRightDown) {
    return {
      x: posX,
      y: containerBoxHeight - moveBoxHeight - sideMargin,
    };
  }

  // 如果鼠标位于左下区域，吸附到屏幕左边
  if (isLeftDown) {
    return { x: sideMargin, y: posY };
  }

  // 如果鼠标位于右下区域，吸附到屏幕右边
  if (isRightDown) {
    return { x: maxX, y: posY };
  }

  // 如果鼠标位置不符合上述条件，默认吸附到上边
  return { x: posX, y: sideMargin };
};

function MoveBoxComponent() {
  const [position, setPosition] = useState<IPosition>({ x: 0, y: 0 }); // moveBox 的位置
  const isDragging = useRef<boolean>(false); // 是否正在拖动
  const offset = useRef({ x: 0, y: 0 }); // 鼠标按下时的偏移量
  const containerBoxSize = { width: 500, height: 500 }; // container的尺寸
  const moveBoxSize = { width: 64, height: 64 }; // moveBox的尺寸

  // 使用 react-spring 创建动画
  const [springProps, api] = useSpring(() => ({}));

  useEffect(() => {
    initBoxPosition();
  }, []);

  const initBoxPosition = async () => {
    const screenSize = {
      width: window.screen.availWidth,
      height: window.screen.availHeight,
    };
    // 初始位置设置在右下角贴边
    const pos = {
      x: screenSize.width,
      y: screenSize.height,
    };
    const snapPosition = checkSnapPosition(containerBoxSize, moveBoxSize, pos);
    // 更新位置
    setPosition(snapPosition);
    // 使用动画效果移动到初始位置
    api.start({
      from: { x: 0, y: 0 },
      to: snapPosition,
      config: { tension: 300, friction: 130 },
    });
  };

  // 处理鼠标按下事件，初始化拖动
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;

    // 记录鼠标按下时的偏移
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };

    // 禁用选中文本，防止拖动时文本被选择
    document.body.style.userSelect = "none";

    // 添加 mousemove 和 mouseup 事件监听
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // 处理鼠标移动事件，更新 moveBox 的位置
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    const pos = {
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    };
    // 更新位置
    setPosition(pos);
    // 使用动画效果
    api.start({
      from: pos,
      to: pos,
      config: { tension: 300, friction: 50 },
    });
  };

  // 处理鼠标松开事件，停止拖动
  const handleMouseUp = (e: MouseEvent) => {
    isDragging.current = false;

    const pos = {
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    };
    // 检查是否需要贴边或吸附
    const snapPosition = checkSnapPosition(containerBoxSize, moveBoxSize, pos);
    // 更新位置
    setPosition(snapPosition);
    // 使用动画效果
    api.start({
      from: pos,
      to: snapPosition,
      config: { tension: 300, friction: 50 },
    });

    // 移除事件监听
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);

    // 恢复文本选择
    document.body.style.userSelect = "auto";
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("右键菜单");
  };

  const handleClick = () => {
    console.log("单击事件");
  };

  const handleDoubleClick = () => {
    console.log("双击事件");
  };

  return (
    <div
      id='container'
      style={{
        width: containerBoxSize.width,
        height: containerBoxSize.height,
        border: "1px solid #ccc",
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* moveBox */}
      <animated.div
        style={{
          width: moveBoxSize.width,
          height: moveBoxSize.height,
          borderRadius: "50%",
          backgroundImage: "",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          boxShadow: "0px 0px 5px 1px rgba(0, 0, 0, 0.32)",
          cursor: "pointer",
          position: "absolute",
          // top: position.y, // 无需动画时可放开注释，且注释 springProps 
          // left: position.x, // 无需动画时可放开注释，且注释 springProps 
          ...springProps, // 使用动画效果
        }}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      ></animated.div>
    </div>
  );
}

export default MoveBoxComponent;
