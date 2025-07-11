import { createRoot } from 'react-dom/client';
import { ConversationNavigator } from './components/ConversationNavigator';
// @ts-expect-error Because file doesn't exist before build
import tailwindcssOutput from '../dist/tailwind-output.css?inline';
import { colorLog } from '@extension/dev-utils';

// 添加重试机制
const initializePlugin = (retryCount = 0, maxRetries = 5) => {
  const shadowHost = document.createElement('div');
  shadowHost.id = 'ai-conversation-navigator-root';
  shadowHost.style.zIndex = '2147483647';
  const presentation = document.querySelector('[role="presentation"]') as HTMLElement;

  if (!presentation) {
    if (retryCount < maxRetries) {
      colorLog(`等待页面加载... (尝试 ${retryCount + 1}/${maxRetries})`, 'info');
      setTimeout(() => {
        initializePlugin(retryCount + 1, maxRetries);
      }, 1000);
    } else {
      colorLog('初始化失败：无法找到目标元素', 'error');
    }
    return;
  }

  // 检查是否已存在导航器
  const existingNavigator = document.getElementById('ai-conversation-navigator-root');
  if (existingNavigator) {
    existingNavigator.remove();
  }

  const insertElement = presentation.children[1];
  presentation.insertBefore(shadowHost, insertElement);
  const shadowRoot = shadowHost.attachShadow({ mode: 'open' });

  if (navigator.userAgent.includes('Firefox')) {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = tailwindcssOutput;
    shadowRoot.appendChild(styleElement);
  } else {
    const globalStyleSheet = new CSSStyleSheet();
    globalStyleSheet.replaceSync(tailwindcssOutput);
    shadowRoot.adoptedStyleSheets = [globalStyleSheet];
  }

  const mountPoint = document.createElement('div');
  mountPoint.id = 'mount-point';
  shadowRoot.appendChild(mountPoint);
  createRoot(mountPoint).render(<ConversationNavigator />);

  colorLog('导航器初始化成功', 'success');
};

// 监听 URL 变化，重新初始化插件
const initUrlChangeListener = () => {
  let lastHref = location.href;
  setInterval(() => {
    if (location.href !== lastHref) {
      console.log('URL changed 222:', location.href);
      lastHref = location.href;
      initializePlugin();
    }
  }, 1000);
};

// 初始化
setTimeout(() => {
  initializePlugin();
  initUrlChangeListener();
}, 2000);
