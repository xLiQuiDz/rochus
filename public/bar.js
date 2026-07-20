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
  const OPEN_REMINDER_MS = 60 * 1000;
  const POLL_MS = 3000;

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

  function formatTime(iso) {
    try {
      const d = new Date(iso + (iso.endsWith('Z') || iso.includes('+') ? '' : 'Z'));
      return d.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
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
    const open = getOpenOrders().sort((a, b) =>
      String(b.created_at).localeCompare(String(a.created_at))
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
      ticket.className = `ticket ticket--${order.status}`;
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
          <button type="button" class="ticket__btn ticket__btn--primary" data-status="preparing">Bezig</button>
          <button type="button" class="ticket__btn ticket__btn--danger" data-status="cancelled">Annuleren</button>
        `;
      } else if (order.status === 'preparing') {
        actions = `
          <button type="button" class="ticket__btn ticket__btn--primary" data-status="served">Geserveerd</button>
          <button type="button" class="ticket__btn ticket__btn--danger" data-status="cancelled">Annuleren</button>
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
            <span class="ticket__time">#${order.id} · ${formatTime(order.created_at)}</span>
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
    pollTimer = setInterval(() => {
      loadOrders({ announceNew: true }).catch(() => {
        setLiveStatus('warn', 'Verbinding traag — opnieuw proberen…');
      });
    }, POLL_MS);
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
    });

    eventSource.addEventListener('order', (ev) => {
      try {
        const order = JSON.parse(ev.data);
        upsertOrder(order, { announce: true });
        setLiveStatus('ok', 'Live · nieuwe orders verschijnen meteen');
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
    stopPolling();
    stopOpenReminder();
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
    await Promise.all([loadOrders({ announceNew: false }), loadMenu()]);
    connectStream();
    startPolling();
    syncOpenReminder();
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

  board.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-status]');
    if (!btn) return;
    const wrap = btn.closest('[data-order-id]');
    const id = Number(wrap?.dataset.orderId);
    const status = btn.dataset.status;
    if (!id || !status) return;
    btn.disabled = true;
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (res.status === 401) {
        showLogin();
        return;
      }
      const order = await res.json();
      if (!res.ok) throw new Error(order.error || 'Update mislukt');
      upsertOrder(order);
    } catch (err) {
      alert(err.message || 'Update mislukt');
      btn.disabled = false;
    }
  });

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
