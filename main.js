// ==UserScript==
// @name         ChatGPT Conversation Navigator
// @name:zh      ChatGPT 对话导航器
// @name:en      ChatGPT Conversation Navigator
// @namespace    http://tampermonkey.net/
// @version      1.0.2
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
        const chatContainer = document.querySelector('article[data-testid]');
        
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
    
        const existingMessages = document.querySelectorAll('article[data-testid]');
        log(`找到 ${existingMessages.length} 条现有对话`);
        existingMessages.forEach(node => createNavigationItem(node));
    
        // 移除加载状态
        const loadingElement = document.querySelector('.nav-loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    
        setupObserver();
        log('导航初始化完成');
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
        const sidebar = document.createElement('div');
        sidebar.id = 'chatgpt-nav-sidebar';
        sidebar.style.position = 'fixed';
        sidebar.style.top = '80px';
        sidebar.style.left = '20px';
        sidebar.style.width = '300px';
        sidebar.style.backgroundColor = 'var(--surface-primary)';
        sidebar.style.padding = '12px';
        sidebar.style.zIndex = '10';
        sidebar.style.maxHeight = 'calc(100vh - 100px)';
        sidebar.style.overflowY = 'auto';
        sidebar.style.fontSize = '16px';
        sidebar.style.fontWeight = '500';
        sidebar.style.borderRadius = '12px';
        sidebar.style.backdropFilter = 'blur(8px)';
        sidebar.style.backgroundColor = 'rgba(52, 53, 65, 0.7)';

        const style = document.createElement('style');
        style.textContent = `
            #chatgpt-nav-sidebar {
                opacity: 0;
                transform: translateX(-20px);
                animation: slideIn 0.3s ease forwards;
                transition: opacity 0.3s ease;
                left: 20px !important;
                right: auto !important;
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
                color: var(--text-primary, #ececf1);
                text-decoration: none;
                display: block;
                padding: 8px 12px;
                margin: 0;
                border-radius: 6px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: pre-wrap;
                line-height: 1.5;
                max-height: none;
                font-size: 16px;
                font-weight: 500;
                transition: all 0.2s ease;
                background-color: transparent;
                border-left: 3px solid transparent;
            }
            
            #chatgpt-nav-sidebar a:hover {
                background-color: rgba(52, 53, 65, 0.9);
                border-left-color: var(--text-primary, #ececf1);
            }
            
            #chatgpt-nav-sidebar .nav-item-wrapper {
                padding: 2px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
        
        const textContent = node.querySelector('.whitespace-pre-wrap')?.innerText.trim() || node.innerText.trim().split('\n')[0];
        log(`提取文本内容: ${textContent}`);

        if (isUserQuestion) {
            const wrapper = document.createElement('div');
            wrapper.className = 'nav-item-wrapper';
            const navItem = document.createElement('div');
            navItem.innerHTML = `<a href="#${id}">${textContent}</a>`;
            wrapper.appendChild(navItem);
            sidebar.appendChild(wrapper);
            node.id = id;
        }
    };

    // 移除原有的事件监听代码
    // window.addEventListener('DOMContentLoaded', (event) => {
    //     initializeNavigator();
    // });
    
    // 替换为新的初始化逻辑
    if (document.readyState === 'loading') {
    // 如果页面还在加载中，等待 DOMContentLoaded 事件
    window.addEventListener('DOMContentLoaded', initializeNavigator);
    } else {
    // 如果页面已经加载完成，直接执行初始化
    initializeNavigator();
    }
})();
