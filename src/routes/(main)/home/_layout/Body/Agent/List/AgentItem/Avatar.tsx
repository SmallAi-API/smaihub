import { DEFAULT_AVATAR } from '@lobechat/const';
import { memo } from 'react';

import AgentAvatar from '@/features/AgentAvatar';

interface AgentItemAvatarProps {
  avatar?: string;
  avatarBackground?: string;
}

const AgentItemAvatar = memo<AgentItemAvatarProps>(({ avatar, avatarBackground }) => {
  return (
    <AgentAvatar
      emojiScaleWithBackground
      avatar={avatar || DEFAULT_AVATAR}
      background={avatarBackground}
      shape={'square'}
      size={22}
    />
  );
});

export default AgentItemAvatar;
