import { createStaticStyles } from 'antd-style';

export const styles = createStaticStyles(({ css, cssVar }) => ({
  // Divider 样式
  divider: css`
    height: 24px;
  `,

  // 下载按钮
  downloadButton: css`
    min-width: 240px;
    height: 48px;
    font-size: 16px;
    font-weight: 500;
  `,

  // 特性卡片
  featureCard: css`
    padding: 24px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: ${cssVar.borderRadius};

    background: ${cssVar.colorFillQuaternary};

    transition: all 0.2s ease;

    &:hover {
      border-color: ${cssVar.colorPrimary};
      background: ${cssVar.colorFillTertiary};
    }
  `,

  // 内层容器 - 深色模式
  innerContainerDark: css`
    position: relative;

    overflow: hidden;

    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: ${cssVar.borderRadius};

    background: ${cssVar.colorBgContainer};
  `,

  // 内层容器 - 浅色模式
  innerContainerLight: css`
    position: relative;

    overflow: hidden;

    border: 1px solid ${cssVar.colorBorder};
    border-radius: ${cssVar.borderRadius};

    background: ${cssVar.colorBgContainer};
  `,

  // 外层容器
  outerContainer: css`
    position: relative;
  `,

  // 版本信息
  versionBadge: css`
    padding-block: 4px;
    padding-inline: 12px;
    border-radius: ${cssVar.borderRadius};

    font-family: ${cssVar.fontFamilyCode};

    background: ${cssVar.colorFillSecondary};
  `,
}));
