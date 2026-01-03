import { useState, useCallback } from 'react';

interface TouchState {
  index: number | null;
  startY: number;
  currentY: number;
  elementRect?: DOMRect;
}

interface UseDragReorderOptions<T> {
  items: T[];
  onReorder: (newItems: T[]) => void;
  itemHeight?: number;
}

interface UseDragReorderReturn {
  draggingIndex: number | null;
  touchState: TouchState;
  previewOrder: number[];
  getItemTransform: (currentIndex: number) => string | undefined;
  dragHandlers: {
    onDragStart: (e: React.DragEvent, index: number) => void;
    onDragOver: (e: React.DragEvent, index: number) => void;
    onDragEnd: () => void;
  };
  touchHandlers: {
    onTouchStart: (e: React.TouchEvent, index: number) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
  getItemProps: (index: number) => {
    'data-team-item': boolean;
    draggable: boolean;
    onDragStart: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragEnd: () => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
    style: React.CSSProperties;
    className: string;
  };
}

export function useDragReorder<T>({
  items,
  onReorder,
  itemHeight = 60,
}: UseDragReorderOptions<T>): UseDragReorderReturn {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [touchState, setTouchState] = useState<TouchState>({
    index: null,
    startY: 0,
    currentY: 0,
  });
  const [previewOrder, setPreviewOrder] = useState<number[]>([]);

  const reorderItems = useCallback(
    (fromIndex: number, toIndex: number) => {
      const newItems = [...items];
      const draggedItem = newItems[fromIndex];
      newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, draggedItem);
      onReorder(newItems);
    },
    [items, onReorder]
  );

  // Desktop drag handlers
  const onDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const onDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (draggingIndex === null || draggingIndex === index) return;
      reorderItems(draggingIndex, index);
      setDraggingIndex(index);
    },
    [draggingIndex, reorderItems]
  );

  const onDragEnd = useCallback(() => {
    setDraggingIndex(null);
  }, []);

  // Mobile touch handlers
  const onTouchStart = useCallback(
    (e: React.TouchEvent, index: number) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.drag-handle')) return;

      e.preventDefault();
      e.stopPropagation();

      const touch = e.touches[0];
      const element = target.closest('[data-team-item]') as HTMLElement;
      const rect = element?.getBoundingClientRect();

      setTouchState({
        index,
        startY: touch.clientY,
        currentY: touch.clientY,
        elementRect: rect,
      });
      setDraggingIndex(index);
      setPreviewOrder([...Array(items.length).keys()]);
    },
    [items.length]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (touchState.index === null) return;

      e.preventDefault();
      e.stopPropagation();

      const touch = e.touches[0];
      const deltaY = touch.clientY - touchState.startY;
      const positionShift = Math.round(deltaY / itemHeight);
      const newPosition = Math.max(
        0,
        Math.min(items.length - 1, touchState.index + positionShift)
      );

      const preview = [...Array(items.length).keys()];
      if (newPosition !== touchState.index) {
        preview.splice(touchState.index, 1);
        preview.splice(newPosition, 0, touchState.index);
      }
      setPreviewOrder(preview);

      setTouchState((prev) => ({
        ...prev,
        currentY: touch.clientY,
      }));
    },
    [touchState.index, touchState.startY, items.length, itemHeight]
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchState.index === null) return;

      e.preventDefault();
      e.stopPropagation();

      const deltaY = touchState.currentY - touchState.startY;
      const moveThreshold = itemHeight * 0.5;

      if (Math.abs(deltaY) > moveThreshold) {
        const direction = deltaY > 0 ? 1 : -1;
        const newIndex = Math.max(
          0,
          Math.min(items.length - 1, touchState.index + direction)
        );
        if (newIndex !== touchState.index) {
          reorderItems(touchState.index, newIndex);
        }
      }

      setTouchState({ index: null, startY: 0, currentY: 0 });
      setDraggingIndex(null);
      setPreviewOrder([]);
    },
    [touchState, items.length, itemHeight, reorderItems]
  );

  const getItemTransform = useCallback(
    (currentIndex: number): string | undefined => {
      if (touchState.index === null || previewOrder.length === 0) {
        return touchState.index === currentIndex
          ? `translateY(${touchState.currentY - touchState.startY}px)`
          : undefined;
      }

      if (touchState.index === currentIndex) {
        return `translateY(${touchState.currentY - touchState.startY}px)`;
      }

      const previewIndex = previewOrder.indexOf(currentIndex);
      const offset = (previewIndex - currentIndex) * itemHeight;
      return offset !== 0 ? `translateY(${offset}px)` : undefined;
    },
    [touchState, previewOrder, itemHeight]
  );

  const getItemProps = useCallback(
    (index: number) => ({
      'data-team-item': true,
      draggable: true,
      onDragStart: (e: React.DragEvent) => onDragStart(e, index),
      onDragOver: (e: React.DragEvent) => onDragOver(e, index),
      onDragEnd,
      onTouchStart: (e: React.TouchEvent) => onTouchStart(e, index),
      onTouchMove,
      onTouchEnd,
      style: {
        transform: getItemTransform(index),
        pointerEvents: (touchState.index === index ? 'none' : 'auto') as React.CSSProperties['pointerEvents'],
        transition: touchState.index === index ? 'none' : 'transform 200ms ease-out',
      },
      className: `${draggingIndex === index ? 'z-20 opacity-70 shadow-lg' : ''} ${touchState.index === index ? '' : 'transition-transform duration-200'}`,
    }),
    [
      draggingIndex,
      touchState.index,
      onDragStart,
      onDragOver,
      onDragEnd,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      getItemTransform,
    ]
  );

  return {
    draggingIndex,
    touchState,
    previewOrder,
    getItemTransform,
    dragHandlers: { onDragStart, onDragOver, onDragEnd },
    touchHandlers: { onTouchStart, onTouchMove, onTouchEnd },
    getItemProps,
  };
}
