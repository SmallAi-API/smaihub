import { createStaticStyles } from '@lobehub/ui';

import { densityVars } from '@/styles/densityVars';

export const styles = createStaticStyles(({ css }) => ({
  // 搜索栏容器
  searchBarContainer: css`
    padding-block: 8px;
    padding-inline: ${densityVars.cardPadding};
  `,
}));
