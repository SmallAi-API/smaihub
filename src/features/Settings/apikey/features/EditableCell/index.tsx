'use client';

import { ActionIcon, Input, toast } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import dayjs from 'dayjs';
import { type Dayjs } from 'dayjs';
import { Check, Edit, X } from 'lucide-react';
import React, { memo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ApiKeyDatePicker from '../ApiKeyDatePicker';

// 内容类型定义
export type ContentType = 'text' | 'date';

// 组件Props接口定义
export interface EditableCellProps {
  /** 是否禁用编辑 */
  disabled?: boolean;
  /** 提交回调函数 */
  onSubmit: (value: string | Date | null) => void;
  /** 占位符文本 */
  placeholder?: string;
  /** 内容类型 */
  type: ContentType;
  /** 从数据库中查出的值，不管是什么类型，存进去的都是字符串 */
  value: string | null;
}

// Style definitions
const styles = stylex.create({
  actionButtons: {
    display: 'flex',
    flexShrink: 0,
    gap: '4px',
  },
  container: {
    position: 'relative',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    minHeight: '32px',
  },
  content: {
    minWidth: 0,
    lineHeight: 1.5,
    color: cssVar.colorText,
    wordBreak: 'break-all',
  },
  editButton: {
    opacity: { default: 0, [stylex.when.ancestor(':hover')]: 1 },
    transition: 'opacity 0.2s ease',
  },
  editingContainer: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    width: '100%',
  },
  inputWrapper: {
    flex: '1',
  },
});

// 主组件实现
const EditableCell = memo<EditableCellProps>(
  ({ value, type, onSubmit, placeholder, disabled = false }) => {
    const { t } = useTranslation('auth');

    // 编辑状态管理
    const [isEditing, setIsEditing] = useState(false);

    // Ref for the Input element
    const inputRef = useRef<HTMLInputElement>(null);

    // 格式化显示值
    const formatDisplayValue = (val: string | null) => {
      if (type === 'date' && val) {
        const date = dayjs(val);

        return date.isValid() ? date.format('YYYY-MM-DD') : val || placeholder || '';
      }

      return val || placeholder || '';
    };

    // 开始编辑
    const handleEdit = () => {
      if (disabled) return;

      setIsEditing(true);
    };

    // 提交编辑
    const handleSubmit = () => {
      if (type === 'text') {
        const inputValue = inputRef.current?.value;

        if (!inputValue) {
          toast.warning(t('apikey.validation.required'));
          return;
        }

        onSubmit(inputValue);
      }

      setIsEditing(false);
    };

    // 取消编辑
    const handleCancel = () => {
      setIsEditing(false);
    };

    // 输入框组件的键盘事件处理
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };

    // 日期选择器提交
    const handleDatePickerSubmit = (date: Dayjs | null) => {
      onSubmit(date && dayjs(date).toISOString());

      setIsEditing(false);
    };

    // 渲染编辑模式
    const renderEditMode = () => {
      switch (type) {
        case 'text': {
          return (
            <div {...stylex.props(styles.inputWrapper)}>
              <Input
                autoFocus
                defaultValue={value as string}
                placeholder={placeholder}
                ref={inputRef}
                onKeyDown={handleKeyDown}
              />
            </div>
          );
        }

        case 'date': {
          const dateValue = value && dayjs(value).isValid() ? dayjs(value) : null;

          return <ApiKeyDatePicker defaultValue={dateValue} onChange={handleDatePickerSubmit} />;
        }

        default: {
          return null;
        }
      }
    };

    // 文本类型的编辑模式，展示保存和取消按钮
    if (type === 'text' && isEditing) {
      return (
        <div {...stylex.props(styles.editingContainer)}>
          {renderEditMode()}
          <div {...stylex.props(styles.actionButtons)}>
            <ActionIcon icon={Check} size="small" onClick={handleSubmit} />
            <ActionIcon icon={X} size="small" onClick={handleCancel} />
          </div>
        </div>
      );
    }

    // 日期类型的编辑模式，展示日期选择器
    if (type === 'date' && isEditing) {
      return (
        <div {...stylex.props(styles.editingContainer)}>
          {renderEditMode()}
          <ActionIcon icon={X} size="small" onClick={handleCancel} />
        </div>
      );
    }

    // 展示模式
    return (
      <div {...stylex.props(styles.container, stylex.defaultMarker())}>
        <div {...stylex.props(styles.content)}>{formatDisplayValue(value)}</div>
        <ActionIcon
          className={stylex.props(styles.editButton).className}
          icon={Edit}
          size="small"
          onClick={handleEdit}
        />
      </div>
    );
  },
);

EditableCell.displayName = 'EditableCell';

export default EditableCell;
