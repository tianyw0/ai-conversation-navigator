import { Question } from '@extension/shared';

class ConversationService {
  private questions: Question[] = [];

  constructor() {
    this.initObserver();
  }

  private initObserver() {
    // 首先尝试获取对话容器元素
    const findConversationContainer = () => {
      const thread = document.getElementById('thread');
      if (thread) {
        // 找到对话容器后，只监听这个容器内的变化
        const observer = new MutationObserver(() => {
          this.updateQuestions();
          this.notifyUI();
        });

        observer.observe(thread, {
          childList: true,
          subtree: true,
        });

        console.log('对话导航器: 已开始监听对话容器');
      } else {
        // 如果还没找到，稍后再试
        setTimeout(findConversationContainer, 1000);
        console.log('对话导航器: 等待对话容器加载...');
      }
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

    this.questions = questionElements.map(element => ({
      id: (element as HTMLElement).dataset.testid || '',
      element: element as HTMLElement,
      text: this.extractQuestionText(element as HTMLElement),
    }));
  }

  private notifyUI() {
    window.postMessage(
      {
        type: 'CONVERSATION_UPDATE',
        payload: this.questions,
      },
      '*',
    );
  }

  // 添加提取问题文本的方法
  private extractQuestionText(node: HTMLElement): string {
    const textContent = (
      (node.querySelector('.whitespace-pre-wrap') as HTMLElement)?.innerText.trim() || node.innerText.trim()
    )
      .split(/[\n\r]+/)
      .join(' ')
      .replace(/\s+/g, ' ');

    return textContent.length > 20 ? this.escapeHtml(textContent.slice(0, 20)) + '...' : this.escapeHtml(textContent);
  }

  // 添加HTML转义方法
  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
