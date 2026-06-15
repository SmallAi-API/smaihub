'use client';

import { createModal } from '@lobehub/ui/base-ui';
import { t } from 'i18next';

import { isDesktop } from '@/const/version';
import { MarketAuthProvider } from '@/layout/AuthProvider/MarketAuth';

import { SkillStoreContent, type SkillStoreTab } from './SkillStoreContent';

export const createSkillStoreModal = (options?: { initialTab?: SkillStoreTab }) =>
  createModal({
    content: (
      <MarketAuthProvider isDesktop={isDesktop}>
        <SkillStoreContent initialTab={options?.initialTab} />
      </MarketAuthProvider>
    ),
    footer: null,
    title: t('skillStore.title', { ns: 'setting' }),
    width: 'min(80%, 800px)',
  });
