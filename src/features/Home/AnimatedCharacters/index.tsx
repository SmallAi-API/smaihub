import { cx } from 'antd-style';
import type { ReactNode } from 'react';
import { memo, useCallback, useRef, useState, useSyncExternalStore } from 'react';

import { EyeBall, Pupil, useBlinking } from './AnimatedEye';
import type { CharacterMood } from './mood';
import { getMousePosition, subscribeMousePosition } from './mousePosition';
import type { CharacterName } from './poses';
import { getCharacterPose, getEyeDirection, getMoodTiming, getMouthShape } from './poses';
import { moodStyles, styles } from './styles';

interface CharacterPosition {
  bodySkew: number;
  faceX: number;
  faceY: number;
}

const STILL: CharacterPosition = { bodySkew: 0, faceX: 0, faceY: 0 };

/** Hover widens the pointer throw; the scaled-down artwork needs the help. */
const HOVER_TRACKING_BOOST = 1.8;
const HOVER_LEAN = 1.6;

const useMousePosition = () =>
  useSyncExternalStore(subscribeMousePosition, getMousePosition, getMousePosition);

interface AnimatedCharactersProps {
  mood?: CharacterMood;
}

/**
 * Four cartoon characters that follow the pointer and share one mood.
 *
 * Purple stands back-left, black back-right, orange front-left, yellow
 * front-right. Each leans toward the pointer and shifts its face within a
 * capped range; the mood adds a staggered animation on top, so every reaction
 * runs through all four rather than only the tall pair.
 */
