import { useEffect, useRef, useState } from 'react';
import { ConversationNavigator } from './components/ConversationNavigator';
import { colorLog } from '@extension/dev-utils';

export default function App() {
  const [panelLeft, setPanelLeft] = useState<number>(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 查找目标元素
    const sidebar = document.querySelector('.bg-token-sidebar-surface-primary');
    let target: HTMLElement | null = null;
    if (sidebar && sidebar.nextElementSibling instanceof HTMLElement) {
      target = sidebar.nextElementSibling;
    }

    if (!target) return;

    // 初始设置left
    setPanelLeft(target.getBoundingClientRect().left);
    // 监听窗口resize，保证left实时更新
    const handleWindowResize = () => {
      setPanelLeft(target.getBoundingClientRect().left);
    };
    window.addEventListener('resize', handleWindowResize);

    // 可选：监听目标元素自身的移动
    const resizeObserver = new ResizeObserver(() => {
      let left = target.getBoundingClientRect().left;
      if (left > 248) {
        left = 270;
      }
      setPanelLeft(left);
    });
    resizeObserver.observe(target);
    colorLog('ui::content ui loaded', 'info');

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={panelRef}
      style={{ left: panelLeft }}
      className='absolute w-[310px] top-[56px] max-h-[calc(100vh-190px)] overflow-auto flex flex-col gap-2 rounded px-2 py-1'>
      <ConversationNavigator />
    </div>
  );
}
