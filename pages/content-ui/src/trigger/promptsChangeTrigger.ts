import { PromptEntity } from '@src/types';
import { escapeHtml, extractFullContent } from '@src/utils';

export function promptsChangeTrigger(promptsSetter: React.Dispatch<React.SetStateAction<PromptEntity[] | undefined>>) {
  const observer = new MutationObserver(() => {
    const questionElements = Array.from(document.querySelectorAll('article[data-testid^="conversation-turn-"]')).filter(
      el => {
        const id = (el as HTMLElement).dataset.testid?.split('-').pop();
        return id && Number(id) % 2 === 1;
      },
    );

    const promptEntities: PromptEntity[] = Array.from(questionElements)
      .map(element => {
        const testId = (element as HTMLElement).dataset.testid;
        const id = testId ? Number(testId.split('-').pop()) : NaN;
        if (isNaN(id)) return null;

        const content = extractFullContent(element as HTMLElement);
        return {
          id,
          elementId: testId || '',
          content,
          summary: escapeHtml(content),
        };
      })
      .filter((item): item is PromptEntity => item !== null);
    promptsSetter(promptEntities);
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true, // 监听深层嵌套结构变化
  });
  return () => observer.disconnect();
}
