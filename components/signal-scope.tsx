"use client";

import { useEffect, useRef } from "react";

const channelColors = ["#78dce8", "#ff6b57", "#f4c95d", "#547eff"];
const restingPointer = { x: 0.58, y: 0.45 };

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function SignalScope() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerTargetRef = useRef({ ...restingPointer });
  const pointerRenderRef = useRef({ ...restingPointer });
  const redrawRef = useRef(() => {});

  useEffect(() => {
    const scope = scopeRef.current;
    const canvas = canvasRef.current;
    if (!scope || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    let animationId = 0;
    let isVisible = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const bounds = scope.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) return false;

      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      return true;
    };

    const draw = () => {
      animationId = 0;
      if (width <= 0 || height <= 0) return;

      const target = pointerTargetRef.current;
      const pointer = pointerRenderRef.current;
      const smoothing = reducedMotion ? 1 : 0.14;
      pointer.x += (target.x - pointer.x) * smoothing;
      pointer.y += (target.y - pointer.y) * smoothing;

      context.clearRect(0, 0, width, height);
      context.strokeStyle = "rgba(240, 238, 232, 0.09)";
      context.lineWidth = 1;

      const gridSize = width < 420 ? 34 : 42;

      for (let x = 0; x <= width; x += gridSize) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
      }

      for (let y = 0; y <= height; y += gridSize) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }

      const cursorX = pointer.x * width;
      const cursorY = pointer.y * height;

      channelColors.forEach((color, index) => {
        const baseline = height * (0.23 + index * 0.18);
        const amplitude = 10 + index * 3;
        const frequency = 0.024 + index * 0.005;

        context.beginPath();
        for (let x = 0; x <= width; x += 3) {
          const xRatio = x / Math.max(width, 1);
          const influence = Math.exp(-Math.pow((xRatio - pointer.x) * 8, 2));
          const baseWave =
            Math.sin(x * frequency + frame * (0.025 + index * 0.004)) *
              amplitude *
              0.46 +
            Math.sin(x * frequency * 0.37 - frame * 0.012) * amplitude * 0.25;
          const attraction = (cursorY - baseline) * influence * 0.34;
          const localSignal =
            Math.sin((x - cursorX) * 0.13 + frame * 0.018 + index * 1.4) *
            influence *
            (5 + index);

          const y = baseline + baseWave + attraction + localSignal;
          if (x === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }

        context.strokeStyle = color;
        context.globalAlpha = 0.84;
        context.lineWidth = index === 0 ? 2 : 1.35;
        context.stroke();
      });

      context.globalAlpha = 1;
      context.save();
      context.strokeStyle = "rgba(240, 238, 232, 0.42)";
      context.setLineDash([3, 5]);
      context.beginPath();
      context.moveTo(cursorX, 0);
      context.lineTo(cursorX, height);
      context.stroke();
      context.restore();

      context.strokeStyle = "rgba(240, 238, 232, 0.72)";
      context.beginPath();
      context.moveTo(cursorX - 10, cursorY);
      context.lineTo(cursorX + 10, cursorY);
      context.moveTo(cursorX, cursorY - 10);
      context.lineTo(cursorX, cursorY + 10);
      context.stroke();

      context.fillStyle = "#f0eee8";
      context.beginPath();
      context.arc(cursorX, cursorY, 2.4, 0, Math.PI * 2);
      context.fill();

      frame += 1;
      if (!reducedMotion && isVisible) animationId = requestAnimationFrame(draw);
    };

    const requestDraw = () => {
      if (reducedMotion) {
        draw();
        return;
      }

      if (isVisible && animationId === 0) {
        animationId = requestAnimationFrame(draw);
      }
    };

    redrawRef.current = requestDraw;

    const observer = new ResizeObserver(() => {
      if (resize()) requestDraw();
    });

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) requestDraw();
        else {
          cancelAnimationFrame(animationId);
          animationId = 0;
        }
      },
      { rootMargin: "120px" },
    );

    observer.observe(scope);
    visibilityObserver.observe(scope);
    if (resize()) requestDraw();

    return () => {
      observer.disconnect();
      visibilityObserver.disconnect();
      cancelAnimationFrame(animationId);
      redrawRef.current = () => {};
    };
  }, []);

  const updatePointer = (clientX: number, clientY: number, element: HTMLDivElement) => {
    const bounds = element.getBoundingClientRect();
    pointerTargetRef.current = {
      x: clamp((clientX - bounds.left) / Math.max(bounds.width, 1)),
      y: clamp((clientY - bounds.top) / Math.max(bounds.height, 1)),
    };
    redrawRef.current();
  };

  return (
    <div
      ref={scopeRef}
      className="scope"
      onPointerMove={(event) => {
        if (event.pointerType === "touch") return;
        updatePointer(event.clientX, event.clientY, event.currentTarget);
      }}
      onPointerLeave={() => {
        pointerTargetRef.current = { ...restingPointer };
        redrawRef.current();
      }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="scope-canvas" />
      <div className="scope-labels">
        <span>build</span>
        <span>learn</span>
        <span>listen</span>
        <span>ship</span>
      </div>
      <div className="scope-readout">SIGNAL / 04 CH</div>
    </div>
  );
}