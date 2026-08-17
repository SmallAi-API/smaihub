import { createStaticStyles } from 'antd-style';

export const styles = createStaticStyles(({ css, cssVar }) => ({
  actionRow: css`
    flex-wrap: wrap;
    margin-block-start: auto;
  `,
  apiKeyCard: css`
    grid-column: 1;
    grid-row: 2;

    @media (width <= 860px) {
      grid-column: auto;
      grid-row: auto;
    }
  `,
  /**
   * Left column stacks two cards; the messenger card spans both rows so its
   * platform grid has the room it needs and both columns end flush.
   */
  bentoGrid: css`
    display: grid;
    grid-template-columns: minmax(0, 0.88fr) minmax(0, 1.12fr);
    grid-template-rows: repeat(2, minmax(220px, auto));
    gap: 16px;

    @media (width <= 860px) {
      grid-template-columns: 1fr;
      grid-template-rows: none;
    }
  `,
  card: css`
    min-height: 220px;
    padding: 24px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: ${cssVar.borderRadiusLG};

    background: ${cssVar.colorBgContainer};
  `,
  content: css`
    width: min(100%, 1120px);
    margin-block: 0;
    margin-inline: auto;
    padding-block: 32px 96px;
    padding-inline: 24px;

    @media (width <= 760px) {
      padding-block-start: 16px;
      padding-inline: 16px;
    }
  `,
  desktopCard: css`
    grid-column: 1;
    grid-row: 1;

    @media (width <= 860px) {
      grid-column: auto;
      grid-row: auto;
    }
  `,
  iconBox: css`
    width: 44px;
    height: 44px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 12px;

    color: ${cssVar.colorText};

    background: ${cssVar.colorFillQuaternary};
  `,
  messengerCard: css`
    grid-column: 2;
    grid-row: 1 / 3;

    @media (width <= 860px) {
      grid-column: auto;
      grid-row: auto;
    }
  `,
  page: css`
    overflow-y: auto;
    height: 100%;
    min-height: 100%;
    background: ${cssVar.colorBgLayout};
  `,
  pageHeader: css`
    margin-block-end: 24px;
    text-align: start;
  `,
  pageTitle: css`
    margin: 0;
    font-size: 30px;
    line-height: 1.2;
    letter-spacing: 0;
  `,
  platformChevron: css`
    flex-shrink: 0;
    color: ${cssVar.colorTextTertiary};
  `,
  platformGrid: css`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-block: 22px;

    @media (width <= 520px) {
      grid-template-columns: 1fr;
    }
  `,
  platformIcon: css`
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    line-height: 0;
  `,
  platformItem: css`
    cursor: pointer;

    justify-content: flex-start;

    width: 100%;
    min-height: 44px;
    padding-inline: 12px;
    border-radius: 10px;

    color: ${cssVar.colorText};
    text-align: start;

    background: ${cssVar.colorFillQuaternary};

    &:hover {
      border-color: ${cssVar.colorBorder};
      background: ${cssVar.colorFillTertiary};
    }
  `,
  platformLabel: css`
    display: inline-flex;
    flex: 1;
    gap: 6px;
    align-items: center;

    min-width: 0;
  `,
  platformName: css`
    overflow: hidden;
    min-width: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
}));
