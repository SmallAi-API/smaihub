import { createStaticStyles } from 'antd-style';
import { memo, useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { getMousePosition, subscribeMousePosition } from './mousePosition';

const styles = createStaticStyles(({ css }) => ({
  ball: css`
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 50%;

    transition: all 150ms ease;

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  `,
  pupil: css`
    border-radius: 50%;
    transition: transform 100ms ease-out;

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  `,
}));

const useMousePosition = () =>
  useSyncExternalStore(subscribeMousePosition, getMousePosition, getMousePosition);

interface LookTarget {
  forceLookX?: number;
  forceLookY?: number;
  /**
   * Multiplies the tracking radius. The artwork is scaled down to fit the
   * portrait lane, which shrinks a 5px pupil throw to well under 2px on screen —
   * a boost is how a deliberate glance stays legible at that size.
   */
  trackingBoost?: number;
}

/**
 * Where the pupil sits inside its socket, in the artwork's own coordinates.
 *
 * Read from layout during render rather than from an effect: the pointer store
 * re-renders on every frame the mouse moves, so the rect is re-measured exactly
 * as often as the answer can change, and an effect would only add a frame of lag.
 */
const useLookOffset = (
  ref: React.RefObject<HTMLDivElement | null>,
  maxDistance: number,
  { forceLookX, forceLookY, trackingBoost = 1 }: LookTarget,
) => {
  const { x: mouseX, y: mouseY } = useMousePosition();

  if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
  if (!ref.current) return { x: 0, y: 0 };

  const rect = ref.current.getBoundingClientRect();
  const deltaX = mouseX - (rect.left + rect.width / 2);
  const deltaY = mouseY - (rect.top + rect.height / 2);
  const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance * trackingBoost);
  const angle = Math.atan2(deltaY, deltaX);

  return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
};

interface PupilProps extends LookTarget {
  /** Added to the pupil's size — wide eyes read as delight, narrow as focus. */
  dilate?: number;
  maxDistance?: number;
  pupilColor?: string;
  size?: number;
}

/** A bare pupil, for the characters drawn without a white of the eye. */
export const Pupil = memo<PupilProps>(
  ({
    dilate = 0,
    forceLookX,
    forceLookY,
    maxDistance = 5,
    pupilColor = 'black',
    size = 12,
    trackingBoost,
  }) => {
    const ref = useRef<HTMLDivElement>(null);
    const offset = useLookOffset(ref, maxDistance, { forceLookX, forceLookY, trackingBoost });

    return (
      <div
        className={styles.pupil}
        ref={ref}
        style={{
          backgroundColor: pupilColor,
          height: size + dilate,
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          width: size + dilate,
        }}
      />
    );
  },
);

interface EyeBallProps extends LookTarget {
  /** Added to the pupil's size — wide eyes read as delight, narrow as focus. */
  dilate?: number;
  eyeColor?: string;
  isBlinking?: boolean;
  maxDistance?: number;
  pupilColor?: string;
  pupilSize?: number;
  size?: number;
}

/** A full eye: white sclera, tracking pupil, and a lid that can shut. */
export const EyeBall = memo<EyeBallProps>(
  ({
    dilate = 0,
    eyeColor = 'white',
    forceLookX,
    forceLookY,
    isBlinking = false,
    maxDistance = 10,
    pupilColor = 'black',
    pupilSize = 16,
    size = 48,
    trackingBoost,
  }) => {
    const ref = useRef<HTMLDivElement>(null);
    const offset = useLookOffset(ref, maxDistance, { forceLookX, forceLookY, trackingBoost });

    return (
      <div
        className={styles.ball}
        ref={ref}
        style={{
          backgroundColor: eyeColor,
          // A blink collapses the sclera to a line; the pupil leaves with it.
          height: isBlinking ? 2 : size,
          width: size,
        }}
      >
        {!isBlinking && (
          <div
            className={styles.pupil}
            style={{
              backgroundColor: pupilColor,
              height: pupilSize + dilate,
              transform: `translate(${offset.x}px, ${offset.y}px)`,
              width: pupilSize + dilate,
            }}
          />
        )}
      </div>
    );
  },
);

/** Blinks on a random cadence so two characters never blink in lockstep. */
export const useBlinking = (minInterval = 3000, maxInterval = 7000) => {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    let blinkTimer: ReturnType<typeof setTimeout>;
    let lidTimer: ReturnType<typeof setTimeout>;

    const scheduleBlink = () => {
      blinkTimer = setTimeout(
        () => {
          setIsBlinking(true);
          lidTimer = setTimeout(() => {
            setIsBlinking(false);
            scheduleBlink();
          }, 150);
        },
        Math.random() * (maxInterval - minInterval) + minInterval,
      );
    };

    scheduleBlink();
    return () => {
      clearTimeout(blinkTimer);
      clearTimeout(lidTimer);
    };
  }, [minInterval, maxInterval]);

  return isBlinking;
};
