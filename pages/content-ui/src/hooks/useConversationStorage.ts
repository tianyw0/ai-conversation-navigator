import { useState, useEffect } from 'react';
import { createConversationPageStorage, type ConversationPageData } from '@extension/storage';
import { colorLog } from '@extension/dev-utils';

export const useConversationStorage = () => {
  const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const [data, setData] = useState<ConversationPageData>({
    pageId: '',
    conversations: [],
    activeConversationId: null,
    currentTheme: currentTheme,
  });

  useEffect(() => {
    // 更新存储的函数
    const updateStorage = () => {
      const pageId = window.location.pathname; // 获取当前页面的路径
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

      return unsubscribe; // 返回取消订阅的函数
    };

    // 初始时订阅数据
    const unsubscribe = updateStorage();
    colorLog('ui-hooks::useConversationStorage::unsubscribe:' + unsubscribe, 'info');

    // 定时器的状态
    let lastUrl = window.location.pathname;

    // 每秒检查一次 URL 是否发生变化
    const intervalId = setInterval(() => {
      const currentUrl = window.location.pathname;
      if (currentUrl !== lastUrl) {
        colorLog('ui-hooks::URL changed:' + currentUrl, 'info');
        unsubscribe(); // 先取消之前的订阅
        lastUrl = currentUrl; // 更新最后检查过的 URL
        updateStorage(); // 更新存储
      }
    }, 1000);

    // 清理副作用：移除定时器和取消订阅
    return () => {
      clearInterval(intervalId);
      unsubscribe();
    };
  }, []);

  return data; // 返回当前存储的数据
};
