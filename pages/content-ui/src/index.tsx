import { createRoot } from 'react-dom/client';
import App from '@src/App';
// @ts-expect-error Because file doesn't exist before build
import tailwindcssOutput from '../dist/tailwind-output.css?inline';

// 等待文档加载完成后再初始化插件
const initializePlugin = () => {
  const shadowHost = document.createElement('div');
  shadowHost.id = 'ai-conversation-navigator-root';
  document.body.append(shadowHost);
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
  createRoot(mountPoint).render(<App />);
};

setTimeout(() => {
  initializePlugin();
}, 200);
