(() => {
  'use strict';
  const fonts = [
    {id:'palatino',name:'Palatino Linotype',category:'serif',family:'Palatino Linotype',source:'主页正文 · 系统字体',local:true,italic:true,note:'古典、舒展，有温和的书卷气。',fallback:'EB Garamond'},
    {id:'times',name:'Times New Roman',category:'serif',family:'Times New Roman',source:'系统字体',local:true,italic:true,note:'熟悉的学术印刷感，紧凑、端正。',fallback:'Libre Baskerville'},
    {id:'georgia',name:'Georgia',category:'serif',family:'Georgia',source:'Shujie 实际渲染 · 系统字体',local:true,italic:true,reference:true,note:'圆润厚实，屏幕阅读清晰。',fallback:'Domine'},
    {id:'domine',name:'Domine',category:'serif',family:'Domine',source:'Shujie 声明字体 · 已内置',reference:true,note:'稳重、清楚，有报刊正文的质感。'},
    {id:'eb-garamond',name:'EB Garamond',category:'serif',family:'EB Garamond',source:'已内置',italic:true,note:'古典书籍感，克制、柔和。'},
    {id:'cormorant',name:'Cormorant Garamond',category:'serif',family:'Cormorant Garamond',source:'已内置',italic:true,note:'纤细、优雅，斜体尤其有韵味。'},
    {id:'baskerville',name:'Libre Baskerville',category:'serif',family:'Libre Baskerville',source:'已内置',italic:true,note:'稳重典雅，适合长段简介。'},
    {id:'playfair',name:'Playfair Display',category:'serif',family:'Playfair Display',source:'已内置',italic:true,note:'笔画对比鲜明，像杂志标题。'},
    {id:'bodoni',name:'Bodoni Moda',category:'serif',family:'Bodoni Moda',source:'已内置',italic:true,note:'细粗分明，精致而有仪式感。'},
    {id:'instrument',name:'Instrument Serif',category:'serif',family:'Instrument Serif',source:'已内置',italic:true,note:'修长、轻盈，带一点艺术气质。'},
    {id:'great-vibes',name:'Great Vibes',category:'script',family:'Great Vibes',source:'已内置',note:'装饰性连笔花体，适合姓名。'},
    {id:'allura',name:'Allura',category:'script',family:'Allura',source:'已内置',note:'流畅自然的签名字体。'},
    {id:'caveat',name:'Caveat',category:'script',family:'Caveat',source:'主页标题 · 已内置',note:'松弛的笔记感，亲切、自然。'},
    {id:'segoe-print',name:'Segoe Print',category:'script',family:'Segoe Print',source:'系统字体',local:true,note:'圆润的手写印刷体，像手账。',fallback:'Caveat'},
    {id:'nunito',name:'Nunito',category:'sans',family:'Nunito',source:'已内置',italic:true,note:'柔和的圆角，友好又容易阅读。'},
    {id:'quicksand',name:'Quicksand',category:'sans',family:'Quicksand',source:'已内置',note:'几何、圆润，轻巧而干净。'},
    {id:'dm-sans',name:'DM Sans',category:'sans',family:'DM Sans',source:'已内置',note:'简洁、平衡，适合与花体搭配。'},
    {id:'avenir',name:'Avenir Next Cyr',category:'sans',family:'Avenir Next Cyr Reference',source:'TRELLIS.2 · 在线参考',reference:true,remote:true,italic:true,note:'清爽的几何字形，现代、匀称。',fallback:'Nunito'}
  ];
  const defaults = {heading:'caveat',body:'palatino',headingSize:48,bodySize:16,italic:false};
  let state = {...defaults};
  try {
    const saved = JSON.parse(localStorage.getItem('zirui-font-studio-v1') || 'null');
    if (saved) {
      if (fonts.some(f => f.id === saved.heading)) state.heading = saved.heading;
      if (fonts.some(f => f.id === saved.body)) state.body = saved.body;
      if (Number.isFinite(saved.headingSize)) state.headingSize = Math.min(68, Math.max(32, saved.headingSize));
      if (Number.isFinite(saved.bodySize)) state.bodySize = Math.min(22, Math.max(13, saved.bodySize));
      state.italic = saved.italic === true;
    }
  } catch { /* Preview also works when browser storage is disabled. */ }
  let filter = 'all';
  let target = 'heading';
  let customFontNumber = 0;
  const $ = id => document.getElementById(id);
  const getFont = id => fonts.find(f => f.id === id);
  const generic = font => font.category === 'sans' ? 'sans-serif' : font.category === 'script' ? 'cursive' : 'serif';
  const familyCSS = font => `"${font.available === false ? font.fallback || 'Georgia' : font.family}", ${generic(font)}`;
  const make = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  function populateSelectors() {
    for (const field of ['heading', 'body']) {
      const select = $(`${field}-font`);
      select.replaceChildren();
      fonts.forEach(font => {
        const option = document.createElement('option');
        option.value = font.id;
        option.textContent = font.name;
        select.append(option);
      });
      select.value = state[field];
    }
  }

  function renderCards() {
    const visibleFonts = fonts.filter(font => filter === 'all' || (filter === 'reference' ? font.reference : font.category === filter));
    $('font-count').textContent = `${visibleFonts.length} / ${fonts.length}`;
    const fragment = document.createDocumentFragment();
    visibleFonts.forEach(font => {
      const card = make('button', 'font-card');
      card.type = 'button';
      card.dataset.font = font.id;
      card.dataset.category = font.category;
      const topline = make('span', 'card-top');
      topline.append(make('span', 'card-font-name', font.name), make('span', 'card-number', String(fonts.indexOf(font) + 1).padStart(2, '0')));
      card.append(topline, make('span', 'card-source', font.source), make('span', 'font-specimen', $('sample-text').value || 'Zirui Zhou'), make('span', 'card-line', 'Scenes, robotics & art.'), make('span', 'card-note', font.note), make('span', 'card-status'));
      card.addEventListener('click', () => { state[target] = font.id; renderPreview(); });
      fragment.append(card);
    });
    $('font-grid').replaceChildren(fragment);
    updateCards();
  }

  function updateCards() {
    document.querySelectorAll('.font-card').forEach(card => {
      const font = getFont(card.dataset.font);
      card.style.setProperty('--specimen-font', familyCSS(font));
      card.setAttribute('aria-pressed', String(font.id === state[target]));
      card.setAttribute('aria-label', `${font.name}，用作${target === 'heading' ? '标题' : '正文'}`);
      card.classList.toggle('is-unavailable', font.available === false);
      card.querySelector('.card-status').textContent = font.available === false
        ? `${font.local ? '本机未安装' : '字体未加载'}；当前预览：${font.fallback || 'Georgia'}`
        : font.remote && font.available === undefined ? '正在加载原站字体…' : '';
    });
  }

  function renderPreview() {
    const heading = getFont(state.heading);
    const body = getFont(state.body);
    const sheet = $('preview-sheet');
    sheet.style.setProperty('--heading-font', familyCSS(heading));
    sheet.style.setProperty('--body-font', familyCSS(body));
    sheet.style.setProperty('--heading-size', `${state.headingSize}px`);
    sheet.style.setProperty('--body-size', `${state.bodySize}px`);
    sheet.style.setProperty('--heading-style', state.italic && heading.italic ? 'italic' : 'normal');
    $('heading-font').value = state.heading;
    $('body-font').value = state.body;
    $('heading-size').value = state.headingSize;
    $('body-size').value = state.bodySize;
    $('heading-size-value').value = state.headingSize;
    $('body-size-value').value = state.bodySize;
    $('heading-italic').checked = state.italic;
    $('heading-italic').disabled = !heading.italic;
    const notes = [...new Set([heading, body])].filter(font => font.available === false).map(font => `${font.name} 暂不可用，显示 ${font.fallback || 'Georgia'}。`);
    if ([heading, body].some(font => font.remote && font.available !== false)) notes.push('Avenir Next Cyr 为原站在线参考；固定用于主页时可接入你提供的 Webfont。');
    $('font-status').textContent = notes.join(' ');
    $('copy-feedback').textContent = '挑好后，把字体名称或这段选择发给我。';
    $('selection-text').hidden = true;
    updateCards();
    try { localStorage.setItem('zirui-font-studio-v1', JSON.stringify(state)); } catch { /* Optional persistence. */ }
  }

  document.querySelectorAll('input[name="target"]').forEach(input => input.addEventListener('change', () => {
    target = input.value;
    updateCards();
  }));
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    renderCards();
  }));
  $('sample-text').addEventListener('input', event => {
    document.querySelectorAll('.font-specimen').forEach(sample => { sample.textContent = event.target.value || 'Zirui Zhou'; });
  });
  ['heading', 'body'].forEach(field => {
    $(`${field}-font`).addEventListener('change', event => { state[field] = event.target.value; renderPreview(); });
    $(`${field}-size`).addEventListener('input', event => { state[`${field}Size`] = Number(event.target.value); renderPreview(); });
  });
  $('heading-italic').addEventListener('change', event => { state.italic = event.target.checked; renderPreview(); });
  $('preview-title-input').addEventListener('input', event => { $('preview-name').textContent = event.target.value || 'Zirui Zhou'; });
  $('preview-body-input').addEventListener('input', event => { $('preview-copy').textContent = event.target.value; });
  $('reset').addEventListener('click', () => { state = {...defaults}; renderPreview(); });

  const presets = {
    classic: ['eb-garamond', 'baskerville', false],
    soft: ['cormorant', 'nunito', false],
    handwritten: ['allura', 'dm-sans', false],
    shujie: ['georgia', 'georgia', false],
    trellis: ['avenir', 'avenir', false]
  };
  document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => {
    [state.heading, state.body, state.italic] = presets[button.dataset.preset];
    renderPreview();
  }));

  $('copy-selection').addEventListener('click', async () => {
    const heading = getFont(state.heading);
    const body = getFont(state.body);
    const describe = font => font.available === false ? `${font.name}（当前预览替代字体：${font.fallback || 'Georgia'}）` : font.name;
    const text = `标题：${describe(heading)}，${state.headingSize}px${state.italic && heading.italic ? '，斜体' : ''}\n正文：${describe(body)}，${state.bodySize}px`;
    $('selection-text').value = text;
    $('selection-text').hidden = false;
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      $('copy-feedback').textContent = '已复制，把这段选择发给我就好。';
    } catch {
      $('selection-text').focus();
      $('selection-text').select();
      $('copy-feedback').textContent = '选择已显示在下方，可直接选中复制。';
    }
  });

  $('upload-font').addEventListener('change', async event => {
    const file = event.target.files[0];
    if (!file) return;
    $('upload-status').textContent = '正在读取字体…';
    try {
      const family = `ZiruiCustomFont${++customFontNumber}`;
      const face = new FontFace(family, await file.arrayBuffer());
      await face.load();
      document.fonts.add(face);
      const font = {id:`custom-${customFontNumber}`,name:file.name.replace(/\.(woff2?|ttf|otf)$/i,''),category:'custom',family,source:'本地导入 · 未上传',note:'当前浏览器中的字体文件。刷新后需重新导入。',available:true};
      fonts.push(font);
      state[target] = font.id;
      populateSelectors();
      filter = 'all';
      document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === 'all')));
      renderCards();
      renderPreview();
      $('upload-status').textContent = `已载入 ${font.name}，文件没有上传。`;
    } catch {
      $('upload-status').textContent = '无法读取这个文件，请选择有效的 WOFF2、WOFF、TTF 或 OTF 字体。';
    }
    event.target.value = '';
  });

  populateSelectors();
  renderCards();
  renderPreview();
  Promise.allSettled(fonts.map(async font => {
    try {
      if (font.local) {
        await new FontFace(`Probe-${font.id}`, `local("${font.family}")`).load();
      } else {
        const loaded = await document.fonts.load(`400 24px "${font.family}"`, 'Zirui Zhou');
        if (!loaded.length) throw new Error('Font unavailable');
      }
      font.available = true;
    } catch { font.available = false; }
    updateCards();
    if (font.id === state.heading || font.id === state.body) renderPreview();
  }));
})();
