import { t } from '@extension/i18n';

export function extractFullContent(node: HTMLElement): string {
  // 这里先检测 node 中是否包含 img 标签，如果有img，需要加上前缀"[图片]"
  let text = '';
  const img = node.querySelector('img');
  if (img) {
    // 使用 i18n 的 t 函数替换硬编码文本
    text = t('image_placeholder');
  }

  let textContent =
    (node.querySelector('.whitespace-pre-wrap') as HTMLElement)?.innerText.trim() || node.innerText.trim();
  const quote = node.querySelector('p.line-clamp-3');
  if (quote instanceof HTMLElement) {
    textContent = quote.innerText.trim() + textContent;
  }
  return (
    text +
    textContent
      .split(/[\n\r]+/)
      .join(' ')
      .replace(/\s+/g, ' ')
  );
}

export function escapeHtml(unsafe: string): string {
  return unsafe.replace(/<[^>]*>/g, match => match.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
}

export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  } as T;
}

export function isElementVisibleEnough(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
  return visibleHeight >= Math.min(250, rect.height * 0.3); // 可见面积需超过 250px 或元素高度的 30%
}
