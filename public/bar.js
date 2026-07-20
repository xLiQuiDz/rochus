(() => {
  'use strict';

  const loginView = document.getElementById('login-view');
  const dashView = document.getElementById('dash-view');
  const loginForm = document.getElementById('login-form');
  const loginPin = document.getElementById('login-pin');
  const loginError = document.getElementById('login-error');
  const board = document.getElementById('order-board');
  const boardEmpty = document.getElementById('board-empty');
  const logoutBtn = document.getElementById('logout-btn');
  const soundToggle = document.getElementById('sound-toggle');
  const newFlash = document.getElementById('new-flash');
  const liveStatus = document.getElementById('live-status');
  const liveStatusText = document.getElementById('live-status-text');
  const stockToggleBtn = document.getElementById('stock-toggle-btn');
  const stockPanel = document.getElementById('stock-panel');
  const stockList = document.getElementById('stock-list');
  const stockCount = document.getElementById('stock-count');
  const statsEl = document.getElementById('dash-stats');
  const barToast = document.getElementById('bar-toast');
  const barToastText = document.getElementById('bar-toast-text');
  const barToastUndo = document.getElementById('bar-toast-undo');

  const CATEGORY_LABELS = {
    bieren: "Bieren van 't vat",
    flessen: 'Flessenbier',
    fris: 'Frisdranken',
    cocktails: 'Cocktails',
    wijnen: 'Wijnen & bubbels',
    shots: 'Shots',
    warme: 'Warme dranken',
    fingerfood: 'Fingerfood & snacks',
  };

  const CATEGORY_ORDER = [
    'bieren',
    'flessen',
    'fris',
    'cocktails',
    'wijnen',
    'shots',
    'warme',
    'fingerfood',
  ];

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
  let sseHealthy = false;
  const OPEN_REMINDER_MS = 60 * 1000;
  const POLL_MS = 3000;
  const POLL_RELAXED_MS = 15000;
  const AGE_REFRESH_MS = 30 * 1000;
  const STATS_REFRESH_MS = 60 * 1000;
  const AGE_WARN_MIN = 5;
  const AGE_LATE_MIN = 10;

  function formatEuro(price) {
    return (
      '€' +
      Number(price).toLocaleString('nl-BE', {
        minimumFractionDigits: Number(price) % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      })
    );
  }

  function formatEuroCents(cents) {
    const n = cents / 100;
    return (
      '€' +
      n.toLocaleString('nl-BE', {
        minimumFractionDigits: n % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      })
    );
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
    return mins < 1 ? 'zonet' : `${mins} min`;
  }

  function ageClass(mins) {
    if (mins >= AGE_LATE_MIN) return 'ticket--age-late';
    if (mins >= AGE_WARN_MIN) return 'ticket--age-warn';
    return '';
  }

  function statusLabel(status) {
    if (status === 'new') return 'Nieuw';
    if (status === 'preparing') return 'Bezig';
    if (status === 'served') return 'Geserveerd';
    if (status === 'cancelled') return 'Geannuleerd';
    return status;
  }

  function getOpenOrders() {
    return [...orders.values()].filter((o) => o.status === 'new' || o.status === 'preparing');
  }

  function ensureAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function tone(freq, startAt, duration, peak = 0.16) {
    const ctx = ensureAudio();
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
      const t = ctx.currentTime;
      tone(880, t, 0.28);
      tone(1320, t + 0.12, 0.28);
    } catch {
      /* ignore */
    }
  }

  /** Stronger double beep for open-order reminder */
  function playOpenReminder() {
    if (!soundToggle.checked) return;
    if (getOpenOrders().length === 0) return;
    try {
      const ctx = ensureAudio();
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

  function flashNew() {
    newFlash.hidden = false;
    clearTimeout(flashNew._t);
    flashNew._t = setTimeout(() => {
      newFlash.hidden = true;
    }, 2500);
  }

  function renderBoard() {
    // Oldest first — the ticket bovenaan is altijd de volgende die klaar moet
    const open = getOpenOrders().sort((a, b) =>
      String(a.created_at).localeCompare(String(b.created_at))
    );

    board.querySelectorAll('.ticket').forEach((el) => el.remove());

    if (open.length === 0) {
      boardEmpty.hidden = false;
      syncOpenReminder();
      return;
    }
    boardEmpty.hidden = true;

    for (const order of open) {
      const ticket = document.createElement('article');
      const mins = ageMinutes(order.created_at);
      ticket.className = `ticket ticket--${order.status} ${ageClass(mins)}`.trim();
      ticket.dataset.id = String(order.id);

      const itemsHtml = (order.items || [])
        .map((item) => {
          const free =
            item.free_qty > 0
              ? `<span class="ticket__free">${item.free_qty} gratis</span>`
              : '';
          return `<li><span><span class="ticket__qty">${item.qty}×</span>${escapeHtml(
            item.name
          )}${free}</span><span>${formatEuroCents(
            item.unit_price_cents * (item.qty - (item.free_qty || 0))
          )}</span></li>`;
        })
        .join('');

      let actions = '';
      if (order.status === 'new') {
        actions = `
          <button type="button" class="ticket__btn ticket__btn--danger" data-status="cancelled" aria-label="Annuleer bestelling">✕</button>
          <button type="button" class="ticket__btn ticket__btn--primary" data-status="preparing">Start bereiding →</button>
        `;
      } else if (order.status === 'preparing') {
        actions = `
          <button type="button" class="ticket__btn ticket__btn--danger" data-status="cancelled" aria-label="Annuleer bestelling">✕</button>
          <button type="button" class="ticket__btn ticket__btn--primary" data-status="served">✓ Geserveerd</button>
        `;
      }

      ticket.innerHTML = `
        <div class="ticket__table">
          <span class="ticket__table-label">Tafel</span>
          <span class="ticket__table-num">${order.table_number}</span>
        </div>
        <div class="ticket__body">
          <div class="ticket__meta">
            <span class="ticket__status ticket__status--${order.status}">${statusLabel(order.status)}</span>
            <span class="ticket__pay${
              order.payment_method === 'payconiq' ? ' ticket__pay--payconiq' : ''
            }">${order.payment_method === 'payconiq' ? '📱 Payconiq' : '💶 Cash'}</span>
            <span class="ticket__time">#${order.id} · ${formatTime(order.created_at)}</span>
            <span class="ticket__age">${ageLabel(mins)}</span>
          </div>
          <ul class="ticket__items">${itemsHtml}</ul>
          ${
            order.note
              ? `<p class="ticket__note">“${escapeHtml(order.note)}”</p>`
              : ''
          }
          <div class="ticket__footer">
            <div class="ticket__total">${formatEuroCents(order.total_cents)}${
              order.discount_cents
                ? ` <span style="color:var(--ok);font-size:0.8rem;font-weight:600">(−${formatEuroCents(
                    order.discount_cents
                  )})</span>`
                : ''
            }</div>
            <div class="ticket__actions" data-order-id="${order.id}">${actions}</div>
          </div>
        </div>
      `;
      board.appendChild(ticket);
    }

    syncOpenReminder();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Update age badges in place — no re-render, so taps never miss. */
  function refreshAges() {
    board.querySelectorAll('.ticket').forEach((el) => {
      const order = orders.get(Number(el.dataset.id));
      if (!order) return;
      const mins = ageMinutes(order.created_at);
      const ageEl = el.querySelector('.ticket__age');
      if (ageEl) ageEl.textContent = ageLabel(mins);
      el.classList.toggle('ticket--age-warn', mins >= AGE_WARN_MIN && mins < AGE_LATE_MIN);
      el.classList.toggle('ticket--age-late', mins >= AGE_LATE_MIN);
    });
  }

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

  async function loadStats() {
    if (!statsEl) return;
    try {
      const res = await fetch('/api/stats/today', { credentials: 'include' });
      if (!res.ok) return;
      const s = await res.json();
      const top = (s.top || []).map((t) => `${t.name} ×${t.qty}`).join(' · ');
      const payconiq = s.payconiq_cents > 0 ? ` (waarvan 📱 ${formatEuroCents(s.payconiq_cents)})` : '';
      statsEl.textContent =
        `Vandaag: ${s.orders} bestellingen · ${formatEuroCents(s.revenue_cents)}${payconiq}` +
        (top ? ` · Top: ${top}` : '');
      statsEl.hidden = false;
    } catch {
      /* stats zijn nice-to-have — stil falen */
    }
  }

  function applyAvailability(list) {
    outOfStock = new Set(Array.isArray(list) ? list : []);
    menuItems = menuItems.map((item) => ({
      ...item,
      outOfStock: outOfStock.has(item.name),
    }));
    if (!stockPanel.hidden) renderStock();
    else updateStockCount();
  }

  function updateStockCount() {
    if (!stockCount) return;
    const n = outOfStock.size;
    stockCount.textContent = n === 0 ? 'Alles beschikbaar' : `${n} uitverkocht`;
    stockCount.style.color = n === 0 ? 'var(--muted)' : 'var(--danger)';
  }

  function renderStock() {
    if (!stockList) return;
    updateStockCount();

    const byCat = new Map();
    for (const item of menuItems) {
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
              <div class="stock__item-name">${escapeHtml(item.name)}</div>
              <div class="stock__item-price">${formatEuro(item.price)}</div>
            </div>
            <button
              type="button"
              class="stock__btn ${oos ? 'stock__btn--oos' : 'stock__btn--available'}"
              data-stock-name="${escapeHtml(item.name)}"
              data-stock-oos="${oos ? 'false' : 'true'}"
            >${oos ? 'Terug beschikbaar' : 'Uitverkocht'}</button>
          </li>`;
        })
        .join('');
      parts.push(`
        <div class="stock__category">
          <h3 class="stock__category-title">${escapeHtml(CATEGORY_LABELS[cat] || cat)}</h3>
          <ul class="stock__items">${rows}</ul>
        </div>
      `);
    }

    stockList.innerHTML = parts.join('') || '<p class="board__empty">Geen producten</p>';
  }

  async function loadMenu() {
    const res = await fetch('/api/menu', { credentials: 'include' });
    if (res.status === 401) {
      showLogin();
      return;
    }
    if (!res.ok) throw new Error('Kon menu niet laden');
    const data = await res.json();
    menuItems = Array.isArray(data.items) ? data.items : [];
    outOfStock = new Set(data.outOfStock || []);
    if (!stockPanel.hidden) renderStock();
    else updateStockCount();
  }

  function setLiveStatus(mode, text) {
    if (!liveStatus || !liveStatusText) return;
    liveStatus.classList.remove('dash__live--ok', 'dash__live--warn', 'dash__live--err');
    if (mode) liveStatus.classList.add(`dash__live--${mode}`);
    liveStatusText.textContent = text;
  }

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
      flashNew();
    }
  }

  function mergeOpenList(list, { announceNew } = {}) {
    const incomingIds = new Set(list.map((o) => Number(o.id)));
    const previousOpenIds = new Set(
      [...orders.values()]
        .filter((o) => o.status === 'new' || o.status === 'preparing')
        .map((o) => Number(o.id))
    );

    // Mark missing open orders as served locally if they disappeared from open list
    for (const id of previousOpenIds) {
      if (!incomingIds.has(id)) {
        const existing = orders.get(id);
        if (existing && (existing.status === 'new' || existing.status === 'preparing')) {
          orders.set(id, { ...existing, status: 'served' });
        }
      }
    }

    for (const order of list) {
      const id = Number(order.id);
      const isNew = !previousOpenIds.has(id);
      upsertOrder(order, { announce: Boolean(announceNew && isNew) });
    }

    if (list.length === 0) {
      renderBoard();
    }
  }

  async function loadOrders({ announceNew = false } = {}) {
    const res = await fetch('/api/orders?status=open', { credentials: 'include' });
    if (res.status === 401) {
      showLogin();
      return;
    }
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
    // Met een gezonde live stream is polling enkel vangnet — rustiger aan
    pollTimer = setInterval(() => {
      loadOrders({ announceNew: true }).catch(() => {
        setLiveStatus('warn', 'Verbinding traag — opnieuw proberen…');
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

    setLiveStatus('warn', 'Live verbinden…');
    eventSource = new EventSource('/api/orders/stream');

    eventSource.addEventListener('connected', () => {
      setLiveStatus('ok', 'Live · nieuwe orders verschijnen meteen');
      sseHealthy = true;
      startPolling();
    });

    eventSource.addEventListener('order', (ev) => {
      try {
        const order = JSON.parse(ev.data);
        upsertOrder(order, { announce: true });
        setLiveStatus('ok', 'Live · nieuwe orders verschijnen meteen');
        loadStats();
      } catch {
        /* ignore */
      }
    });

    eventSource.addEventListener('availability', (ev) => {
      try {
        const data = JSON.parse(ev.data);
        applyAvailability(data.outOfStock || []);
      } catch {
        /* ignore */
      }
    });

    eventSource.onerror = () => {
      setLiveStatus('warn', 'Live even weg — polling actief');
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
    if (ageTimer) {
      clearInterval(ageTimer);
      ageTimer = null;
    }
    if (statsTimer) {
      clearInterval(statsTimer);
      statsTimer = null;
    }
    hideBarToast();
    statsEl.hidden = true;
    stockPanel.hidden = true;
    stockToggleBtn.setAttribute('aria-expanded', 'false');
    stockToggleBtn.classList.remove('dash__link--active');
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

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.hidden = true;
    const pin = loginPin.value;
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ pin }),
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

  stockToggleBtn.addEventListener('click', () => {
    const open = stockPanel.hidden;
    stockPanel.hidden = !open;
    stockToggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    stockToggleBtn.classList.toggle('dash__link--active', open);
    if (open) {
      if (menuItems.length === 0) {
        loadMenu().catch(() => {});
      } else {
        renderStock();
      }
    }
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
      if (res.status === 401) {
        showLogin();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update mislukt');
      applyAvailability(data.outOfStock || []);
    } catch (err) {
      alert(err.message || 'Voorraad-update mislukt');
      btn.disabled = false;
    }
  });

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

  board.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-status]');
    if (!btn) return;
    const wrap = btn.closest('[data-order-id]');
    const id = Number(wrap?.dataset.orderId);
    const status = btn.dataset.status;
    if (!id || !status) return;
    const prevStatus = orders.get(id)?.status;
    btn.disabled = true;
    try {
      const order = await patchOrderStatus(id, status);
      if (!order) return;
      // Geserveerd/geannuleerd verdwijnt van het bord — geef even een terugweg
      if ((status === 'served' || status === 'cancelled') && prevStatus) {
        showBarToast(`Tafel ${order.table_number} · #${order.id} → ${statusLabel(status)}`, {
          onUndo: () => {
            patchOrderStatus(id, prevStatus).catch((err) => {
              alert(err.message || 'Terugzetten mislukt');
            });
          },
        });
      }
      loadStats();
    } catch (err) {
      alert(err.message || 'Update mislukt');
      btn.disabled = false;
    }
  });

  /* Scherm-wake-lock: de bar-tablet mag niet in slaap vallen tijdens de shift */
  const wakeToggle = document.getElementById('wake-toggle');
  let wakeLock = null;
  let wakeWanted = false;
  try {
    wakeWanted = localStorage.getItem('rochus-bar-wake') === '1';
  } catch {
    /* private mode */
  }

  function syncWakeUI() {
    if (!wakeToggle) return;
    wakeToggle.classList.toggle('dash__link--active', Boolean(wakeLock));
    wakeToggle.textContent = wakeLock ? '💡 Scherm blijft aan' : '💡 Scherm aan';
  }

  async function acquireWake() {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {
        wakeLock = null;
        syncWakeUI();
      });
    } catch {
      wakeLock = null;
    }
    syncWakeUI();
  }

  if (wakeToggle && 'wakeLock' in navigator) {
    wakeToggle.hidden = false;
    syncWakeUI();
    wakeToggle.addEventListener('click', async () => {
      if (wakeLock) {
        wakeWanted = false;
        try {
          await wakeLock.release();
        } catch {
          /* al vrijgegeven */
        }
        wakeLock = null;
        syncWakeUI();
      } else {
        wakeWanted = true;
        await acquireWake();
      }
      try {
        localStorage.setItem('rochus-bar-wake', wakeWanted ? '1' : '0');
      } catch {
        /* private mode */
      }
    });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && wakeWanted && !wakeLock) acquireWake();
    });
    if (wakeWanted) acquireWake();
  }

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
