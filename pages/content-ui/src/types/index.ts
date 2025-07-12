// 定义对话项的数据结构
export type PromptEntity = {
  // 唯一标识符，用于定位和跳转
  id: number;
  // 对话元素的DOM ID，用于定位元素
  elementId: string;
  // 对话内容的摘要，显示在导航目录中
  summary: string;
  // 完整的对话内容
  content: string;
};
