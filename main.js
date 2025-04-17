// ==UserScript==
// @name         ChatGPT Conversation Navigator
// @name:zh      ChatGPT 对话导航器
// @name:en      ChatGPT Conversation Navigator
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Add a clickable conversation index on ChatGPT page
// @description:zh  为 ChatGPT 页面添加可点击的对话索引
// @description:en  Add a clickable conversation index on ChatGPT page
// @author       tianyw0
// @match        https://chatgpt.com/c/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    const MAX_RETRIES = 5;
    const RETRY_INTERVAL = 1000;
    let retryCount = 0;

    const log = (message, type = 'info') => {
        const prefix = '[ChatGPT Navigator]';
        switch(type) {
            case 'error':
                console.error(`${prefix} ${message}`);
                break;
            case 'warn':
                console.warn(`${prefix} ${message}`);
                break;
            default:
                console.log(`${prefix} ${message}`);
        }
    };

    const initializeNavigator = () => {
        // 修改选择器以匹配奇数结尾的 conversation-turn
        const chatContainer = document.querySelector('[data-testid$="1"], [data-testid$="3"], [data-testid$="5"], [data-testid$="7"], [data-testid$="9"]');
        
        if (!chatContainer && retryCount < MAX_RETRIES) {
            log(`未找到聊天容器，${RETRY_INTERVAL/1000}秒后重试 (${retryCount + 1}/${MAX_RETRIES})`, 'warn');
            retryCount++;
            setTimeout(initializeNavigator, RETRY_INTERVAL);
            return;
        }

        if (!chatContainer) {
            log('无法找到聊天容器，初始化失败', 'error');
            return;
        }

        log('成功找到聊天容器，开始初始化导航');

        const existingSidebar = document.getElementById('chatgpt-nav-sidebar');
        if (existingSidebar) {
            log('检测到现有导航栏，正在重置');
            existingSidebar.innerHTML = '';
        } else {
            log('创建新的导航栏');
            createNavigationSidebar();
        }

        const existingMessages = document.querySelectorAll('.text-token-text-primary');
        log(`找到 ${existingMessages.length} 条现有对话`);
        existingMessages.forEach(node => createNavigationItem(node));

        setupObserver();
        log('导航初始化完成');
    };

    const setupObserver = () => {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.classList.contains('text-token-text-primary')) {
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
        const sidebar = document.createElement('div');
        sidebar.id = 'chatgpt-nav-sidebar';
        sidebar.style.position = 'fixed';
        sidebar.style.top = '20px';
        sidebar.style.right = '20px';
        sidebar.style.width = '280px'; // 增加宽度
        sidebar.style.backgroundColor = 'var(--surface-primary)'; // 使用 ChatGPT 的背景色
        sidebar.style.padding = '15px';
        sidebar.style.zIndex = '9999';
        sidebar.style.maxHeight = '90vh';
        sidebar.style.overflowY = 'auto';
        sidebar.style.color = 'var(--text-primary)'; // 使用 ChatGPT 的文字颜色
        sidebar.style.fontSize = '14px';
        sidebar.style.borderRadius = '8px'; // 圆角
        sidebar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'; // 添加阴影
        
        // 添加加载动画和样式
        const style = document.createElement('style');
        style.textContent = `
            #chatgpt-nav-sidebar {
                opacity: 0;
                transform: translateX(20px);
                animation: slideIn 0.3s ease forwards;
            }
            
            @keyframes slideIn {
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            #chatgpt-nav-sidebar::-webkit-scrollbar {
                width: 6px;
            }
            
            #chatgpt-nav-sidebar::-webkit-scrollbar-thumb {
                background-color: rgba(86, 88, 105, 0.3);
                border-radius: 3px;
            }
            
            #chatgpt-nav-sidebar a {
                color: var(--text-primary);
                text-decoration: none;
                display: block;
                padding: 8px 12px;
                margin: 4px 0;
                border-radius: 6px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: pre-line;
                line-height: 1.5;
                max-height: 4.5em; // 显示三行文字
                transition: background-color 0.2s;
            }
            
            #chatgpt-nav-sidebar a:hover {
                background-color: var(--surface-secondary);
            }
            
            .nav-loading {
                display: flex;
                justify-content: center;
                padding: 20px;
                color: var(--text-secondary);
            }
            
            @keyframes pulse {
                50% { opacity: 0.5; }
            }
            
            .nav-loading::after {
                content: "加载中...";
                animation: pulse 1.5s ease-in-out infinite;
            }
        `;
        document.head.appendChild(style);
        
        // 添加加载提示
        const loading = document.createElement('div');
        loading.className = 'nav-loading';
        sidebar.appendChild(loading);
        
        document.body.appendChild(sidebar);
    };

    const createNavigationItem = (node) => {
        const sidebar = document.getElementById('chatgpt-nav-sidebar');
        if (!sidebar) {
            log('导航栏不存在，无法创建导航项', 'error');
            return;
        }

        const dataTestId = node.getAttribute('data-testid');
        if (!dataTestId) {
            log('节点缺少 data-testid 属性', 'warn');
            return;
        }

        const isUserQuestion = parseInt(dataTestId.split('-')[2]) % 2 === 1;
        const id = `nav-${dataTestId}`;
        
        // 获取最内层的文本内容
        const textContent = node.querySelector('.whitespace-pre-wrap')?.innerText.trim() || node.innerText.trim().split('\n')[0];
        log(`提取文本内容: ${textContent}`);

        // 只为用户提问创建导航项
        if (isUserQuestion) {
            const navItem = document.createElement('div');
            navItem.innerHTML = `<a href="#${id}">${textContent}</a>`;
            sidebar.appendChild(navItem);
            node.id = id;
        }
    };

    createNavigationSidebar();

    initializeNavigator();
})();
