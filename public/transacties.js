(() => {
  'use strict';

  /* ============================================================
     Grafiekkleuren — gevalideerd met de dataviz-validator tegen
     het donkere oppervlak #15120f (lichtheid, chroma, CVD, contrast).
     Eén reeks = één kleur; nooit een waardeverloop over categorieën.
     ============================================================ */
  const SERIES_1 = '#c98500'; // amber
  const SERIES_2 = '#3987e5'; // blauw
  const GRID = 'rgba(245, 230, 200, 0.08)';
  const INK_MUTED = '#9a8f80';
  const INK = '#f7f1e8';
  const SURFACE = '#15120f';
  const NS = 'http://www.w3.org/2000/svg';

  const CATEGORY_LABELS = {
    bieren: "Bieren van 't vat",
    flessen: 'Flessenbier',
    alcoholvrij: 'Alcoholvrij',
    fris: 'Frisdranken',
    cocktails: 'Cocktails',
    wijnen: 'Wijnen & bubbels',
    shots: 'Shots',
    warme: 'Warme dranken',
    fingerfood: 'Fingerfood',
  };

  const STATUS_LABELS = {
    new: 'Nieuw',
    preparing: 'Bezig',
    served: 'Geserveerd',
    cancelled: 'Geannuleerd',
  };

  /* ---------------- Elements ---------------- */
  const loginView = document.getElementById('login-view');
  const pageView = document.getElementById('page-view');
  const loginForm = document.getElementById('login-form');
  const loginPin = document.getElementById('login-pin');
  const loginError = document.getElementById('login-error');
  const rangeBtns = [...document.querySelectorAll('[data-range]')];
  const tip = document.getElementById('tip');
  const txBody = document.getElementById('tx-body');
  const txEmpty = document.getElementById('tx-empty');
  const tableNote = document.getElementById('table-note');
  const exportBtn = document.getElementById('export-btn');
  const filterStatus = document.getElementById('filter-status');
  const filterPayment = document.getElementById('filter-payment');
  const filterTable = document.getElementById('filter-table');

  let range = 'today';
  let analytics = null;
  let transactions = [];
  let reloadTimer = null;

  /* ---------------- Formatting ---------------- */
  const euro = (cents, { decimals = false } = {}) => {
    const n = cents / 100;
    return (
      '€' +
      n.toLocaleString('nl-BE', {
        minimumFractionDigits: decimals && n % 1 !== 0 ? 2 : 0,
        maximumFractionDigits: decimals ? 2 : 0,
      })
    );
  };

  const escapeHtml = (str) =>
    String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  function parseDate(iso) {
    const s = String(iso);
    return new Date(s + (s.endsWith('Z') || s.includes('+') ? '' : 'Z'));
  }

  const timeFmt = (iso) =>
    parseDate(iso).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });
  const dateFmt = (iso) =>
    parseDate(iso).toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit' });

  /** Bucketlabel: "14u" voor uren, "20/07" voor dagen. */
  function bucketLabel(bucket, unit) {
    const d = new Date(bucket);
    if (Number.isNaN(d.getTime())) return String(bucket);
    return unit === 'uur'
      ? `${String(d.getUTCHours()).padStart(2, '0')}u`
      : `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  }

  /* ---------------- SVG helpers ---------------- */
  function el(tag, attrs = {}) {
    const node = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
    return node;
  }

  /** Staafpad met 4px afgeronde data-uiteinde, vlak op de basislijn. */
  function barUp(x, y, w, h, r = 4) {
    const rr = Math.min(r, h, w / 2);
    return `M${x},${y + h} L${x},${y + rr} Q${x},${y} ${x + rr},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h} Z`;
  }

  function barRight(x, y, w, h, r = 4) {
    const rr = Math.min(r, w, h / 2);
    return `M${x},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h - rr} Q${x + w},${y + h} ${x + w - rr},${y + h} L${x},${y + h} Z`;
  }

  function text(str, x, y, opts = {}) {
    const t = el('text', {
      x,
      y,
      fill: opts.fill || INK_MUTED,
      'font-size': opts.size || 11,
      'font-weight': opts.weight || 600,
      'text-anchor': opts.anchor || 'start',
      'font-family': "'Plus Jakarta Sans', system-ui, sans-serif",
    });
    if (opts.tabular) t.setAttribute('style', 'font-variant-numeric: tabular-nums');
    t.textContent = str;
    return t;
  }

  /* ---------------- Tooltip ---------------- */
  function showTip(ev, html) {
    tip.innerHTML = html;
    tip.hidden = false;
    tip.style.left = `${ev.clientX}px`;
    tip.style.top = `${ev.clientY - 12}px`;
  }
  const hideTip = () => { tip.hidden = true; };

  function hoverable(node, html) {
    node.addEventListener('mouseenter', (e) => showTip(e, html));
    node.addEventListener('mousemove', (e) => showTip(e, html));
    node.addEventListener('mouseleave', hideTip);
  }

  function emptyChart(container, message) {
    container.innerHTML = `<p class="chart__empty">${escapeHtml(message)}</p>`;
  }

  /* ============================================================
     Grafiek 1 — omzet per uur/dag (kolommen, één reeks)
     ============================================================ */
  function renderRevenueChart() {
    const box = document.getElementById('chart-revenue');
    const series = analytics.series || [];
    if (series.length === 0) return emptyChart(box, 'Nog geen omzet in deze periode');

    const width = Math.max(320, box.clientWidth || 640);
    const padL = 54;
    const padR = 12;
    const plotH = 200;
    const axisH = 28;
    const height = plotH + axisH;

    const svg = el('svg', {
      viewBox: `0 0 ${width} ${height}`,
      height,
      role: 'img',
      'aria-label': `Omzet per ${analytics.unit}`,
    });

    const max = Math.max(...series.map((s) => s.revenue_cents), 1);
    // Ronde bovengrens zodat de asstappen leesbaar blijven
    const step = Math.max(100, Math.ceil(max / 4 / 500) * 500);
    const top = Math.ceil(max / step) * step;
    const plotW = width - padL - padR;
    const y = (cents) => plotH - (cents / top) * (plotH - 10);

    // Hairline raster (doorlopend, nooit gestippeld) + waarden op de as
    for (let v = 0; v <= top; v += step) {
      const yy = y(v);
      svg.appendChild(el('line', { x1: padL, y1: yy, x2: width - padR, y2: yy, stroke: GRID, 'stroke-width': 1 }));
      svg.appendChild(text(euro(v), padL - 10, yy + 4, { anchor: 'end', size: 10, tabular: true }));
    }

    const band = plotW / series.length;
    const barW = Math.max(4, Math.min(38, band * 0.6));
    const labelEvery = Math.ceil(series.length / Math.max(4, Math.floor(plotW / 56)));

    series.forEach((point, i) => {
      const cx = padL + band * i + band / 2;
      const h = Math.max(2, plotH - y(point.revenue_cents));
      const bar = el('path', { d: barUp(cx - barW / 2, plotH - h, barW, h), fill: SERIES_1 });
      svg.appendChild(bar);

      // Trefvlak breder dan de staaf zelf
      const hit = el('rect', { x: padL + band * i, y: 0, width: band, height: plotH, fill: 'transparent' });
      hoverable(
        hit,
        `${escapeHtml(bucketLabel(point.bucket, analytics.unit))} — ${euro(point.revenue_cents)}` +
          `<span class="tip__sub">${point.orders} bestelling${point.orders === 1 ? '' : 'en'}</span>`
      );
      svg.appendChild(hit);

      if (i % labelEvery === 0) {
        svg.appendChild(
          text(bucketLabel(point.bucket, analytics.unit), cx, plotH + 18, { anchor: 'middle', size: 10 })
        );
      }
    });

    box.innerHTML = '';
    box.appendChild(svg);
  }

  /* ============================================================
     Grafiek 2 — betaalwijze (gestapelde balk, 2 reeksen + legenda)
     ============================================================ */
  function renderPaymentChart() {
    const box = document.getElementById('chart-payment');
    const legend = document.getElementById('pay-legend');
    const t = analytics.totals;
    const total = t.cash_cents + t.payconiq_cents;

    const breakdown = document.getElementById('pay-breakdown');
    if (total <= 0) {
      legend.innerHTML = '';
      breakdown.innerHTML = '';
      return emptyChart(box, 'Nog geen betalingen');
    }

    const parts = [
      { label: 'Cash', color: SERIES_1, cents: t.cash_cents, orders: t.cash_orders },
      { label: 'Bancontact', color: SERIES_2, cents: t.payconiq_cents, orders: t.payconiq_orders },
    ];

    legend.innerHTML = parts
      .map(
        (p) => `<span class="legend__item">
          <span class="legend__swatch" style="background:${p.color}"></span>
          <span class="legend__label">${p.label}</span>
          <span class="legend__value">${euro(p.cents)} · ${Math.round((p.cents / total) * 100)}%</span>
        </span>`
      )
      .join('');

    breakdown.innerHTML = parts
      .map(
        (p) => `<div class="paybreak__row">
          <span class="paybreak__label">${p.label}</span>
          <span class="paybreak__meta">${p.orders} bestelling${p.orders === 1 ? '' : 'en'} · gem. ${
            p.orders ? euro(Math.round(p.cents / p.orders), { decimals: true }) : '—'
          }</span>
        </div>`
      )
      .join('');

    const width = Math.max(260, box.clientWidth || 320);
    const barH = 30;
    const height = barH + 8;
    const svg = el('svg', { viewBox: `0 0 ${width} ${height}`, height, role: 'img', 'aria-label': 'Aandeel per betaalwijze' });

    const GAP = 2; // 2px oppervlak tussen segmenten, geen randlijn
    let x = 0;
    parts.forEach((p, i) => {
      const share = p.cents / total;
      const w = Math.max(0, share * width - (i > 0 ? GAP : 0));
      if (w <= 0) return;
      const first = i === 0;
      const d = first
        ? `M${x + 6},0 L${x + w},0 L${x + w},${barH} L${x + 6},${barH} Q${x},${barH} ${x},${barH - 6} L${x},6 Q${x},0 ${x + 6},0 Z`
        : barRight(x, 0, w, barH, 6);
      svg.appendChild(el('path', { d, fill: p.color }));

      // Direct label alleen als het met marge past
      const pct = `${Math.round(share * 100)}%`;
      if (w > 56) {
        svg.appendChild(
          text(pct, x + w / 2, barH / 2 + 4, { anchor: 'middle', size: 12, weight: 800, fill: SURFACE })
        );
      }

      const hit = el('rect', { x, y: 0, width: w, height: barH, fill: 'transparent' });
      hoverable(
        hit,
        `${p.label} — ${euro(p.cents)}<span class="tip__sub">${p.orders} bestelling${
          p.orders === 1 ? '' : 'en'
        } · ${pct}</span>`
      );
      svg.appendChild(hit);
      x += share * width;
    });

    box.innerHTML = '';
    box.appendChild(svg);
  }

  /* ============================================================
     Grafieken 3 & 4 — horizontale staaflijst (één reeks, één kleur)
     Label boven de staaf: geen afkapping, geen clipping.
     ============================================================ */
  function renderBarList(boxId, rows, { emptyMsg }) {
    const box = document.getElementById(boxId);
    if (!rows.length) return emptyChart(box, emptyMsg);

    const width = Math.max(280, box.clientWidth || 360);
    const rowH = 40;
    const barH = 10;
    const height = rows.length * rowH;
    const svg = el('svg', { viewBox: `0 0 ${width} ${height}`, height, role: 'img' });

    const max = Math.max(...rows.map((r) => r.value), 1);

    rows.forEach((row, i) => {
      const y0 = i * rowH;
      svg.appendChild(text(row.label, 0, y0 + 12, { size: 11.5, fill: INK, weight: 600 }));
      svg.appendChild(
        text(row.valueLabel, width, y0 + 12, { anchor: 'end', size: 11.5, weight: 700, tabular: true })
      );

      const trackY = y0 + 22;
      svg.appendChild(el('rect', { x: 0, y: trackY, width, height: barH, rx: 5, fill: 'rgba(255,255,255,0.04)' }));
      const w = Math.max(3, (row.value / max) * width);
      svg.appendChild(el('path', { d: barRight(0, trackY, w, barH, 5), fill: SERIES_1 }));

      const hit = el('rect', { x: 0, y: y0, width, height: rowH, fill: 'transparent' });
      hoverable(hit, `${escapeHtml(row.label)} — ${escapeHtml(row.valueLabel)}${row.sub ? `<span class="tip__sub">${escapeHtml(row.sub)}</span>` : ''}`);
      svg.appendChild(hit);
    });

    box.innerHTML = '';
    box.appendChild(svg);
  }

  /* ---------------- KPI's ---------------- */
  function renderKpis() {
    const t = analytics.totals;
    document.getElementById('kpi-revenue').textContent = euro(t.revenue_cents);
    document.getElementById('kpi-revenue-sub').textContent =
      t.cancelled > 0 ? `${t.cancelled} geannuleerd (niet meegeteld)` : 'exclusief annulaties';

    document.getElementById('kpi-orders').textContent = String(t.orders);
    document.getElementById('kpi-orders-sub').textContent = `${t.cash_orders} cash · ${t.payconiq_orders} Bancontact`;

    document.getElementById('kpi-avg').textContent = euro(t.avg_cents, { decimals: true });
    document.getElementById('kpi-avg-sub').textContent = t.orders > 0 ? `over ${t.orders} bestellingen` : '—';

    const top = (analytics.tables || [])[0];
    document.getElementById('kpi-table').textContent = top ? `Tafel ${top.table_number}` : '—';
    document.getElementById('kpi-table-sub').textContent = top
      ? `${euro(top.revenue_cents)} · ${top.orders} bestelling${top.orders === 1 ? '' : 'en'}`
      : 'nog geen data';

    document.getElementById('unit-label').textContent = analytics.unit;
    const buckets = (analytics.series || []).length;
    document.getElementById('revenue-note').textContent = buckets
      ? `${buckets} ${analytics.unit === 'uur' ? 'uren' : 'dagen'} met omzet`
      : '';
  }

  function renderCharts() {
    if (!analytics) return;
    renderKpis();
    renderRevenueChart();
    renderPaymentChart();
    renderBarList(
      'chart-items',
      (analytics.top_items || []).map((i) => ({
        label: i.name,
        value: i.revenue_cents,
        valueLabel: euro(i.revenue_cents),
        sub: `${i.qty} verkocht`,
      })),
      { emptyMsg: 'Nog geen producten verkocht' }
    );
    renderBarList(
      'chart-categories',
      (analytics.categories || []).map((c) => ({
        label: CATEGORY_LABELS[c.category] || c.category,
        value: c.revenue_cents,
        valueLabel: euro(c.revenue_cents),
        sub: `${c.qty} stuks`,
      })),
      { emptyMsg: 'Nog geen categorieën' }
    );
  }

  /* ---------------- Transactietabel ---------------- */
  function itemSummary(order) {
    return (order.items || []).map((i) => `${i.qty}× ${i.name}`).join(', ');
  }

  function renderTable() {
    txBody.innerHTML = '';
    txEmpty.hidden = transactions.length > 0;

    for (const order of transactions) {
      const tr = document.createElement('tr');
      tr.className = 'tx__row';
      tr.dataset.id = String(order.id);
      tr.innerHTML = `
        <td class="tx__id">#${order.id}</td>
        <td class="tx__time">${dateFmt(order.created_at)}<br />${timeFmt(order.created_at)}</td>
        <td class="tx__table">${order.table_number}</td>
        <td class="tx__items">${escapeHtml(itemSummary(order))}</td>
        <td><span class="pill${order.payment_method === 'payconiq' ? ' pill--payconiq' : ''}">${
          order.payment_method === 'payconiq' ? '📱 Bancontact' : '💶 Cash'
        }</span></td>
        <td><span class="pill pill--${order.status}">${STATUS_LABELS[order.status] || order.status}</span></td>
        <td class="tx__num">${euro(order.total_cents, { decimals: true })}</td>
      `;
      txBody.appendChild(tr);
    }
  }

  txBody.addEventListener('click', (e) => {
    const row = e.target.closest('.tx__row');
    if (!row) return;
    const next = row.nextElementSibling;
    if (next && next.classList.contains('tx__detail')) {
      next.remove();
      return;
    }
    document.querySelectorAll('.tx__detail').forEach((d) => d.remove());

    const order = transactions.find((o) => String(o.id) === row.dataset.id);
    if (!order) return;
    const detail = document.createElement('tr');
    detail.className = 'tx__detail';
    const lines = (order.items || [])
      .map(
        (i) =>
          `<li><span>${i.qty}× ${escapeHtml(i.name)}</span><span>${euro(
            i.unit_price_cents * (i.qty - (i.free_qty || 0)),
            { decimals: true }
          )}</span></li>`
      )
      .join('');
    detail.innerHTML = `<td colspan="7">
      <ul class="tx__detail-list">${lines}</ul>
      ${order.note ? `<p class="tx__detail-note">“${escapeHtml(order.note)}”</p>` : ''}
    </td>`;
    row.after(detail);
  });

  /* ---------------- CSV ---------------- */
  function exportCsv() {
    const head = ['id', 'datum', 'tijd', 'tafel', 'status', 'betaalwijze', 'items', 'bedrag_eur'];
    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = transactions.map((o) =>
      [
        o.id,
        dateFmt(o.created_at),
        timeFmt(o.created_at),
        o.table_number,
        STATUS_LABELS[o.status] || o.status,
        o.payment_method === 'payconiq' ? 'Bancontact' : 'Cash',
        itemSummary(o),
        (o.total_cents / 100).toFixed(2),
      ].map(esc).join(';')
    );
    const csv = [head.join(';'), ...rows].join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rochus-transacties-${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportBtn.addEventListener('click', exportCsv);

  /* ---------------- Laden ---------------- */
  async function loadAll() {
    const params = new URLSearchParams({ range });
    if (filterStatus.value) params.set('status', filterStatus.value);
    if (filterPayment.value) params.set('payment', filterPayment.value);
    if (filterTable.value) params.set('table', filterTable.value);

    const [aRes, tRes] = await Promise.all([
      fetch(`/api/analytics?range=${encodeURIComponent(range)}`, { credentials: 'include' }),
      fetch(`/api/transactions?${params}`, { credentials: 'include' }),
    ]);

    if (aRes.status === 401 || tRes.status === 401) return showLogin();
    if (!aRes.ok || !tRes.ok) throw new Error('Laden mislukt');

    analytics = await aRes.json();
    const data = await tRes.json();
    transactions = data.rows || [];

    renderCharts();
    renderTable();
    tableNote.textContent = `${data.total} transactie${data.total === 1 ? '' : 's'} · ${euro(
      data.revenue_cents
    )} omzet${transactions.length < data.total ? ` · nieuwste ${transactions.length} getoond` : ''}`;
  }

  function scheduleReload() {
    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(() => loadAll().catch(() => {}), 220);
  }

  rangeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      range = btn.dataset.range;
      rangeBtns.forEach((b) => b.classList.toggle('segmented__btn--on', b === btn));
      loadAll().catch(() => {});
    });
  });

  [filterStatus, filterPayment].forEach((sel) => sel.addEventListener('change', scheduleReload));
  filterTable.addEventListener('input', scheduleReload);

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderCharts, 150);
  });

  /* ---------------- Auth ---------------- */
  function showLogin() {
    loginView.hidden = false;
    pageView.hidden = true;
  }

  async function showPage() {
    loginView.hidden = true;
    pageView.hidden = false;
    await loadAll();
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
    await showPage();
  });

  (async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      const data = await res.json();
      if (data.authenticated) await showPage();
      else showLogin();
    } catch {
      showLogin();
    }
  })();
})();
