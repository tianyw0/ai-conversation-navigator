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
        const chatContainer = document.querySelector('[data-testid="conversation-turn-"]');
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

        const isUserQuestion = parseInt(dataTestId.split('-')[2]) % 2 === 1; // 判断是否为用户提问（奇数）
        const id = `nav-${dataTestId}`;
        const textContent = node.innerText.trim().split('\n')[0]; // 获取对话的第一行

        if (isUserQuestion) {
            const navItem = document.createElement('div');
            navItem.innerHTML = `<a href="#${id}">User: ${textContent}</a>`;
            sidebar.appendChild(navItem);

            // 给用户的提问加上唯一的 ID
            node.id = id;
        } else {
            const navItem = document.createElement('div');
            navItem.innerHTML = `<a href="#${id}">ChatGPT: ${textContent}</a>`;
            sidebar.appendChild(navItem);

            // 给 ChatGPT 的回答加上唯一的 ID
            node.id = id;
        }
    };

    createNavigationSidebar();

    initializeNavigator();
})();
