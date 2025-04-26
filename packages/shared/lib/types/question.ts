/**
 * 表示对话中的问题
 */
export interface Question {
  /**
   * 问题的唯一标识符，来自 DOM 元素的 data-testid
   */
  id: string;

  /**
   * 问题对应的 DOM 元素
   */
  element: HTMLElement;

  /**
   * 问题的文本内容
   */
  text: string;
}
