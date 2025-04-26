import type { BaseStorage } from '../base/index.js';
import { createStorage, StorageEnum } from '../base/index.js';

// 定义对话项的数据结构
export type ConversationItem = {
  // 唯一标识符，用于定位和跳转
  id: string;
  // 对话元素的DOM ID，用于定位元素
  elementId: string;
  // 对话内容的摘要，显示在导航目录中
  summary: string;
  // 完整的对话内容
  content: string;
  // 创建时间
  timestamp: number;
};

// 定义页面存储的数据结构
export type ConversationPageData = {
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
  getConversationById: (id: string) => Promise<ConversationItem | undefined>;
  // 清空所有对话项
  clearAllConversations: () => Promise<void>;
  // 设置当前活跃的对话ID
  setActiveConversationId: (id: string | null) => Promise<void>;
  // 设置当前主题
  setCurrentTheme: (theme: 'light' | 'dark') => Promise<void>;
};

// 创建页面存储工厂函数
export function createConversationPageStorage(pageId: string): ConversationPageStorage {
  // 使用页面ID创建唯一的存储键
  const storageKey = `conversation-page-storage-${pageId}`;

  // 默认数据
  const defaultData: ConversationPageData = {
    conversations: [],
    activeConversationId: null,
    currentTheme: 'light',
  };

  // 创建存储实例
  const storage = createStorage<ConversationPageData>(storageKey, defaultData, {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  });

  // 返回带有扩展方法的存储对象
  return {
    ...storage,

    // 添加新的对话项
    addConversation: async (item: ConversationItem) => {
      await storage.set(current => {
        const existingIndex = current.conversations.findIndex(existing => existing.id === item.id);

        if (existingIndex >= 0) {
          // 更新现有项
          const updatedConversations = [...current.conversations];
          updatedConversations[existingIndex] = item;
          updatedConversations.sort((a, b) => {
            const getIdNum = (id: string) => {
              const match = id.match(/(\d+)$/);
              return match ? parseInt(match[1], 10) : 0;
            };
            return getIdNum(a.id) - getIdNum(b.id);
          });
          return {
            ...current,
            conversations: updatedConversations,
          };
        } else {
          // 添加新项
          const newConversations = [...current.conversations, item].sort((a, b) => {
            const getIdNum = (id: string) => {
              const match = id.match(/(\d+)$/);
              return match ? parseInt(match[1], 10) : 0;
            };
            return getIdNum(a.id) - getIdNum(b.id);
          });
          return {
            ...current,
            conversations: newConversations,
          };
        }
      });
    },

    // 根据ID获取特定对话项
    getConversationById: async (id: string) => {
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
  };
}

// 创建一个全局存储实例，用于共享数据
const globalStorageKey = 'conversation-global-storage';
const defaultGlobalData: ConversationPageData = {
  conversations: [],
  activeConversationId: null,
  currentTheme: 'light',
};

const globalStorage = createStorage<ConversationPageData>(globalStorageKey, defaultGlobalData, {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

// 导出全局存储对象
export const globalConversationStorage: ConversationPageStorage = {
  ...globalStorage,

  // 添加新的对话项
  addConversation: async (item: ConversationItem) => {
    await globalStorage.set(current => {
      const existingIndex = current.conversations.findIndex(existing => existing.id === item.id);

      if (existingIndex >= 0) {
        // 更新现有项
        const updatedConversations = [...current.conversations];
        updatedConversations[existingIndex] = item;
        updatedConversations.sort((a, b) => {
          const getIdNum = (id: string) => {
            const match = id.match(/(\d+)$/);
            return match ? parseInt(match[1], 10) : 0;
          };
          return getIdNum(a.id) - getIdNum(b.id);
        });
        return {
          ...current,
          conversations: updatedConversations,
        };
      } else {
        // 添加新项
        const newConversations = [...current.conversations, item].sort((a, b) => {
          const getIdNum = (id: string) => {
            const match = id.match(/(\d+)$/);
            return match ? parseInt(match[1], 10) : 0;
          };
          return getIdNum(a.id) - getIdNum(b.id);
        });
        return {
          ...current,
          conversations: newConversations,
        };
      }
    });
  },

  // 根据ID获取特定对话项
  getConversationById: async (id: string) => {
    const data = await globalStorage.get();
    return data.conversations.find(item => item.id === id);
  },

  // 清空所有对话项
  clearAllConversations: async () => {
    await globalStorage.set(current => ({
      ...current,
      conversations: [],
    }));
  },

  // 设置当前活跃的对话ID
  setActiveConversationId: async (id: string | null) => {
    await globalStorage.set(current => ({
      ...current,
      activeConversationId: id,
    }));
  },

  // 设置当前主题
  setCurrentTheme: async (theme: 'light' | 'dark') => {
    await globalStorage.set(current => ({
      ...current,
      currentTheme: theme,
    }));
  },
};
