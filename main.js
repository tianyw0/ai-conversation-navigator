// ==UserScript==
// @name         ChatGPT Conversation Navigator
// @name:zh      ChatGPT 对话导航器
// @name:en      ChatGPT Conversation Navigator
// @namespace    http://tampermonkey.net/
// @version      1.0.4
// @description  Add a clickable conversation index on ChatGPT page
// @description:zh  为 ChatGPT 页面添加可点击的对话索引
// @description:en  Add a clickable conversation index on ChatGPT page
// @author       tianyw0
// @match        https://chatgpt.com/c/*
// @grant        GM_addStyle
// @license      MIT
// @homepageURL  https://github.com/tianyw0/ai-conversation-navigator
// @supportURL   https://github.com/tianyw0/ai-conversation-navigator/issues
// @updateURL    https://raw.githubusercontent.com/tianyw0/ai-conversation-navigator/main/main.js
// @downloadURL  https://raw.githubusercontent.com/tianyw0/ai-conversation-navigator/main/main.js
// ==/UserScript==

(function() {
    'use strict';

    const MAX_RETRIES = 50;
    const RETRY_INTERVAL = 1000;
    let retryCount = 0;

    const utils = {
        log(message, type = 'info') {
            let prefix;
            switch(type) {
                case 'error':
                    prefix = '[ChatGPT Navigator] ❌';
                    console.error(`${prefix} ${message}`);
                    break;
                case 'warn':
                    prefix = '[ChatGPT Navigator] ⚠️';
                    console.warn(`${prefix} ${message}`);
                    break;
                default:
                    prefix = '[ChatGPT Navigator] 🚀';
                    console.log(`${prefix} ${message}`);
            }
        }
    };

    const initializeNavigator = () => {
        // 重置重试计数
        retryCount = 0;
        
        // 原有的初始化逻辑
        const chatContainer = document.querySelector('article[data-testid]');
        
        if (!chatContainer && retryCount < MAX_RETRIES) {
            utils.log(`未找到聊天容器，${RETRY_INTERVAL/1000}秒后重试 (${retryCount + 1}/${MAX_RETRIES})`, 'warn');
            retryCount++;
            setTimeout(initializeNavigator, RETRY_INTERVAL);
            return;
        }
        if (!chatContainer) {
            utils.log('无法找到聊天容器，初始化失败', 'error');
            return;
        }
        utils.log('成功找到聊天容器，开始初始化导航');
    
        const existingSidebar = document.getElementById('chatgpt-nav-sidebar');
        if (existingSidebar) {
            utils.log('检测到现有导航栏，正在重置');
            existingSidebar.innerHTML = '';
        } else {
            utils.log('创建新的导航栏');
            createNavigationSidebar();
        }
    
        // 找到所有奇数 data-testid 的元素
        const existingMessages = Array.from(
            document.querySelectorAll('article[data-testid^="conversation-turn-"]')
          ).filter(el => {
            const id = el.dataset.testid.split('-').pop();
            return Number(id) % 2 === 1;
          });
          
        utils.log(`找到 ${existingMessages.length} 条提问`);
        existingMessages.forEach(node => createNavigationItem(node));
    
        // 移除加载状态
        const loadingElement = document.querySelector('.nav-loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    
        setupObserver();
        utils.log('导航初始化完成');
    };
    
    const setupObserver = () => {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.tagName === 'ARTICLE' && node.hasAttribute('data-testid')) {
                        createNavigationItem(node);
                    }
                });
            });
        });
    
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    };

    const createNavigationSidebar = () => {
        // 1. 找到目标容器和所有需要的元素
        const threadContainer = document.getElementById('thread');
        const presentationDiv = threadContainer?.querySelector('div[role="presentation"]');
        if (!presentationDiv) {
            utils.log('未找到目标容器', 'warn');
            return;
        }

        // 保存原始的三个 div
        const originalDivs = Array.from(presentationDiv.children);
        if (originalDivs.length !== 3) {
            utils.log('目标容器结构不符合预期', 'warn');
            return;
        }
        const [div1, div2, div3] = originalDivs;

        // 2. 清空 presentation div
        presentationDiv.innerHTML = '';

        // 3. 创建导航栏和新的 flex 容器
        const sidebar = document.createElement('div');
        sidebar.id = 'chatgpt-nav-sidebar';
        
        // 设置导航栏样式
        sidebar.style.position = 'absolute';
        sidebar.style.zIndex = '1000';
        sidebar.style.left = '0';
        sidebar.style.top = '0';
        sidebar.style.width = 'min(260px, 25%)';
        sidebar.style.height = 'calc(100% - 50px)';
        sidebar.style.marginTop = '50px';
        sidebar.style.flexShrink = '0';
        sidebar.style.backgroundColor = '#212121'; // 主背景色
        sidebar.style.overflowY = 'auto';
        sidebar.style.fontSize = '16px';
        sidebar.style.fontWeight = '500';
        sidebar.style.borderRadius = '0';
        sidebar.style.backdropFilter = 'none';

        // 创建新的 flex 容器包装 div2 和导航栏
        const newDiv2 = document.createElement('div');
        newDiv2.style.display = 'flex';
        newDiv2.style.flexDirection = 'row';
        newDiv2.style.width = '100%';
        newDiv2.style.height = '100%';
        newDiv2.style.overflow = 'hidden';
        newDiv2.style.position = 'relative'; // 添加相对定位作为定位上下文
        newDiv2.appendChild(sidebar);
        newDiv2.appendChild(div2);

        // 4. 重新组装所有元素
        presentationDiv.appendChild(div1);
        presentationDiv.appendChild(newDiv2);
        presentationDiv.appendChild(div3);

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            #chatgpt-nav-sidebar {
                opacity: 0;
                transform: translateX(-20px);
                animation: slideIn 0.3s ease forwards;
                transition: opacity 0.3s ease, transform 0.3s ease;
                left: 20px !important;
                right: auto !important;
                border-right: 1px solid rgba(255,255,255,0.08);
                background: #212121;
            }

            @media (max-width: 1024px) {
                #chatgpt-nav-sidebar {
                    display: none;
                }
            }

            @keyframes slideIn {
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            #chatgpt-nav-sidebar::-webkit-scrollbar {
                width: 4px;
            }

            #chatgpt-nav-sidebar::-webkit-scrollbar-thumb {
                background-color: rgba(217, 217, 227, 0.2);
                border-radius: 2px;
            }

            #chatgpt-nav-sidebar::-webkit-scrollbar-track {
                background-color: transparent;
            }

            #chatgpt-nav-sidebar a {
                color: #ececf1;
                text-decoration: none;
                display: block;
                padding: 8px 12px;
                margin: 0;
                border-radius: 4px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                line-height: 1.5;
                font-size: 16px;
                font-weight: 400;
                transition: background 0.2s, border-radius 0.2s;
                background-color: transparent;
            }

            #chatgpt-nav-sidebar a:hover {
                background-color: #303030;
                border-radius: 1.5rem;
            }

            #chatgpt-nav-sidebar .nav-index {
                color: #6e6e80; /* 更浅的灰色 */
                margin-right: 6px;
                font-size: 15px;
            }

            #chatgpt-nav-sidebar .nav-item-wrapper {
                padding: 2px 0;
                border-bottom: 1px solid rgba(255,255,255,0.06);
                width: calc(100% - 24px); /* 缩短分割线，留出圆角空间 */
                margin-left: 12px;
            }

            #chatgpt-nav-sidebar .nav-item-wrapper:last-child {
                border-bottom: none;
            }
            
            .nav-loading {
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
                color: var(--text-secondary, #ececf1);
                gap: 8px;
            }
            
            .nav-loading::before {
                content: "";
                width: 16px;
                height: 16px;
                border: 2px solid rgba(217, 217, 227, 0.2);
                border-top-color: var(--text-secondary, #ececf1);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                to {
                    transform: rotate(360deg);
                }
            }
            
            .nav-loading::after {
                content: "加载中";
                animation: dots 1.5s infinite;
            }
            
            @keyframes dots {
                0% { content: "加载中"; }
                33% { content: "加载中."; }
                66% { content: "加载中.."; }
                100% { content: "加载中..."; }
            }
        `;
        document.head.appendChild(style);
        
        // 添加加载状态
        const loading = document.createElement('div');
        loading.className = 'nav-loading';
        sidebar.appendChild(loading);
    };

    const createNavigationItem = (node) => {
        const sidebar = document.getElementById('chatgpt-nav-sidebar');
        if (!sidebar) {
            utils.log('导航栏不存在，无法创建导航项', 'error');
            return;
        }

        const dataTestId = node.getAttribute('data-testid');
        if (!dataTestId) {
            utils.log('节点缺少 data-testid 属性', 'warn');
            return;
        }

        const isUserQuestion = parseInt(dataTestId.split('-')[2]) % 2 === 1;
        const id = `nav-${dataTestId}`;
        
        const textContent = (node.querySelector('.whitespace-pre-wrap')?.innerText.trim() || node.innerText.trim())
                    .split(/[\n\r]+/)
                    .join(' ')
                    .replace(/\s+/g, ' ');
        const displayText = textContent.length > 20 ? textContent.slice(0, 20) + '...' : textContent;
        utils.log(`提问: ${textContent}`);
        if (!isUserQuestion) {
            utils.log('非用户提问，跳过', 'warn');
            return;
        }
        // 获取当前导航项序号
        const navItemsCount = sidebar.querySelectorAll('.nav-item-wrapper').length + 1;
        const wrapper = document.createElement('div');
        wrapper.className = 'nav-item-wrapper';
        const navItem = document.createElement('div');
        navItem.innerHTML = `<a href="#${id}" title="${textContent}"><span class="nav-index">${navItemsCount}.</span> ${displayText}</a>`;
        wrapper.appendChild(navItem);
        sidebar.appendChild(wrapper);
        node.id = id;
    };
    // 添加 URL 变化监听
    let lastUrl = location.href;
    const urlObserver = new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            utils.log('检测到页面 URL 变化，重新初始化导航');
            setTimeout(initializeNavigator, 500); // 延迟执行以等待页面内容加载
        }
    });

    // 开始监听 URL 变化
    urlObserver.observe(document.querySelector('body'), {
        childList: true,
        subtree: true
    });

    // 初始化执行
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', initializeNavigator);
    } else {
        initializeNavigator();
    }
})();
