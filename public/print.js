(() => {
  'use strict';

  const loginView = document.getElementById('login-view');
  const printView = document.getElementById('print-view');
  const loginForm = document.getElementById('login-form');
  const loginPin = document.getElementById('login-pin');
  const loginError = document.getElementById('login-error');
  const printBtn = document.getElementById('print-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const brandEls = [...document.querySelectorAll('[data-brand]')];
  const subtitleEls = [...document.querySelectorAll('[data-subtitle]')];
  const page1Sections = document.getElementById('page1-sections');
  const page2Sections = document.getElementById('page2-sections');
  const allergenLegend = document.getElementById('allergen-legend');
  const allergenSections = document.getElementById('allergen-sections');
  const allergenDisclaimer = document.getElementById('allergen-disclaimer');
  const toolbarMeta = document.querySelector('.print-toolbar__meta');

  /* A4: cocktails op pagina 2 — past niet meer onder fris op pagina 1. */
  const A4_FIRST_IDS = new Set(['bieren', 'flessen', 'alcoholvrij', 'fris']);
  const A4_SECOND_IDS = new Set(['cocktails', 'wijnen', 'shots', 'warme', 'fingerfood']);
  /* Klemkaart: cocktails links houden (rechterkolom is al vol met snacks). */
  const CLIP_FIRST_IDS = new Set(['bieren', 'flessen', 'alcoholvrij', 'fris', 'cocktails']);
  const CLIP_SECOND_IDS = new Set(['wijnen', 'shots', 'warme', 'fingerfood']);

  /** Compacte SVG-pictogrammen (currentColor) voor print. */
  const ALLERGEN_ICONS = {
    gluten:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2c-.4 1.8-1.2 3.2-2.4 4.2C8.2 7.4 7 8 5.8 8.2c1.6.6 2.9 1.6 3.8 3 .8 1.2 1.3 2.6 1.5 4.1.2-1.5.7-2.9 1.5-4.1.9-1.4 2.2-2.4 3.8-3C15 8 13.8 7.4 12.4 6.2 11.2 5.2 10.4 3.8 12 2zm0 9.5c-.3 1.4-.9 2.6-1.8 3.5-.8.8-1.8 1.3-2.9 1.5 1.2.5 2.2 1.3 2.9 2.4.6.9 1 2 1.1 3.1.2-1.1.6-2.2 1.2-3.1.7-1.1 1.7-1.9 2.9-2.4-1.1-.2-2.1-.7-2.9-1.5-.9-.9-1.5-2.1-1.8-3.5z"/></svg>',
    ei: '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="13" rx="6.5" ry="8" fill="none" stroke="currentColor" stroke-width="1.8"/><ellipse cx="12" cy="14" rx="2.2" ry="2.6" fill="currentColor"/></svg>',
    melk: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M8 5h8l1 3v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V8l1-3z"/><path fill="none" stroke="currentColor" stroke-width="1.8" d="M9 5V3.5h6V5"/><path fill="currentColor" d="M9 11h6v8H9z"/></svg>',
    soja: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M12 21V8"/><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M12 14c-2.5-1-4-3-4-5.5 2.5 0 4 1.5 4 4z"/><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M12 12c2.5-1 4-3 4-5.5-2.5 0-4 1.5-4 4z"/><circle cx="12" cy="6" r="1.6" fill="currentColor"/></svg>',
    noten:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="13" rx="5.5" ry="7" fill="none" stroke="currentColor" stroke-width="1.8"/><path fill="none" stroke="currentColor" stroke-width="1.5" d="M12 6.5c1.5 2 1.5 5 0 8M9 10c2 1 4 1 6 0"/></svg>',
    pinda:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M9.5 7.5c0-2 1.5-3.5 3.5-3.5s3 1.2 3 3c0 1.5-.8 2.5-1.5 3.2.8.7 1.8 1.8 1.8 3.5 0 2.2-1.8 4-4 4s-4.3-1.8-4.3-4c0-1.6 1-2.7 1.8-3.4-.7-.8-1.3-1.8-1.3-3.3z"/></svg>',
    selderij:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M12 22V10"/><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M12 12c-3-2-5-5-4.5-8M12 11c3-2 5-5 4.5-8M12 14c-2.5-1-4-3-3.5-5.5M12 13c2.5-1 4-3 3.5-5.5"/></svg>',
    mosterd:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M8 20h8l1-10H7l1 10z"/><path fill="none" stroke="currentColor" stroke-width="1.8" d="M9 10V7l3-4 3 4v3"/><circle cx="12" cy="15" r="1.3" fill="currentColor"/></svg>',
    sesam:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="8" cy="9" rx="2" ry="3" fill="currentColor" transform="rotate(-25 8 9)"/><ellipse cx="15" cy="8" rx="2" ry="3" fill="currentColor" transform="rotate(20 15 8)"/><ellipse cx="11" cy="15" rx="2" ry="3" fill="currentColor" transform="rotate(-5 11 15)"/></svg>',
    sulfiet:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M9 3h6l1 3v14a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V6l1-3z"/><path fill="none" stroke="currentColor" stroke-width="1.5" d="M9 8h6"/><path fill="currentColor" d="M10.2 12.2h1.1v4.2h-1.1zm2.5 0h1.1v4.2h-1.1zm-2.5 0c0-1.4.9-2.2 2.05-2.2s2.05.8 2.05 2.2h-1.1c0-.7-.35-1.05-.95-1.05s-.95.35-.95 1.05z"/></svg>',
    schaaldieren:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M4 14c2-4 6-6 8-6s6 2 8 6"/><path fill="none" stroke="currentColor" stroke-width="1.6" d="M6 14c1.5 3 4 5 6 5s4.5-2 6-5"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/></svg>',
    vis: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M3 12s4-5 9-5 9 5 9 5-4 5-9 5-9-5-9-5z"/><circle cx="16" cy="11" r="1.2" fill="currentColor"/><path fill="none" stroke="currentColor" stroke-width="1.6" d="M3 12l3-2.5M3 12l3 2.5"/></svg>',
    lupine:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M12 21V9"/><circle cx="12" cy="7" r="2" fill="currentColor"/><circle cx="9" cy="10" r="1.6" fill="currentColor"/><circle cx="15" cy="10" r="1.6" fill="currentColor"/><circle cx="10" cy="13.5" r="1.5" fill="currentColor"/><circle cx="14" cy="13.5" r="1.5" fill="currentColor"/></svg>',
    weekdieren:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M12 4c4 0 7 3.5 7 8s-3 8-7 8-7-3.5-7-8 3-8 7-8z"/><path fill="none" stroke="currentColor" stroke-width="1.5" d="M12 8c2 0 3.5 2 3.5 4.5S14 17 12 17"/></svg>',
  };

  function formatEuro(price) {
    if (price == null) return '–';
    return (
      '€' +
      Number(price).toLocaleString('nl-BE', {
        minimumFractionDigits: Number(price) % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      })
    );
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function allergenBadge(key, label) {
    const icon = ALLERGEN_ICONS[key] || '';
    const title = escapeHtml(label || key);
    return `<span class="allergen-badge" title="${title}" aria-label="${title}">${icon}</span>`;
  }

  function renderSection(section) {
    const isWine = section.id === 'wijnen';
    const rows = section.items
      .map((item) => {
        if (isWine) {
          const glass =
            item.glass == null
              ? '<span class="sheet__glass sheet__dash">–</span>'
              : `<span class="sheet__glass">${formatEuro(item.glass)}</span>`;
          const bottle =
            item.bottle == null
              ? '<span class="sheet__bottle sheet__dash">–</span>'
              : `<span class="sheet__bottle">${formatEuro(item.bottle)}</span>`;
          return `<li class="sheet__row sheet__row--wine">
            <span class="sheet__name"><span class="sheet__name-text">${escapeHtml(item.name)}</span></span>
            <span class="sheet__leader" aria-hidden="true"></span>
            ${glass}${bottle}
          </li>`;
        }

        const note = item.note
          ? `<span class="sheet__note">${escapeHtml(item.note)}</span>`
          : '';
        const sig = item.signature
          ? '<span class="sheet__sig">✦ signature</span>'
          : '';
        const priceText = item.price === 0 ? 'gratis' : formatEuro(item.price);
        return `<li class="sheet__row">
          <span class="sheet__name">
            <span class="sheet__name-text">${escapeHtml(item.name)}</span>
            ${sig}${note}
          </span>
          <span class="sheet__leader" aria-hidden="true"></span>
          <span class="sheet__price">${priceText}</span>
        </li>`;
      })
      .join('');

    const wineHead = isWine
      ? `<div class="sheet__wine-head"><span></span><span>Glas</span><span>Fles</span></div>`
      : '';

    return `<section class="sheet__section">
      <h2 class="sheet__section-title">${escapeHtml(section.title)}</h2>
      ${wineHead}
      <ul class="sheet__list">${rows}</ul>
    </section>`;
  }

  function splitSections(data, firstIds, secondIds) {
    const sections = Array.isArray(data.sections) ? data.sections : [];
    const first = sections.filter((s) => firstIds.has(s.id));
    const second = sections.filter((s) => secondIds.has(s.id));
    const leftovers = sections.filter((s) => !firstIds.has(s.id) && !secondIds.has(s.id));
    second.push(...leftovers);
    return { first, second };
  }

  function renderA4(data) {
    brandEls.forEach((el) => (el.textContent = data.brand || 'ROCHUS'));
    subtitleEls.forEach((el) => (el.textContent = data.subtitle || 'Summer pop-up bar'));

    const { first, second } = splitSections(data, A4_FIRST_IDS, A4_SECOND_IDS);
    page1Sections.innerHTML = first.map(renderSection).join('');
    page2Sections.innerHTML = second.map(renderSection).join('');
  }

  /** Smalle kaart voor het houten klembord — 2 identieke per vel, liggend */
  function clipCardHtml(data) {
    const { first: left, second: right } = splitSections(data, CLIP_FIRST_IDS, CLIP_SECOND_IDS);
    return `<article class="sheet sheet--clip">
      <header class="sheet__header">
        <p class="sheet__brand">${escapeHtml(data.brand || 'ROCHUS')}</p>
        <p class="sheet__subtitle">${escapeHtml(data.subtitle || 'Summer pop-up bar')}</p>
        <div class="sheet__rule" aria-hidden="true"><span></span>✦<span></span></div>
      </header>
      <div class="sheet__columns">
        <div class="sheet__col">${left.map(renderSection).join('')}</div>
        <div class="sheet__col">${right.map(renderSection).join('')}</div>
      </div>
      <footer class="sheet__footer">
        <div class="sheet__footer-row">
          <span>Scan de QR om te bestellen</span>
          <span class="sheet__footer-sep" aria-hidden="true">✦</span>
          <span>Cash of Bancontact bij levering</span>
        </div>
      </footer>
    </article>`;
  }

  function renderDuo(data) {
    const duo = document.getElementById('duo-sheet');
    if (!duo) return;
    const card = clipCardHtml(data);
    duo.innerHTML = card + card;
  }

  function renderMenu(data) {
    renderA4(data);
    renderDuo(data);
  }

  function renderAllergenSection(section, legendMap) {
    const rows = section.items
      .map((item) => {
        const badges = (item.allergens || [])
          .map((key) => allergenBadge(key, legendMap.get(key) || key))
          .join('');
        return `<li class="sheet__row sheet__row--allergen">
          <span class="sheet__name"><span class="sheet__name-text">${escapeHtml(item.name)}</span></span>
          <span class="allergen-badges">${badges}</span>
        </li>`;
      })
      .join('');

    return `<section class="sheet__section">
      <h2 class="sheet__section-title">${escapeHtml(section.title)}</h2>
      <ul class="sheet__list">${rows}</ul>
    </section>`;
  }

  function renderAllergens(data) {
    const brandEl = document.querySelector('[data-allergen-brand]');
    const subtitleEl = document.querySelector('[data-allergen-subtitle]');
    const titleEl = document.querySelector('[data-allergen-title]');
    if (brandEl) brandEl.textContent = data.brand || 'ROCHUS';
    if (subtitleEl) subtitleEl.textContent = data.subtitle || 'Summer pop-up bar';
    if (titleEl) titleEl.textContent = data.title || 'Allergieën';

    const legend = Array.isArray(data.legend) ? data.legend : [];
    const legendMap = new Map(legend.map((l) => [l.key, l.label]));

    if (allergenLegend) {
      allergenLegend.innerHTML = legend
        .map(
          (entry) =>
            `<div class="allergen-legend__item">${allergenBadge(entry.key, entry.label)}<span>${escapeHtml(entry.label)}</span></div>`
        )
        .join('');
    }

    if (allergenSections) {
      const sections = Array.isArray(data.sections) ? data.sections : [];
      allergenSections.innerHTML = sections
        .map((section) => renderAllergenSection(section, legendMap))
        .join('');
    }

    if (allergenDisclaimer) {
      allergenDisclaimer.textContent = data.disclaimer || '';
    }
  }

  /* Formaatkeuze: A4 tafelkaart, klemkaart, of allergieënkaart */
  const FORMAT_KEY = 'rochus-print-format';
  const VALID_FORMATS = new Set(['a4', 'clip', 'allergens']);
  const formatBtns = [...document.querySelectorAll('.format-btn')];
  const pageStyle = document.createElement('style');
  document.head.appendChild(pageStyle);

  const META = {
    a4: 'A4 · 2 pagina’s · 100% schaal · zonder “aanpassen aan pagina” · lamineren in A4-hoes',
    clip: 'Klemkaart · liggend A4 · 2 kaarten per vel · knippen op stippellijn',
    allergens: 'Allergieënkaart · 1 A4 staand · symbolen + legende · 100% schaal',
  };

  function applyFormat(format) {
    const mode = VALID_FORMATS.has(format) ? format : 'a4';
    const a4Sheet = document.getElementById('menu-sheet');
    const duo = document.getElementById('duo-sheet');
    const allergenSheet = document.getElementById('allergen-sheet');

    if (a4Sheet) a4Sheet.hidden = mode !== 'a4';
    if (duo) duo.hidden = mode !== 'clip';
    if (allergenSheet) allergenSheet.hidden = mode !== 'allergens';

    formatBtns.forEach((btn) => {
      btn.classList.toggle('format-btn--active', btn.dataset.format === mode);
    });

    if (toolbarMeta) toolbarMeta.textContent = META[mode] || META.a4;

    pageStyle.textContent =
      mode === 'clip'
        ? '@page { size: A4 landscape; margin: 8mm; }'
        : '@page { size: A4 portrait; margin: 8mm; }';

    try {
      localStorage.setItem(FORMAT_KEY, mode);
    } catch {
      /* private mode */
    }
  }

  formatBtns.forEach((btn) => {
    btn.addEventListener('click', () => applyFormat(btn.dataset.format));
  });

  let savedFormat = 'a4';
  try {
    const stored = localStorage.getItem(FORMAT_KEY);
    if (VALID_FORMATS.has(stored)) savedFormat = stored;
  } catch {
    /* private mode */
  }
  applyFormat(savedFormat);

  async function loadMenu() {
    const res = await fetch('/api/menu/print', { credentials: 'include' });
    if (res.status === 401) {
      showLogin();
      return;
    }
    if (!res.ok) throw new Error('Kon menukaart niet laden');
    renderMenu(await res.json());
  }

  async function loadAllergens() {
    const res = await fetch('/api/menu/allergens', { credentials: 'include' });
    if (res.status === 401) {
      showLogin();
      return;
    }
    if (!res.ok) throw new Error('Kon allergieënkaart niet laden');
    renderAllergens(await res.json());
  }

  function showLogin() {
    loginView.hidden = false;
    printView.hidden = true;
  }

  async function showPrint() {
    loginView.hidden = true;
    printView.hidden = false;
    await Promise.all([loadMenu(), loadAllergens()]);
  }

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
    await showPrint();
  });

  logoutBtn.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    showLogin();
  });

  printBtn.addEventListener('click', () => {
    window.print();
  });

  (async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      const data = await res.json();
      if (data.authenticated) await showPrint();
      else showLogin();
    } catch {
      showLogin();
    }
  })();
})();
