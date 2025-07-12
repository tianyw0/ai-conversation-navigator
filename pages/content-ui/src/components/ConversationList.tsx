import React, { useEffect } from 'react';
import type { ConversationItem } from '@extension/storage';
import { colorLog } from '@extension/dev-utils';
import { cn } from '@extension/ui';

interface Props {
  conversations: ConversationItem[];
  activePromptId: string | null;
  theme: 'light' | 'dark';
  onSelect: (id: string) => void;
}

export const ConversationList: React.FC<Props> = ({ conversations, activePromptId, theme, onSelect }) => {
  // 在 activeId 变化时，滚动到对应的 li 元素
  useEffect(() => {
    colorLog('ui-component::activeConversationId changed:' + activePromptId, 'info');
    if (activePromptId) {
      // 获取包含 shadow DOM 的宿主元素
      const shadowHost = document.querySelector('#ai-conversation-navigator-root');
      if (shadowHost && shadowHost.shadowRoot) {
        // 获取 shadowRoot
        const shadowRoot = shadowHost.shadowRoot;
        // 在 shadowRoot 中查找对应的按钮
        const activeButton = shadowRoot.querySelector(`button[data-testid='${activePromptId}']`);
        if (activeButton) {
          activeButton.scrollIntoView({
            behavior: 'smooth',
            block: 'center', // 使目标按钮居中显示
          });
        }
      }
    }
  }, [activePromptId]); // 只有 activeId 发生变化时触发

  return (
    <ul className='flex-1 overflow-y-auto'>
      {conversations.map((conversation, index) => {
        const isActive = activePromptId === conversation.elementId;
        const isDark = theme === 'dark';

        return (
          <li key={conversation.id} className='last:border-b-0'>
            <button
              type='button'
              onClick={() => onSelect(conversation.elementId)}
              className={cn(
                'w-full text-left px-2 py-2 cursor-pointer relative group rounded-[4px]',
                'focus:outline-none transition-all',
                'text-[14px] font-[400]',
                isActive &&
                  (isDark ? 'font-bold bg-[#2f2f2f] hover:bg-[#212121]' : 'font-bold bg-[#DEDEDE] hover:bg-[#ECECEC]'),
                isDark ? 'text-[#FFFFFF] hover:bg-[#2f2f2f]' : 'text-[#0D0D0D] hover:bg-[#E3E3E3]',
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
      })}
    </ul>
  );
};
