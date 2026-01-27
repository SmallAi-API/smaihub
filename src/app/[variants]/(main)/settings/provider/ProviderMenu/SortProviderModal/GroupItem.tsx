import { Avatar, Flexbox, SortableList } from '@lobehub/ui';
import { memo } from 'react';

import { type AiProviderListItem } from '@/types/aiProvider';
import { getProviderLogoUrl } from '@/utils/providerLogo';

const GroupItem = memo<AiProviderListItem>(({ id, name }) => {
  return (
    <>
      <Flexbox gap={8} horizontal>
        <Avatar
          alt={name || id}
          avatar={getProviderLogoUrl(id, name)}
          shape={'square'}
          size={24}
          style={{ borderRadius: 6 }}
        />

        {name}
      </Flexbox>
      <SortableList.DragHandle />
    </>
  );
});

export default GroupItem;
