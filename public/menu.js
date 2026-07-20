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
    'Friet 105 Burger': { toast: 'Friet + burger diplomacy', className: 'gag-bounce', sticker: 'feed me' },
    Champagne: { toast: 'Champagne problems, but make it cash', className: 'gag-tilt', sticker: 'bougie' },
    Water: { toast: 'Eindelijk water. Hydratatie legend 💧', className: 'gag-bounce', sticker: 'hydrate' },
  };

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

  /* ------------------------------------------------------------------ */
  /* VANG HET WATER — arena met fysica, conditie en een grote mond      */
  /* ------------------------------------------------------------------ */
  const arenaEl = document.getElementById('water-arena');
  const dropEl = document.getElementById('water-drop');
  const dropFaceEl = document.getElementById('water-face');
  const staminaFillEl = document.getElementById('water-stamina');
  const arenaStatsEl = document.getElementById('water-stats');
  const arenaTauntEl = document.getElementById('water-taunt');
  const splashLayerEl = document.getElementById('water-splash-layer');
  const speechEl = document.getElementById('water-speech');
  const quitBtn = document.getElementById('water-quit');

  const WATER_TRASH_TALK = [
    'Te traag. Zoals de wifi hier.',
    'Ik ben 0 calorieën, waarom wil je mij?!',
    'Mijn moeder is een gletsjer. Respect.',
    'Catch me outside 💅',
    'Ik deed cardio. Jij scrolt menu’s.',
    'Zelfs de Aperol lacht nu met je.',
    'Dichtbij! Maar nee.',
    'Woesh 💨',
    'Ik zwem hier al heel de zomer, schat.',
  ];
  const WATER_TIRED_LINES = [
    'oké… oké… even… pauze 🫁',
    'niet… tegen mijn moeder… zeggen',
    'jij wint… bijna…',
  ];
  const WATER_ARENA_TAUNTS = [
    'hij is sneller dan je ex ging lopen',
    'tip: water wordt moe. jij ook, maar hij eerst.',
    'gratis water. je moet er alleen voor werken.',
    'de bar kijkt mee en geniet',
  ];
  const WATER_QUIT_LINES = [
    'Het water wint. Alweer. 💧🏆',
    'Opgegeven. Het water vertelt dit door aan iederéén.',
    'Geen zorgen, spritz loopt niet weg. 🍹',
  ];

  const DROP_SIZE = 76;

  const waterGame = {
    running: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    stamina: 1,
    finger: { x: 0, y: 0, active: false },
    attempts: 0,
    startAt: 0,
    lastT: 0,
    raf: 0,
    speechUntil: 0,
    tiredSaid: false,
    statsTick: 0,
    tauntTimer: 0,
  };

  function arenaBounds() {
    return {
      minX: 12 + DROP_SIZE / 2,
      maxX: window.innerWidth - 12 - DROP_SIZE / 2,
      minY: 96 + DROP_SIZE / 2,
      maxY: window.innerHeight - 20 - DROP_SIZE / 2,
    };
  }

  function waterSpeech(text, ms = 1500) {
    const now = performance.now();
    if (now < waterGame.speechUntil) return;
    waterGame.speechUntil = now + ms + 1600;
    speechEl.textContent = text;
    speechEl.hidden = false;
    clearTimeout(waterSpeech._t);
    waterSpeech._t = setTimeout(() => {
      speechEl.hidden = true;
    }, ms);
  }

  function spawnSplash(x, y, emoji = '💦') {
    if (!splashLayerEl) return;
    const el = document.createElement('span');
    el.className = 'water-splash';
    el.textContent = emoji;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.setProperty('--sx', `${(Math.random() - 0.5) * 90}px`);
    el.style.setProperty('--sy', `${-30 - Math.random() * 70}px`);
    splashLayerEl.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 900);
  }

  function spawnRing(x, y) {
    if (!splashLayerEl) return;
    const el = document.createElement('span');
    el.className = 'water-ring';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    splashLayerEl.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 700);
  }

  function updateDropDom() {
    const speed = Math.hypot(waterGame.vx, waterGame.vy);
    const s = Math.min(1, speed / 1200);
    const stretch = 1 + s * 0.18;
    const squash = 1 - s * 0.14;
    const angle = speed > 40 ? Math.atan2(waterGame.vy, waterGame.vx) : 0;
    dropEl.style.transform =
      `translate3d(${waterGame.x - DROP_SIZE / 2}px, ${waterGame.y - DROP_SIZE / 2}px, 0) ` +
      `rotate(${angle}rad) scale(${stretch}, ${squash}) rotate(${-angle}rad)`;

    if (speechEl && !speechEl.hidden) {
      speechEl.style.left = `${waterGame.x}px`;
      speechEl.style.top = `${waterGame.y - DROP_SIZE / 2 - 14}px`;
    }
  }

  function waterFace() {
    const d = waterGame.finger.active
      ? Math.hypot(waterGame.x - waterGame.finger.x, waterGame.y - waterGame.finger.y)
      : Infinity;
    if (waterGame.stamina < 0.32) return '🥵';
    if (d < 130) return '😱';
    if (d < 220) return '😬';
    return '😏';
  }

  function waterFrame(now) {
    if (!waterGame.running) return;
    const dt = Math.min(0.033, (now - waterGame.lastT) / 1000 || 0.016);
    waterGame.lastT = now;
    const g = waterGame;
    const b = arenaBounds();

    // Vluchten: kracht weg van de vinger, zwakker naarmate hij moe wordt
    if (g.finger.active) {
      const dx = g.x - g.finger.x;
      const dy = g.y - g.finger.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d < 190) {
        const speedFactor = 0.3 + 0.7 * g.stamina;
        const force = ((190 - d) / 190) * 5200 * speedFactor;
        g.vx += (dx / d) * force * dt;
        g.vy += (dy / d) * force * dt;
        if (Math.random() < 0.12) spawnSplash(g.x, g.y);
        if (Math.random() < 0.02) waterSpeech(pick(WATER_TRASH_TALK));
      }
    } else if (Math.random() < 0.008) {
      // Nerveus rondkijken als er niks gebeurt
      g.vx += (Math.random() - 0.5) * 260;
      g.vy += (Math.random() - 0.5) * 260;
    }

    // Wrijving + snelheidslimiet op basis van conditie
    const drag = Math.max(0, 1 - 2.6 * dt);
    g.vx *= drag;
    g.vy *= drag;
    const maxSpeed = 260 + 1150 * g.stamina;
    const speed = Math.hypot(g.vx, g.vy);
    if (speed > maxSpeed) {
      g.vx = (g.vx / speed) * maxSpeed;
      g.vy = (g.vy / speed) * maxSpeed;
    }

    g.x += g.vx * dt;
    g.y += g.vy * dt;

    // Muren: stuiteren
    if (g.x < b.minX) { g.x = b.minX; g.vx = Math.abs(g.vx) * 0.75; }
    if (g.x > b.maxX) { g.x = b.maxX; g.vx = -Math.abs(g.vx) * 0.75; }
    if (g.y < b.minY) { g.y = b.minY; g.vy = Math.abs(g.vy) * 0.75; }
    if (g.y > b.maxY) { g.y = b.maxY; g.vy = -Math.abs(g.vy) * 0.75; }

    // Conditie: sprinten put uit, stilstaan herstelt héél traag
    if (speed > 240) g.stamina = Math.max(0, g.stamina - 0.085 * dt * (speed / 900));
    else g.stamina = Math.min(1, g.stamina + 0.015 * dt);

    if (g.stamina < 0.32) {
      if (!g.tiredSaid) {
        g.tiredSaid = true;
        waterSpeech(pick(WATER_TIRED_LINES), 2000);
      }
      if (Math.random() < 0.06) spawnSplash(g.x, g.y - DROP_SIZE / 2, '💦');
    } else if (g.stamina > 0.55) {
      g.tiredSaid = false;
    }

    staminaFillEl.style.width = `${Math.round(g.stamina * 100)}%`;
    staminaFillEl.classList.toggle('water-arena__meter-fill--low', g.stamina < 0.32);
    dropFaceEl.textContent = waterFace();
    updateDropDom();

    g.statsTick += dt;
    if (g.statsTick > 0.25) {
      g.statsTick = 0;
      const t = ((performance.now() - g.startAt) / 1000).toFixed(1);
      arenaStatsEl.textContent = `⏱ ${t}s · 👆 ${g.attempts}`;
    }

    g.raf = requestAnimationFrame(waterFrame);
  }

  function catchRadius() {
    // Hoe vermoeider het water, hoe makkelijker te vangen
    return DROP_SIZE / 2 + 14 + (1 - waterGame.stamina) * 34;
  }

  function winWaterGame() {
    const g = waterGame;
    g.running = false;
    cancelAnimationFrame(g.raf);
    dropFaceEl.textContent = '🫠';
    dropEl.classList.add('water-drop--caught');
    for (let i = 0; i < 12; i++) {
      spawnSplash(g.x + (Math.random() - 0.5) * 40, g.y + (Math.random() - 0.5) * 40);
    }
    if (navigator.vibrate) navigator.vibrate([30, 50, 40]);

    const elapsed = (performance.now() - g.startAt) / 1000;
    const line =
      elapsed < 10
        ? `GEVANGEN in ${elapsed.toFixed(1)}s. Olympisch niveau 🥇`
        : elapsed < 25
          ? `Gevangen in ${elapsed.toFixed(1)}s. Het water is onder de indruk 💧`
          : `Gevangen in ${elapsed.toFixed(1)}s. Het water had ondertussen een hypotheek 🏠`;

    setTimeout(() => {
      closeWaterArena();
      grantWater();
      showToast(line, false, 4200);
      burstConfetti();
    }, 650);
  }

  function onArenaPointerDown(ev) {
    const g = waterGame;
    if (!g.running) return;
    if (ev.target.closest('.water-arena__quit')) return;
    ev.preventDefault();
    g.finger.x = ev.clientX;
    g.finger.y = ev.clientY;
    g.finger.active = true;
    g.attempts += 1;

    const d = Math.hypot(g.x - ev.clientX, g.y - ev.clientY);
    if (d < catchRadius()) {
      winWaterGame();
      return;
    }
    spawnRing(ev.clientX, ev.clientY);
    if (d < 120 && navigator.vibrate) navigator.vibrate(12);
    if (d < 120 && Math.random() < 0.5) waterSpeech(pick(WATER_TRASH_TALK));
  }

  function onArenaPointerMove(ev) {
    if (!waterGame.running) return;
    waterGame.finger.x = ev.clientX;
    waterGame.finger.y = ev.clientY;
    waterGame.finger.active = true;
  }

  function onArenaPointerUp() {
    waterGame.finger.active = false;
  }

  function openWaterArena() {
    if (!arenaEl || waterGame.running) return;
    const g = waterGame;
    const b = arenaBounds();
    g.running = true;
    g.stamina = 1;
    g.attempts = 0;
    g.tiredSaid = false;
    g.vx = 0;
    g.vy = 0;
    g.x = b.minX + Math.random() * (b.maxX - b.minX);
    g.y = b.minY + Math.random() * (b.maxY - b.minY);
    g.finger.active = false;
    g.startAt = performance.now();
    g.lastT = g.startAt;
    dropEl.classList.remove('water-drop--caught');
    dropFaceEl.textContent = '😏';
    speechEl.hidden = true;
    arenaStatsEl.textContent = '⏱ 0.0s · 👆 0';
    arenaTauntEl.textContent = pick(WATER_ARENA_TAUNTS);
    staminaFillEl.style.width = '100%';
    arenaEl.hidden = false;
    document.body.style.overflow = 'hidden';
    updateDropDom();
    waterSpeech('kom dan 💧', 1400);
    g.raf = requestAnimationFrame(waterFrame);

    clearInterval(g.tauntTimer);
    g.tauntTimer = setInterval(() => {
      arenaTauntEl.textContent = pick(WATER_ARENA_TAUNTS);
    }, 5000);
  }

  function closeWaterArena() {
    const g = waterGame;
    g.running = false;
    cancelAnimationFrame(g.raf);
    clearInterval(g.tauntTimer);
    arenaEl.hidden = true;
    if (!drawer.classList.contains('open')) document.body.style.overflow = '';
  }

  if (arenaEl) {
    arenaEl.addEventListener('pointerdown', onArenaPointerDown);
    arenaEl.addEventListener('pointermove', onArenaPointerMove);
    arenaEl.addEventListener('pointerup', onArenaPointerUp);
    arenaEl.addEventListener('pointercancel', onArenaPointerUp);
    quitBtn.addEventListener('click', () => {
      closeWaterArena();
      showToast(pick(WATER_QUIT_LINES), false, 2800);
    });
    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Escape' && !arenaEl.hidden) {
          closeWaterArena();
          showToast(pick(WATER_QUIT_LINES), false, 2800);
          e.stopPropagation();
        }
      },
      true
    );
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

    // De kar krijgt stemmingen naarmate hij voller raakt
    const fabIcon = fab.querySelector('.order-fab__icon');
    const mood =
      totalQty === 0 ? '🛒' : totalQty <= 3 ? '🍹' : totalQty <= 7 ? '🥂' : totalQty <= 11 ? '🥴' : '🚨';
    if (fabIcon && fabIcon.textContent !== mood) {
      fabIcon.textContent = mood;
      if (!prefersReducedMotion) {
        fabIcon.classList.remove('order-fab__icon--pop');
        void fabIcon.offsetWidth;
        fabIcon.classList.add('order-fab__icon--pop');
      }
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

  /* ---------------- Betaalwijze: cash of Bancontact/Payconiq ---------------- */
  const PAY_KEY = 'rochus-pay-method';
  const payButtons = [...document.querySelectorAll('.pay-option')];
  const payHint = document.getElementById('confirm-pay-hint');
  const payOverlay = document.getElementById('pay-overlay');
  const payAmountEl = document.getElementById('pay-amount');
  const payLinkEl = document.getElementById('pay-link');
  const payCloseBtn = document.getElementById('pay-close');
  let payMethod = 'cash';
  let payconiqUrl = '';
  try {
    if (localStorage.getItem(PAY_KEY) === 'payconiq') payMethod = 'payconiq';
  } catch {
    /* private mode */
  }

  const PAY_HINTS = {
    cash: 'Pas na bevestiging gaat dit naar de bar · cash bij levering',
    payconiq: 'Pas na bevestiging gaat dit naar de bar · daarna betaal je met de app',
  };

  function applyPayMethod(method) {
    payMethod = method === 'payconiq' ? 'payconiq' : 'cash';
    payButtons.forEach((btn) => {
      const on = btn.dataset.pay === payMethod;
      btn.classList.toggle('pay-option--active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (payHint) payHint.textContent = PAY_HINTS[payMethod];
    try {
      localStorage.setItem(PAY_KEY, payMethod);
    } catch {
      /* private mode */
    }
  }

  payButtons.forEach((btn) => {
    btn.addEventListener('click', () => applyPayMethod(btn.dataset.pay));
  });
  applyPayMethod(payMethod);

  function openPayOverlay(totalCents) {
    if (!payOverlay) return;
    payAmountEl.textContent = formatEuro(totalCents / 100);
    if (payconiqUrl) payLinkEl.href = payconiqUrl;
    payOverlay.hidden = false;
  }

  function closePayOverlay() {
    if (payOverlay) payOverlay.hidden = true;
  }

  if (payOverlay) {
    payCloseBtn.addEventListener('click', closePayOverlay);
    payOverlay.addEventListener('click', (e) => {
      if (e.target === payOverlay) closePayOverlay();
    });
    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Escape' && !payOverlay.hidden) {
          closePayOverlay();
          e.stopPropagation();
        }
      },
      true
    );
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
          payment_method: payMethod,
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
      if (data && data.id) trackOrder(data.id);
      if (payMethod === 'payconiq' && data && data.total_cents) {
        setTimeout(() => openPayOverlay(data.total_cents), 600);
      }
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
    if (navigator.vibrate) navigator.vibrate(10);
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

  /** Add water to the cart with full celebration — the game's prize. */
  function grantWater() {
    const waterCard = document.getElementById('water-card');
    const btn = waterCard && waterCard.querySelector('[data-add]');
    if (!btn) return;
    const gag = addItem(btn.dataset.name, 0, 'fris');
    sparkToFab(btn);
    if (!prefersReducedMotion && waterCard && gag.className) {
      waterCard.classList.add(gag.className);
      setTimeout(() => waterCard.classList.remove(gag.className), 700);
    }
  }

  document.addEventListener('click', (e) => {
    const waterCard = e.target.closest('[data-water-dodge]');
    if (waterCard) {
      e.preventDefault();
      e.stopPropagation();
      // Keyboard / reduced-motion users get their water without the chase
      const viaKeyboard = e.detail === 0;
      if (viaKeyboard || prefersReducedMotion) {
        grantWater();
      } else {
        openWaterArena();
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

    const tappedCard = e.target.closest('.menu-card, .daily-special');
    if (tappedCard && !e.target.closest('button')) {
      handleCardDoubleTap(tappedCard, e);
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
  /* Live tracking van verzonden bestellingen                           */
  /* ------------------------------------------------------------------ */
  const trackChip = document.getElementById('order-track');
  const trackText = document.getElementById('order-track-text');
  const trackIcon = document.getElementById('order-track-icon');

  const TRACK_KEY = 'rochus-tracked-orders';
  const TRACK_POLL_MS = 10000;
  const TRACK_MAX_AGE_MS = 3 * 60 * 60 * 1000;
  const TRACK_LINGER_MS = 2 * 60 * 1000;

  const TRACK_LABELS = {
    new: { icon: '🍹', text: 'Bij de bar' },
    preparing: { icon: '🍸', text: 'Wordt gemaakt' },
    served: { icon: '🥂', text: 'Geserveerd' },
    cancelled: { icon: '🫥', text: 'Geannuleerd' },
  };

  const TRACK_TOASTS = {
    preparing: ['De bar is met je bestelling bezig 🍸', 'Er wordt geshaked en gestird ✨', 'Je drankjes zijn in de maak 🧑‍🍳'],
    served: ['Geserveerd! Proost 🥂', 'Op tafel — enjoy! 🎉', 'Alles staat klaar. Santé! 🍻'],
    cancelled: ['Bestelling geannuleerd — check even bij de bar 🫥'],
  };

  let trackTimer = null;

  function loadTracked() {
    try {
      const raw = JSON.parse(localStorage.getItem(TRACK_KEY) || '[]');
      if (!Array.isArray(raw)) return [];
      const now = Date.now();
      return raw.filter(
        (o) =>
          o &&
          Number.isFinite(o.id) &&
          now - (o.at || 0) < TRACK_MAX_AGE_MS &&
          (!o.closedAt || now - o.closedAt < TRACK_LINGER_MS)
      );
    } catch {
      return [];
    }
  }

  function saveTracked(list) {
    try {
      localStorage.setItem(TRACK_KEY, JSON.stringify(list.slice(-3)));
    } catch {
      /* private mode etc. */
    }
  }

  function renderTrackChip() {
    if (!trackChip) return;
    const list = loadTracked();
    saveTracked(list);
    const current = list[list.length - 1];
    if (!current) {
      trackChip.hidden = true;
      stopTrackPolling();
      return;
    }
    const label = TRACK_LABELS[current.status] || TRACK_LABELS.new;
    trackIcon.textContent = label.icon;
    trackText.textContent = `#${current.id} · ${label.text}`;
    trackChip.classList.toggle('order-track--done', current.status === 'served');
    trackChip.classList.toggle('order-track--cancelled', current.status === 'cancelled');
    trackChip.hidden = false;
  }

  async function pollTrackedOrders() {
    if (document.hidden) return;
    const list = loadTracked();
    const open = list.filter((o) => o.status === 'new' || o.status === 'preparing');
    if (open.length === 0) {
      renderTrackChip();
      return;
    }
    let changed = false;
    for (const entry of open) {
      try {
        const res = await fetch(`/api/orders/${entry.id}/status`, { cache: 'no-store' });
        if (res.status === 404) {
          entry.closedAt = Date.now() - TRACK_LINGER_MS;
          changed = true;
          continue;
        }
        if (!res.ok) continue;
        const data = await res.json();
        if (data.status && data.status !== entry.status) {
          entry.status = data.status;
          changed = true;
          if (data.status === 'served' || data.status === 'cancelled') {
            entry.closedAt = Date.now();
          }
          const lines = TRACK_TOASTS[data.status];
          if (lines) showToast(pick(lines), data.status === 'cancelled', 4200);
          if (data.status === 'served') burstConfetti();
        }
      } catch {
        /* offline — try again next tick */
      }
    }
    if (changed) saveTracked(list);
    renderTrackChip();
  }

  function stopTrackPolling() {
    if (trackTimer) {
      clearInterval(trackTimer);
      trackTimer = null;
    }
  }

  function startTrackPolling() {
    if (trackTimer) return;
    trackTimer = setInterval(pollTrackedOrders, TRACK_POLL_MS);
  }

  function trackOrder(id) {
    const list = loadTracked().filter((o) => o.id !== id);
    list.push({ id, status: 'new', at: Date.now() });
    saveTracked(list);
    renderTrackChip();
    startTrackPolling();
  }

  if (trackChip) {
    trackChip.addEventListener('click', () => {
      const list = loadTracked();
      const current = list[list.length - 1];
      if (!current) return;
      if (current.status === 'served' || current.status === 'cancelled') {
        saveTracked(list.filter((o) => o.id !== current.id));
        renderTrackChip();
        return;
      }
      showToast(
        current.status === 'preparing'
          ? `Bestelling #${current.id} wordt gemaakt — bijna proosten 🍸`
          : `Bestelling #${current.id} staat in de rij bij de bar 🍹`,
        false,
        2600
      );
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && loadTracked().length > 0) pollTrackedOrders();
    });

    renderTrackChip();
    if (loadTracked().some((o) => o.status === 'new' || o.status === 'preparing')) {
      startTrackPolling();
    }
  }

  /* ------------------------------------------------------------------ */
  /* Table from QR (?t=12)                                              */
  /* ------------------------------------------------------------------ */
  async function initTable() {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const cfg = await res.json();
        if (cfg.tableCount) tableCount = cfg.tableCount;
        if (cfg.payconiqUrl) payconiqUrl = cfg.payconiqUrl;
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

  /* ------------------------------------------------------------------ */
  /* Rad van Fortuin — zwierbaar, met donkere humor                     */
  /* ------------------------------------------------------------------ */
  const wheelOverlay = document.getElementById('wheel-overlay');
  const wheelStage = document.getElementById('wheel-stage');
  const wheelCanvas = document.getElementById('wheel-canvas');
  const wheelTitle = document.getElementById('wheel-title');
  const wheelSub = document.getElementById('wheel-sub');
  const wheelResult = document.getElementById('wheel-result');
  const wheelSpinBtn = document.getElementById('wheel-spin');
  const wheelGotoBtn = document.getElementById('wheel-goto');
  const wheelCloseBtn = document.getElementById('wheel-close');
  const diceBtn = document.getElementById('menu-dice');
  const whoPaysBtn = document.getElementById('who-pays');

  // Cards-against-humanity-vibes: kort op het rad, de dolk in de toelichting
  const WHO_PAYS_CARDS = [
    { label: 'De ex-checker 📱', line: 'Wie z’n ex vannacht nog gecheckt heeft, betaalt. Geen oordeel. (Beetje wel.)' },
    { label: 'Teleurstelling 🏆', line: 'De grootste teleurstelling van de familie betaalt. Jullie weten allemaal wie.' },
    { label: 'Woont nog thuis 🏠', line: 'Wie nog bij mama woont, betaalt. Je spaart toch huur uit.' },
    { label: 'Huilde deze week 😭', line: 'Wie deze week al geweend heeft, betaalt. Tranen drogen, portefeuille boven.' },
    { label: 'Therapie geskipt 🛋️', line: 'Wie therapie heeft afgezegd voor dit café, betaalt. Dit ís nu je therapie.' },
    { label: 'Droevigste lovelife 💔', line: 'Degene met het droevigste liefdesleven betaalt. Overleg gerust even.' },
    { label: 'Rode vlaggen 🚩', line: 'De persoon met de meeste rode vlaggen betaalt. Ja, iedereen kijkt nu naar jou.' },
    { label: 'LinkedIn-poster 💼', line: 'Wie ooit “excited to announce” heeft gepost, betaalt. Terecht.' },
    { label: 'Kater incoming 🧟', line: 'Wie morgen “nooit meer alcohol” gaat zeggen, betaalt vanavond alvast.' },
    { label: 'Jij. Gewoon jij. 🫵', line: 'Het rad heeft jou gekozen. Het universum ook. Aanvaard het.' },
    { label: 'Splitsen 🧮', line: 'Niemand wint: splitsen. Jullie sterven toch ook allemaal alleen.' },
    { label: 'De stilste 👀', line: 'De stilste aan tafel betaalt. Die spaart woorden én geld — tijd om te delen.' },
    { label: 'Hoogste schermtijd 📵', line: 'Wie de hoogste schermtijd heeft, betaalt. Toon maar. Lafaards verliezen dubbel.' },
    { label: 'Gym-abonnement 🏋️', line: 'Wie een ongebruikt gymabonnement heeft, betaalt — geld weggooien kan je al.' },
    { label: 'Situationship 🥀', line: 'Wie in een situationship zit, betaalt. Onduidelijkheid kost geld.' },
    { label: '“Gestopt” met vapen 💨', line: 'Wie “gestopt is met vapen” maar er eentje op zak heeft: betalen.' },
  ];

  const FATE_LINES = [
    'Het lot neemt geen klachten aan.',
    'Bezwaar indienen kan bij niemand.',
    'Dit is nu je persoonlijkheid.',
    'Het rad liegt nooit. Mensen wel.',
    'Drink het en denk aan je keuzes.',
    'Gekozen door het universum, betaald door jou.',
  ];

  const WHEEL_SEGMENTS = 8;
  const WHEEL_SIZE = 640;
  const wheelCtx = wheelCanvas ? wheelCanvas.getContext('2d') : null;

  let wheelMode = 'whopays';
  /** @type {{ label: string, line: string, addBtn?: Element }[]} */
  let wheelItems = [];
  let wheelRot = 0;
  let wheelSpinning = false;
  let wheelAnimFrame = 0;
  let wheelWinner = -1;
  let wheelAudioCtx = null;

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function wheelTick(final = false) {
    try {
      if (!wheelAudioCtx) {
        wheelAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (wheelAudioCtx.state === 'suspended') wheelAudioCtx.resume().catch(() => {});
      const t = wheelAudioCtx.currentTime;
      const osc = wheelAudioCtx.createOscillator();
      const gain = wheelAudioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(final ? 660 : 1100, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(final ? 0.09 : 0.045, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + (final ? 0.25 : 0.04));
      osc.connect(gain);
      gain.connect(wheelAudioCtx.destination);
      osc.start(t);
      osc.stop(t + (final ? 0.3 : 0.06));
    } catch {
      /* geen audio, geen drama */
    }
    if (navigator.vibrate) navigator.vibrate(final ? [20, 40, 30] : 6);
  }

  function drawWheel(highlight = -1) {
    if (!wheelCtx) return;
    const n = wheelItems.length;
    const seg = (Math.PI * 2) / n;
    const c = WHEEL_SIZE / 2;
    const r = c - 8;
    const ctx = wheelCtx;

    ctx.clearRect(0, 0, WHEEL_SIZE, WHEEL_SIZE);
    for (let i = 0; i < n; i++) {
      const start = i * seg;
      const isWin = i === highlight;
      ctx.beginPath();
      ctx.moveTo(c, c);
      ctx.arc(c, c, r, start, start + seg);
      ctx.closePath();
      ctx.fillStyle = isWin
        ? 'rgba(212, 175, 112, 0.32)'
        : i % 2 === 0
          ? '#1d1813'
          : '#2a2118';
      ctx.fill();
      ctx.strokeStyle = 'rgba(212, 175, 112, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label radiaal naar buiten
      ctx.save();
      ctx.translate(c, c);
      ctx.rotate(start + seg / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.font = `600 ${isWin ? 25 : 22}px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillStyle = isWin ? '#fff6e5' : i % 2 === 0 ? '#f0d9a8' : '#c4b8a8';
      const label = wheelItems[i].label;
      // Per code point inkorten — nooit een emoji doormidden knippen
      const chars = Array.from(label);
      const maxW = r * 0.68;
      while (chars.length > 2 && ctx.measureText(chars.join('')).width > maxW) {
        chars.pop();
      }
      let shown = chars.join('');
      if (shown !== label) shown = shown.trimEnd() + '…';
      ctx.fillText(shown, r * 0.94, 0);
      ctx.restore();
    }

    // Buitenring + naaf
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(212, 175, 112, 0.7)';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(c, c, 44, 0, Math.PI * 2);
    ctx.fillStyle = '#12100e';
    ctx.fill();
    ctx.strokeStyle = 'rgba(212, 175, 112, 0.7)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.font = '30px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎡', c, c + 2);
  }

  function applyWheelRot() {
    wheelCanvas.style.transform = `rotate(${wheelRot}rad)`;
  }

  function wheelIndexAtPointer() {
    const n = wheelItems.length;
    const seg = (Math.PI * 2) / n;
    // De pijl staat bovenaan (canvas-hoek -π/2); rad is geroteerd met wheelRot
    const angle = (((-Math.PI / 2 - wheelRot) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    return Math.floor(angle / seg) % n;
  }

  function revealWinner() {
    wheelWinner = wheelIndexAtPointer();
    const item = wheelItems[wheelWinner];
    if (!item) return;
    drawWheel(wheelWinner);
    wheelTick(true);
    wheelResult.textContent =
      wheelMode === 'whopays' ? item.line : `${item.label} — ${pick(FATE_LINES)}`;
    wheelResult.hidden = false;
    wheelSpinBtn.textContent = 'Nog eens draaien';
    wheelGotoBtn.hidden = wheelMode !== 'fate';
    burstConfetti();
  }

  function spinWheel(dir = 1, power = 1) {
    if (wheelSpinning || wheelItems.length === 0) return;
    wheelSpinning = true;
    wheelResult.hidden = true;
    wheelGotoBtn.hidden = true;
    wheelWinner = -1;
    drawWheel();

    const turns = (3 + Math.random() * 2.5) * Math.min(2.2, Math.max(0.7, power));
    const target = wheelRot + dir * (turns * Math.PI * 2 + Math.random() * Math.PI * 2);
    const duration = prefersReducedMotion ? 0 : 3200 + Math.random() * 900 + power * 300;
    const from = wheelRot;
    const startAt = performance.now();
    let lastIdx = wheelIndexAtPointer();

    const frame = (now) => {
      const t = duration === 0 ? 1 : Math.min(1, (now - startAt) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      wheelRot = from + (target - from) * eased;
      applyWheelRot();
      const idx = wheelIndexAtPointer();
      if (idx !== lastIdx) {
        lastIdx = idx;
        if (!prefersReducedMotion) wheelTick();
      }
      if (t < 1) {
        wheelAnimFrame = requestAnimationFrame(frame);
      } else {
        wheelSpinning = false;
        revealWinner();
      }
    };
    wheelAnimFrame = requestAnimationFrame(frame);
  }

  function openWheel(mode) {
    wheelMode = mode;
    if (mode === 'whopays') {
      wheelTitle.textContent = 'Wie betaalt?';
      wheelSub.textContent = 'Zwier het rad — het rad kent geen genade';
      wheelItems = shuffle(WHO_PAYS_CARDS).slice(0, WHEEL_SEGMENTS);
    } else {
      // Water doet niet mee — dat moet je zelf vangen
      const candidates = [...document.querySelectorAll('[data-add]')].filter((btn) => {
        const name = btn.dataset.name || '';
        return name && name !== 'Water' && !btn.disabled && !outOfStock.has(name);
      });
      if (candidates.length < 2) {
        showToast('Alles is op?! Legendarische avond 🍾', true, 2600);
        return;
      }
      wheelTitle.textContent = 'Het lot beslist';
      wheelSub.textContent = 'Zwier het rad en drink wat het zegt';
      wheelItems = shuffle(candidates)
        .slice(0, WHEEL_SEGMENTS)
        .map((btn) => ({
          label: btn.dataset.name.replace(" van 't vat", '').replace(' (6 stuks)', ''),
          line: '',
          addBtn: btn,
        }));
    }
    wheelRot = Math.random() * Math.PI * 2;
    wheelWinner = -1;
    wheelResult.hidden = true;
    wheelGotoBtn.hidden = true;
    wheelSpinBtn.textContent = 'Draai';
    drawWheel();
    applyWheelRot();
    wheelOverlay.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeWheel() {
    if (wheelAnimFrame) cancelAnimationFrame(wheelAnimFrame);
    wheelSpinning = false;
    wheelOverlay.hidden = true;
    // Alleen scroll-lock loslaten als het mandje niet open is
    if (!drawer.classList.contains('open')) document.body.style.overflow = '';
  }

  function gotoFateResult() {
    const item = wheelItems[wheelWinner];
    const addBtn = item && item.addBtn;
    closeWheel();
    closeDrawer();
    if (!addBtn) return;
    if (searchInput.value) searchInput.value = '';
    applyCategoryFilter('all');
    const card = addBtn.closest('.menu-card, .daily-special');
    if (!card) return;
    spyPaused = true;
    card.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
    setTimeout(() => {
      spyPaused = false;
    }, 900);
    if (!prefersReducedMotion) {
      card.classList.remove('gag-wobble');
      void card.offsetWidth;
      card.classList.add('gag-wobble');
      setTimeout(() => card.classList.remove('gag-wobble'), 900);
      triggerCardShimmer(card);
      spawnFloatingSticker(card, 'het lot');
    }
  }

  /* Zelf zwieren: sleep/flick op het rad */
  if (wheelStage && wheelCanvas) {
    let dragging = false;
    let dragPrevAngle = 0;
    /** @type {{ t: number, a: number }[]} */
    let dragSamples = [];

    const stageAngle = (ev) => {
      const rect = wheelStage.getBoundingClientRect();
      return Math.atan2(
        ev.clientY - (rect.top + rect.height / 2),
        ev.clientX - (rect.left + rect.width / 2)
      );
    };

    wheelStage.addEventListener('pointerdown', (ev) => {
      if (wheelSpinning) return;
      dragging = true;
      dragPrevAngle = stageAngle(ev);
      dragSamples = [{ t: performance.now(), a: 0 }];
      wheelStage.setPointerCapture(ev.pointerId);
    });

    wheelStage.addEventListener('pointermove', (ev) => {
      if (!dragging || wheelSpinning) return;
      const a = stageAngle(ev);
      let delta = a - dragPrevAngle;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      dragPrevAngle = a;
      wheelRot += delta;
      applyWheelRot();
      const total = dragSamples[dragSamples.length - 1].a + delta;
      dragSamples.push({ t: performance.now(), a: total });
      if (dragSamples.length > 24) dragSamples.shift();
    });

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      const now = performance.now();
      const recent = dragSamples.filter((s) => now - s.t < 130);
      if (recent.length >= 2) {
        const dt = (recent[recent.length - 1].t - recent[0].t) / 1000;
        const da = recent[recent.length - 1].a - recent[0].a;
        const velocity = dt > 0 ? da / dt : 0;
        if (Math.abs(velocity) > 1.4) {
          spinWheel(Math.sign(velocity) || 1, Math.min(2.2, Math.abs(velocity) / 7));
        }
      }
      dragSamples = [];
    };
    wheelStage.addEventListener('pointerup', endDrag);
    wheelStage.addEventListener('pointercancel', endDrag);
  }

  if (wheelSpinBtn) {
    wheelSpinBtn.addEventListener('click', () => spinWheel(Math.random() < 0.5 ? -1 : 1, 1));
  }
  if (wheelGotoBtn) wheelGotoBtn.addEventListener('click', gotoFateResult);
  if (wheelCloseBtn) wheelCloseBtn.addEventListener('click', closeWheel);
  if (wheelOverlay) {
    wheelOverlay.addEventListener('click', (e) => {
      if (e.target === wheelOverlay) closeWheel();
    });
  }
  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape' && wheelOverlay && !wheelOverlay.hidden) {
        closeWheel();
        e.stopPropagation();
      }
    },
    true
  );

  if (diceBtn) {
    diceBtn.addEventListener('click', () => {
      if (!prefersReducedMotion) {
        diceBtn.classList.remove('search-bar__dice--rolling');
        void diceBtn.offsetWidth;
        diceBtn.classList.add('search-bar__dice--rolling');
      }
      openWheel('fate');
    });
  }
  if (whoPaysBtn) whoPaysBtn.addEventListener('click', () => openWheel('whopays'));

  // Rotate hero badge vibes every so often
  const badgeTextEl = document.getElementById('hero-badge-text');
  if (badgeTextEl && !prefersReducedMotion) {
    setInterval(() => {
      if (document.hidden) return;
      badgeTextEl.textContent = pick(HERO_BADGE_LINES);
    }, 9000);
  }

  /* ------------------------------------------------------------------ */
  /* Telefoon-juice: jelly-scroll, dubbeltik-bursts, drink-lore         */
  /* ------------------------------------------------------------------ */
  const CATEGORY_EMOJI = {
    bieren: '🍺',
    flessen: '🍻',
    fris: '🥤',
    cocktails: '🍹',
    wijnen: '🍷',
    shots: '🥃',
    warme: '☕',
    fingerfood: '🍟',
  };

  const DOUBLE_TAP_TOASTS = [
    'Dubbeltik gezien. Dorstniveau: gevaarlijk.',
    'Deze kaart is nu emotioneel aan je gehecht.',
    'Bestellen doe je met de +, schat. Maar leuk.',
    'Oké, je meent het. Respect.',
  ];

  let lastTapCard = null;
  let lastTapAt = 0;
  let dblToastCount = 0;

  function emojiBurst(x, y, emoji, count = 8) {
    const layer = document.getElementById('chaos-layer');
    if (!layer) return;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'emoji-burst';
      el.textContent = emoji;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.setProperty('--bx', `${(Math.random() - 0.5) * 190}px`);
      el.style.setProperty('--by', `${-40 - Math.random() * 150}px`);
      el.style.setProperty('--br', `${(Math.random() - 0.5) * 80}deg`);
      el.style.animationDelay = `${i * 18}ms`;
      layer.appendChild(el);
      el.addEventListener('animationend', () => el.remove(), { once: true });
      setTimeout(() => el.remove(), 1300);
    }
  }

  function handleCardDoubleTap(card, e) {
    if (prefersReducedMotion) return;
    const now = performance.now();
    if (lastTapCard === card && now - lastTapAt < 380) {
      lastTapCard = null;
      lastTapAt = 0;
      const cat =
        card.closest('[data-category]')?.dataset.category ||
        card.querySelector('[data-add]')?.dataset.category ||
        'cocktails';
      emojiBurst(e.clientX, e.clientY, CATEGORY_EMOJI[cat] || '✨');
      if (navigator.vibrate) navigator.vibrate(10);
      dblToastCount += 1;
      if (dblToastCount % 2 === 1) showToast(pick(DOUBLE_TAP_TOASTS), false, 2000);
    } else {
      lastTapCard = card;
      lastTapAt = now;
    }
  }

  /* Langdrukken op een kaart → drink-lore */
  const DRINK_LORE = {
    Duvel: 'Duvel betekent “duivel”. Toeval? Absoluut niet.',
    Tequila: 'Tequila: eerst lachen, dan lore.',
    'Aperol Spritz': 'Smaakt bewezen beter in golden hour. Bron: wij.',
    Corona: 'Mét limoentje. Zonder de rest.',
    Water: 'Heeft trust issues. Logisch, na vanavond.',
    Koffie: 'Koffie op een zomerbar? Iemand heeft morgen een meeting.',
    "Sharing Nacho's": '“Sharing” is juridisch niet bindend.',
    Champagne: 'Voor als de groepschat “GROOT NIEUWS” zegt.',
    Kaasballetjes: 'Volgorde: kaasballetje, slokje, levensverhaal.',
    'Friet 105 Burger': 'Genoemd naar nummer 105. De burger woont daar nu.',
    'Hugo Spritz': 'Hugo is de enige man die iedereen hier vertrouwt.',
    Bitterballen: 'Binnenkant: lava. Wacht. Echt. Wacht.',
  };
  const GENERIC_LORE = [
    '33% van dit drankje is persoonlijkheid.',
    'Langdrukken geeft geen korting. Wel lore.',
    'Deze kaart heeft meer fans dan je story.',
    'Limited edition sinds vanavond.',
  ];

  function showLore(card) {
    const name = card.dataset.name || '';
    let lore = DRINK_LORE[name];
    if (!lore) {
      const key = Object.keys(DRINK_LORE).find((k) => name.toLowerCase().includes(k.toLowerCase()));
      lore = key ? DRINK_LORE[key] : pick(GENERIC_LORE);
    }
    const rect = card.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'lore-bubble';
    el.textContent = `📜 ${lore}`;
    el.style.left = `${rect.left + rect.width / 2}px`;
    el.style.top = `${Math.max(70, rect.top - 10)}px`;
    document.body.appendChild(el);
    if (navigator.vibrate) navigator.vibrate(15);
    if (!prefersReducedMotion) {
      card.classList.add('gag-tilt');
      setTimeout(() => card.classList.remove('gag-tilt'), 700);
    }
    setTimeout(() => el.classList.add('lore-bubble--out'), 2300);
    setTimeout(() => el.remove(), 2750);
  }

  let loreTimer = 0;
  let loreStart = null;
  document.addEventListener(
    'pointerdown',
    (e) => {
      const card = e.target.closest('.menu-card');
      if (!card || e.target.closest('button')) return;
      loreStart = { x: e.clientX, y: e.clientY };
      clearTimeout(loreTimer);
      loreTimer = setTimeout(() => showLore(card), 550);
    },
    { passive: true }
  );
  const cancelLore = (e) => {
    if (
      loreStart &&
      e.type === 'pointermove' &&
      Math.hypot(e.clientX - loreStart.x, e.clientY - loreStart.y) < 12
    ) {
      return;
    }
    clearTimeout(loreTimer);
    loreStart = null;
  };
  document.addEventListener('pointermove', cancelLore, { passive: true });
  document.addEventListener('pointerup', cancelLore, { passive: true });
  document.addEventListener('pointercancel', cancelLore, { passive: true });
  window.addEventListener('scroll', () => clearTimeout(loreTimer), { passive: true });

  /* Jelly-scroll: het menu leunt heel even mee met je duim */
  if (!prefersReducedMotion) {
    const menuContent = document.querySelector('.menu-content');
    let lastLeanY = window.scrollY;
    let lastLeanT = performance.now();
    let leanTarget = 0;
    let lean = 0;
    let leanRaf = 0;
    let fastToastDone = false;

    const leanLoop = () => {
      lean += (leanTarget - lean) * 0.16;
      leanTarget *= 0.86;
      if (Math.abs(lean) < 0.015 && Math.abs(leanTarget) < 0.015) {
        lean = 0;
        menuContent.style.transform = '';
        leanRaf = 0;
        return;
      }
      menuContent.style.transform = `skewY(${lean.toFixed(3)}deg)`;
      leanRaf = requestAnimationFrame(leanLoop);
    };

    window.addEventListener(
      'scroll',
      () => {
        const now = performance.now();
        const dt = now - lastLeanT;
        if (dt <= 0) return;
        const v = (window.scrollY - lastLeanY) / dt;
        lastLeanY = window.scrollY;
        lastLeanT = now;
        leanTarget = Math.max(-1.3, Math.min(1.3, v * 0.5));
        if (!leanRaf && menuContent) leanRaf = requestAnimationFrame(leanLoop);
        if (!fastToastDone && Math.abs(v) > 4.2) {
          fastToastDone = true;
          showToast('Waar is de brand? 🧯 Het menu loopt niet weg.', false, 2600);
        }
      },
      { passive: true }
    );
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
