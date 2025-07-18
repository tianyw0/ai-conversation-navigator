import { PromptEntity } from '@src/types';
import { escapeHtml, extractFullContent } from '@src/utils';

export function promptsChangeTrigger(promptsSetter: React.Dispatch<React.SetStateAction<PromptEntity[] | undefined>>) {
  const observer = new MutationObserver(() => {
    const questionElements = document.querySelectorAll('div[data-message-author-role="user"]');

    const promptEntities: PromptEntity[] = Array.from(questionElements)
      .map(element => {
        const dataMessageId = (element as HTMLElement).dataset.messageId;
        const content = extractFullContent(element as HTMLElement);
        return {
          elementId: dataMessageId,
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
