(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  let scheduled = false;
  function updateHeader() {
    header.classList.toggle('scrolled', window.scrollY > 24);
    scheduled = false;
  }
  window.addEventListener('scroll', () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(updateHeader);
    }
  }, { passive: true });
  updateHeader();

  const wechatLink = document.getElementById('wechat-link');
  const dialog = document.getElementById('wechat-contact');
  if (!wechatLink || !dialog) return;
  const wechatId = document.getElementById('wechat-id');
  const copyButton = document.getElementById('copy-wechat');
  const status = document.getElementById('wechat-status');

  wechatLink.addEventListener('click', event => {
    event.preventDefault();
    status.textContent = '';
    dialog.showModal();
    document.body.classList.add('contact-open');
    copyButton.focus();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('contact-open');
    wechatLink.focus({ preventScroll: true });
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  wechatId.addEventListener('focus', () => wechatId.select());
  copyButton.addEventListener('click', async () => {
    let copied = false;
    try {
      await navigator.clipboard.writeText(wechatId.value);
      copied = true;
    } catch {
      wechatId.focus();
      wechatId.select();
      try { copied = document.execCommand('copy'); } catch { /* Keep the ID selected for manual copying. */ }
    }
    status.textContent = copied ? 'Copied! Search Rasdjex in WeChat.' : 'Select and copy Rasdjex, then search in WeChat.';
    if (copied) copyButton.focus();
  });
})();
