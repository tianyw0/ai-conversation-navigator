import React, { useEffect } from 'react';
import { cn } from '@extension/ui';
import { PromptEntity } from '@src/types';

interface ItemProps {
  conversation: PromptEntity;
  isActive: boolean;
  index: number;
  onSelect: (id: string) => void;
}

export const PromptItem: React.FC<ItemProps> = ({ conversation, isActive, index, onSelect }) => {
  return (
    <li key={conversation.id} className='last:border-b-0'>
      <button
        type='button'
        onClick={() => onSelect(conversation.elementId)}
        className={cn(
          'w-full text-left px-2 py-2 cursor-pointer relative group rounded-[4px]',
          'focus:outline-none transition-all',
          'text-[14px] font-[400]',
          ' dark:text-[#FFFFFF] dark:hover:bg-[#2f2f2f] text-[#0D0D0D] hover:bg-[#E3E3E3]',
          isActive && 'font-bold dark:bg-[#2f2f2f] dark:hover:bg-[#212121] bg-[#DEDEDE] hover:bg-[#ECECEC]',
        )}
        data-testid={conversation.elementId}>
        <div
          className={cn('text-sm flex items-center overflow-hidden whitespace-nowrap text-overflow-ellipsis')}
          title={conversation.content}>
          <span className='mr-2 text-xs text-gray-400'>{index + 1}.</span>
          {conversation.summary}
        </div>
      </button>
    </li>
  );
};
