import React from 'react';
import type { ConversationItem } from '@extension/storage';

interface Props {
  conversations: ConversationItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export const ConversationList: React.FC<Props> = ({ conversations, activeId, onSelect }) => {
  return (
    <ul className="flex-1 overflow-y-auto">
      {conversations.map(conversation => (
        <li
          key={conversation.id}
          className={`
            border-b 
            border-gray-200 dark:border-[#23272f]
            last:border-b-0
          `}>
          <button
            type="button"
            onClick={() => onSelect(conversation.id)}
            className={`
              w-full text-left px-4 py-2 cursor-pointer
              hover:bg-gray-100 dark:hover:bg-[#23272f]
              focus:outline-none
              ${activeId === conversation.id ? 'bg-gray-100 dark:bg-gray-700' : ''}
            `}
            data-testid={conversation.id}>
            <div className="text-sm">{conversation.summary}</div>
          </button>
        </li>
      ))}
    </ul>
  );
};
