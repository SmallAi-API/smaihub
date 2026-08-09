'use client';

import {
  Amp,
  ClaudeCode,
  Cline,
  Codex,
  GeminiCLI,
  HermesAgent,
  OpenClaw,
  OpenCode,
  Pi,
  Qoder,
  RooCode,
  Trae,
} from '@lobehub/icons';
import { Text } from '@lobehub/ui';
import { createStaticStyles, cx } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import PixelCanvas from './PixelCanvas';

/**
 * `size` is the logo height; the wordmark gap is `size * spaceMultiple`, which
 * defaults to a full logo width. Keeping both small is what lets a `Combine`
 * lockup (mark + wordmark) fit inside one grid cell.
 */
const LOGO_SIZE = 28;
const LOGO_SPACE = 0.35;

/**
 * Twelve coding agents ring a center panel: a 4x4 hairline grid with a 2x2 hole
 * punched in the middle, per the reference bento.
 *
 * `colors` feeds the pixel ripple behind each tile and is sampled from that
 * brand's own SVG fills, so the hover effect matches the logo's real palette.
 * These stay literal hex values because they are painted onto a canvas and
 * cannot read theme tokens.
 *
 * Brands split two ways: those with a `Color` variant render in full color and
 * are desaturated at rest (`mono: false`), while the five that ship only
 * monochrome art inherit `currentColor` and get a neutral graphite ripple —
 * inventing brand colors for them would misrepresent their identity.
 */
const AGENT_TILES = [
  {
    colors: ['#D97757', '#E08A6D', '#C46244'],
    logo: <ClaudeCode.Combine size={LOGO_SIZE} spaceMultiple={LOGO_SPACE} type="color" />,
    name: 'Claude Code',
  },
  {
    colors: ['#3941FF', '#7A9DFF', '#B1A7FF'],
    logo: <Codex.Combine size={LOGO_SIZE} spaceMultiple={LOGO_SPACE} type="color" />,
    name: 'Codex',
  },
  {
    colors: ['#F34E3F', '#F87365', '#C93A2D'],
    logo: <Amp.Combine size={LOGO_SIZE} spaceMultiple={LOGO_SPACE} type="color" />,
    name: 'Amp',
  },
  {
    colors: ['#8C8C8C', '#A6A6A6', '#737373'],
    logo: <OpenCode.Combine size={LOGO_SIZE} spaceMultiple={LOGO_SPACE} />,
    mono: true,
    name: 'OpenCode',
  },
  {
    colors: ['#8C8C8C', '#A6A6A6', '#737373'],
    logo: <Pi.Combine size={LOGO_SIZE} spaceMultiple={LOGO_SPACE} />,
    mono: true,
    name: 'Pi',
  },
  {
    colors: ['#2ADB5C', '#5BE882', '#1FA845'],
    logo: <Qoder.Combine size={LOGO_SIZE} spaceMultiple={LOGO_SPACE} type="color" />,
    name: 'Qoder',
  },
  {
    colors: ['#FF4D4D', '#00E5CC', '#991B1B'],
    logo: <OpenClaw.Combine size={LOGO_SIZE} spaceMultiple={LOGO_SPACE} type="color" />,
    name: 'OpenClaw',
  },
  {
    colors: ['#8C8C8C', '#A6A6A6', '#737373'],
    logo: <HermesAgent.Combine size={LOGO_SIZE} spaceMultiple={LOGO_SPACE} />,
    mono: true,
    name: 'Hermes',
  },
  {
    colors: ['#323B43', '#4C575F', '#6B767E'],
    logo: <Cline.Combine size={LOGO_SIZE} spaceMultiple={LOGO_SPACE} />,
    mono: true,
    name: 'Cline',
  },
  {
    colors: ['#8C8C8C', '#A6A6A6', '#737373'],
    logo: <RooCode.Combine size={LOGO_SIZE} spaceMultiple={LOGO_SPACE} />,
    mono: true,
    name: 'Roo Code',
  },
  {
    colors: ['#32F08C', '#6BF5AB', '#1FB768'],
    logo: <Trae.Combine size={LOGO_SIZE} spaceMultiple={LOGO_SPACE} type="color" />,
    name: 'TRAE',
  },
  {
    colors: ['#207CFE', '#B381DD', '#EE4D5D'],
    logo: <GeminiCLI.Combine size={LOGO_SIZE} spaceMultiple={LOGO_SPACE} type="color" />,
    name: 'Gemini CLI',
  },
] as const;

