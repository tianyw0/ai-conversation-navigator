import React, { useEffect, useState } from 'react';
import ConversationNavigator from '@src/components/ConversationNavigator';

const App: React.FC = () => {
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    // 检查是否在 ChatGPT 页面
    const isChatGPT = window.location.hostname.includes('chatgpt.com');
    if (!isChatGPT) return;

    // 监听窗口大小变化，在小屏幕上隐藏侧边栏
    const handleResize = () => {
      setShowSidebar(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 初始检查

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!showSidebar) return null;

  return (
    <div
      className="fixed left-0 top-0 w-[260px] h-[calc(100%-104px)] mt-[104px] flex-shrink-0 overflow-y-auto text-base font-medium rounded-none z-[1000]"
      style={{
        width: 'min(260px, 25%)',
        display: showSidebar ? 'block' : 'none',
      }}>
      <ConversationNavigator />
    </div>
  );
};

export default App;
