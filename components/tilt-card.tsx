"use client";

import type { CSSProperties, PointerEvent, ReactNode } from "react";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
};

type TiltStyle = CSSProperties & {
  "--tilt-x": string;
  "--tilt-y": string;
  "--pointer-x": string;
  "--pointer-y": string;
};

const restingStyle: TiltStyle = {
  "--tilt-x": "0deg",
  "--tilt-y": "0deg",
  "--pointer-x": "50%",
  "--pointer-y": "50%",
};

export function TiltCard({ children, className = "" }: TiltCardProps) {
  const updateTilt = (event: PointerEvent<HTMLElement>) => {
    if (
      event.pointerType === "touch" ||
      window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches
    ) {
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / Math.max(bounds.width, 1);
    const y = (event.clientY - bounds.top) / Math.max(bounds.height, 1);
    const target = event.currentTarget;

    target.style.setProperty("--tilt-x", ((0.5 - y) * 5).toFixed(2) + "deg");
    target.style.setProperty("--tilt-y", ((x - 0.5) * 6).toFixed(2) + "deg");
    target.style.setProperty("--pointer-x", (x * 100).toFixed(1) + "%");
    target.style.setProperty("--pointer-y", (y * 100).toFixed(1) + "%");
  };

  const resetTilt = (event: PointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty("--tilt-x", "0deg");
    event.currentTarget.style.setProperty("--tilt-y", "0deg");
    event.currentTarget.style.setProperty("--pointer-x", "50%");
    event.currentTarget.style.setProperty("--pointer-y", "50%");
  };

  return (
    <article
      className={"tilt-card " + className}
      style={restingStyle}
      onPointerMove={updateTilt}
      onPointerLeave={resetTilt}
      onPointerCancel={resetTilt}
    >
      {children}
    </article>
  );
}
