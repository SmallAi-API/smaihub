'use client';

import { COPYRIGHT_FULL } from '@lobechat/business-const';
import { Center, Flexbox, Text } from '@lobehub/ui';
import { Divider } from 'antd';
import { cx } from 'antd-style';
import { type FC, type PropsWithChildren } from 'react';

import { ProductLogo } from '@/components/Branding';
import LangButton from '@/features/User/UserPanel/LangButton';
import ThemeButton from '@/features/User/UserPanel/ThemeButton';
import { useIsDark } from '@/hooks/useIsDark';
import Link from '@/libs/next/Link';

import { styles } from './style';

const DownloadContainer: FC<PropsWithChildren> = ({ children }) => {
  const isDarkMode = useIsDark();
  return (
    <Flexbox className={styles.outerContainer} height={'100%'} padding={8} width={'100%'}>
      <Flexbox
        className={cx(isDarkMode ? styles.innerContainerDark : styles.innerContainerLight)}
        height={'100%'}
        width={'100%'}
      >
        <Flexbox
          horizontal
          align={'center'}
          gap={8}
          justify={'space-between'}
          padding={16}
          width={'100%'}
        >
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Flexbox horizontal align={'center'} gap={8} style={{ cursor: 'pointer' }}>
              <ProductLogo size={40} />
              <Text style={{ fontSize: 20 }} weight={'bold'}>
                smai.ai
              </Text>
            </Flexbox>
          </Link>
          <Flexbox horizontal align={'center'}>
            <LangButton placement={'bottomRight'} size={18} />
            <Divider className={styles.divider} orientation={'vertical'} />
            <ThemeButton placement={'bottomRight'} size={18} />
          </Flexbox>
        </Flexbox>
        <Center height={'100%'} padding={16} width={'100%'}>
          {children}
        </Center>
        <Center padding={24}>
          <Text align={'center'} type={'secondary'}>
            {COPYRIGHT_FULL}
          </Text>
        </Center>
      </Flexbox>
    </Flexbox>
  );
};

export default DownloadContainer;
