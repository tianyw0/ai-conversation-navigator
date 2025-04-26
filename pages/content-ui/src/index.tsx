import { createRoot } from 'react-dom/client';
import App from '@src/App';

// 注入导航器到 DOM
const injectNavigator = () => {
  const thread = document.getElementById('thread');
  if (!thread) return;

  // 找到 presentationDiv
  const presentationDiv = thread.querySelector('div[role="presentation"]');
  if (!presentationDiv) return;

  // 获取 presentationDiv 的子元素
  const children = Array.from(presentationDiv.children);
  if (children.length < 3) return;

  const div1 = children[0];
  const div2 = children[1];
  const div3 = children[2];

  // 创建新的 div2 容器
  const newDiv2 = document.createElement('div');
  newDiv2.style.display = 'flex';
  newDiv2.style.flexDirection = 'row';
  newDiv2.style.width = '100%';
  newDiv2.style.height = '100%';

  // 将原来的 div2 移动到 newDiv2
  presentationDiv.removeChild(div2);
  newDiv2.appendChild(div2);

  // 将 newDiv2 插入到原来 div2 的位置
  presentationDiv.insertBefore(newDiv2, div3);
};

// 创建根容器并添加 ChatGPT 的基础样式类
const root = document.createElement('div');
root.id = 'chatgpt-conversation-navigator-root';
root.className = 'flex flex-col relative';

// 检查页面是否准备好
const checkPageReady = () => {
  const thread = document.getElementById('thread');
  if (thread) {
    injectNavigator();
    document.body.append(root);
    createRoot(root).render(<App />);
  } else {
    setTimeout(checkPageReady, 500);
  }
};

// 开始检查页面
checkPageReady();
