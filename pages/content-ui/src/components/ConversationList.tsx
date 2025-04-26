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
          <li
            key={conversation.id}
            className={`
              border-b 
              border-gray-200 dark:border-[#23272f]
              last:border-b-0
            `}>
            <button
              type='button'
              onClick={() => onSelect(conversation.elementId)}
              className={`
                w-full text-left px-4 py-2 cursor-pointer relative
                group
                hover:bg-gray-100 dark:hover:bg-gray-700
                hover:font-semibold
                ${isActive ? 'bg-gray-200 dark:bg-gray-800 font-bold' : ''}
                ${isActive ? 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-blue-500 before:rounded-r' : ''}
                ${!isActive ? 'hover:before:absolute hover:before:left-0 hover:before:top-0 hover:before:bottom-0 hover:before:w-1 hover:before:bg-blue-400 dark:hover:before:bg-blue-500 hover:before:rounded-r' : ''}
                focus:outline-none
                transition-all
              `}
              data-testid={conversation.elementId}>
              <div className={`text-sm flex items-center ${isActive ? 'font-bold' : ''}`}>
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
