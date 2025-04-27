import React from 'react';
import { useConversationStorage } from '../hooks/useConversationStorage';
import { ConversationList } from './ConversationList';
import { t } from '@extension/i18n';

export const ConversationNavigator: React.FC = () => {
  const { pageId, conversations, activeConversationId, currentTheme } = useConversationStorage();

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
      className={`flex flex-col h-full overflow-y-auto border-r border-r-transparent ${
        currentTheme === 'dark' ? 'bg-[#212121] text-[#FFFFFF]' : 'bg-white text-[#0D0D0D]'
      }`}>
      <div className='p-2 font-normal border-b border-transparent'>对话导航</div>

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
  );
};
