'use client';

import { Button, Flexbox, Text } from '@lobehub/ui';
import { createModal, type ModalInstance, useModalContext } from '@lobehub/ui/base-ui';
import { cssVar } from 'antd-style';
import { Apple } from 'lucide-react';
import { memo } from 'react';

interface MacGuideContentProps {
  confirmText: string;
  desc: string;
  onConfirm: () => void;
  steps: string[];
}

const MacGuideContent = memo<MacGuideContentProps>(({ confirmText, desc, onConfirm, steps }) => {
  const { close } = useModalContext();

  const handleConfirm = () => {
    onConfirm();
    close();
  };

  return (
    <Flexbox gap={16}>
      <Text style={{ fontSize: 14, lineHeight: 1.6 }} type={'secondary'}>
        {desc}
      </Text>
      <Flexbox gap={12}>
        {steps.map((step, index) => (
          <Flexbox horizontal align={'flex-start'} gap={12} key={index}>
            <div
              style={{
                alignItems: 'center',
                background: cssVar.colorPrimaryBg,
                borderRadius: '50%',
                color: cssVar.colorPrimary,
                display: 'flex',
                flexShrink: 0,
                fontSize: 13,
                fontWeight: 600,
                height: 24,
                justifyContent: 'center',
                width: 24,
              }}
            >
              {index + 1}
            </div>
            <Text style={{ fontSize: 14, lineHeight: 1.6, paddingTop: 1 }}>{step}</Text>
          </Flexbox>
        ))}
      </Flexbox>
      <Flexbox horizontal gap={8} justify={'flex-end'}>
        <Button type={'primary'} onClick={handleConfirm}>
          {confirmText}
        </Button>
      </Flexbox>
    </Flexbox>
  );
});

MacGuideContent.displayName = 'MacGuideContent';

export interface CreateMacGuideModalOptions {
  confirmText: string;
  desc: string;
  onConfirm: () => void;
  steps: string[];
  title: string;
}

export const createMacGuideModal = ({
  confirmText,
  desc,
  onConfirm,
  steps,
  title,
}: CreateMacGuideModalOptions): ModalInstance =>
  createModal({
    content: (
      <MacGuideContent confirmText={confirmText} desc={desc} steps={steps} onConfirm={onConfirm} />
    ),
    footer: null,
    maskClosable: true,
    title: (
      <Flexbox horizontal align={'center'} gap={8}>
        <Apple size={20} />
        {title}
      </Flexbox>
    ),
    width: 480,
  });
