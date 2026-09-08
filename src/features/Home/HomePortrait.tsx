import { createStaticStyles } from 'antd-style';
import { memo } from 'react';

import AnimatedCharacters from './AnimatedCharacters';
import { useCharacterMood } from './AnimatedCharacters/useCharacterMood';
import { CHARACTERS_HEIGHT, CHARACTERS_WIDTH, HOME_PORTRAIT_INSET } from './portraitFraming';

const styles = createStaticStyles(({ css }) => ({
  /**
   * The artwork keeps its authored 550×400 box and the speech layout scales it,
   * so one set of character offsets serves both size tiers. Anchoring the
   * origin to the same corner the insets pin means the scaled result sits where
   * the lane expects it, with the lower bodies passing behind the first card.
   */
  frame: css`
    pointer-events: auto;

    position: absolute;
    inset-block-end: var(--home-portrait-overlap);
    inset-inline-end: ${HOME_PORTRAIT_INSET}px;
    transform-origin: bottom right;
    transform: scale(var(--home-portrait-scale));

    width: ${CHARACTERS_WIDTH}px;
    height: ${CHARACTERS_HEIGHT}px;

    &:dir(rtl) {
      transform-origin: bottom left;
    }
  `,
  root: css`
    pointer-events: none;
    position: relative;
    height: 100%;
  `,
}));

interface HomePortraitProps {
  /** Set while the composer holds a draft, so the characters react to typing. */
  isTyping?: boolean;
}

const HomePortrait = memo<HomePortraitProps>(({ isTyping }) => {
  const { mood } = useCharacterMood({ isDrafting: Boolean(isTyping) });

  return (
    <div aria-hidden className={styles.root}>
      <div className={styles.frame}>
        <AnimatedCharacters mood={mood} />
      </div>
    </div>
  );
});

export default HomePortrait;
