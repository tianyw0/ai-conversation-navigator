import { createRoot } from 'react-dom/client';
import App from '@src/App';
// @ts-expect-error Because file doesn't exist before build
import tailwindcssOutput from '../dist/tailwind-output.css?inline';

// 等待文档加载完成后再初始化插件
const initializePlugin = () => {
  const root = document.createElement('div');
  root.id = 'ai-conversation-navigator-root';

  document.body.append(root);

  const rootIntoShadow = document.createElement('div');
  rootIntoShadow.id = 'shadow-root';

  const shadowRoot = root.attachShadow({ mode: 'open' });

  if (navigator.userAgent.includes('Firefox')) {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = tailwindcssOutput;
    shadowRoot.appendChild(styleElement);
  } else {
    const globalStyleSheet = new CSSStyleSheet();
    globalStyleSheet.replaceSync(tailwindcssOutput);
    shadowRoot.adoptedStyleSheets = [globalStyleSheet];
  }

  shadowRoot.appendChild(rootIntoShadow);
  createRoot(rootIntoShadow).render(<App />);
};

setTimeout(() => {
  initializePlugin();
}, 200);
