import { useState, useEffect } from 'react';
import { createConversationPageStorage, type ConversationPageData } from '@extension/storage';

export const useConversationStorage = () => {
  const [data, setData] = useState<ConversationPageData>({
    conversations: [],
    activeConversationId: null,
    currentTheme: 'light',
  });

  useEffect(() => {
    const pageId = window.location.pathname;
    const storage = createConversationPageStorage(pageId);

    // 只订阅数据变化
    const unsubscribe = storage.subscribe(() => {
      // 当数据变化时，重新获取最新数据
      storage.get().then(newData => {
        setData(newData);
      });
    });

    // 获取当前数据状态
    storage.get().then(setData);

    return () => {
      unsubscribe();
    };
  }, []);

  return data;
};
