import { createRoot } from 'react-dom/client';
import { ConversationNavigator } from './components/ConversationNavigator';
import './tailwind-input.css';

// 防止重复注入
const NAVIGATOR_CONTAINER_ID = 'conversation-navigator-container';

function injectNavigatorIfNeeded() {
  const thread = document.getElementById('thread');
  if (!thread) return;

  const presentationDiv = thread.querySelector('div[role="presentation"]');
  if (!presentationDiv) return;

  const children = Array.from(presentationDiv.children);
  if (children.length < 3) return;

  if (presentationDiv.querySelector(`#${NAVIGATOR_CONTAINER_ID}`)) {
    // 已经注入，无需重复操作
    return;
  }

  const div2 = children[1];
  const div3 = children[2];

  // 创建新的 div2 容器
  const newDiv2 = document.createElement('div');
  newDiv2.className = 'flex flex-row w-full h-full';

  // 创建导航器容器
  const navigatorContainer = document.createElement('div');
  navigatorContainer.id = NAVIGATOR_CONTAINER_ID;
  navigatorContainer.className = 'mt-14';

  // 将原来的 div2 移动到 newDiv2
  presentationDiv.removeChild(div2);
  newDiv2.appendChild(navigatorContainer);
  newDiv2.appendChild(div2);

  // 将 newDiv2 插入到原来 div2 的位置
  presentationDiv.insertBefore(newDiv2, div3);

  // 渲染导航器组件
  const root = createRoot(navigatorContainer);
  root.render(<ConversationNavigator />);
}

// 使用 MutationObserver 监听 DOM 变化
const observer = new MutationObserver(() => {
  injectNavigatorIfNeeded();
});

observer.observe(document.body, { childList: true, subtree: true });

// 首次尝试注入
injectNavigatorIfNeeded();
