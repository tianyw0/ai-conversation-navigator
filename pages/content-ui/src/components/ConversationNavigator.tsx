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
      className={`flex flex-col h-full overflow-y-auto border-r border-r-transparent ${
        currentTheme === 'dark' ? 'bg-[#212121] text-[#FFFFFF]' : 'bg-white text-[#0D0D0D]'
      }`}>
      <div className='p-4 font-medium border-b border-transparent'>对话导航</div>
      <ConversationList
        conversations={conversations}
        activeId={activeConversationId}
        theme={currentTheme}
        onSelect={handleSelect}
      />
    </div>
  );
};
