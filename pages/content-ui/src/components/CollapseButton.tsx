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
      title={expand ? t('expand') : t('collapse')}>
      <svg
        className={cn('w-4 h-4 transform transition-transform', !expand && 'rotate-180')}
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'>
        <path d='M15 19l-7-7 7-7' />
      </svg>
    </button>
  );
};
