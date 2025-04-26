import { createConversationPageStorage, ConversationItem } from '@extension/storage';

export class ConversationService {
  private pageStorage;

  constructor() {
    // 使用当前页面URL作为页面ID
    const pageId = window.location.pathname;
    this.pageStorage = createConversationPageStorage(pageId);
    this.initObserver();
    this.initUrlChangeListener();
  }

  private initObserver() {
    // 首先尝试获取对话容器元素
    const findConversationContainer = () => {
      const thread = document.getElementById('thread');
      // 如果还没找到，稍后再试
      if (!thread) {
        setTimeout(findConversationContainer, 1000);
        console.log('对话导航器: 等待对话容器加载...');
        return;
      }

      // 找到对话容器后，只监听这个容器内的变化
      const observer = new MutationObserver(() => {
        this.updateQuestions();
      });

      observer.observe(thread, {
        childList: true,
        subtree: true,
      });

      // 先直接扫描一次，再监听页面滚动，更新活跃对话
      // this.updateActiveConversation();
      // window.addEventListener('scroll', () => {
      //   this.updateActiveConversation();
      // });
      setInterval(() => {
        this.updateActiveConversation();
      }, 100);

      // 监听主题变化
      this.observeThemeChanges();

      console.log('对话导航器: 已开始监听对话容器');
    };

    // 开始查找对话容器
    findConversationContainer();
  }

  private initUrlChangeListener() {
    // 保存原始的 pushState 和 replaceState 方法
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    // 重写 pushState
    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.handleUrlChange(); // URL 变化时触发处理
    };

    // 重写 replaceState
    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.handleUrlChange(); // URL 变化时触发处理
    };

    // 监听 popstate 事件，用于后退/前进按钮
    window.addEventListener('popstate', this.handleUrlChange.bind(this));
  }

  // 处理 URL 变化
  private handleUrlChange() {
    const pageId = window.location.pathname;
    this.pageStorage = createConversationPageStorage(pageId);

    // 清空之前的内容并重新初始化对话容器监听
    this.initObserver();

    console.log(`URL 变化，重新加载页面内容: ${pageId}`);
  }

  private updateQuestions() {
    const questionElements = Array.from(document.querySelectorAll('article[data-testid^="conversation-turn-"]')).filter(
      el => {
        const id = (el as HTMLElement).dataset.testid?.split('-').pop();
        return id && Number(id) % 2 === 1;
      },
    );

    questionElements.forEach(element => {
      const testId = (element as HTMLElement).dataset.testid;
      const id = testId ? Number(testId.split('-').pop()) : NaN;
      const conversationItem: ConversationItem = {
        id,
        elementId: (element as HTMLElement).dataset.testid || '',
        summary: this.extractQuestionText(element as HTMLElement),
        content: this.extractFullContent(element as HTMLElement),
      };
      this.pageStorage.addConversation(conversationItem);
    });
  }

  private updateActiveConversation() {
    const visibleQuestion = this.findVisibleQuestion();
    if (visibleQuestion) {
      this.pageStorage.setActiveConversationId(visibleQuestion.id);
    }
  }

  private findVisibleQuestion() {
    const questions = Array.from(document.querySelectorAll('article[data-testid^="conversation-turn-"]'));
    const visibleQuestions = questions.filter(question => {
      const rect = question.getBoundingClientRect();
      return rect.top >= 0 && rect.top <= window.innerHeight;
    });

    if (visibleQuestions.length > 0) {
      const id = (visibleQuestions[0] as HTMLElement).dataset.testid || '';
      const numericId = id ? Number(id.split('-').pop()) : NaN;
      const adjustedId = numericId % 2 === 0 ? numericId - 1 : numericId;

      // 拼接前缀和调整后的 ID
      const finalId = `conversation-turn-${adjustedId}`;
      return {
        id: finalId,
      };
    }

    return null;
  }

  private observeThemeChanges() {
    // 监听文档根元素的class变化
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'class') {
          const isDarkMode = document.documentElement.classList.contains('dark');
          this.pageStorage.setCurrentTheme(isDarkMode ? 'dark' : 'light');
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // 初始化主题
    const isDarkMode = document.documentElement.classList.contains('dark');
    this.pageStorage.setCurrentTheme(isDarkMode ? 'dark' : 'light');
  }

  // utils
  private extractQuestionText(node: HTMLElement): string {
    const textContent = (
      (node.querySelector('.whitespace-pre-wrap') as HTMLElement)?.innerText.trim() || node.innerText.trim()
    )
      .split(/[\n\r]+/)
      .join(' ')
      .replace(/\s+/g, ' ');

    return textContent.length > 20 ? this.escapeHtml(textContent.slice(0, 20)) + '...' : this.escapeHtml(textContent);
  }

  private extractFullContent(node: HTMLElement): string {
    return (node.querySelector('.whitespace-pre-wrap') as HTMLElement)?.innerText.trim() || node.innerText.trim();
  }

  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
