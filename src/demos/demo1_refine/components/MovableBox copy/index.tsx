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
    onDragStart?: (position: IPosition) => void; // 开始拖拽
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
    const posX = Math.min(Math.max(pos.x, minX), maxX);
    const posY = Math.min(Math.max(pos.y, minY), maxY);

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
    onDragStart?: (position: IPosition) => void,
    onDragEnd?: (position: IPosition) => void
) => {
    const isDragging = useRef(false);
    const startPos = useRef<IPosition>({ x: 0, y: 0 });
    const offset = useRef({ x: 0, y: 0 });
    const didDrag = useRef(false); // 标记是否实际发生了拖拽
    const hasTriggeredDragStart = useRef(false); // 标记是否已触发 onDragStar

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

    // 处理鼠标移动事件
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging.current) return;

        // 计算新位置
        const newPos = {
            x: startPos.current.x + (e.clientX - offset.current.x),
            y: startPos.current.y + (e.clientY - offset.current.y)
        };

        // 标记实际发生了拖拽
        didDrag.current = true;

        // 直接更新spring，不使用状态
        api.start({
            x: newPos.x,
            y: newPos.y,
            immediate: true
        });

        positionRef.current = newPos;

        // 在移动超过阈值后触发 onDragStart（仅触发一次）
        if (didDrag.current && onDragStart && !hasTriggeredDragStart.current) {
            hasTriggeredDragStart.current = true;
            onDragStart(newPos);
        }
    }, [api, onDragStart]);

    // 处理鼠标释放事件
    const handleMouseUp = useCallback((e: MouseEvent) => {
        if (!isDragging.current) return;

        isDragging.current = false;

        // 只有实际发生了拖拽才调用onDragEnd
        if (didDrag.current && onDragEnd) {
            // 使用当前位置进行贴边
            const snapPosition = updatePosition(positionRef.current);
            onDragEnd(snapPosition);
        }

        // 重置拖拽标志
        didDrag.current = false;
        hasTriggeredDragStart.current = false; // 重置拖拽开始标记

        document.body.style.userSelect = "auto";
        document.body.style.cursor = "auto";

        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
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

        // 重置拖拽标志
        didDrag.current = false;
        hasTriggeredDragStart.current = false; // 重置拖拽开始标记

        document.body.style.userSelect = "none";
        document.body.style.cursor = "grabbing";

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    }, [handleMouseMove, handleMouseUp]);

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

    // 用于区分点击和拖拽
    const dragStartPosition = useRef<IPosition | null>(null);
    const dragThreshold = 5; // 拖动阈值（像素）
    const clickTimer = useRef<NodeJS.Timeout | null>(null); // 用于延迟点击事件
    const isDoubleClick = useRef(false); // 标记是否为双击事件

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
            // 清理定时器
            if (clickTimer.current) {
                clearTimeout(clickTimer.current);
                clickTimer.current = null;
            }
        };
    }, []);

    // 当传入的containerSize变化时，更新实际容器尺寸
    useEffect(() => {
        setActualContainerSize(containerSize);
    }, [containerSize]);

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

    // 处理鼠标按下事件
    const handleWrappedMouseDown = useCallback((e: React.MouseEvent) => {
        // 重置双击标记
        isDoubleClick.current = false;

        // 记录按下时的位置（用于区分点击和拖拽）
        dragStartPosition.current = {
            x: e.clientX,
            y: e.clientY
        };

        // 处理左键拖拽
        if (e.button === 0) {
            handleMouseDown(e);
        }
    }, [handleMouseDown]);

    // 处理点击事件
    const handleWrappedClick = useCallback((e: React.MouseEvent) => {
        if (!dragStartPosition.current || isDoubleClick.current) return;

        // 检查是否发生了明显的移动
        const movedDistance = Math.sqrt(
            Math.pow(e.clientX - dragStartPosition.current.x, 2) +
            Math.pow(e.clientY - dragStartPosition.current.y, 2)
        );

        // 如果移动距离小于阈值，则视为点击
        if (movedDistance < dragThreshold && onClick) {
            // 使用定时器延迟点击事件，以便区分单击和双击
            clickTimer.current = setTimeout(() => {
                // 检查是否在等待期间发生了双击
                if (!isDoubleClick.current) {
                    onClick(e);
                }
                clickTimer.current = null;
            }, 200); // 200ms 延迟，等待可能的双击事件
        }

        // 重置拖拽开始位置
        dragStartPosition.current = null;
    }, [onClick, dragThreshold]);

    // 处理双击事件
    const handleWrappedDoubleClick = useCallback((e: React.MouseEvent) => {
        // 标记为双击事件
        isDoubleClick.current = true;

        // 取消即将触发的单击事件
        if (clickTimer.current) {
            clearTimeout(clickTimer.current);
            clickTimer.current = null;
        }

        // 检查移动距离
        if (dragStartPosition.current) {
            const movedDistance = Math.sqrt(
                Math.pow(e.clientX - dragStartPosition.current.x, 2) +
                Math.pow(e.clientY - dragStartPosition.current.y, 2)
            );

            // 如果移动距离小于阈值，则视为双击
            if (movedDistance < dragThreshold && onDoubleClick) {
                onDoubleClick(e);
            }
        } else if (onDoubleClick) {
            onDoubleClick(e);
        }

        // 重置拖拽开始位置
        dragStartPosition.current = null;
    }, [onDoubleClick, dragThreshold]);

    // 处理右键菜单事件
    const handleWrappedContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        if (onContextMenu) {
            onContextMenu(e);
        }
        // 重置拖拽开始位置
        dragStartPosition.current = null;
    }, [onContextMenu]);

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
                onMouseDown={handleWrappedMouseDown}
                onClick={handleWrappedClick}
                onDoubleClick={handleWrappedDoubleClick}
                onContextMenu={handleWrappedContextMenu}
            >
                {children}
            </animated.div>
        </div>
    );
};