'use client';

import { ComposioDetailProvider } from './ComposioDetailProvider';
import SkillDetailInner from './SkillDetailInner';

export interface ComposioSkillDetailContentProps {
  description?: string;
  icon?: string;
  identifier: string;
  label?: string;
  serverName: string;
}

export const ComposioSkillDetailContent = ({
  description,
  icon,
  identifier,
  label,
  serverName,
}: ComposioSkillDetailContentProps) => {
  return (
    <ComposioDetailProvider
      fallbackDescription={description}
      fallbackIcon={icon}
      fallbackLabel={label}
      identifier={identifier}
      serverName={serverName}
    >
      <SkillDetailInner type="composio" />
    </ComposioDetailProvider>
  );
};
