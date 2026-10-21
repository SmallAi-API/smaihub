'use client';

import { Block, Text, toast } from '@lobehub/ui';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import ImperativeModal from '@/components/ImperativeModal';
import DetailLoading from '@/features/MCP/MCPDetail/Loading';
import { usePermission } from '@/hooks/usePermission';
import { useAgentStore } from '@/store/agent';
import { useDiscoverStore } from '@/store/discover';
import { mcpSelectors } from '@/store/discover/selectors';
import { useToolStore } from '@/store/tool';
import { mcpStoreSelectors } from '@/store/tool/selectors';
import { pluginSelectors } from '@/store/tool/slices/plugin/selectors';

import { type McpInstallRequest } from '../types';
import OfficialDetail from './Detail';
import { useProtocolPluginInstall } from './useProtocolPluginInstall';

interface OfficialPluginInstallModalProps {
  installRequest: McpInstallRequest | null;
  onComplete: () => void;
}

const OfficialPluginInstallModal = memo<OfficialPluginInstallModalProps>(
  ({ installRequest, onComplete }) => {
    const { t } = useTranslation(['plugin', 'common']);
    const { allowed: canCreate } = usePermission('create_content');
    const { allowed: canEdit } = usePermission('edit_own_content');

    // 获取 MCP 插件详情
    const useMcpDetail = useDiscoverStore((s) => s.useFetchMcpDetail);
    const identifier = installRequest?.pluginId || '';

    const [installed, installMCPPlugin, cancelInstallMCPPlugin] = useToolStore((s) => [
      pluginSelectors.isPluginInstalled(identifier!)(s),

      s.installMCPPlugin,
      s.cancelInstallMCPPlugin,
    ]);
    const installing = useToolStore(mcpStoreSelectors.isMCPInstalling(identifier));
    const togglePlugin = useAgentStore((s) => s.togglePlugin);

    const { isLoading, queryKey } = useMcpDetail({ identifier });
    const data = useDiscoverStore(mcpSelectors.mcpDetail(queryKey));

    const install = useCallback(() => installMCPPlugin(identifier), [identifier, installMCPPlugin]);
    const cancel = useCallback(
      () => cancelInstallMCPPlugin(identifier),
      [identifier, cancelInstallMCPPlugin],
    );
    const enable = useCallback(() => togglePlugin(identifier, true), [identifier, togglePlugin]);
    const handleComplete = () => {
      toast.success(t('protocolInstall.messages.installSuccess', { name: data?.name }));
      onComplete();
    };
    const handleError = (error: unknown) => {
      console.error('Official plugin installation error:', error);
      toast.error(t('protocolInstall.messages.installError'));
    };
    const { confirm, dismiss, loading } = useProtocolPluginInstall({
      cancel,
      enable,
      install,
      installed,
      onComplete: handleComplete,
      onError: handleError,
    });

    const handleConfirm = () => {
      if (!canCreate || !canEdit || !installRequest || !data) return;
      return confirm();
    };

    if (!installRequest) return null;

    // 渲染内容
    const renderContent = () => {
      // 如果正在加载，显示骨架屏
      if (isLoading || !identifier) {
        return <DetailLoading />;
      }

      // 如果加载失败或没有数据，显示错误信息
      if (!data) {
        return (
          <Block>
            <Text type="danger">{t('protocolInstall.messages.manifestError')}</Text>
          </Block>
        );
      }

      return <OfficialDetail data={data} identifier={identifier} />;
    };

    return (
      <ImperativeModal
        open
        confirmLoading={loading}
        title={t('protocolInstall.official.title')}
        width={800}
        okButtonProps={{
          disabled: installed || installing || isLoading || !canCreate || !canEdit,
          type: installed ? 'default' : 'primary',
        }}
        okText={
          installed ? t('protocolInstall.actions.installed') : t('protocolInstall.actions.install')
        }
        onOk={handleConfirm}
        onCancel={() => {
          dismiss();
          onComplete();
        }}
      >
        {renderContent()}
      </ImperativeModal>
    );
  },
);

OfficialPluginInstallModal.displayName = 'OfficialPluginInstallModal';

export default OfficialPluginInstallModal;
