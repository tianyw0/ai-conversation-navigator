import { createConversationPageStorage, ConversationItem } from '@extension/storage';
import { colorLog } from '@extension/dev-utils';

export class ConversationService {
  private pageStorage;
  private pageId: string;

  constructor() {
    // 使用当前页面URL作为页面ID
    this.pageId = window.location.pathname;
    this.pageStorage = createConversationPageStorage(this.pageId);
    this.initObserver();
    this.initUrlChangeListener();
  }

  private initObserver() {
    const findConversationContainer = () => {
      const thread = document.getElementById('thread');
      if (!thread) {
        setTimeout(findConversationContainer, 1000);
        colorLog('service::对话导航器: 等待对话容器加载...', 'info');
        return;
      }

      // 找到对话容器后，只监听这个容器内的变化
      setInterval(() => {
        this.updateQuestions();
      }, 1000);

      // 先直接扫描一次，再监听页面滚动，更新活跃对话
      setInterval(() => {
        this.updateActiveConversation();
      }, 200);

      // 每秒检查一次主题变化
      setInterval(() => {
        this.observeThemeChanges();
      }, 1000);

      colorLog('service::对话导航器: 已开始监听对话容器', 'success');
    };

    // 开始查找对话容器
    findConversationContainer();
  }

  private initUrlChangeListener() {
    setInterval(() => {
      const currentPageId = window.location.pathname;
      if (currentPageId !== this.pageId) {
        this.handleUrlChange(currentPageId);
      }
    }, 1000);
  }

  // 处理 URL 变化
  private handleUrlChange(pageId: string) {
    this.pageStorage = createConversationPageStorage(pageId);
    this.pageId = pageId;

    this.initObserver();
    colorLog(`service::URL 变化，重新加载页面内容: ${pageId}`, 'info');
  }

  private async updateQuestions() {
    const questionElements = Array.from(document.querySelectorAll('article[data-testid^="conversation-turn-"]')).filter(
      el => {
        const id = (el as HTMLElement).dataset.testid?.split('-').pop();
        return id && Number(id) % 2 === 1;
      },
    );

    for (const element of questionElements) {
      const testId = (element as HTMLElement).dataset.testid;
      const id = testId ? Number(testId.split('-').pop()) : NaN;
      const content = this.extractFullContent(element as HTMLElement);
      const conversationItem: ConversationItem = {
        id,
        elementId: (element as HTMLElement).dataset.testid || '',
        content,
        summary: this.escapeHtml(content),
      };
      // 先获取旧数据
      const oldItem = await this.pageStorage.getConversationById(id);
      // 只有内容有变化时才更新
      if (!oldItem || oldItem.summary !== conversationItem.summary || oldItem.content !== conversationItem.content) {
        await this.pageStorage.addConversation(conversationItem);
      }
    }
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
    // 初始化主题
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    colorLog('service::当前 theme:' + currentTheme, 'info');
    this.pageStorage.getTheme().then(theme => {
      if (currentTheme !== theme) {
        this.pageStorage.setCurrentTheme(currentTheme);
      }
    });
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
