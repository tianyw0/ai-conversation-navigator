### 开发需求文档内容
1. 分析 chatgpt 对话 dom，提取当前用户的所有提问，将提问整理成目录列表
2. 监听新增的提问，加入到目录列表
3. 点击目录列表中的某一项，跳转到对应的提问， 并将该提问的回答滚动到可视区域
4. 用户互动对话内容区域，目录要跟随滚动
5. 深浅色模式不允许切换，自动根据原网站的样式进行适配

## 可能有帮助的信息，以及一些具体的要求

### 可以通过这样的逻辑找到所有的提问：

```js
Array.from(document.querySelectorAll('article[data-testid^="conversation-turn-"]')).filter(
      el => {
        const id = el.dataset.testid.split('-').pop();
        return Number(id) % 2 === 1;
      },
    );
```

### 处理提问目录在 dom 中的放置逻辑

#thread下有一个div[role="presentation"]我们叫它 presentationDiv，presentationDiv，下面有三个div，我们叫他们div1，div2，div3。我们的目录列表的叫 sidebarDiv。具体的组装逻辑是，新建一个 newdiv2，将 sidebar 和div2 都放在 newdiv2 中，然后将 div1 ，newdiv2, div3 都放在 presentationDiv 中。

### 样式要求

1. 因为原网站采用的 flex 布局，我们新增的 dom也用 flex 布局。
2. 要支持深色模式和浅色模式，并且要有一个开关设置样式跟随当前网站的样式，而不是系统样式，分别背景色是 #212121 和 #FFFFFF，以及两个borderRight = '1px solid rgba(255,255,255,0.08)'; borderRight = '1px solid rgba(0,0,0,0.08)';
3. 响应式：1024px 以下的宽度，不要显示 sidebarDiv。

### sidebarDiv 的布局参考,使用的时候用 tailwindcss 实现

```js
sidebar.style.position = 'absolute';
sidebar.style.zIndex = '1000';
sidebar.style.left = '0';
sidebar.style.top = '0';
sidebar.style.width = 'min(260px, 25%)';
sidebar.style.height = 'calc(100% - 104px)';
sidebar.style.marginTop = '104px';
sidebar.style.flexShrink = '0';
sidebar.style.overflowY = 'auto';
sidebar.style.fontSize = '16px';
sidebar.style.fontWeight = '500';
sidebar.style.borderRadius = '0';
sidebar.style.backdropFilter = 'none';
```


### dom 提取目录内容注意,可以参考下面逻辑

```js
// 转义HTML内容
const escapeHtml = unsafe => {
    return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const textContent = (node.querySelector('.whitespace-pre-wrap')?.innerText.trim() || node.innerText.trim())
    .split(/[\n\r]+/)
    .join(' ')
    .replace(/\s+/g, ' ');
const displayText =
    textContent.length > 20 ? escapeHtml(textContent.slice(0, 20)) + '...' : escapeHtml(textContent);

```




