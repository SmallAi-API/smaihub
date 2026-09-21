import { SKIP, visit } from 'unist-util-visit';

import { treeNodeToString } from './getNodeContent';

export interface RemarkCustomTagOptions {
  /**
   * Only parse the tag when it is the very first node of the document. Tags
   * appearing mid-document — including inline ones inside a paragraph — stay
   * as raw HTML / plain text instead of becoming a custom block.
   */
  leadingOnly?: boolean;
}

export const createRemarkCustomTagPlugin =
  (tag: string, options: RemarkCustomTagOptions = {}) =>
  () => {
    const leadingOnly = options.leadingOnly === true;

    return (tree: any) => {
      visit(tree, 'html', (node, index, parent) => {
        if (leadingOnly) {
          // Leading-only mode (e.g. the `think` tag): the tag is a leading block,
          // not an inline construct. Only an exact standalone open tag sitting at
          // the very head of the document is eligible — anything else (inline tag
          // inside a paragraph, or a block tag after other content) must stay raw
          // HTML so quoting `<think>` mid-message never renders a Thinking block.
          if (parent?.type !== 'root' || index !== 0) return;
          if (node.value !== `<${tag}>`) return;
        } else if (node.value !== `<${tag}>`) {
          return;
        }

        const startIndex = index as number;
        let endIndex = startIndex + 1;
        let hasCloseTag = false;

        // 查找闭合标签
        while (endIndex < parent.children.length) {
          const sibling = parent.children[endIndex];
          if (sibling.type === 'html' && sibling.value === `</${tag}>`) {
            hasCloseTag = true;
            break;
          }
          endIndex++;
        }

        // 计算需要删除的节点范围
        const deleteCount = hasCloseTag
          ? endIndex - startIndex + 1
          : parent.children.length - startIndex;

        // 提取内容节点
        const contentNodes = parent.children.slice(
          startIndex + 1,
          hasCloseTag ? endIndex : undefined,
        );

        // 转换为 Markdown 字符串

        const content = treeNodeToString(contentNodes);

        // 创建自定义节点
        const customNode = {
          data: {
            hChildren: [{ type: 'text', value: content }],
            hName: tag,
          },
          position: node.position,
          type: `${tag}Block`,
        };

        // 替换原始节点
        parent.children.splice(startIndex, deleteCount, customNode);

        // 跳过已处理的节点
        return [SKIP, startIndex + 1];
      });
    };
  };
