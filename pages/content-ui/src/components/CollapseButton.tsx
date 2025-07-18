import React from 'react';
import { t } from '@extension/i18n';
import { cn } from '@extension/ui';

interface CollapseButtonProps {
  expand: boolean;
  onToggle: (newState: boolean) => void;
}

export const CollapseButton: React.FC<CollapseButtonProps> = ({ expand, onToggle }) => {
  const handleClick = () => {
    onToggle(!expand); // 将新的状态传递给父组件
  };
  return (
    <button
      onClick={handleClick}
      className={cn('p-1 rounded flex items-center justify-center dark:hover:bg-gray-700 hover:bg-gray-200')}
      title={expand ? t('collapse') : t('expand')}>
      {expand ? (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='16'
          height='16'
          fill='currentColor'
          className='bi bi-layout-sidebar-inset-reverse text-[#8F8F8F] dark:text-[#AFAFAF]'
          viewBox='0 0 16 16'>
          <path d='M2 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2zm12-1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h12z' />
          <path d='M13 4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V4z' />
        </svg>
      ) : (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='16'
          height='16'
          fill='currentColor'
          className='bi bi-layout-sidebar-inset text-[#8F8F8F] dark:text-[#AFAFAF]'
          viewBox='0 0 16 16'>
          <path d='M14 2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h12zM2 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H2z' />
          <path d='M3 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4z' />
        </svg>
      )}
    </button>
  );
};
