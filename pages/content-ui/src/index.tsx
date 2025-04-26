import { createRoot } from 'react-dom/client';
import { ConversationNavigator } from './components/ConversationNavigator';
import './tailwind-input.css';

// 防止重复注入
const NAVIGATOR_CONTAINER_ID = 'conversation-navigator-container';

const injectNavigator = () => {
  const thread = document.getElementById('thread');
  if (!thread) {
    setTimeout(injectNavigator, 1000);
    return;
  }

  // 找到 presentationDiv
  const presentationDiv = thread.querySelector('div[role="presentation"]');
  if (!presentationDiv) {
    setTimeout(injectNavigator, 1000);
    return;
  }

  // 获取 presentationDiv 的子元素
  const children = Array.from(presentationDiv.children);
  if (children.length < 3) {
    setTimeout(injectNavigator, 1000);
    return;
  }

  // 检查是否已经注入过
  if (presentationDiv.querySelector(`#${NAVIGATOR_CONTAINER_ID}`)) {
    // 已经注入，无需重复操作
    return;
  }

  const div1 = children[0];
  const div2 = children[1];
  const div3 = children[2];

  // 创建新的 div2 容器
  const newDiv2 = document.createElement('div');
  newDiv2.style.display = 'flex';
  newDiv2.style.flexDirection = 'row';
  newDiv2.style.width = '100%';
  newDiv2.style.height = '100%';

  // 创建导航器容器
  const navigatorContainer = document.createElement('div');
  navigatorContainer.id = NAVIGATOR_CONTAINER_ID;
  navigatorContainer.style.width = '280px';
  navigatorContainer.style.borderRight = '1px solid rgba(0,0,0,0.1)';

  // 将原来的 div2 移动到 newDiv2
  presentationDiv.removeChild(div2);
  newDiv2.appendChild(navigatorContainer);
  newDiv2.appendChild(div2);

  // 将 newDiv2 插入到原来 div2 的位置
  presentationDiv.insertBefore(newDiv2, div3);

  // 渲染导航器组件
  const root = createRoot(navigatorContainer);
  root.render(<ConversationNavigator />);
};

// 开始注入过程
injectNavigator();
