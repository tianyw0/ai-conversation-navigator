import React, { useEffect } from 'react';
import type { ConversationItem } from '@extension/storage';

interface Props {
  conversations: ConversationItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export const ConversationList: React.FC<Props> = ({ conversations, activeId, onSelect }) => {
  // 在 activeId 变化时，滚动到对应的 li 元素
  useEffect(() => {
    console.log('activeId changed:', activeId);
    if (activeId) {
      // 获取包含 shadow DOM 的宿主元素
      const shadowHost = document.querySelector('#ai-conversation-navigator-root');
      if (shadowHost && shadowHost.shadowRoot) {
        // 获取 shadowRoot
        const shadowRoot = shadowHost.shadowRoot;
        // 在 shadowRoot 中查找对应的按钮
        const activeButton = shadowRoot.querySelector(`button[data-testid='${activeId}']`);
        if (activeButton) {
          activeButton.scrollIntoView({
            behavior: 'smooth',
            block: 'center', // 使目标按钮居中显示
          });
        }
      }
    }
  }, [activeId]); // 只有 activeId 发生变化时触发

  return (
    <ul className='flex-1 overflow-y-auto'>
      {conversations.map((conversation, index) => {
        const isActive = activeId === conversation.elementId;
        return (
          <li key={conversation.id} className='last:border-b-0'>
            <button
              type='button'
              onClick={() => onSelect(conversation.elementId)}
              className={`
                w-full text-left px-8 py-2 cursor-pointer relative group rounded-[4px]
                focus:outline-none transition-all
                ${
                  isActive
                    ? 'bg-[#2F2F2F] dark:bg-[#2F2F2F] font-bold'
                    : 'hover:bg-[#2F2F2F] dark:hover:bg-[#2F2F2F] font-normal'
                }
                ${isActive ? 'dark:bg-[#2F2F2F] dark:text-white' : 'dark:text-white dark:text-14px'}
                ${isActive ? 'hover:text-500' : 'hover:text-500'}
                `}
              data-testid={conversation.elementId}>
              <div className={`text-sm flex items-center`}>
                <span className='mr-2 text-xs text-gray-400 dark:text-gray-500'>{index + 1}.</span>
                {conversation.summary}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
};
