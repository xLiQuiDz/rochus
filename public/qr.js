(() => {
  'use strict';

  const loginView = document.getElementById('login-view');
  const qrView = document.getElementById('qr-view');
  const loginForm = document.getElementById('login-form');
  const loginPin = document.getElementById('login-pin');
  const loginError = document.getElementById('login-error');
  const qrGrid = document.getElementById('qr-grid');
  const publicUrlEl = document.getElementById('public-url');
  const tableCountEl = document.getElementById('table-count-label');
  const printBtn = document.getElementById('print-btn');
  const logoutBtn = document.getElementById('logout-btn');

  let publicUrl = window.location.origin;
  let tableCount = 30;

  const FUN_LINES = [
    'Jouw ronde start hier',
    'Scan me, drink me',
    'Pop-up privilege',
    'Zomer op tafel',
    'Bestel zonder te zwaaien',
    'VIP van deze tafel',
    'Een tipje: begin met spritz',
    'Cash klaar? Scan maar',
    'Tafelkoning(in) mode',
    'Geen app, wel fun',
    'Menu in je pocket',
    'Rochus zegt: proost',
  ];

  function showLogin() {
    loginView.hidden = false;
    qrView.hidden = true;
  }

  async function renderCodes() {
    const res = await fetch('/api/config');
    if (res.ok) {
      const cfg = await res.json();
      publicUrl = cfg.publicUrl || window.location.origin;
      tableCount = cfg.tableCount || 30;
    }

    publicUrlEl.textContent = publicUrl;
    if (tableCountEl) {
      tableCountEl.textContent = `${tableCount} stickers · klaar om te printen`;
    }
    qrGrid.innerHTML = '';

    for (let t = 1; t <= tableCount; t++) {
      const fun = FUN_LINES[(t - 1) % FUN_LINES.length];
      const card = document.createElement('article');
      card.className = 'qr-sticker';
      card.innerHTML = `
        <div class="qr-sticker__cut" aria-hidden="true"></div>
        <div class="qr-sticker__inner">
          <p class="qr-sticker__brand">ROCHUS</p>
          <p class="qr-sticker__eyebrow">zomer pop-up</p>
          <p class="qr-sticker__table">Tafel <span>${t}</span></p>
          <div class="qr-sticker__qr">
            <img
              src="/api/qr/${t}"
              alt="QR code tafel ${t}"
              width="220"
              height="220"
              decoding="async"
              loading="eager"
            />
          </div>
          <p class="qr-sticker__fun">${fun}</p>
          <p class="qr-sticker__cta">Scan &amp; bestel</p>
          <p class="qr-sticker__promo">Actie 3+1 op snacks van €6</p>
          <p class="qr-sticker__cash">Cash bij levering</p>
        </div>
      `;
      qrGrid.appendChild(card);
    }
  }

  async function showQr() {
    loginView.hidden = true;
    qrView.hidden = false;
    await renderCodes();
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
    await showQr();
  });

  printBtn.addEventListener('click', () => window.print());

  logoutBtn.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    showLogin();
  });

  (async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      const data = await res.json();
      if (data.authenticated) await showQr();
      else showLogin();
    } catch {
      showLogin();
    }
  })();
})();
