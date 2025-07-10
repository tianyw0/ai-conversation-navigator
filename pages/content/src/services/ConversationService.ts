import { createConversationPageStorage, ConversationItem } from '@extension/storage';
import { colorLog } from '@extension/dev-utils';

export class ConversationService {
  private pageStorage;
  private pageId: string;
  private observers: Array<number> = []; // 存储所有 interval ID
  private isProcessing = false; // 防止并发处理
  private mutationObserver: MutationObserver | null = null;
  private themeObserver: MutationObserver | null = null;

  constructor() {
    this.pageId = window.location.pathname;
    this.pageStorage = createConversationPageStorage(this.pageId);
    this.initObservers();
  }

  private initObservers() {
    this.cleanupObservers(); // 清理现有观察器
    this.initConversationObserver();
    this.initThemeObserver();
    this.initScrollObserver();
  }

  private cleanupObservers() {
    // 清理所有 interval
    this.observers.forEach(id => clearInterval(id));
    this.observers = [];

    // 清理 MutationObserver
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    if (this.themeObserver) {
      this.themeObserver.disconnect();
    }
  }

  private initConversationObserver() {
    const findConversationContainer = () => {
      const thread = document.getElementById('thread');
      if (!thread) {
        const timeoutId = setTimeout(() => {
          findConversationContainer();
        }, 1000);
        this.observers.push(timeoutId);
        colorLog('service::对话导航器: 等待对话容器加载...', 'info');
        return;
      }

      // 使用 MutationObserver 替代 setInterval
      this.mutationObserver = new MutationObserver(this.debouncedUpdateQuestions.bind(this));
      this.mutationObserver.observe(thread, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      // 初始化时执行一次更新
      this.updateQuestions();
      colorLog('service::对话导航器: 已开始监听对话容器', 'success');
    };

    findConversationContainer();
  }

  private initThemeObserver() {
    // 使用 MutationObserver 监听主题变化
    this.themeObserver = new MutationObserver(() => {
      if (!this.isProcessing) {
        this.observeThemeChanges();
      }
    });

    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  private initScrollObserver() {
    // 使用 requestAnimationFrame 优化滚动监听
    let scrollTimeout: number;
    const scrollHandler = () => {
      if (!this.isProcessing) {
        this.updateActiveConversation();
      }
    };

    window.addEventListener(
      'scroll',
      () => {
        cancelAnimationFrame(scrollTimeout);
        scrollTimeout = requestAnimationFrame(scrollHandler);
      },
      { passive: true },
    );
  }

  // 使用防抖处理更新
  private debouncedUpdateQuestions() {
    if (this.isProcessing) return;

    this.isProcessing = true;
    setTimeout(async () => {
      await this.updateQuestions();
      this.isProcessing = false;
    }, 200);
  }

  private async updateQuestions() {
    try {
      const questionElements = Array.from(
        document.querySelectorAll('article[data-testid^="conversation-turn-"]'),
      ).filter(el => {
        const id = (el as HTMLElement).dataset.testid?.split('-').pop();
        return id && Number(id) % 2 === 1;
      });

      for (const element of questionElements) {
        const testId = (element as HTMLElement).dataset.testid;
        const id = testId ? Number(testId.split('-').pop()) : NaN;
        if (isNaN(id)) continue;

        const content = this.extractFullContent(element as HTMLElement);
        const conversationItem: ConversationItem = {
          id,
          elementId: testId || '',
          content,
          summary: this.escapeHtml(content),
        };

        const oldItem = await this.pageStorage.getConversationById(id);
        if (!oldItem || oldItem.summary !== conversationItem.summary || oldItem.content !== conversationItem.content) {
          await this.pageStorage.addConversation(conversationItem);
        }
      }
    } catch (error) {
      console.error('更新对话失败:', error);
    }
  }

  private handleUrlChange(pageId: string) {
    this.cleanupObservers();
    this.pageStorage = createConversationPageStorage(pageId);
    this.pageId = pageId;
    this.initObservers();
    colorLog(`service::URL 变化，重新加载页面内容: ${pageId}`, 'info');
  }

  private async updateActiveConversation() {
    const visibleQuestion = this.findVisibleQuestion();
    if (visibleQuestion) {
      await this.pageStorage.setActiveConversationId(visibleQuestion.id);
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
  private async observeThemeChanges() {
    try {
      const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      const theme = await this.pageStorage.getTheme();
      if (currentTheme !== theme) {
        await this.pageStorage.setCurrentTheme(currentTheme);
        colorLog('service::主题已更新: ' + currentTheme, 'info');
      }
    } catch (error) {
      console.error('主题更新失败:', error);
    }
  }

  // utils
  private extractFullContent(node: HTMLElement): string {
    let textContent =
      (node.querySelector('.whitespace-pre-wrap') as HTMLElement)?.innerText.trim() || node.innerText.trim();
    const quote = node.querySelector('p.line-clamp-3');
    if (quote instanceof HTMLElement) {
      textContent = quote.innerText.trim() + textContent;
    }
    return textContent
      .split(/[\n\r]+/)
      .join(' ')
      .replace(/\s+/g, ' ');
  }

  private escapeHtml(unsafe: string): string {
    return unsafe.replace(/<[^>]*>/g, match => match.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
  }
}
