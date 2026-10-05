'use client';

import { useRef } from 'react';
import { cx } from './cx';

/** Horizontal pointer travel (px) before a press counts as a drag. */
const DRAG_THRESHOLD_PX = 4;

/** Pointer-driven drag-to-scroll for horizontal rails. */
export function Rail({
  className = '',
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  const railRef = useRef<HTMLDivElement>(null);
  // Mutable drag state; kept in a ref so pointer moves do not re-render
  const drag = useRef({
    active: false,
    moved: false,
    startX: 0,
    startScroll: 0,
  });

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const rail = railRef.current;
    if (!rail) return;
    drag.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      startScroll: rail.scrollLeft,
    };
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail || !drag.current.active) return;
    const deltaX = event.clientX - drag.current.startX;
    if (!drag.current.moved) {
      if (Math.abs(deltaX) <= DRAG_THRESHOLD_PX) return;
      drag.current.moved = true;
      // Capture only once it's a real drag: capturing on pointerdown
      // retargets the click to the rail, so cards and chips never opened
      rail.setPointerCapture(event.pointerId);
    }
    rail.scrollLeft = drag.current.startScroll - deltaX;
  };
  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    drag.current.active = false;
    const rail = railRef.current;
    if (rail?.hasPointerCapture(event.pointerId)) {
      rail.releasePointerCapture(event.pointerId);
    }
  };
  const onClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (drag.current.moved) {
      event.preventDefault();
      event.stopPropagation();
      drag.current.moved = false;
    }
  };

  return (
    <div
      ref={railRef}
      className={cx(
        'flex gap-4 overflow-x-auto no-scrollbar py-[3px] px-0.5 pb-[9px] cursor-grab active:cursor-grabbing overscroll-x-contain max-sm:gap-3',
        className
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onClickCapture={onClickCapture}
      {...rest}
    >
      {children}
    </div>
  );
}
