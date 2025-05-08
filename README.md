English | [中文](./README_zh-CN.md)

# ChatGPT Conversation Navigator (prompts navigator)

ChatGPT Conversation Navigator is a user script that provides navigation for multi-turn conversations. It enhances the ChatGPT interface by adding clickable conversation indexes. This tool provides users with a sidebar containing links to each user question, allowing them to easily browse their conversation history.

## Features

- Add clickable conversation indexes on the ChatGPT page for easy navigation.
- Automatically track and highlight the current position in the conversation.
- Support both light and dark themes, adapting to ChatGPT's interface.
- Automatically update navigation when new messages are added.
- Only display navigation when conversations exceed three entries.

## Installation

**Method 1: Install from Chrome Web Store (Recommended)**

1. Click [here](https://chromewebstore.google.com/detail/chatgpt-%E5%AF%B9%E8%AF%9D%E5%AF%BC%E8%88%AA%E5%99%A8/phelhffecoejnegmdnboboofmhhmhlcf) to install the extension from Chrome Web Store.

**Method 2: Manual Installation**

1.  Go to the [Releases page](https://github.com/tianyw0/ai-conversation-navigator/releases) of this repository.
2.  Download the latest `chatgpt-conversation-navigator-chrome-vx.x.x.zip` file (or the Firefox equivalent if needed).
3.  Unzip the downloaded file to a local directory.
4.  Open your Chrome browser and navigate to `chrome://extensions`.
5.  Enable "Developer mode" (usually a toggle in the top right corner).
6.  Click on "Load unpacked" and select the directory where you unzipped the extension files.

## Usage

After installation, the navigator will automatically display on the ChatGPT page. You can quickly access any part of the conversation by clicking on the links in the sidebar.

## Demo

<div style="display: flex; justify-content: space-between;">
  <div style="flex: 1; margin-right: 10px;">
    <p><strong>Dark Mode</strong></p>
    <img src="./docs/promotional_material/chatgpt-navigator-dark.png" alt="Dark Mode Demo" style="width: 100%;">
  </div>
  <div style="flex: 1; margin-left: 10px;">
    <p><strong>Light Mode</strong></p>
    <img src="./docs/promotional_material/chatgpt-navigator-light.png" alt="Light Mode Demo" style="width: 100%;">
  </div>
</div>

## License

MIT

## Support

For help or to report issues, please visit the [support page](https://github.com/tianyw0/ai-conversation-navigator/issues).

## Acknowledgements

This project was inspired by and benefited from the [chrome-extension-boilerplate-react-vite](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite) project. Special thanks to its contributors.

Powered by ChatGPT & [Trae IDE](https://www.trae.ai/)