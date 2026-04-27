import { Book, CircleUserRound, Settings2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import useBusinessMeCells from '@/business/client/features/User/useBusinessMeCells';
import { type CellProps } from '@/components/Cell';
import { DOCUMENTS } from '@/const/index';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

export const useCategory = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'setting', 'auth']);
  const { hideDocs } = useServerConfigStore(featureFlagsSelectors);
  const [isLoginWithAuth] = useUserStore((s) => [authSelectors.isLoginWithAuth(s)]);

  const businessMeCells = useBusinessMeCells();

  const profile: CellProps[] = [
    {
      icon: CircleUserRound,
      key: 'profile',
      label: t('userPanel.profile'),
      onClick: () => navigate('/me/profile'),
    },
  ];

  const settings: CellProps[] = [
    {
      icon: Settings2,
      key: 'setting',
      label: t('userPanel.setting'),
      onClick: () => navigate('/me/settings'),
    },
    {
      type: 'divider',
    },
  ];

  /* ↓ cloud slot ↓ */
  const helps: CellProps[] = [
    {
      icon: Book,
      key: 'docs',
      label: t('document'),
      onClick: () => window.open(DOCUMENTS, '__blank'),
    },
  ].filter(Boolean) as CellProps[];

  const mainItems = [
    {
      type: 'divider',
    },
    ...(isLoginWithAuth ? profile : []),
    ...(isLoginWithAuth ? settings : []),
    ...(isLoginWithAuth ? businessMeCells : []),
    ...(!hideDocs ? helps : []),
  ].filter(Boolean) as CellProps[];

  return mainItems;
};