const AnimatedCharacters = memo<AnimatedCharactersProps>(({ mood = 'idle' }) => {
  const { x: mouseX, y: mouseY } = useMousePosition();
  const [isHovered, setIsHovered] = useState(false);

  const refs = {
    black: useRef<HTMLDivElement>(null),
    orange: useRef<HTMLDivElement>(null),
    purple: useRef<HTMLDivElement>(null),
    yellow: useRef<HTMLDivElement>(null),
  };

  // Thinking tightens the blink cadence; a calm blink under load reads as idle.
  const blinkRange: [number, number] = mood === 'think' ? [900, 1800] : [3000, 7000];
  const isPurpleBlinking = useBlinking(...blinkRange);
  const isBlackBlinking = useBlinking(...blinkRange);

  /**
   * While a draft is open the pointer is in the composer, so tracking it would
   * pull every face straight back at the text the turn-away pose just moved
   * them off. Holding still is the whole point of the pose.
   */
  const isAvoiding = mood === 'listen';

  const positionOf = useCallback(
    (name: CharacterName): CharacterPosition => {
      const node = refs[name].current;
      if (isAvoiding || !node) return STILL;

      const rect = node.getBoundingClientRect();
      const deltaX = mouseX - (rect.left + rect.width / 2);
      // A third down the body, roughly where the face sits.
      const deltaY = mouseY - (rect.top + rect.height / 3);

      return {
        bodySkew: Math.max(-6, Math.min(6, -deltaX / 120)),
        faceX: Math.max(-15, Math.min(15, deltaX / 20)),
        faceY: Math.max(-10, Math.min(10, deltaY / 30)),
      };
    },
    // Every ref is stable for the component's life; the pointer is what moves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mouseX, mouseY, isAvoiding],
  );

  const trackingBoost = isHovered ? HOVER_TRACKING_BOOST : 1;
  const mouth = getMouthShape(mood);

  /**
   * Compose one character's two layers.
   *
   * The pointer lean and the pose go on the outer element, the mood's keyframes
   * on the inner one — a single element cannot carry both an inline transform
   * and an animated one.
   */
  const character = (
    name: CharacterName,
    paint: {
      background: string;
      borderRadius: string;
      height: number;
      left: number;
      width: number;
      zIndex: number;
    },
    children: ReactNode,
  ) => {
    const { bodySkew } = positionOf(name);
    const pose = getCharacterPose(mood, name);
    const lean = bodySkew * (isHovered ? HOVER_LEAN : 1) + pose.skew;

    return (
      <div
        className={styles.body}
        ref={refs[name]}
        style={{
          height: paint.height,
          left: paint.left,
          transform: `skewX(${lean}deg) translateX(${pose.translateX}px)`,
          width: paint.width,
          zIndex: paint.zIndex,
        }}
      >
        <div
          className={cx(styles.pose, moodStyles[mood])}
          style={{
            background: paint.background,
            borderRadius: paint.borderRadius,
            ...getMoodTiming(mood, name),
          }}
        >
          {children}
        </div>
      </div>
    );
  };

  const purple = positionOf('purple');
  const black = positionOf('black');
  const orange = positionOf('orange');
  const yellow = positionOf('yellow');
  const purpleGaze = getEyeDirection(mood, 'purple');
  const blackGaze = getEyeDirection(mood, 'black');
  const orangeGaze = getEyeDirection(mood, 'orange');
  const yellowGaze = getEyeDirection(mood, 'yellow');

  return (
    <div
      className={styles.root}
      data-hovered={isHovered}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {character(
        'purple',
        {
          background: '#6C3FF5',
          borderRadius: '10px 10px 0 0',
          height: 400,
          left: 70,
          width: 180,
          zIndex: 1,
        },
        <div
          className={styles.eyes}
          style={{ gap: 32, left: 45 + purple.faceX, top: 40 + purple.faceY }}
        >
          {[0, 1].map((eye) => (
            <EyeBall
              dilate={purpleGaze.dilate}
              eyeColor={'white'}
              forceLookX={purpleGaze.x}
              forceLookY={purpleGaze.y}
              isBlinking={isPurpleBlinking}
              key={eye}
              maxDistance={5}
              pupilColor={'#2D2D2D'}
              pupilSize={7}
              size={18}
              trackingBoost={trackingBoost}
            />
          ))}
        </div>,
      )}

      {character(
        'black',
        {
          background: '#2D2D2D',
          borderRadius: '8px 8px 0 0',
          height: 310,
          left: 240,
          width: 120,
          zIndex: 2,
        },
        <div
          className={styles.eyes}
          style={{ gap: 24, left: 26 + black.faceX, top: 32 + black.faceY }}
        >
          {[0, 1].map((eye) => (
            <EyeBall
              dilate={blackGaze.dilate}
              eyeColor={'white'}
              forceLookX={blackGaze.x}
              forceLookY={blackGaze.y}
              isBlinking={isBlackBlinking}
              key={eye}
              maxDistance={4}
              pupilColor={'#2D2D2D'}
              pupilSize={6}
              size={16}
              trackingBoost={trackingBoost}
            />
          ))}
        </div>,
      )}

      {character(
        'orange',
        {
          background: '#FF9B6B',
          borderRadius: '120px 120px 0 0',
          height: 200,
          left: 0,
          width: 240,
          zIndex: 3,
        },
        <div
          className={styles.eyesQuick}
          style={{ gap: 32, left: 82 + orange.faceX, top: 90 + orange.faceY }}
        >
          {[0, 1].map((eye) => (
            <Pupil
              dilate={orangeGaze.dilate}
              forceLookX={orangeGaze.x}
              forceLookY={orangeGaze.y}
              key={eye}
              maxDistance={5}
              pupilColor={'#2D2D2D'}
              size={12}
              trackingBoost={trackingBoost}
            />
          ))}
        </div>,
      )}

      {character(
        'yellow',
        {
          background: '#E8D754',
          borderRadius: '70px 70px 0 0',
          height: 230,
          left: 310,
          width: 140,
          zIndex: 4,
        },
        <>
          <div
            className={styles.eyesQuick}
            style={{ gap: 24, left: 52 + yellow.faceX, top: 40 + yellow.faceY }}
          >
            {[0, 1].map((eye) => (
              <Pupil
                dilate={yellowGaze.dilate}
                forceLookX={yellowGaze.x}
                forceLookY={yellowGaze.y}
                key={eye}
                maxDistance={5}
                pupilColor={'#2D2D2D'}
                size={12}
                trackingBoost={trackingBoost}
              />
            ))}
          </div>
          {/* The group's only mouth, so the mood leans on it heavily. */}
          <div
            className={styles.mouth}
            style={{ ...mouth, left: 40 + yellow.faceX, top: 88 + yellow.faceY }}
          />
        </>,
      )}
    </div>
  );
});

export default AnimatedCharacters;
