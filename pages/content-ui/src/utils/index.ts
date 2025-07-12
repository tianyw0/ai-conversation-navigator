export function extractFullContent(node: HTMLElement): string {
  let textContent =
    (node.querySelector('.whitespace-pre-wrap') as HTMLElement)?.innerText.trim() || node.innerText.trim();
  const quote = node.querySelector('p.line-clamp-3');
  if (quote instanceof HTMLElement) {
    textContent = quote.innerText.trim() + textContent;
  }
  return textContent
    .split(/[\n\r]+/)
    .join(' ')
    .replace(/\s+/g, ' ');
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
