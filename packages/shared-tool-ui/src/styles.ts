import { textStyles } from '@lobehub/ui/base-ui';
import { createStaticStyles } from 'antd-style';

/**
 * Coordinate layer for a row that shimmers several separate text spans. Each
 * span's sweep overlay resolves against the nearest positioned ancestor, so
 * dropping `position` on the spans and holding it here gives every span the
 * same row-wide overlay — one continuous wave instead of one sweep per span.
 *
 * Kept local instead of reusing lobe-ui's `textGroupStyles`: that export only
 * landed in @lobehub/ui 5.38, while this package's peer range is `^5`.
 */
const groupStyles = createStaticStyles(({ css }) => ({
  shinyGroup: css`
    @supports (-webkit-mask-clip: text) {
      & {
        --shiny-origin: static;

        position: relative;
      }
    }
  `,
}));

/**
 * Inspector text style — ellipsis + secondary color + flex align
 */
export const inspectorTextStyles = createStaticStyles(({ css, cssVar }) => ({
  root: css`
    /* Coordinate space for the shiny sweep: every shimmering span in the row
     * resolves its overlay against this box, so they read as one wave. */
    ${groupStyles.shinyGroup}

    overflow: hidden;
    display: flex;
    align-items: center;

    min-width: 0;

    color: ${cssVar.colorTextSecondary};
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
}));

/**
 * Highlight underline effect using gradient background
 */
export const highlightTextStyles = createStaticStyles(({ css, cssVar }) => {
  const highlightBase = (highlightColor: string) => css`
    overflow: hidden;

    min-width: 0;
    margin-inline-start: 4px;
    padding-block-end: 1px;

    color: ${cssVar.colorText};
    text-overflow: ellipsis;

    background: linear-gradient(to top, ${highlightColor} 40%, transparent 40%);
  `;

  return {
    gold: highlightBase(cssVar.gold4),
    info: highlightBase(cssVar.colorInfoBg),
    primary: highlightBase(cssVar.colorPrimaryBgHover),
    warning: highlightBase(cssVar.colorWarningBg),
  };
});

/**
 * Shiny loading text animation
 */
export const shinyTextStyles = {
  shinyText: textStyles.shiny,
};

export const shinyGroupStyles = {
  shinyGroup: groupStyles.shinyGroup,
};
