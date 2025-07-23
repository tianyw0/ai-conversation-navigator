let listening = false;

window.addEventListener('keydown', e => {
  const editor = document.querySelector('#prompt-textarea');
  const isTyping = editor?.classList.contains('ProseMirror-focused');

  if (isTyping) return;

  if (e.code === 'Space') {
    e.preventDefault();
    const btns = document.querySelectorAll('.composer-btn');
    const target = listening ? btns[3] : btns[2];
    if (target) {
      target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      listening = !listening;
    }
  }
});
