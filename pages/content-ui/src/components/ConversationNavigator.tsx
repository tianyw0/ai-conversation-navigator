import React, { useState } from 'react';
import { useConversationStorage } from '../hooks/useConversationStorage';
import { ConversationList } from './ConversationList';
import { t } from '@extension/i18n';
import { cn } from '@extension/ui';

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

  const isDarkTheme = currentTheme === 'dark';

  return (
    <div
      className={cn(
        'absolute left-0 top-[56px]',
        isCollapsed
          ? 'w-[40px] h-[40px] p-0 overflow-hidden'
          : 'w-[260px] max-h-[calc(100vh-190px)] px-2 py-1 overflow-auto',
        'flex flex-col rounded transition-all duration-300 ease-in-out',
        'border-r border-r-transparent',
        isDarkTheme ? 'bg-[#212121] text-[#FFFFFF]' : 'bg-white text-[#0D0D0D]',
      )}>
      <div
        className={cn(
          'flex justify-between items-center',
          isCollapsed ? 'p-0 w-[40px] h-[40px] border-none' : 'p-2 font-normal border-b border-transparent',
        )}>
        {!isCollapsed && <span>{t('conversation_navigator')}</span>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            isCollapsed ? 'w-[40px] h-[40px]' : 'p-1',
            'rounded flex items-center justify-center',
            isDarkTheme ? 'hover:bg-gray-700' : 'hover:bg-gray-200',
          )}
          title={isCollapsed ? t('expand') : t('collapse')}>
          <svg
            className={cn('w-4 h-4 transform transition-transform', isCollapsed && 'rotate-180')}
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'>
            <path d='M15 19l-7-7 7-7' />
          </svg>
        </button>
      </div>

      {!isCollapsed && (
        <div className='flex-1'>
          {isLoading ? (
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
          )}
        </div>
      )}
    </div>
  );
};
