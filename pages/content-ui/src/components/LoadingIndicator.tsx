import React from 'react';
import { t } from '@extension/i18n';

export const LoadingIndicator: React.FC = () => {
  return (
    <div className='flex justify-center items-center h-full'>
      <div className='text-sm'>{t('loading')}</div>
    </div>
  );
};
