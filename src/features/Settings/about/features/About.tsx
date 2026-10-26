'use client';

import { BRANDING_NAME } from '@lobechat/business-const';
import { Flexbox } from '@lobehub/ui';
import { Form } from '@lobehub/ui/form';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import Version from './Version';

const About = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { t } = useTranslation('common');

  return (
    <Form.Group
      collapsible={false}
      style={{ maxWidth: '1024px', width: '100%' }}
      title={`${t('about')} ${BRANDING_NAME}`}
      variant={'filled'}
    >
      <Flexbox paddingBlock={20} width={'100%'}>
        <Version mobile={mobile} />
      </Flexbox>
    </Form.Group>
  );
});

export default About;
