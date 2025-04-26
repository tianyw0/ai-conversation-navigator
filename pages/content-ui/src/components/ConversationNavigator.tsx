import React, { useEffect, useState } from 'react';

interface Question {
  id: string;
  element: HTMLElement;
  text: string;
}

const ConversationNavigator: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'CONVERSATION_UPDATE') {
        setQuestions(event.data.payload);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // 转义HTML内容
  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // 提取问题文本
  const extractQuestionText = (node: HTMLElement): string => {
    const textContent = (
      (node.querySelector('.whitespace-pre-wrap') as HTMLElement)?.innerText.trim() || node.innerText.trim()
    )
      .split(/[\n\r]+/)
      .join(' ')
      .replace(/\s+/g, ' ');

    return textContent.length > 20 ? escapeHtml(textContent.slice(0, 20)) + '...' : escapeHtml(textContent);
  };

  // 查找所有提问
  const findAllQuestions = (): Question[] => {
    const questionElements = Array.from(document.querySelectorAll('article[data-testid^="conversation-turn-"]')).filter(
      el => {
        const id = (el as HTMLElement).dataset.testid?.split('-').pop();
        return id && Number(id) % 2 === 1;
      },
    ) as HTMLElement[];

    return questionElements.map(element => ({
      id: element.dataset.testid || '',
      element,
      text: extractQuestionText(element),
    }));
  };

  // 滚动到指定问题
  const scrollToQuestion = (question: Question) => {
    question.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // 检测深色模式
  const detectDarkMode = () => {
    // 检查网站是否使用深色模式
    const isDarkMode =
      document.documentElement.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDarkMode);
  };

  // 初始化和监听变化
  useEffect(() => {
    // 初始化问题列表
    setQuestions(findAllQuestions());

    // 检测深色模式
    detectDarkMode();

    // 创建 MutationObserver 监听 DOM 变化
    const observer = new MutationObserver(mutations => {
      // 当 DOM 变化时，重新获取问题列表
      setQuestions(findAllQuestions());

      // 重新检测深色模式
      detectDarkMode();
    });

    // 开始观察 DOM 变化
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // 清理函数
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className={`flex flex-col h-full overflow-y-auto ${
        darkMode
          ? 'bg-[#212121] text-white border-r border-r-[rgba(255,255,255,0.08)]'
          : 'bg-white text-black border-r border-r-[rgba(0,0,0,0.08)]'
      }`}>
      <div className="p-4 font-medium border-b border-gray-200 dark:border-gray-700">对话导航</div>
      <ul className="flex-1 overflow-y-auto">
        {questions.map(question => (
          <li
            key={question.id}
            onClick={() => scrollToQuestion(question)}
            className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
            dangerouslySetInnerHTML={{ __html: question.text }}
          />
        ))}
      </ul>
    </div>
  );
};

export default ConversationNavigator;
