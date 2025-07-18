export function themeChangeTrigger() {
  const themeObserver = new MutationObserver(() => {
    const newTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const mountPoint = document
      .querySelector('#ai-conversation-navigator-root')
      ?.shadowRoot?.querySelector('#mount-point');
    mountPoint && (mountPoint.className = newTheme);
    console.log(`new theme is ${newTheme}`);
  });

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  return () => themeObserver.disconnect();
}
