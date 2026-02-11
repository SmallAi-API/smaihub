import { type LobeSelectProps } from '@lobehub/ui';
import { LobeSelect, TooltipGroup } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { type ReactNode } from 'react';
import { memo, useMemo } from 'react';

import { ModelItemRender, ProviderItemRender } from '@/components/ModelSelect';
import { useEnabledChatModels } from '@/hooks/useEnabledChatModels';
import { type EnabledProviderWithModels } from '@/types/aiProvider';

const useStyles = createStyles(({ css }, { popupWidth }: { popupWidth?: number | string }) => ({
  popup: css`
    width: ${popupWidth
      ? typeof popupWidth === 'number'
        ? `${popupWidth}px`
        : popupWidth
      : 'max(360px, var(--anchor-width))'};
  `,
}));

type ModelAbilities = EnabledProviderWithModels['children'][number]['abilities'];

interface ModelOption {
  abilities?: ModelAbilities;
  displayName?: string;
  id: string;
  label: ReactNode;
  provider: string;
  value: string;
}

interface ModelSelectProps extends Omit<
  LobeSelectProps,
  'defaultValue' | 'onChange' | 'optionRender' | 'options' | 'value'
> {
  defaultValue?: { model: string; provider?: string };
  initialWidth?: boolean;
  onChange?: (props: { model: string; provider: string }) => void;
  popupWidth?: number | string;
  requiredAbilities?: (keyof EnabledProviderWithModels['children'][number]['abilities'])[];
  showAbility?: boolean;

  value?: { model: string; provider?: string };
}

const ModelSelect = memo<ModelSelectProps>((props) => {
  const {
    value,
    defaultValue,
    onChange,
    initialWidth = false,
    showAbility = true,
    requiredAbilities,
    popupWidth,
    style,
    virtual = true,
    ...rest
  } = props;
  const { styles } = useStyles({ popupWidth });
  const enabledList = useEnabledChatModels();

  const options = useMemo<LobeSelectProps['options']>(() => {
    const getChatModels = (provider: EnabledProviderWithModels) => {
      const models =
        requiredAbilities && requiredAbilities.length > 0
          ? provider.children.filter((model) =>
              requiredAbilities.every((ability) => Boolean(model.abilities?.[ability])),
            )
          : provider.children;

      return models.map((model) => ({
        ...model,
        label: <ModelItemRender {...model} {...model.abilities} showInfoTag={false} />,
        provider: provider.id,
        value: `${provider.id}/${model.id}`,
      }));
    };

    if (enabledList.length === 1) {
      const provider = enabledList[0];

      return getChatModels(provider);
    }

    return enabledList
      .map((provider) => {
        const opts = getChatModels(provider);
        if (opts.length === 0) return undefined;

        return {
          label: (
            <ProviderItemRender
              logo={provider.logo}
              name={provider.name}
              provider={provider.id}
              source={provider.source}
            />
          ),
          options: opts,
        };
      })
      .filter(Boolean) as LobeSelectProps['options'];
  }, [enabledList, requiredAbilities, showAbility]);

  const selectedValue =
    value?.provider && value?.model ? `${value.provider}/${value.model}` : undefined;
  const selectedDefaultValue =
    selectedValue === undefined && defaultValue?.provider && defaultValue?.model
      ? `${defaultValue.provider}/${defaultValue.model}`
      : undefined;
  const popupClassName = rest.popupClassName
    ? `${rest.popupClassName} ${styles.popup}`
    : styles.popup;

  return (
    <TooltipGroup>
      <LobeSelect
        {...rest}
        defaultValue={selectedDefaultValue}
        onChange={(value, option) => {
          if (!value) return;
          const model = (value as string).split('/').slice(1).join('/');
          onChange?.({ model, provider: (option as unknown as ModelOption).provider });
        }}
        optionRender={(option) => {
          const data = option as unknown as ModelOption;
          return (
            <ModelItemRender
              displayName={data.displayName}
              id={data.id}
              showInfoTag={false}
              {...data.abilities}
            />
          );
        }}
        options={options}
        popupClassName={popupClassName}
        popupMatchSelectWidth={false}
        selectedIndicatorVariant="bold"
        style={{
          minWidth: 200,
          width: initialWidth ? 'initial' : undefined,
          ...style,
        }}
        value={selectedValue}
        virtual={virtual}
      />
    </TooltipGroup>
  );
});

export default ModelSelect;
