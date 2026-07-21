(() => {
  'use strict';

  /* ---------------- Elements ---------------- */
  const loginView = document.getElementById('login-view');
  const dashView = document.getElementById('dash-view');
  const loginForm = document.getElementById('login-form');
  const loginPin = document.getElementById('login-pin');
  const loginError = document.getElementById('login-error');

  const topbar = document.querySelector('.topbar');
  const liveStatusText = document.getElementById('live-status-text');
  const statsEl = document.getElementById('dash-stats');

  const laneNew = document.getElementById('lane-new');
  const lanePrep = document.getElementById('lane-prep');
  const emptyNew = document.getElementById('empty-new');
  const emptyPrep = document.getElementById('empty-prep');
  const countNew = document.getElementById('count-new');
  const countPrep = document.getElementById('count-prep');

  const menuBtn = document.getElementById('menu-btn');
  const menuSheet = document.getElementById('menu-sheet');
  const menuScrim = document.getElementById('menu-scrim');
  const menuClose = document.getElementById('menu-close');
  const menuAlert = document.getElementById('menu-alert');
  const logoutBtn = document.getElementById('logout-btn');
  const soundToggle = document.getElementById('sound-toggle');
  const wakeRow = document.getElementById('wake-row');
  const wakeToggle = document.getElementById('wake-toggle');

  const stockOpen = document.getElementById('stock-open');
  const stockSheet = document.getElementById('stock-sheet');
  const stockClose = document.getElementById('stock-close');
  const stockList = document.getElementById('stock-list');
  const stockCount = document.getElementById('stock-count');
  const stockSummary = document.getElementById('stock-summary');
  const stockSearch = document.getElementById('stock-search');
  const stockFilterBtns = [...document.querySelectorAll('[data-stock-filter]')];

  const barToast = document.getElementById('bar-toast');
  const barToastText = document.getElementById('bar-toast-text');
  const barToastUndo = document.getElementById('bar-toast-undo');

  /* ---------------- Constants ---------------- */
  const CATEGORY_LABELS = {
    bieren: "Bieren van 't vat",
    flessen: 'Flessenbier',
    alcoholvrij: 'Alcoholvrij',
    fris: 'Frisdranken',
    cocktails: 'Cocktails',
    wijnen: 'Wijnen & bubbels',
    shots: 'Shots',
    warme: 'Warme dranken',
    fingerfood: 'Fingerfood & snacks',
  };
  const CATEGORY_ORDER = [
    'bieren', 'flessen', 'alcoholvrij', 'fris', 'cocktails', 'wijnen', 'shots', 'warme', 'fingerfood',
  ];

  const POLL_MS = 3000;
  const POLL_RELAXED_MS = 15000;
  const OPEN_REMINDER_MS = 60 * 1000;
  const AGE_REFRESH_MS = 30 * 1000;
  const STATS_REFRESH_MS = 60 * 1000;
  const AGE_WARN_MIN = 5;
  const AGE_LATE_MIN = 10;
  const CANCEL_ARM_MS = 3000;

  /* ---------------- State ---------------- */
  /** @type {Map<number, object>} */
  const orders = new Map();
  /** @type {{ name: string, price: number, category: string, outOfStock: boolean }[]} */
  let menuItems = [];
  /** @type {Set<string>} */
  let outOfStock = new Set();

  let eventSource = null;
  let audioCtx = null;
  let openReminderTimer = null;
  let pollTimer = null;
  let streamRetryTimer = null;
  let ageTimer = null;
  let statsTimer = null;
  let barToastTimer = null;
  let cancelArmTimer = null;
  let sseHealthy = false;
  let stockFilter = 'all';
  let stockQuery = '';

  /* ---------------- Formatting ---------------- */
  function formatEuro(price) {
    const n = Number(price);
    return '€' + n.toLocaleString('nl-BE', {
      minimumFractionDigits: n % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    });
  }

  function formatEuroCents(cents) {
    return formatEuro(cents / 100);
  }

  function parseOrderDate(iso) {
    const s = String(iso);
    return new Date(s + (s.endsWith('Z') || s.includes('+') ? '' : 'Z'));
  }

  function formatTime(iso) {
    try {
      return parseOrderDate(iso).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  }

  function ageMinutes(iso) {
    const t = parseOrderDate(iso).getTime();
    if (!Number.isFinite(t)) return 0;
    return Math.max(0, Math.floor((Date.now() - t) / 60000));
  }

  function ageLabel(mins) {
    if (mins < 1) return 'zonet';
    if (mins < 60) return `${mins} min`;
    return `${Math.floor(mins / 60)}u${String(mins % 60).padStart(2, '0')}`;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getOpenOrders() {
    return [...orders.values()].filter((o) => o.status === 'new' || o.status === 'preparing');
  }

  /* ---------------- Sound ---------------- */
  function ensureAudio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      audioCtx = new Ctx();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    return audioCtx;
  }

  function tone(freq, startAt, duration, peak = 0.16) {
    const ctx = ensureAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(peak, startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startAt);
    osc.stop(startAt + duration + 0.02);
  }

  function playChime() {
    if (!soundToggle.checked) return;
    try {
      const ctx = ensureAudio();
      if (!ctx) return;
      const t = ctx.currentTime;
      tone(880, t, 0.28);
      tone(1320, t + 0.12, 0.28);
    } catch {
      /* ignore */
    }
  }

  function playOpenReminder() {
    if (!soundToggle.checked || getOpenOrders().length === 0) return;
    try {
      const ctx = ensureAudio();
      if (!ctx) return;
      const t = ctx.currentTime;
      tone(740, t, 0.22, 0.18);
      tone(990, t + 0.2, 0.22, 0.18);
      tone(740, t + 0.45, 0.28, 0.2);
    } catch {
      /* ignore */
    }
  }

  function syncOpenReminder() {
    const hasOpen = getOpenOrders().length > 0;
    if (hasOpen && !openReminderTimer) {
      openReminderTimer = setInterval(playOpenReminder, OPEN_REMINDER_MS);
    } else if (!hasOpen && openReminderTimer) {
      clearInterval(openReminderTimer);
      openReminderTimer = null;
    }
  }

  function stopOpenReminder() {
    if (openReminderTimer) {
      clearInterval(openReminderTimer);
      openReminderTimer = null;
    }
  }

  function bumpCount(el) {
    el.classList.remove('lane__count--bump');
    void el.offsetWidth;
    el.classList.add('lane__count--bump');
  }

  /* ---------------- Ticket rendering ---------------- */
  function ticketSignature(order) {
    return [
      order.status,
      order.payment_method,
      order.total_cents,
      order.note,
      (order.items || []).map((i) => `${i.name}x${i.qty}f${i.free_qty || 0}`).join('|'),
    ].join('~');
  }

  function ticketInnerHtml(order) {
    const mins = ageMinutes(order.created_at);
    const payconiq = order.payment_method === 'payconiq';

    const items = (order.items || [])
      .map((item) => {
        const free = item.free_qty > 0
          ? `<span class="tik__free">${item.free_qty} gratis</span>`
          : '';
        const paid = item.unit_price_cents * (item.qty - (item.free_qty || 0));
        return `<li>
          <span><span class="tik__qty">${item.qty}×</span>${escapeHtml(item.name)}${free}</span>
          <span class="tik__line-price">${formatEuroCents(paid)}</span>
        </li>`;
      })
      .join('');

    const action = order.status === 'new'
      ? '<button type="button" class="tik__go" data-status="preparing">Start bereiding →</button>'
      : '<button type="button" class="tik__go" data-status="served">✓ Naar tafel</button>';

    return `
      <div class="tik__top">
        <div class="tik__tblwrap">
          <div class="tik__tbl"><span>Tafel</span><b>${order.table_number}</b></div>
          <span class="tik__id">#${order.id} · ${formatTime(order.created_at)}</span>
        </div>
        <div class="tik__right">
          <span class="tik__age">${ageLabel(mins)}</span>
          <span class="tik__pay${payconiq ? ' tik__pay--payconiq' : ''}">${
            payconiq ? '📱 Payconiq' : '💶 Cash'
          }</span>
        </div>
      </div>
      <ul class="tik__items">${items}</ul>
      ${order.note ? `<p class="tik__note">“${escapeHtml(order.note)}”</p>` : ''}
      <div class="tik__foot">
        <span class="tik__total">${formatEuroCents(order.total_cents)}</span>
        <div class="tik__acts" data-order-id="${order.id}">
          <button type="button" class="tik__x" data-cancel aria-label="Annuleer bestelling">✕</button>
          ${action}
        </div>
      </div>
    `;
  }

  function applyAgeClasses(el, mins) {
    el.classList.toggle('tik--warn', mins >= AGE_WARN_MIN && mins < AGE_LATE_MIN);
    el.classList.toggle('tik--late', mins >= AGE_LATE_MIN);
  }

  /** Diff-render one lane: keep existing cards, only touch what changed. */
  function renderLane(container, emptyEl, list) {
    const wanted = new Map(list.map((o) => [String(o.id), o]));

    // Verwijder tickets die niet meer in deze lane horen
    container.querySelectorAll('.tik').forEach((el) => {
      if (!wanted.has(el.dataset.id)) el.remove();
    });

    let prev = null;
    for (const order of list) {
      const id = String(order.id);
      let el = container.querySelector(`.tik[data-id="${id}"]`);
      const sig = ticketSignature(order);

      if (!el) {
        el = document.createElement('article');
        el.className = 'tik';
        el.dataset.id = id;
        el.dataset.sig = sig;
        el.innerHTML = ticketInnerHtml(order);
      } else if (el.dataset.sig !== sig) {
        el.dataset.sig = sig;
        el.innerHTML = ticketInnerHtml(order);
      }

      applyAgeClasses(el, ageMinutes(order.created_at));

      // Zet in de juiste volgorde (oudste eerst)
      const target = prev ? prev.nextElementSibling : container.firstElementChild;
      if (target !== el) container.insertBefore(el, target);
      prev = el;
    }

    emptyEl.hidden = list.length > 0;
    if (emptyEl.hidden === false) container.appendChild(emptyEl);
  }

  function renderBoard() {
    const oldest = (a, b) => String(a.created_at).localeCompare(String(b.created_at));
    const open = getOpenOrders();
    const news = open.filter((o) => o.status === 'new').sort(oldest);
    const preps = open.filter((o) => o.status === 'preparing').sort(oldest);

    renderLane(laneNew, emptyNew, news);
    renderLane(lanePrep, emptyPrep, preps);

    if (countNew.textContent !== String(news.length)) countNew.textContent = String(news.length);
    if (countPrep.textContent !== String(preps.length)) countPrep.textContent = String(preps.length);

    syncOpenReminder();
  }

  /** Update alleen de leeftijdslabels — geen re-render, taps gaan nooit verloren. */
  function refreshAges() {
    document.querySelectorAll('.tik').forEach((el) => {
      const order = orders.get(Number(el.dataset.id));
      if (!order) return;
      const mins = ageMinutes(order.created_at);
      const ageEl = el.querySelector('.tik__age');
      if (ageEl) ageEl.textContent = ageLabel(mins);
      applyAgeClasses(el, mins);
    });
  }

  /* ---------------- Toast ---------------- */
  function hideBarToast() {
    barToast.hidden = true;
    barToastUndo.onclick = null;
  }

  function showBarToast(message, { onUndo } = {}) {
    barToastText.textContent = message;
    barToastUndo.hidden = !onUndo;
    barToastUndo.onclick = onUndo
      ? () => {
          hideBarToast();
          onUndo();
        }
      : null;
    barToast.hidden = false;
    clearTimeout(barToastTimer);
    barToastTimer = setTimeout(hideBarToast, 6000);
  }

  /* ---------------- Stats ---------------- */
  async function loadStats() {
    if (!statsEl) return;
    try {
      const res = await fetch('/api/stats/today', { credentials: 'include' });
      if (!res.ok) return;
      const s = await res.json();
      const top = (s.top || [])[0];
      statsEl.innerHTML =
        `<span class="stat">🧾 ${s.orders}</span>` +
        `<span class="stat">${formatEuroCents(s.revenue_cents)}</span>` +
        (s.payconiq_cents > 0
          ? `<span class="stat stat--pay">📱 ${formatEuroCents(s.payconiq_cents)}</span>`
          : '') +
        (top ? `<span class="stat stat--muted">🔥 ${escapeHtml(top.name)}</span>` : '');
      statsEl.hidden = false;
    } catch {
      /* stats zijn nice-to-have */
    }
  }

  /* ---------------- Availability / stock ---------------- */
  function updateStockCount() {
    const n = outOfStock.size;
    if (stockCount) {
      stockCount.textContent = n === 0 ? 'Alles beschikbaar' : `${n} uitverkocht`;
      stockCount.classList.toggle('sheet__count--alert', n > 0);
    }
    if (stockSummary) {
      stockSummary.textContent = n === 0 ? 'Alles beschikbaar' : `${n} product(en) uitverkocht`;
    }
    if (menuAlert) menuAlert.hidden = n === 0;
  }

  function renderStock() {
    if (!stockList) return;
    updateStockCount();

    const q = stockQuery.trim().toLowerCase();
    const visible = menuItems.filter((item) => {
      if (stockFilter === 'oos' && !item.outOfStock) return false;
      if (q && !item.name.toLowerCase().includes(q)) return false;
      return true;
    });

    if (visible.length === 0) {
      stockList.innerHTML = `<p class="stock__none">${
        stockFilter === 'oos' ? 'Niets uitverkocht — alles staat klaar 🎉' : 'Geen product gevonden'
      }</p>`;
      return;
    }

    const byCat = new Map();
    for (const item of visible) {
      if (!byCat.has(item.category)) byCat.set(item.category, []);
      byCat.get(item.category).push(item);
    }

    const parts = [];
    for (const cat of CATEGORY_ORDER) {
      const items = byCat.get(cat);
      if (!items || items.length === 0) continue;
      const rows = items
        .map((item) => {
          const oos = Boolean(item.outOfStock);
          return `<li class="stock__item${oos ? ' stock__item--oos' : ''}">
            <div>
              <div class="stock__name">${escapeHtml(item.name)}</div>
              <div class="stock__price">${formatEuro(item.price)}</div>
            </div>
            <button
              type="button"
              class="stock__btn ${oos ? 'stock__btn--oos' : 'stock__btn--available'}"
              data-stock-name="${escapeHtml(item.name)}"
              data-stock-oos="${oos ? 'false' : 'true'}"
            >${oos ? '↩ Beschikbaar' : 'Uitverkocht'}</button>
          </li>`;
        })
        .join('');
      parts.push(`<section>
        <h3 class="stock__cat-title">${escapeHtml(CATEGORY_LABELS[cat] || cat)}</h3>
        <ul class="stock__items">${rows}</ul>
      </section>`);
    }

    stockList.innerHTML = parts.join('');
  }

  function applyAvailability(list) {
    outOfStock = new Set(Array.isArray(list) ? list : []);
    menuItems = menuItems.map((item) => ({ ...item, outOfStock: outOfStock.has(item.name) }));
    if (!stockSheet.hidden) renderStock();
    else updateStockCount();
  }

  async function loadMenu() {
    const res = await fetch('/api/menu', { credentials: 'include' });
    if (res.status === 401) return showLogin();
    if (!res.ok) throw new Error('Kon menu niet laden');
    const data = await res.json();
    menuItems = Array.isArray(data.items) ? data.items : [];
    outOfStock = new Set(data.outOfStock || []);
    if (!stockSheet.hidden) renderStock();
    else updateStockCount();
  }

  /* ---------------- Live status ---------------- */
  function setLiveStatus(mode, text) {
    if (!topbar) return;
    topbar.classList.remove('topbar--ok', 'topbar--warn', 'topbar--err');
    if (mode) topbar.classList.add(`topbar--${mode}`);
    liveStatusText.textContent = text;
  }

  /* ---------------- Orders sync ---------------- */
  function upsertOrder(order, { announce } = {}) {
    const prev = orders.get(order.id);
    const wasOpen = prev && (prev.status === 'new' || prev.status === 'preparing');
    const isOpen = order.status === 'new' || order.status === 'preparing';
    const isBrandNew = !prev && order.status === 'new';
    const reopened = prev && !wasOpen && isOpen;

    orders.set(order.id, order);
    renderBoard();

    if (announce && (isBrandNew || reopened)) {
      playChime();
      bumpCount(order.status === 'preparing' ? countPrep : countNew);
    }
  }

  function mergeOpenList(list, { announceNew } = {}) {
    const incomingIds = new Set(list.map((o) => Number(o.id)));
    const previousOpenIds = new Set(
      [...orders.values()]
        .filter((o) => o.status === 'new' || o.status === 'preparing')
        .map((o) => Number(o.id))
    );

    for (const id of previousOpenIds) {
      if (!incomingIds.has(id)) {
        const existing = orders.get(id);
        if (existing && (existing.status === 'new' || existing.status === 'preparing')) {
          orders.set(id, { ...existing, status: 'served' });
        }
      }
    }

    for (const order of list) {
      const isNew = !previousOpenIds.has(Number(order.id));
      upsertOrder(order, { announce: Boolean(announceNew && isNew) });
    }

    if (list.length === 0) renderBoard();
  }

  async function loadOrders({ announceNew = false } = {}) {
    const res = await fetch('/api/orders?status=open', { credentials: 'include' });
    if (res.status === 401) return showLogin();
    if (!res.ok) throw new Error('Kon bestellingen niet laden');
    const list = await res.json();
    if (!announceNew) {
      orders.clear();
      for (const order of list) orders.set(order.id, order);
      renderBoard();
    } else {
      mergeOpenList(list, { announceNew: true });
    }
  }

  function startPolling() {
    stopPolling();
    pollTimer = setInterval(() => {
      loadOrders({ announceNew: true }).catch(() => {
        setLiveStatus('warn', 'Verbinding traag');
      });
    }, sseHealthy ? POLL_RELAXED_MS : POLL_MS);
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function connectStream() {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    if (streamRetryTimer) {
      clearTimeout(streamRetryTimer);
      streamRetryTimer = null;
    }

    setLiveStatus('warn', 'Verbinden…');
    eventSource = new EventSource('/api/orders/stream');

    eventSource.addEventListener('connected', () => {
      setLiveStatus('ok', 'Live');
      sseHealthy = true;
      startPolling();
    });

    eventSource.addEventListener('order', (ev) => {
      try {
        upsertOrder(JSON.parse(ev.data), { announce: true });
        setLiveStatus('ok', 'Live');
        loadStats();
      } catch {
        /* ignore */
      }
    });

    eventSource.addEventListener('availability', (ev) => {
      try {
        applyAvailability(JSON.parse(ev.data).outOfStock || []);
      } catch {
        /* ignore */
      }
    });

    eventSource.onerror = () => {
      setLiveStatus('warn', 'Offline · polling');
      if (sseHealthy) {
        sseHealthy = false;
        startPolling();
      }
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      streamRetryTimer = setTimeout(connectStream, 4000);
    };
  }

  /* ---------------- Views ---------------- */
  function showLogin() {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    if (streamRetryTimer) {
      clearTimeout(streamRetryTimer);
      streamRetryTimer = null;
    }
    sseHealthy = false;
    stopPolling();
    stopOpenReminder();
    if (ageTimer) { clearInterval(ageTimer); ageTimer = null; }
    if (statsTimer) { clearInterval(statsTimer); statsTimer = null; }
    hideBarToast();
    closeMenu();
    closeStock();
    statsEl.hidden = true;
    loginView.hidden = false;
    dashView.hidden = true;
  }

  async function showDash() {
    loginView.hidden = true;
    dashView.hidden = false;
    ensureAudio();
    setLiveStatus('warn', 'Laden…');
    await Promise.all([loadOrders({ announceNew: false }), loadMenu(), loadStats()]);
    connectStream();
    startPolling();
    syncOpenReminder();
    if (!ageTimer) ageTimer = setInterval(refreshAges, AGE_REFRESH_MS);
    if (!statsTimer) statsTimer = setInterval(loadStats, STATS_REFRESH_MS);
  }

  /* ---------------- Menu drawer ---------------- */
  function openMenu() {
    menuSheet.hidden = false;
    menuScrim.hidden = false;
  }

  function closeMenu() {
    menuSheet.hidden = true;
    menuScrim.hidden = true;
  }

  menuBtn.addEventListener('click', openMenu);
  menuClose.addEventListener('click', closeMenu);
  menuScrim.addEventListener('click', closeMenu);

  /* ---------------- Stock sheet ---------------- */
  function openStock() {
    closeMenu();
    stockSheet.hidden = false;
    if (menuItems.length === 0) loadMenu().then(renderStock).catch(() => {});
    else renderStock();
  }

  function closeStock() {
    stockSheet.hidden = true;
  }

  stockOpen.addEventListener('click', openStock);
  stockClose.addEventListener('click', closeStock);

  stockSearch.addEventListener('input', () => {
    stockQuery = stockSearch.value || '';
    renderStock();
  });

  stockFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      stockFilter = btn.dataset.stockFilter;
      stockFilterBtns.forEach((b) => b.classList.toggle('segmented__btn--on', b === btn));
      renderStock();
    });
  });

  stockList.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-stock-name]');
    if (!btn) return;
    const name = btn.dataset.stockName;
    const nextOos = btn.dataset.stockOos === 'true';
    if (!name) return;
    btn.disabled = true;
    try {
      const res = await fetch('/api/menu/availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, outOfStock: nextOos }),
      });
      if (res.status === 401) return showLogin();
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update mislukt');
      applyAvailability(data.outOfStock || []);
    } catch (err) {
      showBarToast(err.message || 'Voorraad-update mislukt');
      btn.disabled = false;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!stockSheet.hidden) closeStock();
    else if (!menuSheet.hidden) closeMenu();
  });

  /* ---------------- Status changes ---------------- */
  async function patchOrderStatus(id, status) {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    if (res.status === 401) {
      showLogin();
      return null;
    }
    const order = await res.json();
    if (!res.ok) throw new Error(order.error || 'Update mislukt');
    upsertOrder(order);
    return order;
  }

  function disarmCancelButtons() {
    clearTimeout(cancelArmTimer);
    document.querySelectorAll('.tik__x--armed').forEach((b) => {
      b.classList.remove('tik__x--armed');
      b.textContent = '✕';
    });
  }

  async function onBoardClick(e) {
    const cancelBtn = e.target.closest('[data-cancel]');
    if (cancelBtn) {
      // Twee stappen: één tik bewapent, de tweede annuleert echt
      if (!cancelBtn.classList.contains('tik__x--armed')) {
        disarmCancelButtons();
        cancelBtn.classList.add('tik__x--armed');
        cancelBtn.textContent = 'Zeker?';
        cancelArmTimer = setTimeout(disarmCancelButtons, CANCEL_ARM_MS);
        return;
      }
      disarmCancelButtons();
      await changeStatus(cancelBtn, 'cancelled');
      return;
    }

    const goBtn = e.target.closest('[data-status]');
    if (goBtn) {
      disarmCancelButtons();
      await changeStatus(goBtn, goBtn.dataset.status);
    }
  }

  async function changeStatus(btn, status) {
    const wrap = btn.closest('[data-order-id]');
    const id = Number(wrap?.dataset.orderId);
    if (!id || !status) return;
    const prevStatus = orders.get(id)?.status;
    btn.disabled = true;
    try {
      const order = await patchOrderStatus(id, status);
      if (!order) return;
      if ((status === 'served' || status === 'cancelled') && prevStatus) {
        const what = status === 'served' ? 'geserveerd' : 'geannuleerd';
        showBarToast(`Tafel ${order.table_number} · #${order.id} ${what}`, {
          onUndo: () => {
            patchOrderStatus(id, prevStatus).catch((err) => {
              showBarToast(err.message || 'Terugzetten mislukt');
            });
          },
        });
      }
      loadStats();
    } catch (err) {
      showBarToast(err.message || 'Update mislukt');
      btn.disabled = false;
    }
  }

  laneNew.addEventListener('click', onBoardClick);
  lanePrep.addEventListener('click', onBoardClick);

  /* ---------------- Auth ---------------- */
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.hidden = true;
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ pin: loginPin.value }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      loginError.textContent = data.error || 'Onjuiste PIN';
      loginError.hidden = false;
      return;
    }
    loginPin.value = '';
    ensureAudio();
    await showDash();
  });

  logoutBtn.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    showLogin();
  });

  soundToggle.addEventListener('change', () => {
    if (soundToggle.checked) {
      ensureAudio();
      syncOpenReminder();
    } else {
      stopOpenReminder();
    }
  });

  /* ---------------- Wake lock ---------------- */
  let wakeLock = null;
  let wakeWanted = false;
  try {
    wakeWanted = localStorage.getItem('rochus-bar-wake') === '1';
  } catch {
    /* private mode */
  }

  async function acquireWake() {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {
        wakeLock = null;
        if (wakeToggle) wakeToggle.checked = false;
      });
      if (wakeToggle) wakeToggle.checked = true;
    } catch {
      wakeLock = null;
      if (wakeToggle) wakeToggle.checked = false;
    }
  }

  if (wakeToggle && 'wakeLock' in navigator) {
    wakeRow.hidden = false;
    wakeToggle.checked = wakeWanted;
    wakeToggle.addEventListener('change', async () => {
      wakeWanted = wakeToggle.checked;
      try {
        localStorage.setItem('rochus-bar-wake', wakeWanted ? '1' : '0');
      } catch {
        /* private mode */
      }
      if (wakeWanted) {
        await acquireWake();
      } else if (wakeLock) {
        try {
          await wakeLock.release();
        } catch {
          /* al vrij */
        }
        wakeLock = null;
      }
    });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && wakeWanted && !wakeLock) acquireWake();
    });
    if (wakeWanted) acquireWake();
  }

  /* ---------------- Boot ---------------- */
  (async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      const data = await res.json();
      if (data.authenticated) await showDash();
      else showLogin();
    } catch {
      showLogin();
    }
  })();
})();
