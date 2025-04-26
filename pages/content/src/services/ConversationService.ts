import { createConversationPageStorage, ConversationItem } from '../../../../packages/storage';

export class ConversationService {
  private pageStorage;

  constructor() {
    // 使用当前页面URL作为页面ID
    const pageId = window.location.pathname;
    this.pageStorage = createConversationPageStorage(pageId);
    this.initObserver();
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
        this.updateActiveConversation();
        console.log('对话导航器: 已更新对话列表');
      });

      observer.observe(thread, {
        childList: true,
        subtree: true,
      });

      // 监听页面滚动，更新活跃对话
      window.addEventListener('scroll', () => {
        this.updateActiveConversation();
      });

      // 监听主题变化
      this.observeThemeChanges();

      console.log('对话导航器: 已开始监听对话容器');
    };

    // 开始查找对话容器
    findConversationContainer();
  }

  private updateQuestions() {
    const questionElements = Array.from(document.querySelectorAll('article[data-testid^="conversation-turn-"]')).filter(
      el => {
        const id = (el as HTMLElement).dataset.testid?.split('-').pop();
        return id && Number(id) % 2 === 1;
      },
    );

    questionElements.forEach(element => {
      const conversationItem: ConversationItem = {
        id: (element as HTMLElement).dataset.testid || '',
        elementId: (element as HTMLElement).dataset.testid || '',
        summary: this.extractQuestionText(element as HTMLElement),
        content: this.extractFullContent(element as HTMLElement),
        timestamp: Date.now(),
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
    const questions = document.querySelectorAll('article[data-testid^="conversation-turn-"]');

    for (const question of Array.from(questions)) {
      const rect = question.getBoundingClientRect();
      // 如果元素在视口中间区域
      if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
        return {
          id: (question as HTMLElement).dataset.testid || '',
        };
      }
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
