(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  function showToast(message, isError = false) {
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
    }, 4200);
  }

  function openConfirm() {
    if (!tableNumber || order.size === 0) return;

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

    confirmLead.textContent = `Tafel ${tableNumber} · controleer je bestelling voor je verstuurt`;
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

    confirmOverlay.hidden = false;
    confirmModal.hidden = false;
  }

  function closeConfirm() {
    confirmOverlay.hidden = true;
    confirmModal.hidden = true;
    confirmSend.disabled = false;
    confirmSend.textContent = 'Bevestigen & versturen';
  }

  async function submitOrder() {
    if (submitting || !tableNumber || order.size === 0) return;
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
      showToast(`Bestelling bevestigd · tafel ${tableNumber} · we komen eraan`);
    } catch (err) {
      showToast(err.message || 'Bestelling mislukt', true);
      confirmSend.disabled = false;
      confirmSend.textContent = 'Bevestigen & versturen';
    } finally {
      submitting = false;
      submitBtn.textContent = 'Controleer bestelling';
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

  function addItem(name, price, category) {
    const existing = order.get(name);
    if (existing) {
      existing.qty += 1;
    } else {
      order.set(name, { name, price, category, qty: 1 });
    }
    renderOrder();
  }

  function changeQty(name, delta) {
    const item = order.get(name);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) order.delete(name);
    renderOrder();
  }

  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-add]');
    if (addBtn) {
      e.preventDefault();
      const name = addBtn.dataset.name;
      const price = parseFloat(addBtn.dataset.price);
      const category = addBtn.dataset.category || 'other';
      addItem(name, price, category);

      const card = addBtn.closest('.menu-card, .daily-special');
      if (card) {
        card.classList.remove('added');
        void card.offsetWidth;
        card.classList.add('added');
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
    }
  });

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

    noResults.classList.toggle('show', Boolean(q && !anyVisible));
  }

  searchInput.addEventListener('input', applySearch);

  /* ------------------------------------------------------------------ */
  /* Stagger-in animations                                              */
  /* ------------------------------------------------------------------ */
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const staggerEls = document.querySelectorAll('.stagger-in');
    const staggerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const siblings = el.parentElement
              ? [...el.parentElement.children].filter((c) => c.classList.contains('stagger-in'))
              : [];
            const idx = siblings.indexOf(el);
            el.style.transitionDelay = `${Math.max(0, idx) * 60}ms`;
            el.classList.add('visible');
            staggerObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    staggerEls.forEach((el) => staggerObserver.observe(el));
  } else {
    document.querySelectorAll('.stagger-in').forEach((el) => el.classList.add('visible'));
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

  renderOrder();
})();
