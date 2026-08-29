import type {
  HeterogeneousProviderConfig,
  HeterogeneousReasoningEffort,
  HeterogeneousSpeedMode,
  HeteroSelection,
  ListHeterogeneousAgentModelsParams,
} from '@lobechat/types';
import {
  DropdownMenuPopup,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  renderDropdownMenuItems,
} from '@lobehub/ui/base-ui';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { buildSelectorSubmenu } from '../../components/buildSelectorSubmenu';
import Trigger from '../../components/SelectorTrigger';
import { ModelCatalogSelector } from './ModelCatalogSelector';
import type { ModelCapability } from './selectorView';
import { buildSelectorView, resolveModelSwitchSelection } from './selectorView';

interface SelectorMenuProps {
  agentId?: string;
  capability: ModelCapability;
  patch: (selection: HeteroSelection) => Promise<void>;
  permissionReason?: string;
  provider: HeterogeneousProviderConfig;
}

const SelectorMenu = memo<SelectorMenuProps>(
  ({ agentId, capability, patch, permissionReason, provider }) => {
    const { t } = useTranslation('chat');

    const view = useMemo(
      () => buildSelectorView({ capability, provider, t }),
      [capability, provider, t],
    );

    const select = useCallback(
      (key: string, value: string) => {
        if (key === 'model' && capability.model)
          return void patch(
            resolveModelSwitchSelection({
              capability,
              effort: capability.effort?.resolve(provider),
              isFastSpeed: view.isFastSpeed,
              value,
            }),
          );

        void patch(
          key === 'speed'
            ? { speed: value as HeterogeneousSpeedMode }
            : { effort: value as HeterogeneousReasoningEffort },
        );
      },
      [capability, patch, provider, view.isFastSpeed],
    );

    const items = view.dimensions.map((dimension) =>
      buildSelectorSubmenu({
        current: dimension.current,
        label: dimension.label,
        onSelect: (value: string) => select(dimension.key, value),
        options: dimension.options,
        valueLabel: dimension.valueLabel,
      }),
    );

    return (
      <DropdownMenuRoot>
        <DropdownMenuTrigger nativeButton={false}>
          <Trigger ariaLabel={view.ariaLabel} fast={view.isFastSpeed} text={view.triggerText} />
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          {/* The trigger label changes width as selections change, and it sits in the
              right-anchored send area — only its right edge holds still. Aligning to
              the left edge drags the open popup sideways on every pick. */}
          <DropdownMenuPositioner placement="topRight" sideOffset={8}>
            <DropdownMenuPopup style={{ width: 240 }}>
              {view.isCatalogModel && (
                <ModelCatalogSelector
                  agentId={agentId}
                  disabled={false}
                  model={view.model}
                  permissionReason={permissionReason}
                  type={provider.type as ListHeterogeneousAgentModelsParams['type']}
                  variant="submenu"
                  onSelect={(value) => select('model', value)}
                />
              )}
              {renderDropdownMenuItems(items)}
            </DropdownMenuPopup>
          </DropdownMenuPositioner>
        </DropdownMenuPortal>
      </DropdownMenuRoot>
    );
  },
);

SelectorMenu.displayName = 'HeteroModelSelectorMenu';

export default SelectorMenu;
