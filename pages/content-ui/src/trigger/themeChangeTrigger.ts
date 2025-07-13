export function themeChangeTrigger() {
  const themeObserver = new MutationObserver(() => {
    const newTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const mountPoint = document
      .querySelector('#ai-conversation-navigator-root')
      ?.shadowRoot?.querySelector('#mount-point');
    if (newTheme === 'dark') {
      mountPoint?.classList.add('dark');
      mountPoint?.classList.remove('light');
    } else {
      mountPoint?.classList.add('light');
      mountPoint?.classList.remove('dark');
    }
  });

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  return () => themeObserver.disconnect();
}
