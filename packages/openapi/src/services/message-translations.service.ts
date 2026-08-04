import { and, eq, type SQL } from 'drizzle-orm';

import { messages, messageTranslates } from '@/database/schemas';
import type { LobeChatDatabase } from '@/database/type';
import { buildMessageChildScopeWhere, buildMessageScopeWhere } from '@/database/utils/messageScope';

import { BaseService } from '../common/base.service';
import { removeSystemContext } from '../helpers/translate';
import type { ServiceResult } from '../types';
import type {
  MessageTranslateInfoUpdate,
  MessageTranslateResponse,
  MessageTranslateTriggerRequest,
} from '../types/message-translations.type';
import { ChatService } from './chat.service';

type MessageTranslateItem = typeof messageTranslates.$inferSelect;

export class MessageTranslateService extends BaseService {
  constructor(db: LobeChatDatabase, userId: string | null, workspaceId?: string) {
    super(db, userId, workspaceId);
  }

  /**
   * Message scope is derived from the owning topic/session — the snapshot
   * `user_id`/`workspace_id` columns go stale after agent transfers, on both
   * `messages` and `message_translates`.
   */
  private messageScopeWhere(): SQL {
    return buildMessageScopeWhere({ userId: this.userId, workspaceId: this.workspaceId });
  }

  private translateScopeWhere(): SQL {
    return buildMessageChildScopeWhere(
      { userId: this.userId, workspaceId: this.workspaceId },
      messageTranslates.id,
    );
  }

  /**
   * Get translation info by message ID
   * @param messageId Message ID
   * @returns Translation info
   */
  async getTranslateByMessageId(messageId: string): ServiceResult<MessageTranslateResponse | null> {
    // 权限检查已在路由层完成 (MESSAGE_READ + TRANSLATION_READ)

    this.log('info', '根据消息ID获取翻译信息', { messageId, userId: this.userId });

    try {
      // Plain select instead of RQB findFirst: RQB aliases the table, which
      // breaks the correlated EXISTS inside translateScopeWhere().
      const [result] = await this.db
        .select()
        .from(messageTranslates)
        .where(and(eq(messageTranslates.id, messageId), this.translateScopeWhere()))
        .limit(1);

      if (!result) {
        this.log('info', '未找到翻译信息', { messageId });
        return null;
      }

      const response: MessageTranslateResponse = {
        clientId: result.clientId,
        content: result.content,
        from: result.from,
        id: result.id,
        to: result.to,
        userId: result.userId,
      };

      this.log('info', '获取翻译信息完成', { messageId });
      return response;
    } catch (error) {
      this.handleServiceError(error, '根据消息ID获取翻译信息');
    }
  }

  /**
   * 创建或更新消息翻译
   * @param translateData 翻译数据
   * @returns 翻译结果
   */
  async translateMessage(
    translateData: MessageTranslateTriggerRequest,
  ): ServiceResult<Partial<MessageTranslateItem>> {
    // 权限检查已在路由层完成 (MESSAGE_READ + TRANSLATION_CREATE)

    this.log('info', '开始翻译消息', {
      ...translateData,
      userId: this.userId,
    });

    try {
      // 首先获取原始消息内容和 sessionId
      const messageInfo = await this.db.query.messages.findFirst({
        where: and(eq(messages.id, translateData.messageId), this.messageScopeWhere()),
      });

      if (!messageInfo) {
        throw this.createCommonError('未找到要翻译的消息');
      }

      this.log('info', '原始消息内容', { originalMessage: messageInfo.content });

      // Use ChatService for translation, passing sessionId to use the correct model configuration
      const chatService = new ChatService(this.db, this.userId, this.workspaceId);
      const translatedContent = await chatService.translate({
        ...translateData,
        sessionId: messageInfo.sessionId,
        text: removeSystemContext(messageInfo.content),
      });

      // 使用 updateTranslateInfo 来更新翻译内容
      return this.updateTranslateInfo({
        from: translateData.from,
        messageId: translateData.messageId,
        to: translateData.to,
        content: translatedContent,
      });
    } catch (error) {
      this.handleServiceError(error, '翻译消息');
    }
  }

  /**
   * 更新消息翻译信息
   * @param data 翻译信息更新数据
   * @returns 更新后的翻译结果
   */
  async updateTranslateInfo(
    data: MessageTranslateInfoUpdate,
  ): ServiceResult<Partial<MessageTranslateItem>> {
    // 权限检查已在路由层完成 (MESSAGE_UPDATE + TRANSLATION_UPDATE)

    try {
      // 检查消息是否存在
      const messageInfo = await this.db.query.messages.findFirst({
        where: and(eq(messages.id, data.messageId), this.messageScopeWhere()),
      });
      if (!messageInfo) {
        throw this.createCommonError('未找到要更新翻译信息的消息');
      }

      // 更新翻译信息和内容
      await this.db
        .insert(messageTranslates)
        .values({
          content: data.content,
          from: data.from,
          id: data.messageId,
          to: data.to,
          ...this.buildWorkspacePayload({}),
        })
        .onConflictDoUpdate({
          set: {
            content: data.content,
            from: data.from,
            to: data.to,
          },
          target: messageTranslates.id,
        });

      this.log('info', '更新翻译信息完成', { messageId: data.messageId });

      return {
        content: data.content,
        from: data.from,
        id: data.messageId,
        to: data.to,
        userId: this.userId,
      };
    } catch (error) {
      this.handleServiceError(error, '更新翻译信息');
    }
  }

  /**
   * 删除指定消息的翻译信息
   * @param messageId 消息ID
   * @returns 删除结果
   */
  async deleteTranslateByMessageId(
    messageId: string,
  ): ServiceResult<{ deleted: boolean; messageId: string }> {
    // 权限检查已在路由层完成 (TRANSLATION_DELETE)

    try {
      // Check if the translation message exists
      const [originalTranslation] = await this.db
        .select()
        .from(messageTranslates)
        .where(and(eq(messageTranslates.id, messageId), this.translateScopeWhere()))
        .limit(1);

      if (!originalTranslation) {
        throw this.createNotFoundError('翻译消息不存在');
      }

      await this.db
        .delete(messageTranslates)
        .where(and(eq(messageTranslates.id, messageId), this.translateScopeWhere()));

      return { deleted: true, messageId };
    } catch (error) {
      this.handleServiceError(error, '删除翻译信息');
    }
  }
}
