'use client';

import { Alert, Block, Flexbox, Text, toast } from '@lobehub/ui';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ImperativeModal from '@/components/ImperativeModal';
import PluginAvatar from '@/components/Plugins/PluginAvatar';
import PluginTag from '@/components/Plugins/PluginTag';
import { usePermission } from '@/hooks/usePermission';
import { useAgentStore } from '@/store/agent';
import { useToolStore } from '@/store/tool';
import { mcpStoreSelectors } from '@/store/tool/selectors';
import { type McpConnectionParams } from '@/types/plugins';

import ConfigDisplay from './ConfigDisplay';
import { type McpInstallRequest } from './types';

interface CustomPluginInstallModalProps {
  installRequest: McpInstallRequest | null;
  isMarketplace?: boolean;
  onComplete?: () => void;
}

const CustomPluginInstallModal = memo<CustomPluginInstallModalProps>(
  ({ installRequest, isMarketplace = false, onComplete }) => {
    const { t } = useTranslation('plugin');
    const [loading, setLoading] = useState(false);
    const { allowed: canCreate } = usePermission('create_content');
    const { allowed: canEdit } = usePermission('edit_own_content');

    // 跟踪配置更新
    const [updatedConfig, setUpdatedConfig] = useState<{
      env?: Record<string, string>;
      headers?: Record<string, string>;
    }>({});

    const installCustomMcpConnector = useToolStore((s) => s.installCustomMcpConnector);
    const testMcpConnection = useToolStore((s) => s.testMcpConnection);
    const togglePlugin = useAgentStore((s) => s.togglePlugin);

    // 为自定义插件测试连接生成唯一标识符
    const identifier = installRequest?.schema?.identifier || '';
    const testState = useToolStore(mcpStoreSelectors.getMCPConnectionTestState(identifier));

    const schema = installRequest?.schema;
    const isStdioMcp = schema?.config.type === 'stdio';

    // 重置加载状态和配置
    useEffect(() => {
      if (!installRequest) {
        setLoading(false);
        setUpdatedConfig({});
      }
    }, [installRequest]);

    const handleConfirm = useCallback(async () => {
      if (!canCreate || !canEdit || !installRequest || !schema) return;

      setLoading(true);
      try {
        // 合并原始配置和用户更新的配置
        const finalConfig = {
          ...schema.config,
          env: updatedConfig.env || schema.config.env,
          headers: updatedConfig.headers || schema.config.headers,
        };

        // 自定义插件：先测试连接获取真实的 manifest
        const testParams: McpConnectionParams = {
          connection: finalConfig,
          identifier,
          metadata: {
            avatar: schema.icon,
            description: schema.description,
          },
        };

        const testResult = await testMcpConnection(testParams);

        if (!testResult.success) {
          throw new Error(testResult.error || t('protocolInstall.messages.connectionTestFailed'));
        }

        if (!testResult.manifest) {
          throw new Error(t('protocolInstall.messages.manifestNotFound'));
        }

        // Third-party marketplace and custom MCP servers are added as custom connectors
        await installCustomMcpConnector({
          config: finalConfig,
          description: schema.description,
          icon: schema.icon,
          identifier: schema.identifier,
          name: schema.name,
        });
        await togglePlugin(schema.identifier, true);
        toast.success(t('protocolInstall.messages.installSuccess', { name: schema.name }));

        onComplete?.();
      } catch (error) {
        console.error('Plugin installation error:', error);
        toast.error(t('protocolInstall.messages.installError'));
        setLoading(false);
      }
    }, [
      installRequest,
      canCreate,
      canEdit,
      schema,
      updatedConfig,
      onComplete,
      installCustomMcpConnector,
      testMcpConnection,
      togglePlugin,
      t,
      identifier,
    ]);

    const handleCancel = useCallback(() => {
      onComplete?.();
    }, [onComplete]);

    if (!installRequest || !schema) return null;

    // 根据类型渲染不同的 Alert 组件
    const renderAlert = () => {
      const sourceAlert = !isMarketplace ? (
        <Alert
          showIcon
          title={t('protocolInstall.custom.security.description')}
          type="warning"
          variant={'borderless'}
        />
      ) : (
        <Alert
          showIcon
          title={t('protocolInstall.marketplace.unverified.warning')}
          type="warning"
          variant={'borderless'}
        />
      );

      return (
        <Flexbox gap={8}>
          {sourceAlert}
          {isStdioMcp && (
            <Alert
              showIcon
              description={t('protocolInstall.stdio.commandExecution.description')}
              title={t('protocolInstall.stdio.commandExecution.title')}
              type="warning"
              variant={'borderless'}
            />
          )}
        </Flexbox>
      );
    };

    const modalTitle = isMarketplace
      ? t('protocolInstall.marketplace.title')
      : t('protocolInstall.custom.title');

    const okText = isStdioMcp
      ? t('protocolInstall.actions.runCommandAndInstall')
      : isMarketplace
        ? t('protocolInstall.actions.install')
        : t('protocolInstall.actions.installAnyway');

    return (
      <ImperativeModal
        open
        confirmLoading={loading || testState.loading}
        okButtonProps={{ disabled: !canCreate || !canEdit }}
        okText={okText}
        title={modalTitle}
        width={680}
        onCancel={handleCancel}
        onOk={handleConfirm}
      >
        <Flexbox gap={24}>
          {renderAlert()}

          <Block horizontal gap={16} justify={'space-between'} padding={16} variant={'outlined'}>
            <Flexbox horizontal gap={16}>
              <PluginAvatar avatar={schema.icon} size={40} />
              <Flexbox gap={2}>
                <Flexbox horizontal align={'center'} gap={8}>
                  {schema.name}
                  <PluginTag type={'customPlugin'} />
                </Flexbox>
                <Text style={{ fontSize: 12 }} type={'secondary'}>
                  {schema.description}
                </Text>
              </Flexbox>
            </Flexbox>
          </Block>

          <Flexbox>
            <ConfigDisplay schema={schema} onConfigUpdate={setUpdatedConfig} />
            {/* 显示测试连接错误 */}
            {testState.error && (
              <Alert
                closable
                showIcon
                description={testState.error}
                title={t('protocolInstall.messages.connectionTestFailed')}
                type="error"
                variant={'filled'}
              />
            )}
          </Flexbox>
        </Flexbox>
      </ImperativeModal>
    );
  },
);

CustomPluginInstallModal.displayName = 'CustomPluginInstallModal';

export default CustomPluginInstallModal;
