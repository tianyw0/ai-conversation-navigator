export function themeChangeTrigger() {
  function monitor() {
    const newTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const mountPoint = document
      .querySelector('#ai-conversation-navigator-root')
      ?.shadowRoot?.querySelector('#mount-point');
    mountPoint && (mountPoint.className = newTheme);
    console.log(`new theme is ${newTheme}`);
  }
  // 先运行一次
  monitor();
  const themeObserver = new MutationObserver(() => {
    monitor();
  });

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  return () => themeObserver.disconnect();
}
