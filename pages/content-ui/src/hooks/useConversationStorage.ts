import { useState, useEffect, useCallback, useRef } from 'react';
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

  // 使用 ref 存储当前的存储实例和取消订阅函数
  const storageRef = useRef<{
    storage: ReturnType<typeof createConversationPageStorage> | null;
    unsubscribe: (() => void) | null;
  }>({
    storage: null,
    unsubscribe: null,
  });
  // 创建更新存储的函数
  const updateStorage = useCallback((pageId: string) => {
    // 清理旧的订阅
    if (storageRef.current.unsubscribe) {
      storageRef.current.unsubscribe();
    }

    // 创建新的存储实例
    const storage = createConversationPageStorage(pageId);
    storageRef.current.storage = storage;
    // 订阅数据变化
    const unsubscribe = storage.subscribe(() => {
      storage.get().then(newData => {
        setData(newData);
        colorLog(`ui-hooks::数据更新 (页面: ${pageId})`, 'info');
      });
    });

    storageRef.current.unsubscribe = unsubscribe;
    // 获取初始数据
    storage.get().then(newData => {
      setData(newData);
      colorLog(`ui-hooks::初始数据加载 (页面: ${pageId})`, 'info');
    });

    return unsubscribe;
  }, []);

  // 处理 URL 变化的函数
  const handleUrlChange = useCallback(
    (newPageId: string) => {
      colorLog(`ui-hooks::URL 变化到: ${newPageId}`, 'info');
      updateStorage(newPageId);
    },
    [updateStorage],
  );

  useEffect(() => {
    // 初始化存储
    const initialPageId = window.location.pathname;
    updateStorage(initialPageId);

    // 不再需要监听 URL 变化，因为已经在 index.tsx 中处理了
    // 只保留主题监听
    const observer = new MutationObserver(() => {
      if (storageRef.current.storage) {
        const currentPageId = window.location.pathname;
        if (currentPageId !== data.pageId) {
          handleUrlChange(currentPageId);
        }
      }
    });

    // 观察主要内容区域的变化
    const mainContent = document.querySelector('#__next, main, [role="main"]');
    if (mainContent) {
      observer.observe(mainContent, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      observer.disconnect();
      if (storageRef.current.unsubscribe) {
        storageRef.current.unsubscribe();
      }
    };
  }, [handleUrlChange, updateStorage, data.pageId]);

  // 监听主题变化
  useEffect(() => {
    const themeObserver = new MutationObserver(() => {
      const newTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      if (newTheme !== data.currentTheme && storageRef.current.storage) {
        storageRef.current.storage.setCurrentTheme(newTheme);
      }
    });

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => themeObserver.disconnect();
  }, [data.currentTheme]);

  return data;
};
