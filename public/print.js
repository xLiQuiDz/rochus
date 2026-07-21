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

  /* Pagina 1 van de A4-kaart (en linkerkolom van de klemkaart) vs. pagina 2 (rechterkolom) */
  const FIRST_IDS = new Set(['bieren', 'flessen', 'alcoholvrij', 'fris', 'cocktails']);
  const SECOND_IDS = new Set(['wijnen', 'shots', 'warme', 'fingerfood']);

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

  function splitSections(data) {
    const sections = Array.isArray(data.sections) ? data.sections : [];
    const first = sections.filter((s) => FIRST_IDS.has(s.id));
    const second = sections.filter((s) => SECOND_IDS.has(s.id));
    const leftovers = sections.filter((s) => !FIRST_IDS.has(s.id) && !SECOND_IDS.has(s.id));
    second.push(...leftovers);
    return { first, second };
  }

  function renderA4(data) {
    brandEls.forEach((el) => (el.textContent = data.brand || 'ROCHUS'));
    subtitleEls.forEach((el) => (el.textContent = data.subtitle || 'Summer pop-up bar'));

    const { first, second } = splitSections(data);
    page1Sections.innerHTML = first.map(renderSection).join('');
    page2Sections.innerHTML = second.map(renderSection).join('');
  }

  /** Smalle kaart voor het houten klembord — 2 identieke per vel, liggend */
  function clipCardHtml(data) {
    const { first: left, second: right } = splitSections(data);
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

  /* Formaatkeuze: A4 tafelkaart of klemkaart (2 per liggend vel) */
  const FORMAT_KEY = 'rochus-print-format';
  const formatBtns = [...document.querySelectorAll('.format-btn')];
  const pageStyle = document.createElement('style');
  document.head.appendChild(pageStyle);

  function applyFormat(format) {
    const clip = format === 'clip';
    const a4Sheet = document.getElementById('menu-sheet');
    const duo = document.getElementById('duo-sheet');
    if (a4Sheet) a4Sheet.hidden = clip;
    if (duo) duo.hidden = !clip;
    formatBtns.forEach((btn) => {
      btn.classList.toggle('format-btn--active', btn.dataset.format === format);
    });
    pageStyle.textContent = clip
      ? '@page { size: A4 landscape; margin: 8mm; }'
      : '@page { size: A4 portrait; margin: 8mm; }';
    try {
      localStorage.setItem(FORMAT_KEY, format);
    } catch {
      /* private mode */
    }
  }

  formatBtns.forEach((btn) => {
    btn.addEventListener('click', () => applyFormat(btn.dataset.format));
  });

  let savedFormat = 'a4';
  try {
    savedFormat = localStorage.getItem(FORMAT_KEY) === 'clip' ? 'clip' : 'a4';
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

  function showLogin() {
    loginView.hidden = false;
    printView.hidden = true;
  }

  async function showPrint() {
    loginView.hidden = true;
    printView.hidden = false;
    await loadMenu();
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
