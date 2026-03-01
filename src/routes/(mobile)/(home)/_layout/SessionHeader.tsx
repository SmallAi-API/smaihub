'use client';

import { ActionIcon } from '@lobehub/ui';
import { ChatHeader } from '@lobehub/ui/mobile';
import { MessageSquarePlus } from 'lucide-react';
import { memo } from 'react';

import { MOBILE_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { useSessionStore } from '@/store/session';

const Header = memo(() => {
  const [createSession] = useSessionStore((s) => [s.createSession]);

  return (
    <ChatHeader
      right={
        <ActionIcon
          icon={MessageSquarePlus}
          size={MOBILE_HEADER_ICON_SIZE}
          onClick={() => createSession()}
        />
      }
    />
  );
});

export default Header;
