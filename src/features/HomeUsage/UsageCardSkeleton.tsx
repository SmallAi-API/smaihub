import { Block, Flexbox, Skeleton } from '@lobehub/ui';

const statPlaceholders = ['agents', 'topics', 'messages'];

/** Mirrors the quota and personal topic statistics layout while the first read is pending. */
export const UsageCardSkeleton = () => (
  <Flexbox data-testid={'home-smai-usage-loading'} gap={16}>
    <Flexbox gap={8}>
      <Block gap={6} padding={8} variant={'filled'}>
        <Skeleton height={12} width={96} />
        <Skeleton height={22} width={'58%'} />
      </Block>
      <Flexbox horizontal align={'center'} gap={8}>
        <Flexbox flex={1}>
          <Skeleton height={8} width={'100%'} />
        </Flexbox>
        <Skeleton height={16} width={32} />
      </Flexbox>
    </Flexbox>
    <Flexbox gap={8}>
      <Flexbox horizontal align={'center'} justify={'space-between'}>
        <Skeleton height={12} width={36} />
        <Skeleton height={12} width={40} />
      </Flexbox>
      <Flexbox horizontal gap={4}>
        {statPlaceholders.map((placeholder) => (
          <Block flex={1} gap={4} key={placeholder} padding={8} variant={'filled'}>
            <Skeleton height={18} width={'42%'} />
            <Skeleton height={12} width={'68%'} />
          </Block>
        ))}
      </Flexbox>
    </Flexbox>
  </Flexbox>
);
