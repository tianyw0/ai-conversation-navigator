import type { BaseStorage } from '../base/index.js';
import { createStorage, StorageEnum } from '../base/index.js';

// 定义对话项的数据结构
export type ConversationItem = {
  // 唯一标识符，用于定位和跳转
  id: number;
  // 对话元素的DOM ID，用于定位元素
  elementId: string;
  // 对话内容的摘要，显示在导航目录中
  summary: string;
  // 完整的对话内容
  content: string;
};

// 定义页面存储的数据结构
export type ConversationPageData = {
  // 页面ID，用于唯一标识页面
  pageId: string;
  // 对话列表
  conversations: ConversationItem[];
  // 当前活跃的对话ID
  activeConversationId: string | null;
  // 主题设置 - 简化为只保留当前主题
  currentTheme: 'light' | 'dark';
};

// 扩展基础存储类型，添加特定于对话导航的方法
export type ConversationPageStorage = BaseStorage<ConversationPageData> & {
  // 添加新的对话项
  addConversation: (item: ConversationItem) => Promise<void>;
  // 根据ID获取特定对话项
  getConversationById: (id: number) => Promise<ConversationItem | undefined>;
  // 清空所有对话项
  clearAllConversations: () => Promise<void>;
  // 设置当前活跃的对话ID
  setActiveConversationId: (id: string | null) => Promise<void>;
  // 设置当前主题
  setCurrentTheme: (theme: 'light' | 'dark') => Promise<void>;
  // 获取当前对话列表
  getAllConversations: () => Promise<ConversationItem[]>;
};

// 创建页面存储工厂函数
export function createConversationPageStorage(pageId: string): ConversationPageStorage {
  // 使用页面ID创建唯一的存储键
  const storageKey = `conversation-page-storage-${pageId}`;

  // 默认数据
  const defaultData: ConversationPageData = {
    pageId,
    conversations: [],
    activeConversationId: null,
    currentTheme: 'light',
  };

  // 创建存储实例
  const storage = createStorage<ConversationPageData>(storageKey, defaultData, {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  });

  // lock 解决并发问题
  let updateInProgress = false;
  // 返回带有扩展方法的存储对象
  return {
    ...storage,

    addConversation: async (item: ConversationItem) => {
      if (updateInProgress) {
        console.log('已有更新在进行，等待...');
        await new Promise(resolve => {
          const interval = setInterval(() => {
            if (!updateInProgress) {
              clearInterval(interval);
              resolve(null);
            }
          }, 100); // 每 100 毫秒检查一次是否可以开始更新
        });
      }

      // 设置更新标志为 true，表示有更新在进行
      updateInProgress = true;
      try {
        await storage.set(current => {
          const conversations = current.conversations || [];
          const existingIndex = conversations.findIndex(existing => existing.id === item.id);
          let updatedConversations;
          if (existingIndex >= 0) {
            updatedConversations = [...conversations];
            updatedConversations[existingIndex] = item;
          } else {
            updatedConversations = [...conversations, item];
          }
          // 排序
          updatedConversations.sort((a, b) => {
            return Number(a.id) - Number(b.id); // 按 id 升序排序，最新的在最后
          });

          return {
            ...current,
            conversations: updatedConversations,
          };
        });
      } catch (error) {
        console.error('更新操作失败:', error);
      } finally {
        // 更新完成，重置锁
        updateInProgress = false;
      }
    },

    // 根据ID获取特定对话项
    getConversationById: async (id: number) => {
      const data = await storage.get();
      return data.conversations.find(item => item.id === id);
    },

    // 清空所有对话项
    clearAllConversations: async () => {
      await storage.set(current => ({
        ...current,
        conversations: [],
      }));
    },

    // 设置当前活跃的对话ID
    setActiveConversationId: async (id: string | null) => {
      await storage.set(current => ({
        ...current,
        activeConversationId: id,
      }));
    },

    // 设置当前主题
    setCurrentTheme: async (theme: 'light' | 'dark') => {
      await storage.set(current => ({
        ...current,
        currentTheme: theme,
      }));
    },
    // 获取当前对话列表
    getAllConversations: async () => {
      const data = await storage.get();
      return data.conversations;
    },
  };
}
