import React, { useState } from 'react';
import { useConversationStorage } from '../hooks/useConversationStorage';
import { ConversationList } from './ConversationList';
import { t } from '@extension/i18n';

export const ConversationNavigator: React.FC = () => {
  const { pageId, conversations, activeConversationId, currentTheme } = useConversationStorage();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSelect = (id: string) => {
    const element = document.querySelector(`[data-testid="${id}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 如果 pageId 为 '/'，则不渲染 UI
  if (pageId === '/') {
    return null;
  }

  // 判断是否有数据
  const isLoading = !conversations || conversations.length === 0;
  return (
    <div
      className={`flex flex-col h-full ${isCollapsed ? 'w-10' : ''} transition-all duration-300 overflow-y-auto border-r border-r-transparent ${
        currentTheme === 'dark' ? 'bg-[#212121] text-[#FFFFFF]' : 'bg-white text-[#0D0D0D]'
      }`}>
      <div className='flex justify-between items-center p-2 font-normal border-b border-transparent'>
        {!isCollapsed && <span>{t('conversation_navigator')}</span>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1 rounded ${currentTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
          title={isCollapsed ? t('expand') : t('collapse')}>
          <svg
            className={`w-4 h-4 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'>
            <path d='M15 19l-7-7 7-7' />
          </svg>
        </button>
      </div>

      {!isCollapsed &&
        (isLoading ? (
          <div className='flex justify-center items-center h-full'>
            <div className='text-sm'>{t('loading')}</div>
          </div>
        ) : (
          <ConversationList
            conversations={conversations}
            activeId={activeConversationId}
            theme={currentTheme}
            onSelect={handleSelect}
          />
        ))}
    </div>
  );
};
