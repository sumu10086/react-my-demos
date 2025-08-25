import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSpring, animated } from "@react-spring/web";

interface IPosition {
    x: number;
    y: number;
}

interface IBoxSize {
    width: number;
    height: number;
}

export enum ESnapMode {
    Always = "always",
    Smart = "smart", // 默认值
}

interface MovableBoxProps {
    containerSize?: IBoxSize; // 容器尺寸
    boxSize?: IBoxSize;  // 移动盒子的尺寸
    snapMode?: ESnapMode; // 贴边模式
    snapThreshold?: number; // 贴边阈值
    sideMargin?: number;    // 边距
    initialPosition?: IPosition; // 初始位置
    children?: React.ReactNode; // 子元素
    onDragStart?: () => void; // 开始拖拽
    onDragEnd?: (position: IPosition) => void; // 结束拖拽
    onClick?: (e: React.MouseEvent) => void; // 点击事件
    onDoubleClick?: (e: React.MouseEvent) => void; // 双击事件
    onContextMenu?: (e: React.MouseEvent) => void; // 右键菜单事件
    className?: string; // 自定义类名
    style?: React.CSSProperties; // 自定义样式
    containerStyle?: React.CSSProperties; // 容器样式
}

// 贴边位置检查函数
const checkSnapPosition = (
    containerBoxSize: IBoxSize, // 容器尺寸
    moveBoxSize: IBoxSize, // 移动盒子的尺寸
    pos: IPosition, // 移动盒子的位置
    snapMode: ESnapMode, // 贴边模式
    sideMargin: number, // 边距
    snapThreshold: number  // 贴边阈值
): IPosition => {
    const containerWidth = containerBoxSize.width;
    const containerHeight = containerBoxSize.height;
    const moveBoxWidth = moveBoxSize.width;
    const moveBoxHeight = moveBoxSize.height;

    // 计算安全边界 - 确保盒子不会超出容器
    const minX = sideMargin;
    const maxX = Math.max(minX, containerWidth - moveBoxWidth - sideMargin);
    const minY = sideMargin;
    const maxY = Math.max(minY, containerHeight - moveBoxHeight - sideMargin);

    // 确保位置在安全边界内
    let posX = Math.min(Math.max(pos.x, minX), maxX);
    let posY = Math.min(Math.max(pos.y, minY), maxY);

    // 始终贴边模式
    if (snapMode === ESnapMode.Always) {
        const distanceToLeft = posX - minX;
        const distanceToRight = maxX - posX;
        const distanceToTop = posY - minY;
        const distanceToBottom = maxY - posY;

        const minDistance = Math.min(
            distanceToLeft,
            distanceToRight,
            distanceToTop,
            distanceToBottom
        );

        if (minDistance === distanceToLeft) return { x: minX, y: posY };
        if (minDistance === distanceToRight) return { x: maxX, y: posY };
        if (minDistance === distanceToTop) return { x: posX, y: minY };
        return { x: posX, y: maxY };
    }

    // 智能贴边模式 - 使用阈值判断
    if (snapMode === ESnapMode.Smart) {
        const snapLeft = posX - minX < snapThreshold;
        const snapRight = maxX - posX < snapThreshold;
        const snapTop = posY - minY < snapThreshold;
        const snapBottom = maxY - posY < snapThreshold;

        // 处理角落优先贴边
        if (snapLeft && snapTop) return { x: minX, y: minY };
        if (snapRight && snapTop) return { x: maxX, y: minY };
        if (snapLeft && snapBottom) return { x: minX, y: maxY };
        if (snapRight && snapBottom) return { x: maxX, y: maxY };

        // 处理单边贴边
        if (snapLeft) return { x: minX, y: posY };
        if (snapRight) return { x: maxX, y: posY };
        if (snapTop) return { x: posX, y: minY };
        if (snapBottom) return { x: posX, y: maxY };
    }

    return { x: posX, y: posY };
};

