import { Avatar, Flexbox, SortableList } from '@lobehub/ui';
import { memo } from 'react';

import { type AiProviderListItem } from '@/types/aiProvider';
import { getProviderLogoUrl } from '@/utils/providerLogo';

interface GroupItemProps extends AiProviderListItem {
  disabled?: boolean;
}

const GroupItem = memo<GroupItemProps>(({ id, name, source, logo, disabled }) => {
  return (
    <>
      <Flexbox horizontal gap={8}>
        <Avatar
          alt={name || id}
          avatar={getProviderLogoUrl(id, name)}
          shape={'square'}
          size={24}
          style={{ borderRadius: 6 }}
        />

        {name}
      </Flexbox>
      {!disabled && <SortableList.DragHandle />}
    </>
  );
});

export default GroupItem;
