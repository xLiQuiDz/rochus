(() => {
  'use strict';

  const loginView = document.getElementById('login-view');
  const qrView = document.getElementById('qr-view');
  const loginForm = document.getElementById('login-form');
  const loginPin = document.getElementById('login-pin');
  const loginError = document.getElementById('login-error');
  const qrGrid = document.getElementById('qr-grid');
  const publicUrlEl = document.getElementById('public-url');
  const printBtn = document.getElementById('print-btn');
  const logoutBtn = document.getElementById('logout-btn');

  let publicUrl = window.location.origin;
  let tableCount = 20;

  function showLogin() {
    loginView.hidden = false;
    qrView.hidden = true;
  }

  async function renderCodes() {
    const res = await fetch('/api/config');
    if (res.ok) {
      const cfg = await res.json();
      publicUrl = cfg.publicUrl || window.location.origin;
      tableCount = cfg.tableCount || 20;
    }

    publicUrlEl.textContent = publicUrl;
    qrGrid.innerHTML = '';

    for (let t = 1; t <= tableCount; t++) {
      const url = `${publicUrl}/?t=${t}`;
      const card = document.createElement('article');
      card.className = 'qr-card';
      card.innerHTML = `
        <p class="qr-card__brand">ROCHUS</p>
        <p class="qr-card__table">Tafel ${t}</p>
        <canvas id="qr-${t}" width="148" height="148"></canvas>
        <p class="qr-card__hint">Scan &amp; bestel<br />Cash bij levering</p>
      `;
      qrGrid.appendChild(card);

      const canvas = card.querySelector('canvas');
      if (window.QRCode && canvas) {
        QRCode.toCanvas(
          canvas,
          url,
          {
            width: 148,
            margin: 1,
            color: { dark: '#0a0908', light: '#ffffff' },
          },
          () => {}
        );
      }
    }
  }

  async function showQr() {
    loginView.hidden = true;
    qrView.hidden = false;
    // Wait a tick for QRCode lib if still loading
    const waitLib = () =>
      new Promise((resolve) => {
        if (window.QRCode) return resolve();
        const t = setInterval(() => {
          if (window.QRCode) {
            clearInterval(t);
            resolve();
          }
        }, 50);
        setTimeout(() => {
          clearInterval(t);
          resolve();
        }, 3000);
      });
    await waitLib();
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
