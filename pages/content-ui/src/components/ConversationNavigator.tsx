import React from 'react';
import { useConversationStorage } from '../hooks/useConversationStorage';
import { ConversationList } from './ConversationList';

export const ConversationNavigator: React.FC = () => {
  const { conversations, activeConversationId, currentTheme } = useConversationStorage();
  const handleSelect = (id: string) => {
    const element = document.querySelector(`[data-testid="${id}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      className={`flex flex-col h-full overflow-y-auto ${
        currentTheme === 'dark'
          ? 'bg-[#171717] text-white border-r border-r-[rgba(255,255,255,0.08)]'
          : 'bg-[#0D0D0D] text-black border-r border-r-[rgba(0,0,0,0.08)]'
      }`}>
      <div className='p-4 font-medium border-b border-gray-200 dark:border-gray-700'>对话导航</div>
      <ConversationList conversations={conversations} activeId={activeConversationId} onSelect={handleSelect} />
    </div>
  );
};
