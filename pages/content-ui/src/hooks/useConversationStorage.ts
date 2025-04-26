import { useState, useEffect } from 'react';
import { createConversationPageStorage, type ConversationPageData } from '@extension/storage';

export const useConversationStorage = () => {
  const [data, setData] = useState<ConversationPageData>({
    pageId: '',
    conversations: [],
    activeConversationId: null,
    currentTheme: 'light',
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

    // 监听 URL 变化（包括历史记录的前进后退和 pushState）
    const handlePopState = () => {
      console.log('URL changed (popstate)');
      unsubscribe();
      updateStorage(); // 更新存储
    };

    // 自定义事件名称
    const urlChangeEvent = new Event('urlChange');

    // 重写 pushState 和 replaceState，监听 SPA 中的动态 URL 变化
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    // 重写 pushState
    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      window.dispatchEvent(urlChangeEvent); // 触发自定义事件
    };

    // 重写 replaceState
    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      window.dispatchEvent(urlChangeEvent); // 触发自定义事件
    };

    // 添加 popstate 和自定义事件监听器
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('urlChange', handlePopState);

    // 清理副作用：移除事件监听器和取消订阅
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('urlChange', handlePopState);
      unsubscribe();
    };
  }, []); // 空依赖数组确保只在初始加载时运行一次

  return data; // 返回当前存储的数据
};
