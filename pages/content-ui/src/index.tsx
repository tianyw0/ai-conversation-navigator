import { createRoot } from 'react-dom/client';
import { App } from './App';
// @ts-expect-error Because file doesn't exist before build
import tailwindcssOutput from '../dist/tailwind-output.css?inline';

// content script
const initializePlugin = (retryCount = 0, maxRetries = 5) => {
  const existingNavigator = document.getElementById('ai-conversation-navigator-root');
  if (existingNavigator) {
    existingNavigator.remove();
  }

  const shadowHost = document.createElement('div');
  shadowHost.id = 'ai-conversation-navigator-root';
  shadowHost.style.zIndex = '9999';

  document.body.appendChild(shadowHost);
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

initializePlugin();
