import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { type FC, type PropsWithChildren } from 'react';

import ClientOnly from '@/components/client/ClientOnly';

import DownloadContainer from './_layout';

const DownloadLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ClientOnly>
      <NuqsAdapter>
        <DownloadContainer>{children}</DownloadContainer>
      </NuqsAdapter>
    </ClientOnly>
  );
};

export default DownloadLayout;
