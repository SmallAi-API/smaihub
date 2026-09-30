'use client';

import { Flexbox, Icon, Tooltip } from '@lobehub/ui';
import { ActionIcon, Button } from '@lobehub/ui/base-ui';
import { Carousel as AntCarousel } from 'antd';
import { createStaticStyles, cssVar } from 'antd-style';
import { Megaphone, X } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import * as m from 'motion/react-m';
import {
  type ComponentRef,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import { useAnalytics } from '@/libs/analytics/client';
import type { GlobalBillboard, GlobalBillboardItem } from '@/types/serverConfig';

import { resolveBillboardAction, runBillboardAction } from './actions';
import { resolveBillboardItem, resolveBillboardTitle } from './locale';

type BillboardItem = GlobalBillboardItem;

interface BillboardCarouselProps {
  cardAttr?: string;
  closing?: boolean;
  exitTarget?: { x: number; y: number };
  onAnimationFinish?: () => void;
  onClose: () => void;
  set: GlobalBillboard;
}

const styles = createStaticStyles(({ css }) => ({
  card: css`
    /* Anchored to the nav panel (its content box is the positioned ancestor), so
       the card always matches the sidebar width, even while it is resized. */
    position: absolute;
    z-index: 10;
    inset-block-end: 52px;
    inset-inline: 8px;
    transform-origin: bottom left;

    overflow: hidden;
    display: flex;
    flex-direction: column;

    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: ${cssVar.borderRadiusLG};

    background: ${cssVar.colorBgElevated};
    box-shadow: ${cssVar.boxShadowSecondary};
  `,
  description: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;

    font-size: 12px;
    line-height: 20px;
    color: ${cssVar.colorTextSecondary};
    text-overflow: ellipsis;
  `,
  dot: css`
    cursor: pointer;

    width: 6px;
    height: 6px;
    padding: 0;
    border: 0;
    border-radius: 3px;

    background: ${cssVar.colorFillSecondary};

    transition:
      width 0.2s ${cssVar.motionEaseOut},
      background 0.2s ${cssVar.motionEaseOut};

    &:focus-visible {
      outline: 2px solid ${cssVar.colorPrimary};
      outline-offset: 2px;
    }
  `,
  dotActive: css`
    width: 16px;
    background: ${cssVar.colorPrimary};
  `,
  footer: css`
    min-height: 24px;
    padding: 12px;
  `,
  header: css`
    padding-block: 8px 4px;
    padding-inline: 12px 8px;
    font-size: 12px;
    color: ${cssVar.colorTextTertiary};
  `,
  headerTitle: css`
    overflow: hidden;
    flex: 1;

    min-width: 0;

    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  image: css`
    display: block;

    width: 100%;
    height: 112px;
    margin-block-end: 4px;
    border-radius: ${cssVar.borderRadius};

    object-fit: cover;
    background: ${cssVar.colorFillTertiary};
  `,
  itemBody: css`
    padding-inline: 12px;
  `,
  title: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;

    font-size: 14px;
    font-weight: 600;
    line-height: 22px;
    color: ${cssVar.colorText};
    text-overflow: ellipsis;
  `,
}));

const hasCta = (item: BillboardItem) =>
  Boolean(resolveBillboardAction(item.action) || item.linkUrl);

const ItemContent = memo<{ item: BillboardItem }>(({ item }) => {
  const { i18n } = useTranslation();
  const resolved = useMemo(() => resolveBillboardItem(item, i18n.language), [item, i18n.language]);

  const titleRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const [titleOverflow, setTitleOverflow] = useState(false);
  const [descOverflow, setDescOverflow] = useState(false);

  useLayoutEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    setTitleOverflow(el.scrollHeight > el.clientHeight + 1);
  }, [resolved.title]);

  useLayoutEffect(() => {
    const el = descRef.current;
    if (!el) return;
    setDescOverflow(el.scrollHeight > el.clientHeight + 1);
  }, [resolved.description]);

  const titleNode = (
    <div className={styles.title} ref={titleRef}>
      {resolved.title}
    </div>
  );

  const descNode = resolved.description && (
    <div className={styles.description} ref={descRef}>
      {resolved.description}
    </div>
  );

  return (
    <Flexbox className={styles.itemBody} gap={4}>
      {item.cover && <img alt="" className={styles.image} src={item.cover} />}
      {titleOverflow ? (
        <Tooltip placement="top" title={resolved.title}>
          {titleNode}
        </Tooltip>
      ) : (
        titleNode
      )}
      {descNode &&
        (descOverflow ? (
          <Tooltip placement="top" title={resolved.description}>
            {descNode}
          </Tooltip>
        ) : (
          descNode
        ))}
    </Flexbox>
  );
});

ItemContent.displayName = 'BillboardItemContent';

const ItemAction = memo<{
  billboardSlug: string;
  item: BillboardItem;
  onClose: () => void;
  position: number;
}>(({ item, billboardSlug, position, onClose }) => {
  const { t, i18n } = useTranslation('notification');
  const { analytics } = useAnalytics();
  const resolved = useMemo(() => resolveBillboardItem(item, i18n.language), [item, i18n.language]);

  const action = resolveBillboardAction(item.action);
  const label = resolved.linkLabel ?? t('billboard.learnMore');

  const trackCtaClick = useCallback(
    (extra: Record<string, unknown>) => {
      analytics?.track({
        name: 'billboard_cta_clicked',
        properties: {
          billboard_slug: billboardSlug,
          item_id: item.id,
          position,
          spm: 'billboard.cta.clicked',
          ...extra,
        },
      });
    },
    [analytics, billboardSlug, item.id, position],
  );

  const handleActionClick = useCallback(async () => {
    if (!action) return;
    trackCtaClick({ action });
    onClose();
    await Promise.resolve(runBillboardAction(action)).catch(() => {});
  }, [action, trackCtaClick, onClose]);

  const handleLinkClick = useCallback(() => {
    trackCtaClick({ link_url: item.linkUrl });
    onClose();
  }, [trackCtaClick, item.linkUrl, onClose]);

  if (action) {
    return (
      <Button size="small" type="primary" onClick={handleActionClick}>
        {label}
      </Button>
    );
  }

  if (!item.linkUrl) return null;

  return (
    <Button
      href={item.linkUrl}
      rel="noopener noreferrer"
      size="small"
      target="_blank"
      type="primary"
      onClick={handleLinkClick}
    >
      {label}
    </Button>
  );
});

ItemAction.displayName = 'BillboardItemAction';

const BILLBOARD_IMPRESSION_STORAGE_PREFIX = 'billboard:impression:';

const BillboardCarousel = memo<BillboardCarouselProps>(
  ({ set, onClose, closing, exitTarget, onAnimationFinish, cardAttr }) => {
    const { t, i18n } = useTranslation('common');
    const [paused, setPaused] = useState(false);
    const [current, setCurrent] = useState(0);
    const carouselRef = useRef<ComponentRef<typeof AntCarousel>>(null);
    const { analytics } = useAnalytics();
    const reduceMotion = useReducedMotion();

    useEffect(() => {
      if (!analytics || set.items.length === 0) return;
      const key = `${BILLBOARD_IMPRESSION_STORAGE_PREFIX}${set.slug}`;
      try {
        if (globalThis.sessionStorage?.getItem(key) === '1') return;
        globalThis.sessionStorage?.setItem(key, '1');
      } catch {
        // ignore storage access errors (e.g. private mode) and still report
      }
      void analytics.track({
        name: 'billboard_served',
        properties: {
          billboard_slug: set.slug,
          item_count: set.items.length,
          spm: 'billboard.card.served',
        },
      });
    }, [analytics, set.slug, set.items.length]);

    if (set.items.length === 0) return null;

    const single = set.items.length === 1;
    const currentIndex = Math.min(current, set.items.length - 1);
    const currentItem = set.items[currentIndex];
    const showFooter = !single || hasCta(currentItem);

    const cardDataProps = cardAttr ? { [cardAttr]: '' } : {};

    return (
      <m.div
        {...cardDataProps}
        className={styles.card}
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.2, 0.8, 0.2, 1] }}
        animate={
          closing
            ? { opacity: 0, scale: 0.15, x: exitTarget?.x ?? 0, y: exitTarget?.y ?? 40 }
            : { opacity: 1, scale: 1, x: 0, y: 0 }
        }
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onAnimationComplete={() => {
          if (closing) onAnimationFinish?.();
        }}
      >
        <Flexbox horizontal align="center" className={styles.header} gap={8}>
          <Icon icon={Megaphone} size={14} />
          <span className={styles.headerTitle}>{resolveBillboardTitle(set, i18n.language)}</span>
          <ActionIcon aria-label={t('close')} icon={X} size={14} onClick={onClose} />
        </Flexbox>

        {single ? (
          <ItemContent item={currentItem} />
        ) : (
          <AntCarousel
            adaptiveHeight
            autoplay={!paused && !reduceMotion}
            autoplaySpeed={6000}
            beforeChange={(_: number, next: number) => setCurrent(next)}
            dots={false}
            ref={carouselRef}
          >
            {set.items.map((item) => (
              <div key={item.id}>
                <ItemContent item={item} />
              </div>
            ))}
          </AntCarousel>
        )}

        {showFooter ? (
          <Flexbox
            horizontal
            align="center"
            className={styles.footer}
            gap={8}
            justify={single ? 'flex-end' : 'space-between'}
          >
            {!single && (
              <Flexbox horizontal align="center" gap={4}>
                {set.items.map((item, idx) => (
                  <button
                    aria-current={currentIndex === idx}
                    aria-label={`${idx + 1} / ${set.items.length}`}
                    className={`${styles.dot} ${currentIndex === idx ? styles.dotActive : ''}`}
                    key={item.id}
                    type="button"
                    onClick={() => carouselRef.current?.goTo(idx)}
                  />
                ))}
              </Flexbox>
            )}
            <ItemAction
              billboardSlug={set.slug}
              item={currentItem}
              key={currentItem.id}
              position={currentIndex}
              onClose={onClose}
            />
          </Flexbox>
        ) : (
          <div style={{ height: 12 }} />
        )}
      </m.div>
    );
  },
);

BillboardCarousel.displayName = 'BillboardCarousel';

export default BillboardCarousel;
