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

  /** @type {Map<number, object>} */
  const orders = new Map();
  let eventSource = null;
  let audioCtx = null;

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

  function playChime() {
    if (!soundToggle.checked) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.15, audioCtx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {
      /* ignore */
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
    const open = [...orders.values()]
      .filter((o) => o.status === 'new' || o.status === 'preparing')
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));

    board.querySelectorAll('.ticket').forEach((el) => el.remove());

    if (open.length === 0) {
      boardEmpty.hidden = false;
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
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function upsertOrder(order, { announce } = {}) {
    const prev = orders.get(order.id);
    const isNewTicket = !prev && order.status === 'new';
    orders.set(order.id, order);
    if (order.status === 'served' || order.status === 'cancelled') {
      /* keep in map but filtered out of board */
    }
    renderBoard();
    if (announce && isNewTicket) {
      playChime();
      flashNew();
    }
  }

  async function loadOrders() {
    const res = await fetch('/api/orders?status=open', { credentials: 'include' });
    if (res.status === 401) {
      showLogin();
      return;
    }
    if (!res.ok) throw new Error('Kon bestellingen niet laden');
    const list = await res.json();
    orders.clear();
    for (const order of list) orders.set(order.id, order);
    renderBoard();
  }

  function connectStream() {
    if (eventSource) eventSource.close();
    eventSource = new EventSource('/api/orders/stream');
    eventSource.addEventListener('order', (ev) => {
      try {
        const order = JSON.parse(ev.data);
        upsertOrder(order, { announce: true });
      } catch {
        /* ignore */
      }
    });
    eventSource.onerror = () => {
      /* browser will retry */
    };
  }

  function showLogin() {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    loginView.hidden = false;
    dashView.hidden = true;
  }

  async function showDash() {
    loginView.hidden = true;
    dashView.hidden = false;
    await loadOrders();
    connectStream();
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
    await showDash();
  });

  logoutBtn.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    showLogin();
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
