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
        sidebar.style.width = '200px';
        sidebar.style.backgroundColor = '#fff';
        sidebar.style.border = '1px solid #ccc';
        sidebar.style.padding = '10px';
        sidebar.style.zIndex = '9999';
        sidebar.style.maxHeight = '90vh';
        sidebar.style.overflowY = 'auto';
        sidebar.style.color = '#000'; // 添加文字颜色
        sidebar.style.fontSize = '14px'; // 添加字体大小
        
        // 添加链接样式
        const style = document.createElement('style');
        style.textContent = `
            #chatgpt-nav-sidebar a {
                color: #2563eb;
                text-decoration: none;
                display: block;
                padding: 5px 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            #chatgpt-nav-sidebar a:hover {
                text-decoration: underline;
            }
        `;
        document.head.appendChild(style);
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
            navItem.innerHTML = `<a href="#${id}">User: ${textContent}</a>`;
            sidebar.appendChild(navItem);
            node.id = id;
        }
    };

    createNavigationSidebar();

    initializeNavigator();
})();
