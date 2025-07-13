import { colorLog } from '@extension/dev-utils';
import { t } from '@extension/i18n';
import { cn } from '@extension/ui';
import React, { useState, useRef, useEffect } from 'react';
import { PromptItem, LoadingIndicator, CollapseButton } from './components';
import { themeChangeTrigger, promptsChangeTrigger } from './trigger';
import type { PromptEntity } from './types';
import { debounce } from './utils';

export const App: React.FC = () => {
  const [prompts, setPrompts] = useState<PromptEntity[]>();
  const [expand, setExpand] = useState(true);
  const [activePromptId, setActivePromptId] = useState('');
  const [chat, setChat] = useState('');
  const chatRef = useRef(chat);
  const [visible, setVisible] = useState(location.pathname.startsWith('/c/'));
  const [left, setLeft] = useState('left-full');

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
  useEffect(themeChangeTrigger, []);
  // 监听 Prompts
  useEffect(promptsChangeTrigger(setPrompts), []);

  // 定时监测 url 变动
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
  useEffect(() => {
    chatRef.current = chat;
  }, [chat]);

  // 绑定指定元素的 scroll 事件
  // 每次切换聊天都需要重新绑定，因为之前的元素会被替换，事件就没有了
  useEffect(bindScroll, [chat]);

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

  //监听左侧聊天列表变动，控制 Prompt 导航 left 值
  useEffect(() => {
    const updateSidebarClass = () => {
      const sidebar = document.querySelector('#stage-slideover-sidebar');
      if (!sidebar) {
        setLeft('left-hidden');
        return;
      }
      const width = window.getComputedStyle(sidebar).getPropertyValue('width').trim();
      if (width === '52px') {
        setLeft('left-rail');
      } else if (width === '260px') {
        setLeft('left-full');
      }
    };

    // 初始执行一次
    updateSidebarClass();

    const observer = new MutationObserver(() => {
      updateSidebarClass();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    return () => observer.disconnect();
  }, []);

  // jsx 中用到的函数
  const handleSelect = (id: string) => {
    const element = document.querySelector(`[data-testid="${id}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const firstClassName = cn(
    'absolute flex flex-col',
    'top-0 w-[260px] mt-[52px] max-h-[calc(100vh-52px-52px)]',
    'px-2 py-1 rounded transition-all duration-300 ease-in-out',
    'dark:bg-[#212121] dark:text-[#FFFFFF] bg-white text-[#0D0D0D]',
    'border-[1px] rounded-none border-l-0',
    'border-[rgba(13,13,13,0.05)] dark:border-[rgba(255,255,255,0.05)]',
  );

  const titleClassName = cn(
    'sticky top-0 z-10 bg-white dark:bg-[#212121]',
    'flex justify-between items-center p-2 font-normal border-b border-transparent text-sm',
  );

  if (!visible) return null;

  return (
    <div className={cn(firstClassName, left, expand ? '' : 'w-auto max-w-[260px]')}>
      <div className={titleClassName} id='prompt-title'>
        {expand && <span>{t('prompts_navigator')}</span>}
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
