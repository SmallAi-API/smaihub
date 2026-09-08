import { createStaticStyles } from 'antd-style';

import { CHARACTERS_HEIGHT, CHARACTERS_WIDTH } from '../portraitFraming';

/**
 * Every distance below is in the artwork's own 550×400 coordinates, which the
 * portrait lane scales to roughly 0.38. So a 6px breath lands as ~2px on screen
 * and a 16px hover lift as ~6px — the numbers look large because they are
 * authored pre-scale. Rotation and scale are unitless and need no such padding.
 */
export const styles = createStaticStyles(({ css }) => ({
  /** Outer layer: placement and the pointer-driven lean. */
  body: css`
    position: absolute;
    inset-block-end: 0;
    transform-origin: bottom center;
    transition: all 700ms ease-in-out;

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  `,
  eyes: css`
    position: absolute;
    display: flex;
    transition: all 700ms ease-in-out;

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  `,
  /** The lower characters react at pointer speed rather than body speed. */
  eyesQuick: css`
    position: absolute;
    display: flex;
    transition: all 200ms ease-out;

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  `,
  mouth: css`
    position: absolute;
    border-radius: 9999px;
    background: #2d2d2d;
    transition: all 260ms ease-out;

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  `,
  /**
   * Inner layer: the mood's keyframes and the character's own paint.
   *
   * Split from the outer layer because an inline `transform` and an animated
   * one cannot coexist on a single element — the animation wins outright and
   * pointer tracking silently dies.
   */
  pose: css`
    /* Feet, not waist: rotation pivots where the body meets the card, and the
       scaleY moods grow upward instead of sinking through it. */
    transform-origin: bottom center;

    width: 100%;
    height: 100%;

    animation-timing-function: ease-in-out;

    /* Longhand, so the inline duration and delay per character survive. */
    animation-fill-mode: both;
    animation-iteration-count: infinite;

    @media (prefers-reduced-motion: reduce) {
      animation: none !important;
    }
  `,
  root: css`
    position: relative;
    transform: translateY(0);

    /* Hover lifts the whole group; the springy curve gives the landing weight. */
    width: ${CHARACTERS_WIDTH}px;
    height: ${CHARACTERS_HEIGHT}px;

    transition: transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1);

    &[data-hovered='true'] {
      transform: translateY(-16px);
    }

    @media (prefers-reduced-motion: reduce) {
      transform: none;
      transition: none;
    }
  `,
}));

/** One keyframe set per mood, applied to the inner layer. */
export const moodStyles = createStaticStyles(({ css }) => ({
  /** Two heads tilt one way, two the other, then all settle. */
  curious: css`
    @keyframes home-characters-curious {
      0% {
        transform: rotate(0deg);
      }

      22% {
        transform: rotate(-5deg);
      }

      48% {
        transform: rotate(4deg);
      }

      72% {
        transform: rotate(-2deg);
      }

      100% {
        transform: rotate(0deg);
      }
    }

    animation-name: home-characters-curious;
    animation-iteration-count: 1;
  `,
  /** Squash then stretch, passed down the row like a cheer. */
  delight: css`
    @keyframes home-characters-delight {
      0% {
        transform: scaleY(1) translateY(0);
      }

      25% {
        transform: scaleY(0.88) translateY(0);
      }

      60% {
        transform: scaleY(1.12) translateY(-14px);
      }

      100% {
        transform: scaleY(1) translateY(0);
      }
    }

    animation-name: home-characters-delight;
    animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
    animation-iteration-count: 1;
  `,
  /** A breath. The only thing standing between "alive" and "a screenshot". */
  idle: css`
    @keyframes home-characters-idle {
      0%,
      100% {
        transform: scaleY(1) translateY(0);
      }

      50% {
        transform: scaleY(1.014) translateY(-6px);
      }
    }

    animation-name: home-characters-idle;
  `,
  /**
   * Waiting with your back half-turned.
   *
   * A plain vertical nod only reads on the two tall bodies — the dome and the
   * yellow one are too short for 5px to register once the lane scales it down.
   * Rotation registers at any height, so the loop rocks away from the composer
   * and drifts back, which is legible on all four and says "not looking" rather
   * than "nodding along".
   */
  listen: css`
    @keyframes home-characters-listen {
      0%,
      100% {
        transform: rotate(0deg) translateY(0);
      }

      35% {
        transform: rotate(2.2deg) translateY(-4px);
      }

      70% {
        transform: rotate(0.6deg) translateY(-1px);
      }
    }

    animation-name: home-characters-listen;
  `,
  /**
   * Working. Staggered per character so it crosses the group as a wave instead
   * of four bodies bobbing in unison — a wave reads as coordinated effort.
   */
  think: css`
    @keyframes home-characters-think {
      0%,
      100% {
        transform: translateY(0) scaleY(1);
      }

      45% {
        transform: translateY(-11px) scaleY(1.02);
      }
    }

    animation-name: home-characters-think;
  `,
}));
