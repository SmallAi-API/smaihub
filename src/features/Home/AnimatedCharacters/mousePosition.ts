/**
 * One window listener for every eye on the page.
 *
 * The upstream login-page implementation gave each character and each eye its
 * own `mousemove` handler with its own `useState`, so a single pixel of pointer
 * movement scheduled nine renders. Home is a permanently mounted surface, so
 * the same shape would tax every mouse move across the dashboard. Here the
 * listener is a module singleton, coalesced to one animation frame, and React
 * folds all subscribers into a single render pass.
 */
export interface MousePosition {
  x: number;
  y: number;
}

type Listener = () => void;

const listeners = new Set<Listener>();

/**
 * Replaced (never mutated) on flush so `useSyncExternalStore` can compare
 * snapshots by reference and skip renders while the pointer is still.
 */
let position: MousePosition = { x: 0, y: 0 };
let pending: MousePosition | undefined;
let frame = 0;
let listening = false;

const flush = () => {
  frame = 0;
  if (!pending) return;

  position = pending;
  pending = undefined;
  for (const listener of listeners) listener();
};

const handleMouseMove = (event: MouseEvent) => {
  pending = { x: event.clientX, y: event.clientY };
  // Pointer events outpace paints; keep at most one update per frame.
  if (frame) return;
  frame = requestAnimationFrame(flush);
};

const stopListening = () => {
  if (!listening) return;

  window.removeEventListener('mousemove', handleMouseMove);
  listening = false;
  if (frame) {
    cancelAnimationFrame(frame);
    frame = 0;
  }
  pending = undefined;
};

export const subscribeMousePosition = (listener: Listener) => {
  listeners.add(listener);
  if (!listening && typeof window !== 'undefined') {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    listening = true;
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) stopListening();
  };
};

export const getMousePosition = () => position;
