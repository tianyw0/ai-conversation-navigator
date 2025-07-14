import React, { useEffect } from 'react';
import { cn } from '@extension/ui';
import { PromptEntity } from '@src/types';

interface ItemProps {
  prompt: PromptEntity;
  isActive: boolean;
  index: number;
}

export const PromptItem: React.FC<ItemProps> = ({ prompt, isActive, index }) => {
  // jsx 中用到的函数
  const handleOnClickPrompt = (elementId: string) => {
    const element = document.querySelector(`[data-testid="${elementId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <li key={prompt.id} className='last:border-b-0'>
      <button
        type='button'
        onClick={() => handleOnClickPrompt(prompt.elementId)}
        className={cn(
          'w-full text-left p-2 cursor-pointer relative group rounded-[4px]',
          'focus:outline-none transition-all',
          'text-[14px] font-[400]',
          ' dark:text-[#FFFFFF] dark:hover:bg-[#2f2f2f] text-[#0D0D0D] hover:bg-[#E3E3E3]',
          isActive && 'font-bold dark:bg-[#2f2f2f] dark:hover:bg-[#212121] bg-[#DEDEDE] hover:bg-[#ECECEC]',
        )}
        data-testid={prompt.elementId}>
        <div
          className={cn('text-sm flex items-center overflow-hidden whitespace-nowrap text-overflow-ellipsis')}
          title={prompt.content}>
          <span className='mr-2 text-xs text-gray-400'>{index + 1}.</span>
          {prompt.summary}
        </div>
      </button>
    </li>
  );
};
