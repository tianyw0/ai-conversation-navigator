[English](./README.md) | 中文

# ChatGPT 对话导航器 (prompts navigator)

ChatGPT 对话导航器是一个用户脚本，为多轮对话提供导航。通过添加可点击的对话索引来增强 ChatGPT 界面。该工具为用户提供了一个侧边栏，其中包含每个用户问题的链接，使用户能够轻松浏览其对话历史。

## 功能

- 在 ChatGPT 页面上添加可点击的对话索引，便于导航。
- 自动跟踪并高亮显示当前对话位置。
- 支持深色和浅色主题，自动适应 ChatGPT 的界面风格。
- 新消息添加时自动更新导航目录。
- 仅在对话超过三条时才显示导航目录，避免视觉干扰。
- 自动更新新消息。
- 简洁的设计和直观的功能。

## 安装

**方法一：从 Chrome 应用商店安装 (推荐)**

1. 点击 [这里](https://chromewebstore.google.com/detail/promptdock/phelhffecoejnegmdnboboofmhhmhlcf) 从 Chrome 应用商店安装扩展。

**方法二：手动安装**

1.  访问本仓库的 [Releases 页面](https://github.com/tianyw0/promptdock/releases)。
2.  下载最新的 `promptdock-chrome-vx.x.x.zip` 文件 (如果需要，也可以下载 Firefox 版本)。
3.  将下载的 `zip` 文件解压到本地一个文件夹中。
4.  打开您的 Chrome 浏览器，访问 `chrome://extensions`。
5.  启用“开发者模式”（通常在页面右上角有一个开关）。
6.  点击“加载已解压的扩展程序”按钮，然后选择您解压扩展文件所在的文件夹。

## 使用

安装后，导航器将在 ChatGPT 页面上自动显示。您可以通过点击侧边栏中的链接快速访问对话中的任何部分。

## 效果

<div style="display: flex; justify-content: space-between;">
  <div style="flex: 1; margin-right: 10px;">
    <p><strong>深色模式</strong></p>
    <img src="./docs/promotional_material/chatgpt-navigator-dark.png" alt="Dark Mode Demo" style="width: 100%;">
  </div>
  <div style="flex: 1; margin-left: 10px;">
    <p><strong>浅色模式</strong></p>
    <img src="./docs/promotional_material/chatgpt-navigator-light.png" alt="Light Mode Demo" style="width: 100%;">
  </div>
</div>

## 许可证

MIT

## 支持

如需帮助或报告问题，请访问 [支持页面](https://github.com/tianyw0/ai-conversation-navigator/issues)。

## 致谢

本项目的开发受到了 [chrome-extension-boilerplate-react-vite](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite) 项目的启发和帮助，特此感谢。

Powered by ChatGPT & [Trae IDE](https://www.trae.ai/)