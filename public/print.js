(() => {
  'use strict';

  const loginView = document.getElementById('login-view');
  const printView = document.getElementById('print-view');
  const loginForm = document.getElementById('login-form');
  const loginPin = document.getElementById('login-pin');
  const loginError = document.getElementById('login-error');
  const printBtn = document.getElementById('print-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const sheetBrand = document.getElementById('sheet-brand');
  const sheetSubtitle = document.getElementById('sheet-subtitle');
  const sheetColumns = document.getElementById('sheet-columns');

  const LEFT_IDS = new Set(['bieren', 'flessen', 'fris', 'cocktails']);
  const RIGHT_IDS = new Set(['wijnen', 'shots', 'warme', 'fingerfood']);

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

  function renderMenu(data) {
    sheetBrand.textContent = data.brand || 'ROCHUS';
    sheetSubtitle.textContent = data.subtitle || 'Summer pop-up bar';

    const sections = Array.isArray(data.sections) ? data.sections : [];
    const left = sections.filter((s) => LEFT_IDS.has(s.id));
    const right = sections.filter((s) => RIGHT_IDS.has(s.id));
    const leftovers = sections.filter((s) => !LEFT_IDS.has(s.id) && !RIGHT_IDS.has(s.id));
    right.push(...leftovers);

    sheetColumns.innerHTML = `
      <div class="sheet__col">${left.map(renderSection).join('')}</div>
      <div class="sheet__col">${right.map(renderSection).join('')}</div>
    `;
  }

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
