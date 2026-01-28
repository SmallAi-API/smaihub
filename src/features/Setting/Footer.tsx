'use client';

import { Center, Flexbox, Icon } from '@lobehub/ui';
import { createStaticStyles } from 'antd-style';
import { MessageSquareHeart } from 'lucide-react';
import { type PropsWithChildren, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

const styles = createStaticStyles(
  ({ css, cssVar }) => css`
    font-size: 12px;
    color: ${cssVar.colorTextSecondary};
  `,
);

export const LayoutSettingsFooterClassName = 'settings-layout-footer';

const Footer = memo<PropsWithChildren>(() => {
  const { t } = useTranslation('common');

  const { hideGitHub } = useServerConfigStore(featureFlagsSelectors);

  return hideGitHub ? null : (
    <Flexbox flex={1} justify={'flex-end'}>
      <Center as={'footer'} className={styles} flex={'none'} horizontal padding={16} width={'100%'}>
        <div style={{ textAlign: 'center' }}>
          <Icon icon={MessageSquareHeart} /> {`${t('footer.title')} `}
        </div>
      </Center>
    </Flexbox>
  );
});

Footer.displayName = 'SettingFooter';

export default Footer;
