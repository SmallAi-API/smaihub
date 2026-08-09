'use client';

import { createStaticStyles } from 'antd-style';
import { memo, useCallback, useEffect, useRef } from 'react';

/**
 * Animated grid of pixels that ripples in from the center on hover and fades
 * out on leave. Colors are drawn from the parent card's brand palette.
 *
 * Ported from a Tailwind/shadcn snippet — the canvas engine is unchanged, only
 * the styling layer was moved to `createStaticStyles` to match this codebase.
 */

interface Pixel {
  appear: () => void;
  color: string;
  counter: number;
  counterStep: number;
  ctx: CanvasRenderingContext2D;
  delay: number;
  disappear: () => void;
  draw: () => void;
  isIdle: boolean;
  isReverse: boolean;
  isShimmer: boolean;
  maxSize: number;
  maxSizeInt: number;
  minSize: number;
  shimmer: () => void;
  size: number;
  sizeStep: number;
  speed: number;
  x: number;
  y: number;
}

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

const createPixel = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  color: string,
  baseSpeed: number,
  delay: number,
): Pixel => {
  const p: Pixel = {
    appear() {
      p.isIdle = false;
      if (p.counter <= p.delay) {
        p.counter += p.counterStep;
        return;
      }
      if (p.size >= p.maxSize) p.isShimmer = true;
      if (p.isShimmer) p.shimmer();
      else p.size += p.sizeStep;
      p.draw();
    },
    color,
    counter: 0,
    counterStep: Math.random() * 4 + (canvas.width + canvas.height) * 0.01,
    ctx,
    delay,
    disappear() {
      p.isShimmer = false;
      p.counter = 0;
      if (p.size <= 0) {
        p.isIdle = true;
        return;
      }
      p.size -= 0.1;
      p.draw();
    },
    draw() {
      const offset = p.maxSizeInt * 0.5 - p.size * 0.5;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x + offset, p.y + offset, p.size, p.size);
    },
    isIdle: false,
    isReverse: false,
    isShimmer: false,
    maxSize: rand(0.5, 2),
    maxSizeInt: 2,
    minSize: 0.5,
    shimmer() {
      if (p.size >= p.maxSize) p.isReverse = true;
      else if (p.size <= p.minSize) p.isReverse = false;
      if (p.isReverse) p.size -= p.speed;
      else p.size += p.speed;
    },
    size: 0,
    sizeStep: Math.random() * 0.4,
    speed: rand(0.1, 0.9) * baseSpeed,
    x,
    y,
  };

  return p;
};

const styles = createStaticStyles(({ css }) => ({
  canvas: css`
    display: block;
  `,
  wrap: css`
    pointer-events: none;
    position: absolute;
    inset: 0;
    overflow: hidden;
  `,
}));

interface PixelCanvasProps {
  colors: string[];
  gap?: number;
  speed?: number;
}

const PixelCanvas = memo<PixelCanvasProps>(({ colors, gap = 5, speed = 30 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const animationRef = useRef<number>(0);
  // 0 rather than `performance.now()` so the argument is not re-evaluated on
  // every render; the first frame always clears the interval check anyway.
  const lastFrameRef = useRef(0);
  const reducedMotionRef = useRef(false);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = wrap.getBoundingClientRect();
    const w = Math.floor(width);
    const h = Math.floor(height);
    if (w === 0 || h === 0) return;

    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const effectiveSpeed = reducedMotionRef.current ? 0 : Math.min(speed, 100) * 0.001;
    const pixels: Pixel[] = [];

    // Each pixel's delay is its distance from the canvas center, so the
    // animation ripples outward from the middle on hover.
    for (let x = 0; x < w; x += gap) {
      for (let y = 0; y < h; y += gap) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const dx = x - w / 2;
        const dy = y - h / 2;
        const delay = reducedMotionRef.current ? 0 : Math.sqrt(dx * dx + dy * dy);
        pixels.push(createPixel(ctx, canvas, x, y, color, effectiveSpeed, delay));
      }
    }

    pixelsRef.current = pixels;
  }, [colors, gap, speed]);

  const animate = useCallback((mode: 'appear' | 'disappear') => {
    cancelAnimationFrame(animationRef.current);
    const frameInterval = 1000 / 60;

    const loop = () => {
      animationRef.current = requestAnimationFrame(loop);

      const now = performance.now();
      const elapsed = now - lastFrameRef.current;
      if (elapsed < frameInterval) return;
      lastFrameRef.current = now - (elapsed % frameInterval);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const pixels = pixelsRef.current;
      for (const pixel of pixels) pixel[mode]();

      if (pixels.every((p) => p.isIdle)) cancelAnimationFrame(animationRef.current);
    };

    animationRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    init();

    const resizeObserver = new ResizeObserver(() => init());
    const wrap = wrapRef.current;
    if (wrap) resizeObserver.observe(wrap);

    // Hover is tracked on the parent tile, not the canvas, so the canvas never
    // blocks pointer events on the logo above it.
    const tile = wrap?.parentElement;
    const handleEnter = () => animate('appear');
    const handleLeave = () => animate('disappear');
    tile?.addEventListener('mouseenter', handleEnter);
    tile?.addEventListener('mouseleave', handleLeave);
    tile?.addEventListener('focusin', handleEnter);
    tile?.addEventListener('focusout', handleLeave);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationRef.current);
      tile?.removeEventListener('mouseenter', handleEnter);
      tile?.removeEventListener('mouseleave', handleLeave);
      tile?.removeEventListener('focusin', handleEnter);
      tile?.removeEventListener('focusout', handleLeave);
    };
  }, [init, animate]);

  return (
    <div aria-hidden className={styles.wrap} ref={wrapRef}>
      <canvas className={styles.canvas} ref={canvasRef} />
    </div>
  );
});

PixelCanvas.displayName = 'PixelCanvas';

export default PixelCanvas;
