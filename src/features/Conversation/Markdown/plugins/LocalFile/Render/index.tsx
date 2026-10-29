import isEqual from 'fast-deep-equal';
import React, { memo } from 'react';

import { LocalFile } from '@/features/LocalFile';

import { useStartTopicConversation } from '../../../../hooks/useStartTopicConversation';
import { useOpenEditedFile } from '../../../../Messages/EditedFilesCard/useOpenEditedFile';
import { useConversationStore } from '../../../../store';
import { type MarkdownElementProps } from '../../type';

interface LocalFileProps {
  isDirectory: boolean;
  name: string;
  path: string;
}

const Render = memo<MarkdownElementProps<LocalFileProps>>(({ node }) => {
  // 从 node.properties 中提取属性
  const { name, path, isDirectory } = node?.properties || {};
  // Both share surfaces are read-only for the viewer. On the agent-share
  // visitor page this also matters on Electron: an interactive chip would let
  // a model/creator-controlled `<local_file path>` open a path on the
  // VISITOR's machine via `shell.openPath`.
  const isSharePage = useConversationStore(
    (s) => !!s.context.topicShareId || !!s.context.agentShareId,
  );
  const conversation = useStartTopicConversation();
  // Same reachability rules as the edited-files card: on web the file opens in
  // the portal only when the agent's bound device can serve the read.
  const resolveOpenFile = useOpenEditedFile();

  if (!name || !path) {
    // 如果缺少必要属性，可以选择渲染错误提示或 null
    console.error('LocalFile Render component missing required properties:', node?.properties);
    return null; // 或者返回一个错误占位符
  }

  // isDirectory 属性可能为 true (来自插件) 或 undefined，我们需要确保它是 boolean
  const isDir = isDirectory === true;
  const openInPortal = isDir
    ? undefined
    : resolveOpenFile({ kind: 'modified', path, sandboxBacked: false });

  return (
    <LocalFile
      conversation={conversation}
      isDirectory={isDir}
      name={name}
      openInPortal={openInPortal}
      path={path}
      readonly={isSharePage}
    />
  );
}, isEqual);

export default Render;
