import { createRoot } from 'react-dom/client';
import { ConversationNavigator } from './components/ConversationNavigator';
import './tailwind-input.css';

// 防止重复注入
const NAVIGATOR_CONTAINER_ID = 'conversation-navigator-container';

// 添加防抖函数
function debounce(fn: Function, delay: number) {
  let timer: NodeJS.Timeout | null = null;
  return function (...args: any[]) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(null, args), delay);
  };
}

function injectNavigatorIfNeeded() {
  const thread = document.getElementById('thread');
  if (!thread) return false;

  const presentationDiv = thread.querySelector('div[role="presentation"]');
  if (!presentationDiv) return false;

  const children = Array.from(presentationDiv.children);
  if (children.length < 3) return false;

  if (presentationDiv.querySelector(`#${NAVIGATOR_CONTAINER_ID}`)) {
    return true; // 已经注入，返回 true
  }

  const div1 = children[0];
  const div2 = children[1];
  const div3 = children[2];

  // 创建新的 div2 容器
  const newDiv2 = document.createElement('div');
  newDiv2.className = 'flex flex-row w-full';

  // 创建导航器容器
  const navigatorContainer = document.createElement('div');
  navigatorContainer.id = NAVIGATOR_CONTAINER_ID;
  navigatorContainer.className = 'flex pt-14 w-[280px] border-r border-black/10';
  navigatorContainer.style.height = 'calc(100% - 56px)';
  navigatorContainer.style.marginTop = '56px';

  // 将原来的 div2 移动到 newDiv2
  presentationDiv.removeChild(div2);
  newDiv2.appendChild(navigatorContainer);
  newDiv2.appendChild(div2);

  // 将 newDiv2 插入到原来 div2 的位置
  presentationDiv.innerHTML = '';
  presentationDiv.append(div1, newDiv2, div3);

  // 渲染导航器组件
  const root = createRoot(presentationDiv);
  root.render(<ConversationNavigator />);

  return true;
}

// 使用防抖包装注入函数
const debouncedInject = debounce(() => {
  const injected = injectNavigatorIfNeeded();
  if (injected) {
    // 注入成功后断开 observer
    observer.disconnect();
  }
}, 100);

// 使用 MutationObserver 监听 DOM 变化，优化配置
const observer = new MutationObserver(debouncedInject);

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false, // 不监听属性变化
  characterData: false, // 不监听文本内容变化
});

// 首次尝试注入
debouncedInject();
