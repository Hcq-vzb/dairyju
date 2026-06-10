(() => {
  'use strict';

  var WA_NUMBER = '8617751189576';
  var SITE_NAME = 'KIWL Machine';
  var COMPANY_INTRO =
    'We are a professional manufacturer of dairy processing equipment, juice production lines, ' +
    'beverage filling machines and turnkey factory solutions. Serving 50+ countries with CE-certified equipment.';

  var routeMeta = null;
  var panelOpen = false;
  var chatStep = 0;
  var selectedTopic = '';

  var root, fab, panel, messagesEl, optionsEl, waBtn;

  function getPath() {
    var path = location.pathname || '/';
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    return path;
  }

  function getPageInfo() {
    var path = getPath();
    var title = document.title || SITE_NAME;
    var pageTitle = title.split('|')[0].trim();
    var meta = routeMeta && routeMeta[path];
    var label = meta ? meta.title.split('|')[0].trim() : pageTitle;
    var desc = meta ? meta.description : (
      document.querySelector('meta[name="description"]') || {}
    ).content || '';
    var url = location.origin + path;
    return { path: path, label: label, desc: desc, url: url, fullTitle: title };
  }

  function buildWaMessage(extra) {
    var info = getPageInfo();
    var lines = [
      'Hello, I would like to inquire about KIWL machinery.',
      '',
      '📄 Page: ' + info.label,
      '🔗 Link: ' + info.url
    ];
    if (selectedTopic) lines.push('💬 Topic: ' + selectedTopic);
    if (extra) lines.push('📝 Note: ' + extra);
    lines.push('', 'Please connect me with your sales manager. Thank you!');
    return lines.join('\n');
  }

  function waUrl(extra) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(buildWaMessage(extra));
  }

  function updateWaLink() {
    if (waBtn) waBtn.href = waUrl();
  }

  function scrollBottom() {
    if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addBot(text, delay) {
    setTimeout(function () {
      var el = document.createElement('div');
      el.className = 'kiwl-cs-msg kiwl-cs-msg-bot';
      el.textContent = text;
      messagesEl.appendChild(el);
      scrollBottom();
    }, delay || 0);
  }

  function addUser(text) {
    var el = document.createElement('div');
    el.className = 'kiwl-cs-msg kiwl-cs-msg-user';
    el.textContent = text;
    messagesEl.appendChild(el);
    scrollBottom();
  }

  function addPageCard() {
    var info = getPageInfo();
    var card = document.createElement('div');
    card.className = 'kiwl-cs-page-card';
    card.innerHTML =
      '<strong>📍 You are viewing:</strong>' +
      info.label +
      '<br><span>' + info.url + '</span>';
    if (info.desc) {
      card.innerHTML += '<br><span style="margin-top:6px;display:block;color:#64748b">' +
        info.desc.substring(0, 120) + (info.desc.length > 120 ? '…' : '') + '</span>';
    }
    messagesEl.appendChild(card);
    scrollBottom();
  }

  function clearOptions() {
    optionsEl.innerHTML = '';
    optionsEl.style.display = 'none';
  }

  function showOptions(buttons, onPick) {
    optionsEl.innerHTML = '';
    optionsEl.style.display = 'flex';
    buttons.forEach(function (btn) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'kiwl-cs-option-btn';
      b.textContent = btn.label;
      b.addEventListener('click', function () {
        addUser(btn.label);
        clearOptions();
        onPick(btn);
      });
      optionsEl.appendChild(b);
    });
    scrollBottom();
  }

  function startChat() {
    messagesEl.innerHTML = '';
    chatStep = 0;
    selectedTopic = '';
    updateWaLink();

    addBot('Hello! 👋 Welcome to ' + SITE_NAME + '.', 100);
    addBot('I\'m your online assistant. How can I help you today?', 600);
    addBot(COMPANY_INTRO, 1200);

    setTimeout(function () {
      addPageCard();
      addBot('Based on the page you\'re browsing, I can provide tailored information. What would you like to know?', 400);
      showOptions([
        { label: '💰 Request a Quote', key: 'quote' },
        { label: '🏭 Product Details', key: 'product' },
        { label: '🔧 Technical Support', key: 'support' },
        { label: '🚢 Shipping & Delivery', key: 'shipping' }
      ], function (btn) {
        selectedTopic = btn.label.replace(/^[^\s]+\s/, '');
        var replies = {
          quote: 'Great! Our sales team can provide factory pricing and a turnkey solution based on your capacity requirements.',
          product: 'We offer complete production lines for dairy, juice, and beverage — from UHT milk to fruit juice filling lines.',
          support: 'We provide installation guidance, operator training, and lifelong after-sale maintenance worldwide.',
          shipping: 'We have installation engineers stationed globally and can arrange shipping to 50+ countries.'
        };
        addBot(replies[btn.key] || 'Thank you for your interest!', 500);
        addBot('Click the button below to chat with our sales manager on WhatsApp. Your page link will be sent automatically so we know exactly what you\'re interested in.', 1200);
        updateWaLink();
      });
    }, 1800);
  }

  function togglePanel(open) {
    panelOpen = typeof open === 'boolean' ? open : !panelOpen;
    panel.classList.toggle('kiwl-cs-open', panelOpen);
    if (panelOpen && messagesEl.children.length === 0) startChat();
    if (panelOpen) updateWaLink();
  }

  function onRouteChange() {
    updateWaLink();
    if (panelOpen && messagesEl.children.length > 0) {
      addBot('You navigated to a new page — I\'ve updated your inquiry context.', 200);
      addPageCard();
      updateWaLink();
    }
  }

  function buildUI() {
    if (document.getElementById('kiwl-cs-root')) return;
    root = document.createElement('div');
    root.id = 'kiwl-cs-root';

    fab = document.createElement('button');
    fab.id = 'kiwl-cs-fab';
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Open customer service chat');
    fab.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' +
      '</svg><span class="kiwl-cs-badge"></span>';

    panel = document.createElement('div');
    panel.id = 'kiwl-cs-panel';
    panel.innerHTML =
      '<div class="kiwl-cs-header">' +
        '<div class="kiwl-cs-header-avatar">KI</div>' +
        '<div class="kiwl-cs-header-info">' +
          '<h3>' + SITE_NAME + ' Support</h3>' +
          '<p>Online · Typically replies within minutes</p>' +
        '</div>' +
        '<button type="button" class="kiwl-cs-close" aria-label="Close chat">×</button>' +
      '</div>' +
      '<div class="kiwl-cs-messages"></div>' +
      '<div class="kiwl-cs-options"></div>' +
      '<div class="kiwl-cs-footer">' +
        '<a class="kiwl-cs-wa-btn" href="#" target="_blank" rel="noopener noreferrer">' +
          '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>' +
          'Chat with Sales Manager on WhatsApp' +
        '</a>' +
        '<p class="kiwl-cs-footer-note">Your current page link will be included automatically</p>' +
      '</div>';

    root.appendChild(panel);
    root.appendChild(fab);
    document.body.appendChild(root);
    // 始终保持在 body 最末尾，避免被 React 后渲染节点压住
    setInterval(function () {
      if (root.parentNode === document.body && document.body.lastElementChild !== root) {
        document.body.appendChild(root);
      }
    }, 1000);

    messagesEl = panel.querySelector('.kiwl-cs-messages');
    optionsEl = panel.querySelector('.kiwl-cs-options');
    waBtn = panel.querySelector('.kiwl-cs-wa-btn');

    fab.addEventListener('click', function () { togglePanel(); });
    panel.querySelector('.kiwl-cs-close').addEventListener('click', function () { togglePanel(false); });

    waBtn.addEventListener('click', function (e) {
      waBtn.href = waUrl();
    });
  }

  function init() {
    fetch('/route-meta.json')
      .then(function (r) { return r.json(); })
      .then(function (data) { routeMeta = data; })
      .catch(function () {});

    // 等 React 挂载完成后再插入，确保层级最高
    setTimeout(buildUI, 300);
    setTimeout(buildUI, 1500);

    var lastPath = getPath();
    setInterval(function () {
      var p = getPath();
      if (p !== lastPath) { lastPath = p; onRouteChange(); }
    }, 500);

    window.addEventListener('popstate', onRouteChange);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
