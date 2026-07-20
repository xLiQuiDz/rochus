(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ */
  /* Chaos / vibes (young & stupid energy)                              */
  /* ------------------------------------------------------------------ */
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const ADD_TOASTS = [
    'In ’t mandje 💅',
    'Chef’s kiss',
    'Main character energy',
    'Hydratatie unlocked',
    'Goed zo, chaoot',
    'De bar is ready for you',
    'Sip sip hooray',
    'Zero judgment zone',
    'Je bent een icoon',
    'Dit is een moment',
    'Respectloos lekker',
    'Besteld. Geen spijt.',
  ];

  const FLOAT_STICKERS = [
    'gevaarlijk lekker',
    'hot girl summer',
    'ik bel morgen',
    'geen spijt',
    'chaotic good',
    'thirst trap',
    'bar baby',
    'slay',
  ];

  const EMPTY_LINES = [
    { emoji: '🛒', text: 'Je mandje is leeg — en dat is een beetje sad' },
    { emoji: '👻', text: 'Hier spookt niks… behalve je dorst' },
    { emoji: '🥲', text: 'Leeg. Alsof je op een maandag wakker wordt' },
    { emoji: '🧃', text: 'Tik + alsof je swipe — maar dan voor drank' },
    { emoji: '👀', text: 'De bar staart je afwachtend aan…' },
  ];

  const NO_RESULT_LINES = [
    'Niets gevonden. Mischien te niche of misschien al te dronken?',
    'Geen resultaten — die cocktail bestaat alleen in je dromen',
    'Droog als de Sahara hier. Probeer “spritz”.',
  ];

  const CONFIRM_TITLES = [
    'Laatste check voor de chaos?',
    'Sure sure sure?',
    'Dit is geen oefening',
    'Commit to the bit?',
    'Ready to make it everyone’s problem?',
  ];

  const CONFIRM_LEADS = [
    'Tafel {n} · dit gaat pas naar de bar als je bevestigt',
    'Tafel {n} · daarna is er geen weg terug (behalve cash)',
    'Tafel {n} · de bar gaat je niet judgen. Misschien.',
    'Tafel {n} · stuur ’t door voordat je het vergeet',
  ];

  const SENT_TOASTS = [
    'Verstuurd · tafel {n} · cash klaarhouden 💸',
    'De bar is gewaarschuwd · tafel {n}',
    'Order locked in · tafel {n} · stay hydrated',
    'Verstuurd · tafel {n} · jullie zijn legends',
  ];

  const HERO_BADGE_LINES = [
    'Summer evenings',
    'No thoughts, just vibes',
    'Open · chaotic · cute',
    'Sip first, think later',
    'Young & hydrated',
  ];

  const FOOTER_LINES = [
    'Summer pop-up · sip slow · text your ex later',
    'Summer pop-up · hydrate or diedrate',
    'Summer pop-up · we contain multitudes (en gin)',
    'Summer pop-up · touch grass, then order spritz',
  ];

  /** @type {Record<string, { toast: string, className: string, sticker?: string }>} */
  const ITEM_GAGS = {
    'Aperol Spritz': { toast: 'Aperol o’clock 🍊', className: 'gag-bounce', sticker: 'aperol nation' },
    'Hugo Spritz': { toast: 'Hugo zegt hallo 🌿', className: 'gag-bounce', sticker: 'garden party' },
    'Limoncello Spritz': { toast: 'Citroen chaos activated', className: 'gag-wobble', sticker: 'zesty' },
    Corona: { toast: 'Waar is het limoentje?!', className: 'gag-tilt', sticker: 'beach mode' },
    Tequila: { toast: 'Geen spijt. Alleen lore.', className: 'gag-shake', sticker: 'oops' },
    Rum: { toast: 'Pirate energy 🏴‍☠️', className: 'gag-shake' },
    'Limoncello Bongiorno': { toast: 'Bongiornooooo', className: 'gag-wobble', sticker: 'ciao' },
    Duvel: { toast: 'Duvel in detail', className: 'gag-tilt', sticker: 'Belgian menace' },
    "Tripel Karmeliet van 't vat": {
      toast: 'Signature unlocked ✨',
      className: 'gag-bounce',
      sticker: 'vip sip',
    },
    'Sharing Nacho\'s': { toast: 'Sharing is caring (tot de laatste chip)', className: 'gag-wobble' },
    '105 Sharing Burger': { toast: 'Burger diplomacy', className: 'gag-bounce', sticker: 'feed me' },
    Champagne: { toast: 'Champagne problems, but make it cash', className: 'gag-tilt', sticker: 'bougie' },
    Water: { toast: 'Eindelijk water. Hydratatie legend 💧', className: 'gag-bounce', sticker: 'hydrate' },
  };

  const WATER_ESCAPE_TOASTS = [
    'Water zegt nee 💧',
    'Te gezond. Probeer een spritz.',
    'Water is gaan joggen',
    'Nice try, hydration warrior',
    'Het water is sneller dan jij',
    'Plot twist: water wil jou niet',
    'Catch me if you can 💦',
    'De bar keurt water af (grapje… half)',
    'Bijna! Maar nee.',
    'Water left the chat',
  ];

  let waterEscapes = 0;
  let waterCooldown = false;
  let waterAllowOrder = false;
  let waterPlaceholder = null;
  const WATER_CATCH_AFTER = 10;

  function pickItemGag(name, category) {
    if (ITEM_GAGS[name]) return { ...ITEM_GAGS[name] };

    const lower = name.toLowerCase();
    for (const [key, gag] of Object.entries(ITEM_GAGS)) {
      if (lower.includes(key.toLowerCase())) return { ...gag };
    }

    if (category === 'shots') {
      return {
        toast: pick(['Shot. Shot. Shot.', 'Kleine glaasjes, grote keuzes', 'Down the hatch 🫡']),
        className: 'gag-shake',
        sticker: 'yolo',
      };
    }
    if (category === 'cocktails') {
      return {
        toast: pick(['Mixology, maar make it unserious', 'Fancy juice unlocked', pick(ADD_TOASTS)]),
        className: 'gag-bounce',
      };
    }
    if (category === 'fingerfood') {
      return {
        toast: pick(['Snack attack', 'Crunch time', 'Nom nom']),
        className: 'gag-wobble',
        sticker: 'nom',
      };
    }
    return {
      toast: pick(ADD_TOASTS),
      className: Math.random() < 0.4 ? pick(['gag-tilt', 'gag-wobble', 'gag-bounce']) : '',
    };
  }

  function spawnFloatingSticker(nearEl, text) {
    const layer = document.getElementById('chaos-layer');
    if (!layer || !nearEl) return;
    const rect = nearEl.getBoundingClientRect();
    const el = document.createElement('span');
    el.className = 'chaos-sticker';
    el.textContent = text;
    el.style.left = `${rect.left + rect.width * 0.3 + Math.random() * 40}px`;
    el.style.top = `${rect.top + 8}px`;
    layer.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 1600);
  }

  const ROCHUS_CONFETTI_COLORS = ['#f0d9a8', '#d4af70', '#c9a96e', '#e8b4a0', '#f7f1e8', '#9ed0e0'];

  function fireConfetti(opts) {
    if (prefersReducedMotion || typeof window.confetti !== 'function') return;
    window.confetti(opts);
  }

  function burstConfetti() {
    fireConfetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ROCHUS_CONFETTI_COLORS,
    });
  }

  /** Celebration when an order is successfully sent to the bar. */
  function celebrateOrderSuccess() {
    if (prefersReducedMotion || typeof window.confetti !== 'function') return;

    const end = Date.now() + 1800;

    // Dual side cannons
    (function frame() {
      fireConfetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors: ROCHUS_CONFETTI_COLORS,
      });
      fireConfetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors: ROCHUS_CONFETTI_COLORS,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();

    // Center burst
    fireConfetti({
      particleCount: 120,
      spread: 100,
      startVelocity: 45,
      origin: { y: 0.6 },
      colors: ROCHUS_CONFETTI_COLORS,
    });
  }

  function isWaterChase() {
    return document.body.classList.contains('water-chase');
  }

  /** Blank the menu so water can run on an empty canvas. */
  function enterWaterChase(card) {
    if (isWaterChase() || !card) return;

    const rect = card.getBoundingClientRect();
    if (!waterPlaceholder) {
      waterPlaceholder = document.createElement('div');
      waterPlaceholder.className = 'water-placeholder';
      waterPlaceholder.setAttribute('aria-hidden', 'true');
    }
    waterPlaceholder.style.height = `${Math.round(rect.height)}px`;
    if (card.parentNode && card.parentNode !== document.body) {
      card.parentNode.insertBefore(waterPlaceholder, card);
    }
    card.style.width = `${Math.min(rect.width, window.innerWidth - 32)}px`;
    document.body.appendChild(card);
    document.body.classList.add('water-chase');
    card.classList.add('menu-card--fleeing');
  }

  function restoreWaterToSlot(card) {
    document.body.classList.remove('water-chase');
    card.classList.remove('menu-card--fleeing', 'water-vanish', 'water-zip');
    card.style.left = '';
    card.style.top = '';
    card.style.width = '';
    if (waterPlaceholder && waterPlaceholder.parentNode) {
      waterPlaceholder.parentNode.insertBefore(card, waterPlaceholder);
      waterPlaceholder.remove();
    } else if (!card.parentNode || card.parentNode === document.body) {
      const grid = document.querySelector('#fris .menu-grid');
      if (grid) grid.appendChild(card);
    }
  }

  /** Restore menu and put water back in its slot. */
  function endWaterChase(card, { toast = true, instant = false } = {}) {
    if (!card) card = document.getElementById('water-card');
    if (!card) return;

    const wasChasing = isWaterChase() || card.classList.contains('menu-card--fleeing');
    if (!wasChasing && !waterPlaceholder) return;
    if (card.classList.contains('water-vanish')) return;

    waterCooldown = true;
    if (toast && wasChasing) {
      showToast(pick(['Water is weggezwommen 💧', 'Splash — water gone', 'Te laat, water scrollde weg']), false, 1400);
    }

    if (instant) {
      restoreWaterToSlot(card);
      waterCooldown = false;
      return;
    }

    card.classList.remove('water-zip');
    card.classList.add('water-vanish');
    setTimeout(() => {
      restoreWaterToSlot(card);
      setTimeout(() => {
        waterCooldown = false;
      }, 400);
    }, 260);
  }

  /**
   * Teleport the water card somewhere else on screen.
   * @returns {boolean} true if it fled (block add), false if client finally caught it
   */
  function fleeWater(card) {
    if (prefersReducedMotion || waterAllowOrder) return false;
    if (waterCooldown) return true;

    waterEscapes += 1;
    if (waterEscapes >= WATER_CATCH_AFTER) {
      waterEscapes = 0;
      waterAllowOrder = true;
      endWaterChase(card, { toast: false, instant: true });
      showToast('Oké oké… je hebt water verdiend 💧', false, 2400);
      return false;
    }

    waterCooldown = true;
    setTimeout(() => {
      waterCooldown = false;
    }, 380);

    enterWaterChase(card);
    showToast(pick(WATER_ESCAPE_TOASTS), false, 1500);

    const rect = card.getBoundingClientRect();
    const pad = 16;
    const w = card.offsetWidth || 280;
    const h = card.offsetHeight || 72;
    const maxX = Math.max(pad, window.innerWidth - w - pad);
    const maxY = Math.max(pad + 24, window.innerHeight - h - pad - 24);

    let x = pad + Math.random() * Math.max(1, maxX - pad);
    let y = pad + Math.random() * Math.max(1, maxY - pad);

    const cx = rect.left;
    const cy = rect.top;
    let tries = 0;
    while (tries < 8 && Math.hypot(x - cx, y - cy) < 140) {
      x = pad + Math.random() * Math.max(1, maxX - pad);
      y = pad + Math.random() * Math.max(1, maxY - pad);
      tries += 1;
    }

    card.classList.remove('water-zip');
    void card.offsetWidth;
    card.classList.add('water-zip');
    card.style.left = `${Math.round(x)}px`;
    card.style.top = `${Math.round(y)}px`;

    if (Math.random() < 0.4) {
      spawnFloatingSticker(card, pick(['te sober', 'hydrate later', 'nah', 'splash', 'run']));
    }
    return true;
  }

  /** Scroll / swipe ends the blank-canvas chase. */
  function vanishFleeingWater(card) {
    if (!isWaterChase() && !(card && card.classList.contains('menu-card--fleeing'))) return;
    endWaterChase(card);
  }

  /* ------------------------------------------------------------------ */
  /* Order state                                                        */
  /* ------------------------------------------------------------------ */
  /** @type {Map<string, { name: string, price: number, category: string, qty: number }>} */
  const order = new Map();

  const fab = document.getElementById('order-fab');
  const badge = document.getElementById('order-badge');
  const overlay = document.getElementById('order-overlay');
  const drawer = document.getElementById('order-drawer');
  const bodyEl = document.getElementById('order-body');
  const emptyEl = document.getElementById('order-empty');
  const footerEl = document.getElementById('order-footer');
  const totalEl = document.getElementById('order-total');
  const clearBtn = document.getElementById('order-clear');
  const submitBtn = document.getElementById('order-submit');
  const noteInput = document.getElementById('order-note');
  const tableHint = document.getElementById('order-table-hint');
  const tableChip = document.getElementById('table-chip');
  const tableChipNum = document.getElementById('table-chip-num');
  const toastEl = document.getElementById('toast');
  const confirmOverlay = document.getElementById('confirm-overlay');
  const confirmModal = document.getElementById('confirm-modal');
  const confirmLead = document.getElementById('confirm-lead');
  const confirmList = document.getElementById('confirm-list');
  const confirmTotal = document.getElementById('confirm-total');
  const confirmCancel = document.getElementById('confirm-cancel');
  const confirmSend = document.getElementById('confirm-send');

  let tableNumber = null;
  let tableCount = 20;
  let submitting = false;
  /** Only true while the confirm dialog is open — prevents accidental API submits. */
  let confirmReady = false;
  /** @type {Set<string>} */
  let outOfStock = new Set();
  let availabilityTimer = null;
  const AVAILABILITY_POLL_MS = 20000;

  function formatEuro(n) {
    return (
      '€' +
      n.toLocaleString('nl-BE', {
        minimumFractionDigits: n % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      })
    );
  }

  function syncAvailabilityUI() {
    document.querySelectorAll('[data-add]').forEach((btn) => {
      const name = btn.dataset.name || '';
      const oos = Boolean(name && outOfStock.has(name));
      btn.disabled = oos;
      btn.setAttribute('aria-disabled', oos ? 'true' : 'false');
      btn.classList.toggle('is-oos', oos);
      if (btn.classList.contains('menu-card__size-btn')) {
        btn.classList.toggle('menu-card__size-btn--oos', oos);
      }
    });

    document.querySelectorAll('.menu-card, .daily-special').forEach((card) => {
      const addBtns = [...card.querySelectorAll('[data-add]')];
      if (addBtns.length === 0) return;
      const allOos = addBtns.every((b) => outOfStock.has(b.dataset.name || ''));
      card.classList.toggle('menu-card--oos', allOos);
      card.classList.toggle('daily-special--oos', allOos && card.classList.contains('daily-special'));

      let badge = card.querySelector('.menu-card__oos-badge');
      if (allOos) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'menu-card__oos-badge';
          badge.setAttribute('aria-label', 'Uitverkocht');
          badge.innerHTML =
            '<span class="menu-card__oos-badge-text" aria-hidden="true">UITVERKOCHT · UITVERKOCHT · UITVERKOCHT · UITVERKOCHT · UITVERKOCHT ·</span>';
          card.appendChild(badge);
        }
      } else if (badge) {
        badge.remove();
      }
    });
  }

  function applyAvailability(list, { notifyCart } = {}) {
    const next = new Set(Array.isArray(list) ? list : []);
    let removed = 0;
    for (const name of [...order.keys()]) {
      if (next.has(name)) {
        order.delete(name);
        removed += 1;
      }
    }
    outOfStock = next;
    syncAvailabilityUI();
    if (removed > 0) {
      renderOrder();
      if (notifyCart !== false) {
        showToast(
          removed === 1
            ? 'Uitverkocht item verwijderd uit mandje'
            : `${removed} uitverkochte items verwijderd uit mandje`,
          true,
          3200
        );
      }
    }
  }

  async function refreshAvailability({ notifyCart } = {}) {
    try {
      const res = await fetch('/api/menu/availability', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      applyAvailability(data.outOfStock || [], { notifyCart });
    } catch {
      /* ignore transient network errors */
    }
  }

  function startAvailabilityPolling() {
    if (availabilityTimer) clearInterval(availabilityTimer);
    availabilityTimer = setInterval(() => {
      if (document.hidden) return;
      refreshAvailability({ notifyCart: true });
    }, AVAILABILITY_POLL_MS);

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) refreshAvailability({ notifyCart: true });
    });
  }

  function openDrawer() {
    overlay.classList.add('open');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function getTotals() {
    let total = 0;
    for (const item of order.values()) {
      total += item.price * item.qty;
    }
    return { total };
  }

  function renderOrder() {
    const items = [...order.values()];
    const totalQty = items.reduce((sum, i) => sum + i.qty, 0);

    if (totalQty > 0) {
      badge.textContent = String(totalQty);
      badge.classList.add('show');
    } else {
      badge.classList.remove('show');
    }

    // Clear previous item rows (keep empty state node)
    bodyEl.querySelectorAll('.order-item').forEach((el) => el.remove());

    if (items.length === 0) {
      emptyEl.hidden = false;
      footerEl.hidden = true;
      const emptyLine = pick(EMPTY_LINES);
      const emptyEmoji = document.getElementById('order-empty-emoji');
      const emptyText = document.getElementById('order-empty-text');
      if (emptyEmoji) emptyEmoji.textContent = emptyLine.emoji;
      if (emptyText) emptyText.textContent = emptyLine.text;
      return;
    }

    emptyEl.hidden = true;
    footerEl.hidden = false;

    const { total } = getTotals();

    for (const item of items) {
      const lineTotal = item.qty * item.price;
      const row = document.createElement('div');
      row.className = 'order-item';
      row.innerHTML = `
        <span class="order-item__name">${escapeHtml(item.name)}</span>
        <div class="order-item__controls">
          <button type="button" class="order-item__qty-btn" data-dec="${escapeAttr(item.name)}" aria-label="Verminder">−</button>
          <span class="order-item__qty">${item.qty}</span>
          <button type="button" class="order-item__qty-btn" data-inc="${escapeAttr(item.name)}" aria-label="Verhoog">+</button>
        </div>
        <span class="order-item__price">${formatEuro(lineTotal)}</span>
      `;
      bodyEl.appendChild(row);
    }

    totalEl.textContent = formatEuro(total);
    updateSubmitState();
  }

  function updateSubmitState() {
    if (!submitBtn) return;
    if (!tableNumber) {
      tableHint.textContent = 'Scan de QR-code op je tafel om te bestellen.';
      submitBtn.disabled = true;
      return;
    }
    tableHint.textContent = `Tafel ${tableNumber} · we brengen alles naar je toe`;
    submitBtn.disabled = order.size === 0 || submitting;
  }

  function showToast(message, isError = false, ms = 2200) {
    toastEl.hidden = false;
    toastEl.textContent = message;
    toastEl.classList.toggle('toast--error', isError);
    toastEl.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      toastEl.classList.remove('show');
      setTimeout(() => {
        toastEl.hidden = true;
      }, 300);
    }, ms);
  }

  function openConfirm() {
    if (!tableNumber || order.size === 0 || submitting) return;

    const items = [...order.values()];
    const { total } = getTotals();

    const confirmTitle = document.getElementById('confirm-title');
    if (confirmTitle) confirmTitle.textContent = pick(CONFIRM_TITLES);
    confirmLead.textContent = pick(CONFIRM_LEADS).replace('{n}', String(tableNumber));
    confirmList.innerHTML = items
      .map((item) => {
        const line = item.qty * item.price;
        return `<li><span><span class="qty">${item.qty}×</span>${escapeHtml(
          item.name
        )}</span><span>${formatEuro(line)}</span></li>`;
      })
      .join('');

    confirmTotal.textContent = formatEuro(total);

    confirmReady = true;
    confirmOverlay.hidden = false;
    confirmModal.hidden = false;
  }

  function closeConfirm() {
    confirmReady = false;
    confirmOverlay.hidden = true;
    confirmModal.hidden = true;
    confirmSend.disabled = false;
    confirmSend.textContent = 'Ja, verstuur naar de bar';
  }

  async function submitOrder() {
    // Hard gate: never POST unless the confirm dialog is open
    if (!confirmReady || submitting || !tableNumber || order.size === 0) return;
    submitting = true;
    updateSubmitState();
    confirmSend.disabled = true;
    confirmSend.textContent = 'Versturen…';
    submitBtn.textContent = 'Bezig…';

    const items = [...order.values()].map((item) => ({
      name: item.name,
      qty: item.qty,
    }));

    const clientRequestId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: tableNumber,
          items,
          note: (noteInput.value || '').trim(),
          client_request_id: clientRequestId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409 && Array.isArray(data.outOfStock)) {
          applyAvailability(data.outOfStock, { notifyCart: false });
          closeConfirm();
        }
        throw new Error(data.error || 'Bestelling mislukt');
      }

      order.clear();
      noteInput.value = '';
      renderOrder();
      closeConfirm();
      closeDrawer();
      showToast(pick(SENT_TOASTS).replace('{n}', String(tableNumber)), false, 4200);
      celebrateOrderSuccess();
    } catch (err) {
      showToast(err.message || 'Bestelling mislukt', true, 4200);
      confirmSend.disabled = false;
      confirmSend.textContent = 'Ja, verstuur naar de bar';
    } finally {
      submitting = false;
      submitBtn.textContent = 'Verder naar bevestiging';
      updateSubmitState();
    }
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, '&#39;');
  }

  function sparkToFab(fromEl) {
    if (prefersReducedMotion || !fromEl || !fab) return;

    const from = fromEl.getBoundingClientRect();
    const to = fab.getBoundingClientRect();
    const startX = from.left + from.width / 2;
    const startY = from.top + from.height / 2;
    const endX = to.left + to.width / 2;
    const endY = to.top + to.height / 2;
    const dx = endX - startX;
    const dy = endY - startY;

    for (let i = 0; i < 3; i++) {
      const spark = document.createElement('span');
      spark.className = 'cart-spark';
      spark.style.left = `${startX - 3.5}px`;
      spark.style.top = `${startY - 3.5}px`;
      spark.style.setProperty('--spark-dx', `${dx + (i - 1) * 10}px`);
      spark.style.setProperty('--spark-dy', `${dy + (i - 1) * 8}px`);
      spark.style.animationDelay = `${i * 40}ms`;
      document.body.appendChild(spark);
      spark.addEventListener('animationend', () => spark.remove(), { once: true });
    }
  }

  function addItem(name, price, category) {
    if (outOfStock.has(name)) {
      showToast('Uitverkocht', true, 2000);
      return { toast: 'Uitverkocht', className: '' };
    }
    const existing = order.get(name);
    if (existing) {
      existing.qty += 1;
    } else {
      order.set(name, { name, price, category, qty: 1 });
    }
    renderOrder();
    // Cart only — never submits to the bar
    const gag = pickItemGag(name, category);
    showToast(gag.toast, false, 1800);
    fab.classList.add('order-fab--ready');
    fab.classList.add('order-fab--pulse');
    if (!prefersReducedMotion && Math.random() < 0.35) {
      fab.classList.add('fab-spin');
      setTimeout(() => fab.classList.remove('fab-spin'), 700);
    }
    clearTimeout(addItem._pulse);
    addItem._pulse = setTimeout(() => fab.classList.remove('order-fab--pulse'), 600);
    return gag;
  }

  function changeQty(name, delta) {
    const item = order.get(name);
    if (!item) return;
    if (delta > 0 && outOfStock.has(name)) {
      showToast('Uitverkocht', true, 2000);
      return;
    }
    item.qty += delta;
    if (item.qty <= 0) order.delete(name);
    renderOrder();
  }

  document.addEventListener('click', (e) => {
    const waterCard = e.target.closest('[data-water-dodge]');
    if (waterCard) {
      e.preventDefault();
      e.stopPropagation();
      // Keyboard / reduced-motion users can order; mouse/touch must catch it
      const viaKeyboard = e.detail === 0;
      if (!viaKeyboard && fleeWater(waterCard)) return;
      // Fall through: treat as successful add of water
      const btn = waterCard.querySelector('[data-add]');
      if (btn) {
        const name = btn.dataset.name;
        const price = parseFloat(btn.dataset.price);
        const category = btn.dataset.category || 'fris';
        if (name && Number.isFinite(price)) {
          const gag = addItem(name, price, category);
          waterAllowOrder = false;
          waterEscapes = 0;
          sparkToFab(btn);
          if (!prefersReducedMotion && gag.className) {
            waterCard.classList.add(gag.className);
            setTimeout(() => waterCard.classList.remove(gag.className), 700);
          }
        }
      }
      return;
    }

    const addBtn = e.target.closest('[data-add]');
    if (addBtn) {
      e.preventDefault();
      e.stopPropagation();
      if (addBtn.disabled || addBtn.classList.contains('is-oos')) return;
      if (addBtn.closest('[data-water-dodge]')) return;
      const name = addBtn.dataset.name;
      const price = parseFloat(addBtn.dataset.price);
      const category = addBtn.dataset.category || 'other';
      if (!name || !Number.isFinite(price)) return;
      const gag = addItem(name, price, category);
      sparkToFab(addBtn);
      if (!prefersReducedMotion) {
        addBtn.classList.remove('btn-twirl');
        void addBtn.offsetWidth;
        addBtn.classList.add('btn-twirl');
        setTimeout(() => addBtn.classList.remove('btn-twirl'), 600);
      }

      const card = addBtn.closest('.menu-card, .daily-special');
      if (card) {
        card.classList.remove('added', 'gag-shake', 'gag-bounce', 'gag-tilt', 'gag-wobble');
        void card.offsetWidth;
        const gagClass = !prefersReducedMotion && gag.className ? gag.className : '';
        if (gagClass) {
          card.classList.add(gagClass);
        } else {
          card.classList.add('added');
        }
        setTimeout(() => {
          card.classList.remove('added', 'gag-shake', 'gag-bounce', 'gag-tilt', 'gag-wobble');
        }, 700);
        if (!prefersReducedMotion && Math.random() < 0.28) {
          spawnFloatingSticker(card, gag.sticker || pick(FLOAT_STICKERS));
        }
      }
      return;
    }

    const inc = e.target.closest('[data-inc]');
    if (inc) {
      changeQty(inc.getAttribute('data-inc'), 1);
      return;
    }

    const dec = e.target.closest('[data-dec]');
    if (dec) {
      changeQty(dec.getAttribute('data-dec'), -1);
      return;
    }

  });

  // Water chase: click starts blank-canvas mode; during chase, hover still teleports
  const waterEl = document.getElementById('water-card');
  if (waterEl && !prefersReducedMotion) {
    waterEl.addEventListener(
      'pointerenter',
      () => {
        if (isWaterChase()) fleeWater(waterEl);
      },
      { passive: true }
    );

    // Scroll / swipe ends chase and restores the menu
    const onBrowseAway = () => {
      if (isWaterChase()) vanishFleeingWater(waterEl);
    };
    window.addEventListener('scroll', onBrowseAway, { passive: true });
    window.addEventListener('wheel', onBrowseAway, { passive: true });
    window.addEventListener('touchmove', onBrowseAway, { passive: true });
  }

  fab.addEventListener('click', openDrawer);
  overlay.addEventListener('click', closeDrawer);
  clearBtn.addEventListener('click', () => {
    order.clear();
    renderOrder();
  });

  submitBtn.addEventListener('click', openConfirm);
  confirmCancel.addEventListener('click', closeConfirm);
  confirmOverlay.addEventListener('click', closeConfirm);
  confirmSend.addEventListener('click', submitOrder);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!confirmModal.hidden) {
        closeConfirm();
        return;
      }
      if (drawer.classList.contains('open')) {
        closeDrawer();
      }
    }
  });

  /* ------------------------------------------------------------------ */
  /* Table from QR (?t=12)                                              */
  /* ------------------------------------------------------------------ */
  async function initTable() {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const cfg = await res.json();
        if (cfg.tableCount) tableCount = cfg.tableCount;
      }
    } catch {
      /* offline / static preview */
    }

    const params = new URLSearchParams(window.location.search);
    const t = Math.floor(Number(params.get('t')));
    if (Number.isFinite(t) && t >= 1 && t <= tableCount) {
      tableNumber = t;
      tableChip.hidden = false;
      tableChipNum.textContent = String(t);
      document.title = `Rochus · Tafel ${t}`;
    } else {
      tableNumber = null;
      tableChip.hidden = true;
    }
    updateSubmitState();
  }

  initTable();

  /* ------------------------------------------------------------------ */
  /* Category filter + scroll spy                                       */
  /* ------------------------------------------------------------------ */
  const nav = document.querySelector('.nav-filter');
  const navInner = nav?.querySelector('.nav-filter__inner');
  const filterBtns = [...document.querySelectorAll('.nav-filter__btn')];
  const sections = [...document.querySelectorAll('.menu-section[data-category]')];
  let activeFilter = 'all';
  let spyPaused = false;
  let activeNavFilter = 'all';

  function scrollNavBtnIntoView(btn) {
    if (!navInner || !btn) return;
    const pad = 20;
    const btnLeft = btn.offsetLeft;
    const btnRight = btnLeft + btn.offsetWidth;
    const viewLeft = navInner.scrollLeft;
    const viewRight = viewLeft + navInner.clientWidth;
    let nextLeft = null;
    if (btnLeft < viewLeft + pad) {
      nextLeft = Math.max(0, btnLeft - pad);
    } else if (btnRight > viewRight - pad) {
      nextLeft = btnRight - navInner.clientWidth + pad;
    }
    if (nextLeft == null) return;
    navInner.scrollTo({
      left: nextLeft,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }

  function setActiveBtn(filter) {
    if (filter === activeNavFilter) return;
    activeNavFilter = filter;
    filterBtns.forEach((btn) => {
      const on = btn.dataset.filter === filter;
      btn.classList.toggle('active', on);
      if (on) scrollNavBtnIntoView(btn);
    });
  }

  function applyCategoryFilter(filter) {
    activeFilter = filter;
    setActiveBtn(filter);
    sections.forEach((section) => {
      const match = filter === 'all' || section.dataset.category === filter;
      section.hidden = !match;
    });
    applySearch();
    // Avoid chip flicker when page height jumps after filtering
    lastChipScrollY = window.scrollY;
    if (tableChip && !tableChip.hidden) {
      if (filter === 'all') {
        tableChip.classList.toggle('table-chip--away', window.scrollY > 72);
      } else {
        tableChip.classList.add('table-chip--away');
      }
    }
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      applyCategoryFilter(filter);

      if (filter === 'all') {
        setActiveBtn('all');
        window.scrollTo({ top: nav.offsetTop, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        return;
      }

      const target = document.getElementById(filter);
      if (target && !target.hidden) {
        spyPaused = true;
        if (tableChip && !tableChip.hidden) tableChip.classList.add('table-chip--away');
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
        setTimeout(() => {
          spyPaused = false;
          lastChipScrollY = window.scrollY;
        }, 900);
      }
    });
  });

  /* Sticky nav + section spy + table chip */
  let lastChipScrollY = window.scrollY;
  let chipScrollTicking = false;
  let chipDockTop = null;

  function updateActiveSectionFromScroll() {
    if (spyPaused || activeFilter !== 'all') return;

    const marker = (nav?.getBoundingClientRect().bottom || 64) + 20;
    let current = 'all';

    for (const section of sections) {
      if (section.hidden || section.style.display === 'none') continue;
      if (section.getBoundingClientRect().top <= marker) {
        current = section.dataset.category;
      }
    }

    setActiveBtn(current);
  }

  function updateTableChipOnScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 40);

    if (!tableChip || tableChip.hidden) {
      updateActiveSectionFromScroll();
      chipScrollTicking = false;
      return;
    }

    const y = window.scrollY;
    const delta = y - lastChipScrollY;
    const pastHero = y > 72;

    if (pastHero) {
      tableChip.classList.add('table-chip--docked');
      // Stable dock position — measure once, don't jitter every frame
      if (chipDockTop == null) {
        chipDockTop = Math.round((nav?.offsetHeight || 48) + 8);
      }
      tableChip.style.setProperty('--chip-top', `${chipDockTop}px`);
    } else {
      tableChip.classList.remove('table-chip--docked', 'table-chip--away');
      tableChip.style.removeProperty('--chip-top');
      chipDockTop = null;
    }

    // Hysteresis so tiny section scrolls don't flicker the chip
    if (pastHero) {
      if (delta > 14) {
        tableChip.classList.add('table-chip--away');
      } else if (delta < -14) {
        tableChip.classList.remove('table-chip--away');
      }
    }

    if (Math.abs(delta) > 2) lastChipScrollY = y;
    updateActiveSectionFromScroll();
    chipScrollTicking = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (chipScrollTicking) return;
      chipScrollTicking = true;
      requestAnimationFrame(updateTableChipOnScroll);
    },
    { passive: true }
  );
  updateTableChipOnScroll();

  window.addEventListener('resize', () => {
    chipDockTop = null;
  });

  /* ------------------------------------------------------------------ */
  /* Search                                                             */
  /* ------------------------------------------------------------------ */
  const searchInput = document.getElementById('menu-search');
  const noResults = document.getElementById('no-results');

  function applySearch() {
    const q = (searchInput.value || '').trim().toLowerCase();
    let anyVisible = false;

    sections.forEach((section) => {
      if (section.hidden) return;

      const cards = section.querySelectorAll('.menu-card');
      let sectionHasMatch = false;

      cards.forEach((card) => {
        const name = (card.dataset.name || card.querySelector('.menu-card__name')?.textContent || '')
          .toLowerCase();
        const match = !q || name.includes(q);
        card.hidden = !match;
        if (match) sectionHasMatch = true;
      });

      const header = section.querySelector('.menu-section__header');
      if (header) header.hidden = q && !sectionHasMatch;
      section.style.display = sectionHasMatch || !q ? '' : 'none';
      if (sectionHasMatch) anyVisible = true;
    });

    // Signature callout visibility
    const special = document.querySelector('.daily-special');
    if (special) {
      const specialMatch =
        !q ||
        "tripel karmeliet van 't vat signature".includes(q) ||
        q.includes('tripel') ||
        q.includes('karmeliet') ||
        q.includes('signature');
      const categoryOk = activeFilter === 'all' || activeFilter === 'bieren';
      special.hidden = !(specialMatch && categoryOk);
      if (!special.hidden && specialMatch) anyVisible = true;
    }

    const showNone = Boolean(q && !anyVisible);
    noResults.classList.toggle('show', showNone);
    if (showNone) {
      const text = document.getElementById('no-results-text');
      if (text) text.textContent = pick(NO_RESULT_LINES);
    }
  }

  searchInput.addEventListener('input', applySearch);

  /* ------------------------------------------------------------------ */
  /* Stagger-in animations                                              */
  /* ------------------------------------------------------------------ */
  function triggerCardShimmer(el) {
    if (!el.classList.contains('menu-card')) return;
    el.classList.remove('shimmer');
    void el.offsetWidth;
    el.classList.add('shimmer');
    const clear = () => el.classList.remove('shimmer');
    el.addEventListener('animationend', clear, { once: true });
    setTimeout(clear, 1000);
  }

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const staggerEls = document.querySelectorAll('.stagger-in');
    staggerEls.forEach((el) => el.classList.add('is-animating'));
    const staggerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const siblings = el.parentElement
              ? [...el.parentElement.children].filter((c) => c.classList.contains('stagger-in'))
              : [];
            const idx = siblings.indexOf(el);
            const delay = Math.max(0, idx) * 60;
            el.style.transitionDelay = `${delay}ms`;
            el.classList.add('visible');
            if (el.classList.contains('menu-card')) {
              setTimeout(() => triggerCardShimmer(el), delay + 80);
            }
            staggerObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    staggerEls.forEach((el) => staggerObserver.observe(el));
    // Safety: never leave cards invisible
    setTimeout(() => {
      staggerEls.forEach((el) => {
        if (!el.classList.contains('visible')) {
          el.classList.add('visible');
          triggerCardShimmer(el);
        }
      });
    }, 1200);
  } else {
    document.querySelectorAll('.stagger-in').forEach((el) => el.classList.add('visible'));
  }

  /* Lock FAB entrance animation after first play */
  if (fab) {
    fab.addEventListener(
      'animationend',
      (ev) => {
        if (ev.animationName === 'fadeInUp') fab.classList.add('order-fab--ready');
      },
      { once: true }
    );
    // Safety if animation was skipped / already done
    setTimeout(() => fab.classList.add('order-fab--ready'), 2000);
  }

  /* ------------------------------------------------------------------ */
  /* Hero parallax                                                      */
  /* ------------------------------------------------------------------ */
  const parallaxEl = document.querySelector('[data-parallax]');
  if (parallaxEl && !prefersReducedMotion) {
    let ticking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (y < window.innerHeight) {
            parallaxEl.style.transform = `translate3d(0, ${y * 0.35}px, 0)`;
          }
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  /* ------------------------------------------------------------------ */
  /* Easter eggs                                                        */
  /* ------------------------------------------------------------------ */
  const brandTitle = document.getElementById('brand-title');
  if (brandTitle) {
    brandTitle.style.cursor = 'pointer';
    brandTitle.addEventListener('click', () => {
      if (!prefersReducedMotion) {
        brandTitle.classList.remove('brand-jiggle');
        void brandTitle.offsetWidth;
        brandTitle.classList.add('brand-jiggle');
        setTimeout(() => brandTitle.classList.remove('brand-jiggle'), 800);
      }
      showToast(pick(['ROCHUS. zeg ’t nog eens.', 'Je hebt de secret handshake gevonden', 'Shhh… dit is tussen ons', 'Ja hallo 👋']), false, 2200);
      const badgeText = document.getElementById('hero-badge-text');
      if (badgeText) badgeText.textContent = pick(HERO_BADGE_LINES);
    });
  }

  const footerBrand = document.getElementById('footer-brand');
  const footerTag = document.getElementById('footer-tagline');
  if (footerBrand) {
    footerBrand.style.cursor = 'pointer';
    footerBrand.addEventListener('click', () => {
      if (footerTag) footerTag.textContent = pick(FOOTER_LINES);
      showToast(pick(['Footer supremacy', 'Je scrollde helemaal hierheen. Iconisch.', 'Bonuspunt voor commitment']), false, 2000);
      if (!prefersReducedMotion) document.body.classList.add('disco-blip');
      setTimeout(() => document.body.classList.remove('disco-blip'), 900);
    });
  }

  // Triple-tap table chip → brief disco
  const tableChipEl = document.getElementById('table-chip');
  let chipTaps = 0;
  let chipTimer = 0;
  if (tableChipEl) {
    tableChipEl.style.cursor = 'pointer';
    tableChipEl.title = 'tik tik tik…';
    tableChipEl.addEventListener('click', () => {
      chipTaps += 1;
      clearTimeout(chipTimer);
      chipTimer = setTimeout(() => {
        chipTaps = 0;
      }, 900);
      if (chipTaps >= 3) {
        chipTaps = 0;
        showToast('Tafel disco mode ✨ (tijdelijk, beloofd)', false, 2400);
        if (!prefersReducedMotion) {
          document.body.classList.add('disco-blip');
          burstConfetti();
          setTimeout(() => document.body.classList.remove('disco-blip'), 1200);
        }
      }
    });
  }

  // Rotate hero badge vibes every so often
  const badgeTextEl = document.getElementById('hero-badge-text');
  if (badgeTextEl && !prefersReducedMotion) {
    setInterval(() => {
      if (document.hidden) return;
      badgeTextEl.textContent = pick(HERO_BADGE_LINES);
    }, 9000);
  }

  // Random idle stickers over the menu (rare)
  if (!prefersReducedMotion) {
    setInterval(() => {
      if (document.hidden || Math.random() > 0.45) return;
      const cards = [...document.querySelectorAll('.menu-card:not([hidden])')];
      if (!cards.length) return;
      spawnFloatingSticker(pick(cards), pick(FLOAT_STICKERS));
    }, 14000);
  }

  renderOrder();
  refreshAvailability({ notifyCart: false });
  startAvailabilityPolling();
})();
