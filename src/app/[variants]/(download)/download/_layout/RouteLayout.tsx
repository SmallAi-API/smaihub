'use client';

import { type FC } from 'react';
import { Outlet } from 'react-router';

import DownloadContainer from '.';

const DownloadRouteLayout: FC = () => {
  return (
    <DownloadContainer>
      <Outlet />
    </DownloadContainer>
  );
};

export default DownloadRouteLayout;
