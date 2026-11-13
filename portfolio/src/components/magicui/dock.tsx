"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import React, { useCallback, useRef } from "react";

export interface DockProps extends VariantProps<typeof dockVariants> {
  className?: string;
  magnification?: number;
  distance?: number;
  children: React.ReactNode;
}

const DEFAULT_MAGNIFICATION = 60;
const DEFAULT_DISTANCE = 140;
const BASE_SIZE = 40;

const dockVariants = cva(
  "mx-auto w-max h-full p-2 flex items-end rounded-full border"
);

/**
 * macOS-style magnifying dock without framer-motion: on pointer move each
 * icon's width is set from its distance to the cursor (one rAF per frame),
 * and a CSS transition smooths it out.
 */
const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  (
    {
      className,
      children,
      magnification = DEFAULT_MAGNIFICATION,
      distance = DEFAULT_DISTANCE,
      ...props
    },
    forwardedRef
  ) => {
    const innerRef = useRef<HTMLDivElement | null>(null);
    const frame = useRef(0);

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        innerRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef]
    );

    const icons = () =>
      innerRef.current?.querySelectorAll<HTMLElement>("[data-dock-icon]") ?? [];

    const onMouseMove = (e: React.MouseEvent) => {
      const x = e.clientX;
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        for (const icon of icons()) {
          const rect = icon.getBoundingClientRect();
          const d = Math.abs(x - (rect.left + rect.width / 2));
          const size =
            d >= distance
              ? BASE_SIZE
              : BASE_SIZE + (magnification - BASE_SIZE) * (1 - d / distance);
          icon.style.width = `${size}px`;
        }
      });
    };

    const onMouseLeave = () => {
      cancelAnimationFrame(frame.current);
      for (const icon of icons()) icon.style.width = "";
    };

    return (
      <div
        ref={setRefs}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        {...props}
        className={cn(dockVariants({ className }))}
      >
        {children}
      </div>
    );
  }
);

Dock.displayName = "Dock";

export interface DockIconProps {
  className?: string;
  children?: React.ReactNode;
}

const DockIcon = ({ className, children }: DockIconProps) => {
  return (
    <div
      data-dock-icon
      className={cn(
        "flex aspect-square w-10 cursor-pointer items-center justify-center rounded-full transition-[width] duration-150 ease-out motion-reduce:transition-none",
        className
      )}
    >
      {children}
    </div>
  );
};

DockIcon.displayName = "DockIcon";

export { Dock, DockIcon, dockVariants };
