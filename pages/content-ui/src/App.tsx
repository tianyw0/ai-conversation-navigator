import React, { useState, useEffect, useRef } from 'react';
import { LoadingIndicator } from './components/LoadingIndicator';
import { PromptItem } from './components/Promptitem';
import { t } from '@extension/i18n';
import { cn } from '@extension/ui';
import { colorLog } from '@extension/dev-utils';
import { CollapseButton } from './components/CollapseButton';
import type { PromptEntity } from './types';
import { escapeHtml, extractFullContent, debounce } from './utils';

export const App: React.FC = () => {
  const [prompts, setPrompts] = useState<PromptEntity[]>();
  const [expand, setExpand] = useState(true);
  const [activePromptId, setActivePromptId] = useState('');
  const [theme, setTheme] = useState('light');
  const [chat, setChat] = useState('');
  const chatRef = useRef(chat);
  const [visible, setVisible] = useState(location.pathname.startsWith('/c/'));

  useEffect(() => {
    console.log(`current expand: "${expand}"`);
  }, [expand]);

  useEffect(() => {
    colorLog('ui-component::activeConversationId changed:' + activePromptId, 'info');
    if (activePromptId) {
      const activeButton = document
        .querySelector('#ai-conversation-navigator-root')
        ?.shadowRoot?.querySelector(`button[data-testid='${activePromptId}']`);

      activeButton?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activePromptId]);

  // 监听主题变化
  useEffect(() => {
    const themeObserver = new MutationObserver(() => {
      const newTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      console.log(`当前的主题是${theme}`);
      if (theme !== newTheme) {
        console.log(`主题切换，当前主题：${newTheme}`);
        setTheme(newTheme);
      }
    });

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => themeObserver.disconnect();
  });
  // 监听 Prompts
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const questionElements = Array.from(
        document.querySelectorAll('article[data-testid^="conversation-turn-"]'),
      ).filter(el => {
        const id = (el as HTMLElement).dataset.testid?.split('-').pop();
        return id && Number(id) % 2 === 1;
      });

      const promptEntities: PromptEntity[] = Array.from(questionElements)
        .map(element => {
          const testId = (element as HTMLElement).dataset.testid;
          const id = testId ? Number(testId.split('-').pop()) : NaN;
          if (isNaN(id)) return null;

          const content = extractFullContent(element as HTMLElement);
          return {
            id,
            elementId: testId || '',
            content,
            summary: escapeHtml(content),
          };
        })
        .filter((item): item is PromptEntity => item !== null);
      setPrompts(promptEntities);
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true, // 监听深层嵌套结构变化
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (location.href !== chatRef.current) {
        console.log('URL changed: ', location.href);
        console.log('chatRef.current: ', chatRef.current);
        setChat(location.href);
        setVisible(location.pathname.startsWith('/c/'));
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // 绑定指定元素的 scroll 事件
  // 每次切换聊天都需要重新绑定，因为之前的元素会被替换，事件就没有了
  useEffect(bindScroll, [chat]);
  // 借助一个 ref 变量传递变化
  useEffect(() => {
    chatRef.current = chat;
  }, [chat]);

  function bindScroll() {
    const intervalId = setInterval(() => {
      const threadEl = document.querySelector('#thread')?.querySelector('article')?.parentElement?.parentElement;
      if (threadEl) {
        clearInterval(intervalId);
        // 找到元素后执行的代码-start
        const threadEl = document.querySelector('#thread')?.querySelector('article')?.parentElement?.parentElement;

        colorLog(`threadEL is ${threadEl}`, 'info');

        if (!threadEl) {
          colorLog('没有找到滚动元素', 'error');
          return;
        }

        const handleScroll = () => {
          const questions = Array.from(threadEl.querySelectorAll('article[data-testid^="conversation-turn-"]'));
          const visible = questions.find(q => {
            const rect = q.getBoundingClientRect();
            /**
             * 加“可见面积”限制，避免误触
             * 可以加入一个“元素可见区域高度必须超过某个阈值”的判断
             * 比如 250px 或元素自身高度的 30%，这样可以过滤掉仅部分边缘可见的情况：
             */
            const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
            const isVisibleEnough = visibleHeight >= Math.min(250, rect.height * 0.3);
            return isVisibleEnough;
          });

          if (visible) {
            const id = (visible as HTMLElement).dataset.testid || '';
            const numericId = Number(id.split('-').pop());
            const adjustedId = numericId % 2 === 0 ? numericId - 1 : numericId;
            setActivePromptId(`conversation-turn-${adjustedId}`);
            console.log(`conversation-turn-${adjustedId}`);
          }
        };

        //先执行一次，在用户滚动之前，定位导航 Prompt
        handleScroll();

        threadEl.addEventListener('scroll', debounce(handleScroll, 17), { passive: true });
        return () => threadEl.removeEventListener('scroll', handleScroll);
        // 找到元素之后的代码-end
      }
      return; // 这句话不能少 TS 代码要求
    }, 1000);
  }

  const handleSelect = (id: string) => {
    const element = document.querySelector(`[data-testid="${id}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const firstClassName = cn(
    theme,
    'absolute flex flex-col',
    'left-[260px] top-[56px] w-[260px] max-h-[calc(100vh-190px)]',
    'px-2 py-1 rounded transition-all duration-300 ease-in-out',
    'border-r border-r-transparent',
    'dark:bg-[#212121] dark:text-[#FFFFFF] bg-white text-[#0D0D0D]',
  );

  const titleClassName = cn(
    'sticky top-0 z-10 bg-white dark:bg-[#212121]',
    'flex justify-between items-center p-2 font-normal border-b border-transparent text-sm',
  );

  if (!visible) return null;

  return (
    <div className={firstClassName}>
      <div className={titleClassName} id='prompt-title'>
        {expand && <span>{t('conversation_navigator')}</span>}
        <CollapseButton expand={expand} onToggle={newState => setExpand(newState)} />
      </div>
      {expand && (
        <div className='flex-1 overflow-auto'>
          {!prompts?.length ? (
            <LoadingIndicator />
          ) : (
            <ul id='prompt-ul'>
              {prompts.map((prompt, index) => {
                const isActive = activePromptId === prompt.elementId;
                return (
                  <PromptItem
                    key={prompt.elementId}
                    conversation={prompt}
                    isActive={isActive}
                    isDark={theme === 'dark'}
                    index={index}
                    onSelect={handleSelect}
                  />
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
