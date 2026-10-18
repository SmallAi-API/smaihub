import { createStaticStyles, Flexbox, Popover } from '@lobehub/ui';
import { ActionIcon, type PopoverPlacement } from '@lobehub/ui';
import { XIcon } from 'lucide-react';
import { type CSSProperties, type FC, type ReactNode } from 'react';

const styles = createStaticStyles(({ css }) => {
  return {
    close: css`
      color: white;
    `,
    container: css`
      position: relative;
    `,
    footer: css`
      display: flex;
      justify-content: end;
      width: 100%;
    `,
    tip: css`
      position: absolute;
      inset-inline-start: 50%;
      transform: translate(-50%);
    `,
  };
});

export interface TipGuideProps {
  /**
   * 引导内容
   */
  children?: ReactNode;
  /**
   * 类名
   */
  className?: string;
  /**
   * 默认时候的打开状态
   */
  defaultOpen?: boolean;
  /**
   * 用于自定义 footer 部分的 render api
   */
  footerRender?: (dom: ReactNode) => ReactNode;
  /**
   * 最大宽度
   */
  maxWidth?: number;
  /**
   * 纵向偏移值
   */
  offsetY?: number;
  /**
   * 当 open 属性变化时候的触发
   */
  onOpenChange: (open: boolean) => void;
  /**
   * 受控的 open 属性
   */
  open?: boolean;
  /**
   * Tooltip 位置，默认为 bottom
   */
  placement?: PopoverPlacement;
  /**
   * style
   */
  style?: CSSProperties;
  tip?: boolean;
  /**
   * 引导标题
   */
  title: string;
}

const TipGuide: FC<TipGuideProps> = ({
  children,
  placement = 'bottom',
  title,
  offsetY,
  maxWidth = 300,
  className,
  style,
  open,
  onOpenChange: setOpen,
}) => {
  if (!open) return children;

  return (
    <div className={styles.container}>
      <div
        style={{
          marginTop: offsetY,
        }}
      >
        <Popover
          arrow={true}
          classNames={{ root: className }}
          open={open}
          placement={placement}
          trigger="hover"
          content={
            <Flexbox horizontal gap={24} style={{ userSelect: 'none' }}>
              <div>{title}</div>
              <ActionIcon
                className={styles.close}
                icon={XIcon}
                size={'small'}
                onClick={() => {
                  setOpen(false);
                }}
              />
            </Flexbox>
          }
          styles={{
            root: { maxWidth, zIndex: 1000, ...style },
          }}
        >
          {children}
        </Popover>
      </div>
    </div>
  );
};

export default TipGuide;
