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
    'Niet gevonden. Misschien te niche. Misschien te drunk-typed.',
    'Droog als de Sahara hier. Probeer “spritz”.',
    'Onze AI (een intern) kent dit niet. Typ iets normalers.',
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
        toast: pick(['Snack attack', '3+1 brain activated', 'Crunch time']),
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

  function burstConfetti() {
    const layer = document.getElementById('chaos-layer');
    if (!layer) return;
    const bits = ['✨', '🍊', '🥂', '💥', '🍋', '💅', '🥳', '🍟'];
    for (let i = 0; i < 14; i++) {
      const bit = document.createElement('span');
      bit.className = 'chaos-confetti';
      bit.textContent = pick(bits);
      bit.style.left = `${20 + Math.random() * 60}vw`;
      bit.style.setProperty('--drift', `${(Math.random() - 0.5) * 120}px`);
      bit.style.animationDelay = `${Math.random() * 0.2}s`;
      bit.style.fontSize = `${0.9 + Math.random() * 0.8}rem`;
      layer.appendChild(bit);
      bit.addEventListener('animationend', () => bit.remove(), { once: true });
      setTimeout(() => bit.remove(), 2000);
    }
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
      card.classList.remove('menu-card--fleeing', 'water-zip');
      card.style.left = '';
      card.style.top = '';
      card.style.width = '';
      showToast('Oké oké… je hebt water verdiend 💧', false, 2400);
      return false;
    }

    waterCooldown = true;
    setTimeout(() => {
      waterCooldown = false;
    }, 380);

    showToast(pick(WATER_ESCAPE_TOASTS), false, 1500);

    const rect = card.getBoundingClientRect();
    if (!card.classList.contains('menu-card--fleeing')) {
      card.style.width = `${Math.min(rect.width, window.innerWidth - 32)}px`;
      card.classList.add('menu-card--fleeing');
    }

    const pad = 12;
    const w = card.offsetWidth || 280;
    const h = card.offsetHeight || 72;
    const maxX = Math.max(pad, window.innerWidth - w - pad);
    const maxY = Math.max(pad + 70, window.innerHeight - h - pad - 90);

    let x = pad + Math.random() * (maxX - pad);
    let y = 70 + Math.random() * Math.max(40, maxY - 70);

    // Don't land too close to current spot
    const cx = rect.left;
    const cy = rect.top;
    let tries = 0;
    while (tries < 8 && Math.hypot(x - cx, y - cy) < 120) {
      x = pad + Math.random() * (maxX - pad);
      y = 70 + Math.random() * Math.max(40, maxY - 70);
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

  /** Swipe/scroll → runaway water poofs away and returns to the menu slot. */
  function vanishFleeingWater(card) {
    if (!card || !card.classList.contains('menu-card--fleeing')) return;
    if (card.classList.contains('water-vanish')) return;

    waterCooldown = true;
    card.classList.remove('water-zip');
    card.classList.add('water-vanish');
    showToast(pick(['Water is weggezwommen 💧', 'Splash — water gone', 'Te laat, water scrollde weg']), false, 1400);

    setTimeout(() => {
      card.classList.remove('menu-card--fleeing', 'water-vanish', 'water-zip');
      card.style.left = '';
      card.style.top = '';
      card.style.width = '';
      setTimeout(() => {
        waterCooldown = false;
      }, 500);
    }, 280);
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
  const discountEl = document.getElementById('order-discount');
  const discountAmountEl = document.getElementById('order-discount-amount');
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
  const confirmDiscountRow = document.getElementById('confirm-discount-row');
  const confirmDiscount = document.getElementById('confirm-discount');
  const confirmTotal = document.getElementById('confirm-total');
  const confirmCancel = document.getElementById('confirm-cancel');
  const confirmSend = document.getElementById('confirm-send');

  let tableNumber = null;
  let tableCount = 20;
  let submitting = false;
  /** Only true while the confirm dialog is open — prevents accidental API submits. */
  let confirmReady = false;

  function formatEuro(n) {
    return (
      '€' +
      n.toLocaleString('nl-BE', {
        minimumFractionDigits: n % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      })
    );
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
    let subtotal = 0;
    let fingerfoodUnits = [];

    for (const item of order.values()) {
      const line = item.price * item.qty;
      subtotal += line;
      if (item.category === 'fingerfood') {
        for (let i = 0; i < item.qty; i++) {
          fingerfoodUnits.push(item.price);
        }
      }
    }

    // 3+1: every 4th fingerfood unit free (cheapest of each group of 4)
    fingerfoodUnits.sort((a, b) => a - b);
    let discount = 0;
    const freeCount = Math.floor(fingerfoodUnits.length / 4);
    for (let i = 0; i < freeCount; i++) {
      discount += fingerfoodUnits[i];
    }

    return { subtotal, discount, total: subtotal - discount, freeCount };
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

    const { discount, total, freeCount } = getTotals();

    // Distribute free tags across fingerfood lines (cheapest units first)
    let remainingFree = freeCount;
    const fingerfoodSorted = items
      .filter((i) => i.category === 'fingerfood')
      .slice()
      .sort((a, b) => a.price - b.price);

    /** @type {Map<string, number>} */
    const freeByKey = new Map();
    for (const item of fingerfoodSorted) {
      if (remainingFree <= 0) break;
      const freeHere = Math.min(item.qty, remainingFree);
      freeByKey.set(item.name, freeHere);
      remainingFree -= freeHere;
    }

    for (const item of items) {
      const freeHere = freeByKey.get(item.name) || 0;
      const paidQty = item.qty - freeHere;
      const lineTotal = paidQty * item.price;

      const row = document.createElement('div');
      row.className = 'order-item';
      row.innerHTML = `
        <span class="order-item__name">${escapeHtml(item.name)}</span>
        ${freeHere > 0 ? `<span class="order-item__free-tag">${freeHere} gratis</span>` : ''}
        <div class="order-item__controls">
          <button type="button" class="order-item__qty-btn" data-dec="${escapeAttr(item.name)}" aria-label="Verminder">−</button>
          <span class="order-item__qty">${item.qty}</span>
          <button type="button" class="order-item__qty-btn" data-inc="${escapeAttr(item.name)}" aria-label="Verhoog">+</button>
        </div>
        <span class="order-item__price${freeHere === item.qty ? ' order-item__price--free' : ''}">${formatEuro(lineTotal)}</span>
      `;
      bodyEl.appendChild(row);
    }

    if (discount > 0) {
      discountEl.hidden = false;
      discountAmountEl.textContent = `−${formatEuro(discount)}`;
    } else {
      discountEl.hidden = true;
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
    const { discount, total, freeCount } = getTotals();

    let remainingFree = freeCount;
    const fingerfoodSorted = items
      .filter((i) => i.category === 'fingerfood')
      .slice()
      .sort((a, b) => a.price - b.price);
    const freeByKey = new Map();
    for (const item of fingerfoodSorted) {
      if (remainingFree <= 0) break;
      const freeHere = Math.min(item.qty, remainingFree);
      freeByKey.set(item.name, freeHere);
      remainingFree -= freeHere;
    }

    const confirmTitle = document.getElementById('confirm-title');
    if (confirmTitle) confirmTitle.textContent = pick(CONFIRM_TITLES);
    confirmLead.textContent = pick(CONFIRM_LEADS).replace('{n}', String(tableNumber));
    confirmList.innerHTML = items
      .map((item) => {
        const freeHere = freeByKey.get(item.name) || 0;
        const line = (item.qty - freeHere) * item.price;
        const freeTag =
          freeHere > 0 ? ` <small style="color:#22c55e">(${freeHere} gratis)</small>` : '';
        return `<li><span><span class="qty">${item.qty}×</span>${escapeHtml(
          item.name
        )}${freeTag}</span><span>${formatEuro(line)}</span></li>`;
      })
      .join('');

    if (discount > 0) {
      confirmDiscountRow.hidden = false;
      confirmDiscount.textContent = `−${formatEuro(discount)}`;
    } else {
      confirmDiscountRow.hidden = true;
    }
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
      if (!res.ok) throw new Error(data.error || 'Bestelling mislukt');

      order.clear();
      noteInput.value = '';
      renderOrder();
      closeConfirm();
      closeDrawer();
      showToast(pick(SENT_TOASTS).replace('{n}', String(tableNumber)), false, 4200);
      if (!prefersReducedMotion) burstConfetti();
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

    // Tap anywhere on a simple (non-wine, non-water) card to add
    const card = e.target.closest('.menu-card:not(.menu-card--wine):not([data-water-dodge])');
    if (card) {
      const btn = card.querySelector('.menu-card__add-btn[data-add]');
      if (btn) {
        e.preventDefault();
        btn.click();
      }
    }
  });

  // Water also flees when you hover / get close (desktop chaos)
  const waterEl = document.getElementById('water-card');
  if (waterEl && !prefersReducedMotion) {
    waterEl.addEventListener(
      'pointerenter',
      () => {
        fleeWater(waterEl);
      },
      { passive: true }
    );

    // Swipe / scroll while it's floating → disappear back into the menu
    const onBrowseAway = () => vanishFleeingWater(waterEl);
    window.addEventListener('scroll', onBrowseAway, { passive: true });
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
  const filterBtns = [...document.querySelectorAll('.nav-filter__btn')];
  const sections = [...document.querySelectorAll('.menu-section[data-category]')];
  let activeFilter = 'all';
  let spyPaused = false;

  function setActiveBtn(filter) {
    filterBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
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
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
        setTimeout(() => {
          spyPaused = false;
        }, 800);
      }
    });
  });

  /* Sticky nav shadow */
  window.addEventListener(
    'scroll',
    () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    },
    { passive: true }
  );

  /* Scroll spy when filter is "all" */
  if ('IntersectionObserver' in window) {
    const spyObserver = new IntersectionObserver(
      (entries) => {
        if (spyPaused || activeFilter !== 'all') return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActiveBtn(visible[0].target.dataset.category);
        }
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75] }
    );
    sections.forEach((s) => spyObserver.observe(s));
  }

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
      const promo = section.querySelector('.menu-section__promo');
      if (header) header.hidden = q && !sectionHasMatch;
      if (promo) promo.hidden = q && !sectionHasMatch;
      section.style.display = sectionHasMatch || !q ? '' : 'none';
      if (sectionHasMatch) anyVisible = true;
    });

    // Daily special visibility
    const special = document.querySelector('.daily-special');
    if (special) {
      const specialMatch =
        !q || "tripel karmeliet van 't vat signature".includes(q);
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
})();
