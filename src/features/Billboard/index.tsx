'use client';

import { memo, useCallback, useState } from 'react';

import { useAnalytics } from '@/libs/analytics/client';
import { useGlobalStore } from '@/store/global';
import { useServerConfigStore } from '@/store/serverConfig';
import type { GlobalBillboard } from '@/types/serverConfig';

import BillboardCarousel from './Carousel';
import { useBillboardWindow } from './useBillboardWindow';

export const billboardDismissKey = (slug: string) => `billboard:${slug}`;
export const BILLBOARD_ANCHOR_ATTR = 'data-billboard-anchor';
const CARD_ATTR = 'data-billboard-card';

const BillboardContent = memo(({ billboard }: { billboard: GlobalBillboard }) => {
  const updateSystemStatus = useGlobalStore((s) => s.updateSystemStatus);
  const dismissedSlugs = useGlobalStore((s) => s.status.readNotificationSlugs ?? []);
  const { analytics } = useAnalytics();
  const [closing, setClosing] = useState(false);
  const [exitTarget, setExitTarget] = useState<{ x: number; y: number }>({ x: 0, y: 40 });

  const inWindow = useBillboardWindow(billboard);

  const isDismissed = billboard
    ? dismissedSlugs.includes(billboardDismissKey(billboard.slug))
    : true;

  const handleCloseStart = useCallback(() => {
    const anchor = document.querySelector<HTMLElement>(`[${BILLBOARD_ANCHOR_ATTR}]`);
    const card = document.querySelector<HTMLElement>(`[${CARD_ATTR}]`);
    if (anchor && card) {
      const anchorRect = anchor.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      setExitTarget({
        x: anchorRect.left + anchorRect.width / 2 - (cardRect.left + cardRect.width / 2),
        y: anchorRect.top + anchorRect.height / 2 - (cardRect.top + cardRect.height / 2),
      });
    }
    if (billboard) {
      analytics?.track({
        name: 'billboard_dismissed',
        properties: {
          billboard_slug: billboard.slug,
          item_count: billboard.items.length,
          spm: 'billboard.dismiss.clicked',
        },
      });
    }
    setClosing(true);
  }, [analytics, billboard]);

  const handleAnimationFinish = useCallback(() => {
    if (!billboard) return;
    const slug = billboardDismissKey(billboard.slug);
    const current = useGlobalStore.getState().status.readNotificationSlugs ?? [];
    if (!current.includes(slug)) {
      updateSystemStatus({ readNotificationSlugs: [...current, slug] });
    }
    setClosing(false);
  }, [billboard, updateSystemStatus]);

  if (!billboard || !inWindow || isDismissed || billboard.items.length === 0) return null;

  return (
    <BillboardCarousel
      cardAttr={CARD_ATTR}
      closing={closing}
      exitTarget={exitTarget}
      set={billboard}
      onAnimationFinish={handleAnimationFinish}
      onClose={handleCloseStart}
    />
  );
});

BillboardContent.displayName = 'BillboardContent';

const Billboard = memo(() => {
  const billboard = useServerConfigStore((s) => s.billboard);
  // A newly published group must not inherit an old group's dismissal animation.
  return billboard ? <BillboardContent billboard={billboard} key={billboard.slug} /> : null;
});

Billboard.displayName = 'Billboard';

export default Billboard;
