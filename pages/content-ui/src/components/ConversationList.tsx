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
          onClick={() => onSelect(conversation.id)}
          className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
            activeId === conversation.id ? 'bg-gray-100 dark:bg-gray-700' : ''
          }`}>
          <div className="text-sm">{conversation.summary}</div>
        </li>
      ))}
    </ul>
  );
};