// useMovable自定义hook
const useMovable = (
    containerSize: IBoxSize,
    boxSize: IBoxSize,
    initialPosition: IPosition,
    snapMode: ESnapMode,
    snapThreshold: number,
    sideMargin: number,
    onDragStart?: () => void,
    onDragEnd?: (position: IPosition) => void
) => {
    const isDragging = useRef(false);
    const startPos = useRef<IPosition>({ x: 0, y: 0 });
    const offset = useRef({ x: 0, y: 0 });

    // 使用ref存储当前位置，避免状态更新导致的闪烁
    const positionRef = useRef<IPosition>(initialPosition);

    // 使用单个spring实例管理位置
    const [springProps, api] = useSpring(() => ({
        x: initialPosition.x,
        y: initialPosition.y,
        config: { tension: 300, friction: 30 },
        immediate: false
    }));

    // 更新位置（带动画）
    const updatePosition = useCallback((newPos: IPosition, animated: boolean = true) => {
        const snapPosition = checkSnapPosition(
            containerSize,
            boxSize,
            newPos,
            snapMode,
            sideMargin,
            snapThreshold
        );

        positionRef.current = snapPosition;

        if (animated) {
            api.start({
                x: snapPosition.x,
                y: snapPosition.y,
                config: { tension: 300, friction: 50 },
                immediate: false
            });
        } else {
            api.start({
                x: snapPosition.x,
                y: snapPosition.y,
                immediate: true
            });
        }

        return snapPosition;
    }, [api, boxSize, containerSize, sideMargin, snapMode, snapThreshold]);

    // 初始化位置
    useEffect(() => {
        updatePosition(initialPosition, true);
    }, [initialPosition, updatePosition]);

    // 处理鼠标移动事件 - 使用直接DOM操作避免闪烁
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging.current) return;

        // 计算新位置
        const newPos = {
            x: startPos.current.x + (e.clientX - offset.current.x),
            y: startPos.current.y + (e.clientY - offset.current.y)
        };

        // 直接更新spring，不使用状态
        api.start({
            x: newPos.x,
            y: newPos.y,
            immediate: true
        });

        positionRef.current = newPos;
    }, [api]);

    // 处理鼠标释放事件
    const handleMouseUp = useCallback((e: MouseEvent) => {
        if (!isDragging.current) return;

        isDragging.current = false;

        // 使用当前位置进行贴边
        const snapPosition = updatePosition(positionRef.current);

        document.body.style.userSelect = "auto";
        document.body.style.cursor = "auto";

        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);

        if (onDragEnd) onDragEnd(snapPosition);
    }, [handleMouseMove, onDragEnd, updatePosition]);

    // 处理鼠标按下事件
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        // 阻止右键触发拖拽
        if (e.button !== 0) return;

        isDragging.current = true;

        // 记录初始位置和鼠标偏移量
        startPos.current = { ...positionRef.current };
        offset.current = {
            x: e.clientX,
            y: e.clientY
        };

        document.body.style.userSelect = "none";
        document.body.style.cursor = "grabbing";

        if (onDragStart) onDragStart();

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    }, [handleMouseMove, handleMouseUp, onDragStart]);

    // 组件卸载时清理事件监听器
    useEffect(() => {
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            document.body.style.userSelect = "auto";
            document.body.style.cursor = "auto";
        };
    }, [handleMouseMove, handleMouseUp]);

    return {
        springProps,
        handleMouseDown,
        updatePosition
    };
};

// 可移动盒子组件
export const MovableBox: React.FC<MovableBoxProps> = ({
    containerSize = { width: window.innerWidth, height: window.innerHeight }, 
    boxSize = { width: 64, height: 64 }, 
    snapMode = ESnapMode.Smart, 
    snapThreshold = 100, 
    sideMargin = 21, 
    initialPosition = { x: containerSize.width - boxSize.width - sideMargin, y: containerSize.height - boxSize.height - sideMargin }, 
    children, 
    onDragStart, 
    onDragEnd,   
    onClick,     
    onDoubleClick, 
    onContextMenu, 
    className = "", 
    style = {}, 
    containerStyle = {} 
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [actualContainerSize, setActualContainerSize] = useState(containerSize);

    // 监听容器尺寸变化
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setActualContainerSize({
                    width: rect.width,
                    height: rect.height
                });
            }
        };

        updateSize();

        const resizeObserver = new ResizeObserver(updateSize);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        window.addEventListener("resize", updateSize);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", updateSize);
        };
    }, []);

    const { springProps, handleMouseDown } = useMovable(
        actualContainerSize,
        boxSize,
        initialPosition,
        snapMode,
        snapThreshold,
        sideMargin,
        onDragStart,
        onDragEnd
    );

    // 防止拖拽结束后触发点击事件
    const isDraggingRef = useRef(false);
    const handleClick = useCallback((e: React.MouseEvent) => {
        if (isDraggingRef.current) {
            isDraggingRef.current = false;
            return;
        }
        onClick?.(e);
    }, [onClick]);

    return (
        <div
            ref={containerRef}
            className="movable-container"
            style={{
                position: "relative",
                overflow: "hidden",
                ...containerStyle,
                ...containerSize
            }}
        >
            <animated.div
                className={`movable-box ${className}`}
                style={{
                    position: "absolute",
                    width: boxSize.width,
                    height: boxSize.height,
                    cursor: "grab",
                    touchAction: "none",
                    userSelect: "none",
                    ...style,
                    ...springProps
                }}
                onMouseDown={(e) => {
                    isDraggingRef.current = true;
                    handleMouseDown(e);
                }}
                onClick={handleClick}
                onDoubleClick={onDoubleClick}
                onContextMenu={onContextMenu}
            >
                {children}
            </animated.div>
        </div>
    );
};