const styles = createStaticStyles(({ css, cssVar }) => ({
  badge: css`
    padding-block: 5px;
    padding-inline: 14px;
    border: 1px solid ${cssVar.colorBorder};
    border-radius: 999px;

    background: ${cssVar.colorBgContainer};
  `,
  /**
   * The 1px gap is the hairline: the container paints a border-colored
   * background and each cell paints over it, so the seams read as dividers
   * without any per-cell border bookkeeping.
   */
  grid: css`
    overflow: hidden;
    display: grid;
    grid-auto-flow: row dense;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1px;

    margin-block-start: 16px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: ${cssVar.borderRadiusLG};

    background: ${cssVar.colorBorderSecondary};

    @media (width <= 860px) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    @media (width <= 520px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  `,
  heading: css`
    max-width: 22ch;
    margin: 0;

    font-size: 28px;
    line-height: 1.25;
    text-align: center;

    @media (width <= 860px) {
      font-size: 22px;
    }
  `,
  logo: css`
    position: relative;
    z-index: 1;
    display: flex;
    transition:
      color 0.25s ease,
      filter 0.25s ease,
      opacity 0.25s ease,
      transform 0.25s ease;
  `,
  /** Full-color art: desaturated at rest, true brand palette on hover. */
  logoColor: css`
    opacity: 0.5;
    filter: grayscale(1);
  `,
  /** Monochrome art: inherits currentColor, so hover only shifts the tone. */
  logoMono: css`
    color: ${cssVar.colorTextQuaternary};
  `,
  panel: css`
    display: flex;
    grid-column: 2 / 4;
    grid-row: 2 / 4;
    flex-direction: column;
    gap: 16px;
    align-items: center;
    justify-content: center;

    padding-block: 32px;
    padding-inline: 24px;

    background: ${cssVar.colorBgContainer};

    @media (width <= 860px) {
      grid-column: 1 / -1;
      grid-row: auto;
    }
  `,
  tile: css`
    position: relative;

    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 98px;
    padding-inline: 12px;

    background: ${cssVar.colorBgContainer};

    &:hover > * {
      transform: scale(1.04);
      opacity: 1;
      filter: grayscale(0);
    }
  `,
  /** Scoped to mono tiles so color brands are not tinted on hover. */
  tileMono: css`
    &:hover > * {
      color: ${cssVar.colorText};
    }
  `,
}));

const PixelLogoGrid = memo(() => {
  const { t } = useTranslation('setting');

  return (
    <section className={styles.grid}>
      <div className={styles.panel}>
        <Text className={styles.badge} type="secondary">
          {t('downloads.pixelGrid.badge')}
        </Text>
        <Text as="h2" className={styles.heading} weight={700}>
          {t('downloads.pixelGrid.title')}
        </Text>
      </div>
      {AGENT_TILES.map((tile) => (
        <div
          aria-label={tile.name}
          className={cx(styles.tile, 'mono' in tile && tile.mono && styles.tileMono)}
          key={tile.name}
          role="img"
          title={tile.name}
        >
          <PixelCanvas colors={[...tile.colors]} gap={6} speed={35} />
          <span
            className={cx(
              styles.logo,
              'mono' in tile && tile.mono ? styles.logoMono : styles.logoColor,
            )}
          >
            {tile.logo}
          </span>
        </div>
      ))}
    </section>
  );
});

PixelLogoGrid.displayName = 'PixelLogoGrid';

export default PixelLogoGrid;
