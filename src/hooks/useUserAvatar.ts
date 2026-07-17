import { DEFAULT_USER_AVATAR } from '@lobechat/const';

import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

import { useAvatarUrl } from './useAvatarUrl';

export const useUserAvatar = () => {
  const avatar = useUserStore(userProfileSelectors.userAvatar) || DEFAULT_USER_AVATAR;

  // Desktop resolves a `/`-rooted avatar against the cloud origin; see useAvatarUrl.
  return useAvatarUrl(avatar);
};
