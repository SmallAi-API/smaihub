import { Avatar } from '@lobehub/ui';
import { type ComponentProps, memo } from 'react';

import { useAvatarUrl } from '@/hooks/useAvatarUrl';

type AvatarProps = ComponentProps<typeof Avatar>;

/**
 * Agent/inbox avatar renderer.
 *
 * A thin wrapper over `@lobehub/ui`'s `<Avatar>` that resolves the `avatar`
 * value through {@link useAvatarUrl}, so a root-relative default (e.g. the
 * inbox `/logo.png`) loads from the cloud origin on desktop instead of the
 * `app://renderer` origin where it 404s. Emoji / already-absolute avatars pass
 * through unchanged. All other props are forwarded as-is.
 *
 * Use this instead of `<Avatar>` at agent/inbox render sites so the fix applies
 * uniformly (including inside `.map()` loops, where a hook can't be called per
 * item).
 */
const AgentAvatar = memo<AvatarProps>(({ avatar, ...rest }) => {
  const resolved = useAvatarUrl(typeof avatar === 'string' ? avatar : undefined);

  return <Avatar avatar={typeof avatar === 'string' ? resolved : avatar} {...rest} />;
});

export default AgentAvatar;
