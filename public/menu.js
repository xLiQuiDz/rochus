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
    Rum: { toast: 'Pirate energy 🏴‍☠️', className: 'gag-shake', sticker: 'why is the rum' },
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
    'Chaudfontaine Plat': { toast: 'Plat water. Verdiend. 💧', className: 'gag-bounce', sticker: 'hydrate' },
    'Chaudfontaine Bruis': { toast: 'Bruis water. Verdiend. 💧', className: 'gag-bounce', sticker: 'hydrate' },
    'Meter bier': { toast: 'Eén. Volledige. Meter. 📏🍺', className: 'gag-bounce', sticker: 'formaat: episch' },
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
  const chanceFillEl = document.getElementById('water-chance');
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
    'Woesh 💨',
    'Ik zwem hier al heel de zomer, schat.',
    'Ik zie waar je vinger naartoe gaat, hé.',
    'Dit is mijn arena. Jij bent te gast.',
  ];
  const WATER_NEARMISS_LINES = [
    'DAT WAS 2 MILLIMETER 😭',
    'oeioeioei — bijna, echt bijna',
    'mijn leven flitste voorbij 💀',
    'nog eens zo dichtbij en ik bel de politie',
    'ik voelde de wind van je vinger',
  ];
  const WATER_DASH_LINES = [
    'NOPE 💨',
    'WOEP',
    'doei!',
    'ciao bella 🏃',
    'weg is ie',
  ];
  const WATER_GLOAT_LINES = [
    'even uitrusten, jij haalt me toch niet 😎',
    'ik pauzeer. uit medelijden.',
    'kijk, ik sta zelfs stil…',
    'moment, ik check mijn stories 📱',
    'ik ben zo snel dat ik even mag chillen',
  ];
  const WATER_ARENA_TAUNTS = [
    'moeilijkheidsgraad: belachelijk',
    'hij ziet je vinger aankomen — mik waar hij zál zijn',
    'wacht op het groene balkje. dat is je enige kans.',
    'niemand heeft dit ooit gehaald. bijna niemand.',
    'de bar kijkt mee en geniet enorm',
  ];
  const WATER_QUIT_LINES = [
    'Het water wint. Alweer. 💧🏆',
    'Opgegeven. Het water vertelt dit door aan iederéén.',
    'Geen zorgen, spritz loopt niet weg. 🍹',
    'Verstandig. Dat ding is niet normaal.',
  ];

  const DROP_SIZE = 76;

  const waterGame = {
    pendingPrize: null,
    running: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    finger: { x: 0, y: 0, active: false },
    fvx: 0,
    fvy: 0,
    fLastT: 0,
    heading: 0,
    headingUntil: 0,
    dashCd: 0,
    gloatUntil: 0,
    nextGloatAt: 0,
    rage: 0,
    mercy: 0,
    seed: 0,
    attempts: 0,
    nearMisses: 0,
    startAt: 0,
    lastT: 0,
    raf: 0,
    speechUntil: 0,
    statsTick: 0,
    tauntTimer: 0,
  };

  const meterLabelEl = document.getElementById('water-meter-label');

  function isGloating(now) {
    return waterGame.gloatUntil > (now || performance.now());
  }

  /** Explosieve ontsnapping — weg van de vinger, met een willekeurige knik. */
  function dashAway(power = 1) {
    const g = waterGame;
    const dx = g.x - g.finger.x;
    const dy = g.y - g.finger.y;
    const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 1.1;
    const impulse = 1500 * power;
    g.vx = Math.cos(angle) * impulse;
    g.vy = Math.sin(angle) * impulse;
    g.dashCd = 0.5;
    spawnSplash(g.x, g.y, '💨');
    if (Math.random() < 0.55) waterSpeech(pick(WATER_DASH_LINES), 900);
    if (navigator.vibrate) navigator.vibrate(8);
  }

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
      // Binnen beeld houden, ook als het water tegen de rand plakt
      const half = Math.min(125, window.innerWidth * 0.4);
      const sx = Math.max(half, Math.min(window.innerWidth - half, waterGame.x));
      speechEl.style.left = `${sx}px`;
      speechEl.style.top = `${Math.max(58, waterGame.y - DROP_SIZE / 2 - 14)}px`;
    }
  }

  function waterFace() {
    const g = waterGame;
    if (isGloating()) return '😎';
    const d = g.finger.active ? Math.hypot(g.x - g.finger.x, g.y - g.finger.y) : Infinity;
    if (d < 110) return '😱';
    if (g.rage > 2) return '😤';
    if (d < 200) return '😬';
    return '😏';
  }

  function waterFrame(now) {
    if (!waterGame.running) return;
    const g = waterGame;
    const dt = Math.min(0.033, (now - g.lastT) / 1000 || 0.016);
    g.lastT = now;
    const b = arenaBounds();
    const t = now / 1000;

    const fingerDist = g.finger.active
      ? Math.hypot(g.x - g.finger.x, g.y - g.finger.y)
      : Infinity;

    if (isGloating(now)) {
      // Het opschep-moment: hij vertraagt, maar blijft glijden. Enige echte kans.
      g.vx *= 0.9;
      g.vy *= 0.9;
      if (g.finger.active && fingerDist < 150) {
        // Betrapt tijdens het opscheppen — meteen weg
        g.gloatUntil = 0;
        g.nextGloatAt = now + 5000 + Math.random() * 4000;
        dashAway(1.2);
      }
    } else {
      if (g.finger.active) {
        // Vlucht van waar de vinger NAARTOE gaat, niet waar hij nu is
        const px = g.finger.x + g.fvx * 0.17;
        const py = g.finger.y + g.fvy * 0.17;
        const dx = g.x - px;
        const dy = g.y - py;
        const d = Math.hypot(dx, dy) || 1;
        const R = 330;
        if (d < R) {
          // Zijwaartse knik zodat hij nooit in een rechte lijn vlucht
          const juke = Math.sin(t * 4.6 + g.seed) * 0.75;
          const ca = Math.cos(juke);
          const sa = Math.sin(juke);
          const jx = (dx * ca - dy * sa) / d;
          const jy = (dx * sa + dy * ca) / d;
          const force = Math.pow((R - d) / R, 1.4) * 17000;
          g.vx += jx * force * dt;
          g.vy += jy * force * dt;
          if (Math.random() < 0.14) spawnSplash(g.x, g.y);
          if (Math.random() < 0.012) waterSpeech(pick(WATER_TRASH_TALK));
        }
        if (fingerDist < 125 && g.dashCd <= 0) dashAway(1.25);
      }

      // Ook zonder vinger constant in beweging, met wisselende koers
      if (now > g.headingUntil) {
        g.heading = Math.random() * Math.PI * 2;
        g.headingUntil = now + 360 + Math.random() * 680;
      }
      const cruise = (880 + g.rage * 90) * (1 - g.mercy * 0.3);
      g.vx += Math.cos(g.heading) * cruise * 2.3 * dt;
      g.vy += Math.sin(g.heading) * cruise * 2.3 * dt;
    }

    // Muren afstoten — zo laat hij zich niet in een hoek drijven
    const WALL = 130;
    if (g.x - b.minX < WALL) g.vx += (WALL - (g.x - b.minX)) * 26 * dt;
    if (b.maxX - g.x < WALL) g.vx -= (WALL - (b.maxX - g.x)) * 26 * dt;
    if (g.y - b.minY < WALL) g.vy += (WALL - (g.y - b.minY)) * 26 * dt;
    if (b.maxY - g.y < WALL) g.vy -= (WALL - (b.maxY - g.y)) * 26 * dt;

    g.dashCd = Math.max(0, g.dashCd - dt);

    const drag = Math.max(0, 1 - 1.9 * dt);
    g.vx *= drag;
    g.vy *= drag;

    const maxSpeed = isGloating(now)
      ? 240
      : (1250 + g.rage * 110) * (1 - g.mercy * 0.24);
    let speed = Math.hypot(g.vx, g.vy);
    if (speed > maxSpeed) {
      g.vx = (g.vx / speed) * maxSpeed;
      g.vy = (g.vy / speed) * maxSpeed;
      speed = maxSpeed;
    }

    g.x += g.vx * dt;
    g.y += g.vy * dt;

    if (g.x < b.minX) { g.x = b.minX; g.vx = Math.abs(g.vx) * 0.8; }
    if (g.x > b.maxX) { g.x = b.maxX; g.vx = -Math.abs(g.vx) * 0.8; }
    if (g.y < b.minY) { g.y = b.minY; g.vy = Math.abs(g.vy) * 0.8; }
    if (g.y > b.maxY) { g.y = b.maxY; g.vy = -Math.abs(g.vy) * 0.8; }

    // Volgende opschep-pauze inplannen (alleen als je niet vlakbij staat)
    if (!isGloating(now) && now > g.nextGloatAt && fingerDist > 200) {
      g.gloatUntil = now + 230 + Math.random() * 220 + g.mercy * 520;
      g.nextGloatAt = g.gloatUntil + 8000 + Math.random() * 6000 - g.mercy * 4000;
      waterSpeech(pick(WATER_GLOAT_LINES), 900);
    }

    // Genade groeit pas na een lange lijdensweg, en blijft klein
    const elapsed = (now - g.startAt) / 1000;
    g.mercy = Math.min(1, Math.max(0, (elapsed - 70) / 90));
    g.rage = Math.max(0, g.rage - 0.12 * dt);

    // Vangkans-meter: groen = nu of nooit
    const vuln = isGloating(now) ? 1 : Math.max(0, 1 - speed / 1000) * 0.3;
    const hot = vuln > 0.6;
    chanceFillEl.style.width = `${Math.round(vuln * 100)}%`;
    chanceFillEl.classList.toggle('water-arena__meter-fill--hot', hot);
    if (meterLabelEl) {
      meterLabelEl.textContent = hot ? 'NU! 🫵' : 'vangkans';
      meterLabelEl.classList.toggle('water-arena__meter-label--hot', hot);
    }

    dropFaceEl.textContent = waterFace();
    updateDropDom();

    g.statsTick += dt;
    if (g.statsTick > 0.25) {
      g.statsTick = 0;
      const secs = ((now - g.startAt) / 1000).toFixed(1);
      arenaStatsEl.textContent = `⏱ ${secs}s · 👆 ${g.attempts}${
        g.nearMisses ? ` · 😤 ${g.nearMisses}` : ''
      }`;
    }

    g.raf = requestAnimationFrame(waterFrame);
  }

  function catchRadius() {
    // Tijdens het opscheppen ruim; anders moet je hem écht op de kop tikken
    if (isGloating()) return DROP_SIZE / 2 + 4 + waterGame.mercy * 22;
    return DROP_SIZE * 0.25 + waterGame.mercy * 12;
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
      elapsed < 15
        ? `GEVANGEN in ${elapsed.toFixed(1)}s?! Dat is niet menselijk 🏆`
        : elapsed < 45
          ? `Gevangen in ${elapsed.toFixed(1)}s na ${g.attempts} pogingen. Legende 🥇`
          : elapsed < 120
            ? `Gevangen in ${elapsed.toFixed(1)}s. Het water accepteert zijn nederlaag 💧`
            : `${elapsed.toFixed(0)}s en ${g.attempts} pogingen. Dit water gaat in therapie 🛋️`;

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
    g.fvx = 0;
    g.fvy = 0;
    g.fLastT = performance.now();
    g.attempts += 1;

    const d = Math.hypot(g.x - ev.clientX, g.y - ev.clientY);
    if (d < catchRadius()) {
      winWaterGame();
      return;
    }

    // Mis: hij schrikt, wordt bozer en dus sneller
    spawnRing(ev.clientX, ev.clientY);
    g.rage = Math.min(4, g.rage + 0.55);
    if (d < 85) {
      g.nearMisses += 1;
      waterSpeech(pick(WATER_NEARMISS_LINES), 1400);
      if (navigator.vibrate) navigator.vibrate(18);
    } else if (Math.random() < 0.3) {
      waterSpeech(pick(WATER_TRASH_TALK));
    }
    if (g.dashCd <= 0) dashAway(1);
  }

  function onArenaPointerMove(ev) {
    const g = waterGame;
    if (!g.running) return;
    const now = performance.now();
    const dt = (now - g.fLastT) / 1000;
    if (dt > 0.004) {
      // Vingersnelheid — hierop voorspelt hij waar je naartoe mikt
      g.fvx = Math.max(-2500, Math.min(2500, (ev.clientX - g.finger.x) / dt));
      g.fvy = Math.max(-2500, Math.min(2500, (ev.clientY - g.finger.y) / dt));
      g.fLastT = now;
    }
    g.finger.x = ev.clientX;
    g.finger.y = ev.clientY;
    g.finger.active = true;
  }

  function onArenaPointerUp() {
    waterGame.finger.active = false;
  }

  function openWaterArena() {
    if (!arenaEl || waterGame.running) return;
    const g = waterGame;
    const b = arenaBounds();
    g.running = true;
    g.attempts = 0;
    g.nearMisses = 0;
    g.rage = 0;
    g.mercy = 0;
    g.dashCd = 0;
    g.gloatUntil = 0;
    g.seed = Math.random() * 100;
    g.heading = Math.random() * Math.PI * 2;
    g.vx = 0;
    g.vy = 0;
    g.fvx = 0;
    g.fvy = 0;
    g.x = b.minX + Math.random() * (b.maxX - b.minX);
    g.y = b.minY + Math.random() * (b.maxY - b.minY);
    g.finger.active = false;
    g.startAt = performance.now();
    g.lastT = g.startAt;
    g.fLastT = g.startAt;
    g.headingUntil = g.startAt + 400;
    // Eerste opschep-moment na een paar seconden
    g.nextGloatAt = g.startAt + 4000 + Math.random() * 3000;
    dropEl.classList.remove('water-drop--caught');
    dropFaceEl.textContent = '😏';
    speechEl.hidden = true;
    arenaStatsEl.textContent = '⏱ 0.0s · 👆 0';
    arenaTauntEl.textContent = pick(WATER_ARENA_TAUNTS);
    chanceFillEl.style.width = '0%';
    chanceFillEl.classList.remove('water-arena__meter-fill--hot');
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
      waterGame.pendingPrize = null;
      closeWaterArena();
      showToast(pick(WATER_QUIT_LINES), false, 2800);
    });
    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Escape' && !arenaEl.hidden) {
          waterGame.pendingPrize = null;
          closeWaterArena();
          showToast(pick(WATER_QUIT_LINES), false, 2800);
          e.stopPropagation();
        }
      },
      true
    );
  }

  /* ------------------------------------------------------------------ */
  /* METER BIER — 100 cm cinema op een scherm van 7 cm                  */
  /* ------------------------------------------------------------------ */
  const meterShowEl = document.getElementById('meter-show');
  const meterPlankEl = document.getElementById('meter-plank');
  const meterCmEl = document.getElementById('meter-cm');
  const meterCaptionEl = document.getElementById('meter-caption');
  const meterTitleEl = document.getElementById('meter-title');
  const meterStampEl = document.getElementById('meter-stamp');
  const meterStampSubEl = document.getElementById('meter-stamp-sub');
  const meterSkipEl = document.getElementById('meter-skip');

  const METER_GLASSES = 11;
  const METER_GLASS_FACES = { 0: '😎', 5: '😅', 10: '🥳' };

  const METER_TITLES_REPEAT = [
    'ALWEER EEN METER?!',
    'DE METER: HET VERVOLG',
    'JULLIE ZIJN NIET OKÉ 😳',
    'NÓG 100 CM. RESPECT.',
  ];
  /* Onderschriften per centimeterstand — moet oplopend op `at` staan */
  const METER_CAPTIONS = [
    { at: 2, text: 'daar gaan we — 100 cm bier onderweg' },
    { at: 22, text: 'ja, dit is écht een volle meter' },
    { at: 48, text: 'HALFWEG. even ademen. 😮‍💨' },
    { at: 72, text: 'je scherm is 7 cm. dit is 100. hou vol.' },
    { at: 93, text: 'bijna… BIJNA…' },
  ];
  const METER_CAPTIONS_REPEAT = [
    { at: 2, text: 'alweer?! oké. daar gaan we weer.' },
    { at: 30, text: 'je weet hoe lang dit duurt hè' },
    { at: 50, text: 'HALFWEG. alweer. legende.' },
    { at: 80, text: 'de bar sleept de glazen al aan' },
  ];
  const METER_STAMP_SUBS = [
    '±11 glazen · sterkte aan de drager 🫡',
    '100 cm geluk · 0 cm spijt',
    'deel eerlijk. of niet. wij kijken niet. 👀',
    'tip: drink van buiten naar binnen, anders kantelt ’m',
  ];
  const METER_DONE_TOASTS = [
    'Meter bier in ’t mandje. Groots. 📏',
    '100 cm geluk toegevoegd 🍺',
    'De bar zet zich al schrap 💪',
    'Meter besteld. Vrienden verplicht.',
  ];

  const meterShow = {
    running: false,
    phase: 'idle',
    plays: 0,
    start: 0,
    raf: 0,
    capIdx: 0,
    lastTick: -1,
    closeTimer: 0,
  };

  /* De reis: rustig op gang, kruipend "rustpunt" rond 50 cm, dan uitrijden */
  const METER_SEGMENTS = [
    { until: 1900, from: 0, to: 0.47, ease: meterEase },
    { until: 2500, from: 0.47, to: 0.52, ease: (t) => t },
    { until: 4400, from: 0.52, to: 1, ease: meterEase },
  ];

  function meterEase(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function meterProgress(elapsed) {
    let prev = 0;
    for (const seg of METER_SEGMENTS) {
      if (elapsed < seg.until) {
        const t = (elapsed - prev) / (seg.until - prev);
        return seg.from + (seg.to - seg.from) * seg.ease(t);
      }
      prev = seg.until;
    }
    return 1;
  }

  function buildMeterPlank() {
    if (!meterPlankEl || meterPlankEl.dataset.built) return;
    meterPlankEl.dataset.built = '1';
    const frag = document.createDocumentFragment();
    for (let cm = 0; cm <= 100; cm += 10) {
      const num = document.createElement('span');
      num.className = 'meter-show__ruler-num';
      num.textContent = cm;
      num.style.left = `${cm}%`;
      frag.appendChild(num);
    }
    for (let i = 0; i < METER_GLASSES; i++) {
      const glass = document.createElement('div');
      glass.className = 'meter-glass';
      glass.style.left = `${4.5 + (i * 91) / (METER_GLASSES - 1)}%`;
      glass.style.setProperty('--jig', `${(i % 4) * 0.16}s`);
      if (METER_GLASS_FACES[i]) {
        const face = document.createElement('span');
        face.className = 'meter-glass__face';
        face.textContent = METER_GLASS_FACES[i];
        glass.appendChild(face);
      }
      frag.appendChild(glass);
    }
    meterPlankEl.appendChild(frag);
  }

  function setMeterCaption(text) {
    meterCaptionEl.textContent = text;
    meterCaptionEl.classList.remove('meter-show__caption--pop');
    void meterCaptionEl.offsetWidth;
    meterCaptionEl.classList.add('meter-show__caption--pop');
  }

  function meterFrame(now) {
    const g = meterShow;
    if (!g.running || g.phase !== 'pan') return;
    const p = meterProgress(now - g.start);
    const cm = Math.min(100, Math.round(p * 100));
    meterCmEl.textContent = cm;

    const travel = Math.max(0, meterPlankEl.offsetWidth - window.innerWidth + 36);
    meterPlankEl.style.transform = `translate3d(${18 - p * travel}px, 0, 0)`;

    // Tik-tik-tik: elk gepasseerde 10 cm voel je in je hand
    const tick = Math.floor(cm / 10);
    if (tick !== g.lastTick) {
      g.lastTick = tick;
      if (cm > 0 && cm < 100 && navigator.vibrate) navigator.vibrate(6);
    }

    const caps = g.plays > 1 ? METER_CAPTIONS_REPEAT : METER_CAPTIONS;
    while (g.capIdx < caps.length && cm >= caps[g.capIdx].at) {
      setMeterCaption(caps[g.capIdx].text);
      g.capIdx += 1;
    }

    if (p >= 1) {
      meterFinale();
      return;
    }
    g.raf = requestAnimationFrame(meterFrame);
  }

  /* De punchline: camera zoomt uit, héél de meter past ineens op je scherm */
  function meterFinale() {
    const g = meterShow;
    if (g.phase === 'finale') return;
    g.phase = 'finale';
    cancelAnimationFrame(g.raf);
    meterCmEl.textContent = '100';
    meterCaptionEl.textContent = '';
    meterSkipEl.textContent = 'tik om te sluiten';

    const pad = 18;
    const scale = Math.min(1, (window.innerWidth - pad * 2) / meterPlankEl.offsetWidth);
    meterPlankEl.style.transition = 'transform 0.65s var(--ease-out-expo)';
    meterPlankEl.style.transform = `translate3d(${pad}px, 0, 0) scale(${scale})`;
    meterShowEl.classList.add('meter-show--done');

    setTimeout(() => {
      if (!g.running) return;
      meterStampEl.hidden = false;
      if (navigator.vibrate) navigator.vibrate([30, 60, 30, 60, 80]);
      // zIndex boven de overlay (645) — standaard zit confetti op 100
      fireConfetti({
        particleCount: 90,
        spread: 85,
        startVelocity: 42,
        origin: { y: 0.62 },
        zIndex: 655,
        colors: ROCHUS_CONFETTI_COLORS,
      });
      fireConfetti({
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.72 },
        zIndex: 655,
        colors: ROCHUS_CONFETTI_COLORS,
      });
      fireConfetti({
        particleCount: 40,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.72 },
        zIndex: 655,
        colors: ROCHUS_CONFETTI_COLORS,
      });
    }, 420);

    clearTimeout(g.closeTimer);
    g.closeTimer = setTimeout(closeMeterShow, 2800);
  }

  function playMeterShow() {
    if (!meterShowEl || prefersReducedMotion || meterShow.running) return;
    const g = meterShow;
    buildMeterPlank();
    g.running = true;
    g.phase = 'pan';
    g.plays += 1;
    g.capIdx = 0;
    g.lastTick = -1;
    clearTimeout(g.closeTimer);

    // De gewone add-toast zou over de cinema hangen — die komt na afloop
    clearTimeout(showToast._t);
    toastEl.classList.remove('show');
    toastEl.hidden = true;

    meterShowEl.classList.remove('meter-show--done', 'meter-show--out');
    meterStampEl.hidden = true;
    meterStampSubEl.textContent = pick(METER_STAMP_SUBS);
    meterTitleEl.textContent = g.plays > 1 ? pick(METER_TITLES_REPEAT) : 'DE METER KOMT ERAAN';
    meterCaptionEl.textContent = '';
    meterCaptionEl.classList.remove('meter-show__caption--pop');
    meterSkipEl.textContent = 'tik om door te spoelen ⏩';
    meterCmEl.textContent = '0';
    meterPlankEl.style.transition = 'none';
    meterPlankEl.style.transform = 'translate3d(18px, 0, 0)';
    meterShowEl.hidden = false;
    document.body.style.overflow = 'hidden';

    g.start = performance.now();
    g.raf = requestAnimationFrame(meterFrame);
  }

  function closeMeterShow() {
    const g = meterShow;
    if (!g.running) return;
    g.running = false;
    g.phase = 'idle';
    cancelAnimationFrame(g.raf);
    clearTimeout(g.closeTimer);
    meterShowEl.classList.add('meter-show--out');
    setTimeout(() => {
      meterShowEl.hidden = true;
      meterShowEl.classList.remove('meter-show--out', 'meter-show--done');
    }, 380);
    if (!drawer.classList.contains('open')) document.body.style.overflow = '';
    showToast(pick(METER_DONE_TOASTS), false, 3000);
  }

  if (meterShowEl) {
    // Eén tik: doorspoelen naar de finale; nog een tik: sluiten
    meterShowEl.addEventListener('click', () => {
      if (!meterShow.running) return;
      if (meterShow.phase === 'pan') meterFinale();
      else closeMeterShow();
    });
    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Escape' && meterShow.running) {
          closeMeterShow();
          e.stopPropagation();
        }
      },
      true
    );
  }

  /* ------------------------------------------------------------------ */
  /* RUM — de rumshow in drie bedrijven: de fles is leeg (één zielige   */
  /* druppel), paniek + geschud, dan barst de rumgeiser los en rijst    */
  /* Captain Jack himself uit de rum op.                                */
  /* ------------------------------------------------------------------ */
  const rumShowEl = document.getElementById('rum-show');
  const rumGifEl = document.getElementById('rum-gif');
  const rumTitleEl = document.getElementById('rum-title');
  const rumSlamEl = document.getElementById('rum-slam');
  const rumCaptionEl = document.getElementById('rum-caption');
  const rumSeaEl = document.getElementById('rum-sea');
  const rumWavefrontEl = document.getElementById('rum-wavefront');
  const rumBubblesEl = document.getElementById('rum-bubbles');
  const rumSkipEl = document.getElementById('rum-skip');

  /* [opzet, dreun] — Sparrow-speak; dreun knalt bij de paniek */
  const RUM_TITLE_PAIRS = [['WHY IS THE RUM…', '…GONE?!']];
  const RUM_TITLE_PAIRS_REPEAT = [
    ['BUT WHY IS THE RUM…', '…GONE?!'],
    ['HIDE THE RUM…', 'TOO LATE?!'],
    ['I CLEARLY…', 'REQUIRE MORE RUM?!'],
    ['SAVVY…', 'WHERE’S THE RUM?!'],
    ['THIS IS THE DAY…', 'THE RUM VANISHED?!'],
  ];
  const RUM_FINALE_LINES = [
    'SAVVY?',
    'DRINK UP!',
    'THE RUM!',
    'ME HEARTIES',
  ];
  const RUM_DONE_TOASTS = [
    'Hide the rum. Too late. 🏴‍☠️',
    'Savvy? Rum’s in the bag.',
    'Not all treasure is silver and gold… some of it is rum',
    'Drink up, me hearties 🍾',
    'The problem isn’t the rum. The problem is not enough rum.',
  ];

  const RUM_FILL = 0.62; /* de rum stopt op 62% van het scherm */
  const RUM_PANIC_AT = 2600; /* na de zielige druppel + een beat stilte */
  const RUM_ERUPT_AT = 4900; /* na het paniekgeschud barst de geiser los */
  const RUM_RISE_MS = 1600; /* hoe lang de rum erover doet om te stijgen */

  const rumShow = {
    running: false,
    phase: 'idle',
    plays: 0,
    start: 0,
    eruptStart: 0,
    last: 0,
    raf: 0,
    p: 0,
    timers: [],
    closeTimer: 0,
  };

  function isRumItem(name) {
    return name === 'Rum' || name === 'Rum Captain Morgan';
  }

  function rumSchedule(fn, ms) {
    rumShow.timers.push(setTimeout(fn, ms));
  }

  function rumClearTimers() {
    rumShow.timers.forEach(clearTimeout);
    rumShow.timers = [];
  }

  function rumEaseOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /** Letter-for-letter Sparrow finale line (CSS --i staggers each glyph). */
  function setRumCaption(line) {
    if (!rumCaptionEl) return;
    let i = 0;
    rumCaptionEl.innerHTML = String(line)
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => {
        const letters = [...word]
          .map((ch) => {
            const html = `<span style="--i: ${i}">${escapeHtml(ch)}</span>`;
            i += 1;
            return html;
          })
          .join('');
        return `<span class="rum-show__cword">${letters}</span>`;
      })
      .join('');
  }

  function buildRumBubbles() {
    if (!rumBubblesEl || rumBubblesEl.dataset.built) return;
    rumBubblesEl.dataset.built = '1';
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 14; i++) {
      const b = document.createElement('span');
      b.className = 'rum-show__bubble';
      const size = (7 + Math.random() * 8).toFixed(1);
      b.style.width = `${size}px`;
      b.style.height = `${size}px`;
      b.style.left = `${4 + Math.random() * 92}%`;
      b.style.top = `${18 + Math.random() * 72}vh`;
      b.style.setProperty('--drift', `${(Math.random() * 48 - 24).toFixed(0)}px`);
      b.style.animationDuration = `${(2.6 + Math.random() * 2).toFixed(2)}s`;
      b.style.animationDelay = `${(Math.random() * 3.4).toFixed(2)}s`;
      frag.appendChild(b);
    }
    rumBubblesEl.appendChild(frag);
  }

  /* Bedrijf 1 & 2 draaien op CSS-klokken; de rAF drijft enkel de rumzee.
     Zachte achtervolging van het doelniveau — maakt ook doorspoelen vloeiend */
  function rumFrame(now) {
    const g = rumShow;
    if (!g.running) return;
    const elapsed = now - g.start;
    const dt = g.last ? Math.min(48, now - g.last) : 16;
    g.last = now;

    let target = 0;
    if (g.phase === 'erupt') target = rumEaseOut(Math.min(1, (now - g.eruptStart) / RUM_RISE_MS));
    else if (g.phase === 'finale') target = 1;
    g.p += (target - g.p) * Math.min(1, dt * 0.0085);

    const H = window.innerHeight;
    const seaY = -g.p * H * RUM_FILL + Math.sin(elapsed * 0.0021) * 3 * g.p;
    rumSeaEl.style.transform = `translate3d(0, ${seaY}px, 0)`;
    rumWavefrontEl.style.transform = `translate3d(0, ${seaY}px, 0)`;

    if (g.phase === 'erupt' && target >= 1 && g.p > 0.985) rumFinale();
    g.raf = requestAnimationFrame(rumFrame);
  }

  /* Bedrijf 2: "…GONE?!" + paniekgeschud */
  function rumPanic() {
    const g = rumShow;
    if (!g.running || g.phase !== 'act') return;
    rumShowEl.classList.add('rum-show--panic');
    if (navigator.vibrate) navigator.vibrate([20, 30, 20]);
  }

  /* Bedrijf 3: de geiser barst los, de rum stijgt */
  function rumErupt() {
    const g = rumShow;
    if (!g.running || g.phase === 'erupt' || g.phase === 'finale') return;
    g.phase = 'erupt';
    g.eruptStart = performance.now();
    rumShowEl.classList.add('rum-show--erupt');
    if (navigator.vibrate) navigator.vibrate(35);
  }

  /* Finale: Jack rijst uit de rum. De rAF loopt door voor het zee-gedobber */
  function rumFinale() {
    const g = rumShow;
    if (g.phase === 'finale') return;
    g.phase = 'finale';
    rumClearTimers();
    setRumCaption(pick(RUM_FINALE_LINES));
    /* Bij doorspoelen vanuit bedrijf 1/2: geiser + blast alsnog mee */
    rumShowEl.classList.add('rum-show--erupt', 'rum-show--done');
    rumSkipEl.textContent = 'tap to close, savvy';
    if (rumGifEl) {
      /* Herstart de gif-loop op de reveal: Jack proost precies op tijd */
      const src = rumGifEl.getAttribute('src').split('?')[0];
      rumGifEl.src = `${src}?t=${Date.now()}`;
    }
    setTimeout(() => {
      if (g.running && navigator.vibrate) navigator.vibrate([28, 55, 28, 55, 105]);
    }, 500);
    setTimeout(() => {
      if (g.running)
        fireConfetti({
          particleCount: 90,
          spread: 100,
          startVelocity: 38,
          origin: { y: 0.45 },
          colors: ['#f7e2ae', '#f2b854', '#d98d2b', '#fff6d8'],
        });
    }, 900);
    clearTimeout(g.closeTimer);
    g.closeTimer = setTimeout(closeRumShow, 4600);
  }

  function playRumShow() {
    if (!rumShowEl || prefersReducedMotion || rumShow.running) return;
    if (meterShow.running) return;
    const g = rumShow;
    buildRumBubbles();
    g.running = true;
    g.phase = 'act';
    g.plays += 1;
    g.p = 0;
    g.last = 0;
    clearTimeout(g.closeTimer);
    rumClearTimers();

    clearTimeout(showToast._t);
    toastEl.classList.remove('show');
    toastEl.hidden = true;

    rumShowEl.classList.remove('rum-show--out', 'rum-show--done', 'rum-show--panic', 'rum-show--erupt');
    const pair = g.plays > 1 ? pick(RUM_TITLE_PAIRS_REPEAT) : pick(RUM_TITLE_PAIRS);
    rumTitleEl.textContent = pair[0];
    rumSlamEl.textContent = pair[1];
    if (rumCaptionEl) rumCaptionEl.innerHTML = '';
    rumSkipEl.textContent = 'tap to skip, savvy ⏩';
    rumSeaEl.style.transform = 'translate3d(0, 0, 0)';
    rumWavefrontEl.style.transform = 'translate3d(0, 0, 0)';
    /* hidden weghalen herstart alle CSS-animaties van bedrijf 1 */
    rumShowEl.hidden = false;
    rumShowEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    /* de plik van de zielige druppel, voelbaar */
    rumSchedule(() => {
      if (g.running && navigator.vibrate) navigator.vibrate(8);
    }, 2000);
    rumSchedule(rumPanic, RUM_PANIC_AT);
    rumSchedule(rumErupt, RUM_ERUPT_AT);

    g.start = performance.now();
    g.raf = requestAnimationFrame(rumFrame);
  }

  function closeRumShow() {
    const g = rumShow;
    if (!g.running) return;
    g.running = false;
    g.phase = 'idle';
    cancelAnimationFrame(g.raf);
    clearTimeout(g.closeTimer);
    rumClearTimers();
    rumShowEl.classList.add('rum-show--out');
    setTimeout(() => {
      rumShowEl.hidden = true;
      rumShowEl.setAttribute('aria-hidden', 'true');
      rumShowEl.classList.remove('rum-show--out', 'rum-show--done', 'rum-show--panic', 'rum-show--erupt');
    }, 300);
    if (!drawer.classList.contains('open')) document.body.style.overflow = '';
    showToast(pick(RUM_DONE_TOASTS), false, 3000);
  }

  if (rumShowEl) {
    /* Eén tik: doorspoelen naar de finale; nog een tik: sluiten */
    rumShowEl.addEventListener('click', () => {
      if (!rumShow.running) return;
      if (rumShow.phase === 'finale') closeRumShow();
      else rumFinale();
    });
    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Escape' && rumShow.running) {
          closeRumShow();
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
    syncDiceWithStock();
    if (removed > 0) {
      pendingRequestId = null;
      renderOrder();
      if (confirmReady) {
        // Bevestig-modal toont anders een verouderde lijst
        closeConfirm();
        showToast('Het aanbod is net veranderd — check je mandje even', true, 3600);
      } else if (notifyCart !== false) {
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
    // Fouten mogen de screenreader onderbreken; gewone meldingen niet
    toastEl.setAttribute('aria-live', isError ? 'assertive' : 'polite');
    toastEl.setAttribute('role', isError ? 'alert' : 'status');
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
  const payQrEl = document.getElementById('pay-qr');
  const payStatusEl = document.getElementById('pay-status');
  const payHintEl = document.getElementById('pay-hint');
  const payCloseBtn = document.getElementById('pay-close');
  let payMethod = 'cash';
  let bancontactEnabled = false;
  let payPollTimer = 0;
  let payPollOrderId = null;
  let payPollTick = null;
  try {
    if (localStorage.getItem(PAY_KEY) === 'payconiq') payMethod = 'payconiq';
  } catch {
    /* private mode */
  }

  const PAY_HINTS = {
    cash: 'Pas na bevestiging gaat dit naar de bar · cash bij levering',
    payconiq: 'Je betaalt eerst via Bancontact — pas daarna ziet de bar je order',
  };

  function applyPayMethod(method) {
    payMethod = method === 'payconiq' ? 'payconiq' : 'cash';
    payButtons.forEach((btn) => {
      const on = btn.dataset.pay === payMethod;
      btn.classList.toggle('pay-option--active', on);
      btn.setAttribute('aria-checked', on ? 'true' : 'false');
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

  /* Zelfde limieten als de server — de server blijft de scheidsrechter */
  const MAX_LINE_QTY = 24;
  const MAX_ORDER_QTY = 60;

  function cartTotalQty() {
    let n = 0;
    for (const item of order.values()) n += item.qty;
    return n;
  }

  /* Idempotency-key: stabiel per poging zodat een netwerk-retry nooit een
     tweede bestelling (of tweede betaling) aanmaakt. Reset bij elke
     mandje-wijziging en na een geslaagde bestelling. */
  let pendingRequestId = null;

  /* Snapshot van het mandje bij een Bancontact-poging: mislukt of verloopt
     de betaling, dan zetten we het mandje terug i.p.v. de gast alles
     opnieuw te laten aantikken. */
  let lastPayconiqCart = null;

  function makeRequestId() {
    return typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  /* Openstaande Bancontact-betaling overleeft reload/terugkeer uit de
     bank-app via localStorage. */
  const PENDING_PAY_KEY = 'rochus-pending-payment';
  const PAY_MAX_AGE_MS = 25 * 60 * 1000; // betaallink leeft ± 20 min
  let payResumeChip = null;

  function savePendingPayment(rec) {
    try {
      localStorage.setItem(PENDING_PAY_KEY, JSON.stringify(rec));
    } catch {
      /* private mode */
    }
  }

  function loadPendingPayment() {
    try {
      const rec = JSON.parse(localStorage.getItem(PENDING_PAY_KEY) || 'null');
      if (!rec || !Number.isFinite(rec.orderId)) return null;
      if (Date.now() - (rec.at || 0) > PAY_MAX_AGE_MS) {
        clearPendingPayment();
        return null;
      }
      return rec;
    } catch {
      return null;
    }
  }

  function clearPendingPayment() {
    try {
      localStorage.removeItem(PENDING_PAY_KEY);
    } catch {
      /* private mode */
    }
    hidePayResumeChip();
  }

  function hidePayResumeChip() {
    if (payResumeChip) payResumeChip.hidden = true;
  }

  function showPayResumeChip() {
    if (!payResumeChip) {
      payResumeChip = document.createElement('button');
      payResumeChip.type = 'button';
      payResumeChip.className = 'pay-resume-chip';
      payResumeChip.textContent = '📱 Betaling bezig — tik om te openen';
      payResumeChip.style.cssText =
        'position:fixed;left:50%;bottom:88px;transform:translateX(-50%);z-index:60;' +
        'padding:10px 16px;border-radius:999px;border:1px solid #c98500;' +
        'background:#1a1208;color:#fffaf2;font:inherit;font-size:14px;' +
        'box-shadow:0 6px 18px rgba(0,0,0,.45);cursor:pointer';
      payResumeChip.addEventListener('click', () => {
        const rec = loadPendingPayment();
        if (!rec) {
          hidePayResumeChip();
          return;
        }
        openPayOverlay({
          orderId: rec.orderId,
          totalCents: rec.totalCents,
          payment: rec.payment || {},
        });
        startPayPoll(rec.orderId);
      });
      document.body.appendChild(payResumeChip);
    }
    payResumeChip.hidden = false;
  }

  function stopPayPoll() {
    if (payPollTimer) {
      clearInterval(payPollTimer);
      payPollTimer = 0;
    }
    payPollOrderId = null;
  }

  function setPayUiStatus(text, tone) {
    if (payStatusEl) {
      payStatusEl.textContent = text;
      payStatusEl.dataset.tone = tone || 'pending';
    }
  }

  async function pollPaymentOnce(orderId) {
    const res = await fetch(`/api/orders/${orderId}/payment`, { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Kon betaalstatus niet laden');
    return data;
  }

  function handlePaySuccess(orderId) {
    stopPayPoll();
    clearPendingPayment();
    lastPayconiqCart = null;
    setPayUiStatus('Betaald ✓ — de bar heeft je order', 'ok');
    if (payHintEl) {
      payHintEl.textContent = 'Bedankt! We brengen alles naar je tafel.';
    }
    showToast('Betaald — order staat bij de bar 🍹', false, 4200);
    celebrateOrderSuccess();
    trackOrder(orderId);
    setTimeout(() => closePayOverlay(), 2200);
  }

  function handlePayFailure(status) {
    stopPayPoll();
    clearPendingPayment();
    // Zet het mandje terug zoals het was, zodat "probeer opnieuw" niet
    // betekent: alles opnieuw aantikken
    if (lastPayconiqCart && order.size === 0) {
      for (const item of lastPayconiqCart.items) order.set(item.name, item);
      if (noteInput && !noteInput.value) noteInput.value = lastPayconiqCart.note || '';
      renderOrder();
    }
    lastPayconiqCart = null;
    setPayUiStatus(status === 'expired' ? 'Betaling verlopen' : 'Betaling mislukt', 'err');
    if (payHintEl) {
      payHintEl.textContent = 'Je mandje staat nog klaar — probeer opnieuw, of kies cash.';
    }
    // Overlay al dicht? Meld het dan via een toast
    if (payOverlay && payOverlay.hidden) {
      showToast(
        status === 'expired'
          ? 'Betaling verlopen — bestel gerust opnieuw'
          : 'Betaling niet gelukt — bestel gerust opnieuw',
        true,
        5200
      );
    }
  }

  function startPayPoll(orderId) {
    stopPayPoll();
    payPollOrderId = orderId;
    const startedAt = Date.now();
    let misses = 0;
    const tick = async () => {
      if (payPollOrderId !== orderId) return;
      if (Date.now() - startedAt > PAY_MAX_AGE_MS) {
        handlePayFailure('expired');
        return;
      }
      try {
        const data = await pollPaymentOnce(orderId);
        misses = 0;
        if (data.payment_status === 'succeeded') {
          handlePaySuccess(orderId);
          return;
        }
        if (data.payment_status === 'failed' || data.payment_status === 'expired') {
          handlePayFailure(data.payment_status);
          return;
        }
        setPayUiStatus('Wachten op Bancontact…', 'pending');
      } catch {
        misses += 1;
        if (misses >= 8) {
          setPayUiStatus('Verbinding hapert — we blijven checken…', 'pending');
        }
      }
    };
    payPollTick = tick;
    tick();
    payPollTimer = setInterval(tick, 2500);
  }

  // Terug uit de bank-app in dezelfde tab: meteen checken, niet wachten op
  // de (door Safari geknepen) interval
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && payPollOrderId && payPollTick) payPollTick();
  });

  /* Betaallinks komen uit de API óf uit localStorage — laat nooit een
     javascript:/data:-URL in de href belanden. App-schemes (payconiq://…)
     blijven wel werken. */
  function safePayLink(url) {
    const s = String(url || '').trim();
    if (!s || /^(javascript|data|vbscript):/i.test(s)) return '';
    return s;
  }

  function openPayOverlay({ orderId, totalCents, payment }) {
    if (!payOverlay) return;
    payAmountEl.textContent = formatEuro(totalCents / 100);
    const deeplink = safePayLink(payment?.deeplink);
    const link = deeplink || safePayLink(payment?.checkoutUrl) || '#';
    if (payLinkEl) {
      payLinkEl.href = link;
      payLinkEl.classList.toggle('is-disabled', link === '#');
    }
    let qrShown = false;
    if (payQrEl) {
      if (payment?.qrUrl) {
        payQrEl.src = payment.qrUrl;
        qrShown = true;
      } else if (deeplink) {
        payQrEl.src = `/api/qr/payconiq?u=${encodeURIComponent(deeplink)}`;
        qrShown = true;
      }
      payQrEl.hidden = !qrShown;
    }
    if (link === '#' && !qrShown) {
      // Geen link én geen QR: laat de gast niet eindeloos wachten
      setPayUiStatus('Betaallink ontbreekt', 'err');
      if (payHintEl) {
        payHintEl.textContent =
          'Er ging iets mis bij het starten van de betaling. Sluit dit venster en probeer opnieuw.';
      }
    } else {
      setPayUiStatus('Wachten op betaling…', 'pending');
      if (payHintEl) {
        payHintEl.textContent =
          'Scan of open de app. Zodra Bancontact bevestigt, gaat het naar de bar.';
      }
    }
    hidePayResumeChip();
    document.body.style.overflow = 'hidden';
    payOverlay.hidden = false;
    if (orderId) {
      savePendingPayment({
        orderId,
        totalCents,
        payment: {
          deeplink: payment?.deeplink || '',
          checkoutUrl: payment?.checkoutUrl || '',
          qrUrl: payment?.qrUrl || '',
        },
        at: Date.now(),
      });
    }
  }

  function closePayOverlay() {
    if (payOverlay) payOverlay.hidden = true;
    const pickOpen = pickOverlay && !pickOverlay.hidden;
    if (!drawer.classList.contains('open') && !pickOpen) {
      document.body.style.overflow = '';
    }
    // Betaling nog bezig? De poll loopt door en de terugkeer-knop blijft staan
    if (payPollOrderId) {
      showPayResumeChip();
      showToast('Betaling loopt door — tik onderaan om terug te keren', false, 3200);
    }
  }

  if (payQrEl) {
    // Kapotte QR (404/extern domein plat): verberg het broken-image-icoon
    // en wijs naar de app-knop i.p.v. een schijnbaar vastgelopen scherm
    payQrEl.addEventListener('error', () => {
      payQrEl.hidden = true;
      if (payHintEl) {
        payHintEl.textContent = 'QR kon niet laden — open de betaling via de knop hierboven.';
      }
    });
  }

  if (payOverlay) {
    payCloseBtn.addEventListener('click', closePayOverlay);
    // Bewust géén sluiten op backdrop-tik: één mis-touch mag een lopende
    // betaling niet wegvegen
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
    if (payMethod === 'payconiq' && !bancontactEnabled) {
      showToast('Bancontact is nog niet actief — kies cash of vraag de bar', true, 4200);
      return;
    }
    submitting = true;
    updateSubmitState();
    confirmSend.disabled = true;
    confirmSend.textContent = payMethod === 'payconiq' ? 'Betaling starten…' : 'Versturen…';
    submitBtn.textContent = 'Bezig…';

    const items = [...order.values()].map((item) => ({
      name: item.name,
      qty: item.qty,
    }));

    if (!pendingRequestId) pendingRequestId = makeRequestId();
    const clientRequestId = pendingRequestId;

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

      if (payMethod === 'payconiq') {
        lastPayconiqCart = {
          items: [...order.values()].map((item) => ({ ...item })),
          note: noteInput.value,
        };
      }

      order.clear();
      pendingRequestId = null;
      noteInput.value = '';
      renderOrder();
      closeConfirm();
      closeDrawer();

      if (payMethod === 'payconiq') {
        showToast('Betaal om je order naar de bar te sturen', false, 3600);
        openPayOverlay({
          orderId: data.id,
          totalCents: data.total_cents,
          payment: data.payment || {},
        });
        if (data.id) startPayPoll(data.id);
      } else {
        showToast(pick(SENT_TOASTS).replace('{n}', String(tableNumber)), false, 4200);
        celebrateOrderSuccess();
        if (data && data.id) trackOrder(data.id);
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
    if (existing && existing.qty >= MAX_LINE_QTY) {
      showToast(`Max ${MAX_LINE_QTY}× hetzelfde item — vraag de bar voor meer`, true, 2600);
      return { toast: 'Max bereikt', className: '' };
    }
    if (cartTotalQty() >= MAX_ORDER_QTY) {
      showToast(`Max ${MAX_ORDER_QTY} items per bestelling — splits je ronde op`, true, 2600);
      return { toast: 'Max bereikt', className: '' };
    }
    if (existing) {
      existing.qty += 1;
    } else {
      order.set(name, { name, price, category, qty: 1 });
    }
    pendingRequestId = null;
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
    if (delta > 0 && (item.qty >= MAX_LINE_QTY || cartTotalQty() >= MAX_ORDER_QTY)) {
      showToast('Maximum bereikt — splits je ronde op', true, 2400);
      return;
    }
    item.qty += delta;
    if (item.qty <= 0) order.delete(name);
    pendingRequestId = null;
    renderOrder();
  }

  /** Add the chased Chaudfontaine to the cart — still paid, just earned. */
  function grantWater() {
    const prize = waterGame.pendingPrize;
    waterGame.pendingPrize = null;
    if (!prize || !prize.btn) return;
    const price = Number(prize.price);
    const gag = addItem(prize.name, Number.isFinite(price) ? price : 3, prize.category || 'fris');
    sparkToFab(prize.btn);
    if (!prefersReducedMotion && prize.card && gag.className) {
      prize.card.classList.add(gag.className);
      setTimeout(() => prize.card.classList.remove(gag.className), 700);
    }
  }

  function armWaterPrize(card) {
    const btn = card && card.querySelector('[data-add]');
    if (!btn) return null;
    waterGame.pendingPrize = {
      name: btn.dataset.name,
      price: parseFloat(btn.dataset.price),
      category: btn.dataset.category || 'fris',
      btn,
      card,
    };
    return waterGame.pendingPrize;
  }

  document.addEventListener('click', (e) => {
    const waterCard = e.target.closest('[data-water-dodge]');
    if (waterCard) {
      e.preventDefault();
      e.stopPropagation();
      if (!armWaterPrize(waterCard)) return;
      // Keyboard / reduced-motion users skip the chase but still pay
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
      const qtyBefore = cartTotalQty();
      const gag = addItem(name, price, category);
      sparkToFab(addBtn);
      // Alleen bij een échte toevoeging (niet bij uitverkocht/max) mag de cinema starten
      if (name === 'Meter bier' && cartTotalQty() > qtyBefore) playMeterShow();
      if (isRumItem(name) && cartTotalQty() > qtyBefore) playRumShow();
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
  function applyTableFromUrl() {
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

  async function initTable() {
    // Tafel eerst — een hangende config-fetch mag bestellen niet blokkeren
    applyTableFromUrl();
    try {
      const res = await fetch('/api/config', { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const cfg = await res.json();
        if (cfg.tableCount) tableCount = cfg.tableCount;
        bancontactEnabled = Boolean(cfg.bancontactEnabled);
        // Disable Bancontact option in UI when API is not configured
        payButtons.forEach((btn) => {
          if (btn.dataset.pay === 'payconiq') {
            btn.disabled = !bancontactEnabled;
            btn.title = bancontactEnabled
              ? ''
              : 'Bancontact API nog niet geconfigureerd';
          }
        });
        if (!bancontactEnabled && payMethod === 'payconiq') applyPayMethod('cash');

      }
    } catch {
      /* offline / static preview */
    }

    // Opnieuw checken tegen de échte tableCount van de server
    applyTableFromUrl();
  }

  /** Hervat een lopende Bancontact-betaling na reload of terugkeer uit de
      bank-app (returnUrl `?paid=1&order=N`, of het localStorage-record). */
  async function resumePendingPayment() {
    const params = new URLSearchParams(window.location.search);
    const cameBack = params.get('paid') === '1';
    const urlOrder = Math.floor(Number(params.get('order')));
    const rec = loadPendingPayment();
    const orderId = Number.isFinite(urlOrder) && urlOrder >= 1 ? urlOrder : rec?.orderId;
    if (cameBack) {
      params.delete('paid');
      params.delete('order');
      const qs = params.toString();
      history.replaceState(null, '', qs ? `${location.pathname}?${qs}` : location.pathname);
    }
    if (!orderId) return;
    const stored = rec && rec.orderId === orderId ? rec : null;
    try {
      const data = await pollPaymentOnce(orderId);
      if (data.payment_status === 'succeeded') {
        clearPendingPayment();
        showToast('Betaald — je bestelling staat bij de bar 🍹', false, 4600);
        celebrateOrderSuccess();
        trackOrder(orderId);
        return;
      }
      if (data.payment_status === 'failed' || data.payment_status === 'expired') {
        clearPendingPayment();
        showToast(
          data.payment_status === 'expired'
            ? 'Betaling verlopen — bestel gerust opnieuw'
            : 'Betaling niet gelukt — bestel gerust opnieuw',
          true,
          5200
        );
        return;
      }
      if (data.payment_method !== 'payconiq') return;
      // Nog bezig — heropen het betaalscherm (mét links als we ze nog hebben)
      if (stored) {
        openPayOverlay({
          orderId,
          totalCents: stored.totalCents,
          payment: stored.payment || {},
        });
      } else {
        showToast('We checken je betaling…', false, 3200);
      }
      startPayPoll(orderId);
    } catch {
      // Offline? Laat het record staan; de knop brengt de gast terug
      if (stored) showPayResumeChip();
    }
  }

  initTable();
  resumePendingPayment();

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
    const allergenFold = document.getElementById('allergen-fold');
    if (allergenFold) {
      if (filter === 'allergieen') {
        allergenFold.open = true;
        loadGuestAllergenCard();
      } else if (filter === 'all') {
        allergenFold.open = false;
      }
    }
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

      if (section.dataset.category === 'allergieen') {
        const fold = section.querySelector('#allergen-fold');
        const rows = section.querySelectorAll('[data-allergen-item]');
        let sectionHasMatch = false;
        rows.forEach((row) => {
          const name = (row.dataset.allergenItem || '').toLowerCase();
          const match = !q || name.includes(q) || q.startsWith('allerg');
          row.hidden = !match;
          if (match) sectionHasMatch = true;
        });
        /* Without loaded rows yet, keep the fold visible for "all"/empty search */
        if (!rows.length && (!q || q.startsWith('allerg'))) sectionHasMatch = true;
        if (fold) {
          const summary = fold.querySelector('.allergen-fold__summary');
          if (summary) summary.hidden = Boolean(q && !sectionHasMatch);
          if (q && sectionHasMatch) fold.open = true;
        }
        section.style.display = sectionHasMatch || !q ? '' : 'none';
        if (sectionHasMatch) anyVisible = true;
        return;
      }

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
  /* Digital allergen card                                              */
  /* ------------------------------------------------------------------ */
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

  function allergenBadgeHtml(key, label) {
    const icon = ALLERGEN_ICONS[key] || '';
    const title = escapeHtml(label || key);
    return `<span class="allergen-badge" title="${title}" aria-label="${title}">${icon}</span>`;
  }

  function renderGuestAllergenCard(data) {
    const loadingEl = document.getElementById('allergen-card-loading');
    const legendEl = document.getElementById('allergen-card-legend');
    const bodyEl = document.getElementById('allergen-card-body');
    const disclaimerEl = document.getElementById('allergen-card-disclaimer');
    if (!legendEl || !bodyEl) return;

    const legend = Array.isArray(data.legend) ? data.legend : [];
    const legendMap = new Map(legend.map((l) => [l.key, l.label]));

    legendEl.innerHTML = legend
      .map(
        (entry) =>
          `<div class="allergen-card__legend-item">${allergenBadgeHtml(entry.key, entry.label)}<span>${escapeHtml(entry.label)}</span></div>`
      )
      .join('');

    bodyEl.innerHTML = (Array.isArray(data.sections) ? data.sections : [])
      .map((section) => {
        const rows = (section.items || [])
          .map((item) => {
            const badges = (item.allergens || [])
              .map((key) => allergenBadgeHtml(key, legendMap.get(key) || key))
              .join('');
            return `<li class="allergen-card__row" data-allergen-item="${escapeHtml(item.name)}">
              <span class="allergen-card__name">${escapeHtml(item.name)}</span>
              <span class="allergen-card__badges">${badges}</span>
            </li>`;
          })
          .join('');
        return `<div class="allergen-card__section">
          <h3 class="allergen-card__section-title">${escapeHtml(section.title)}</h3>
          <ul class="allergen-card__list">${rows}</ul>
        </div>`;
      })
      .join('');

    if (disclaimerEl) {
      disclaimerEl.textContent = data.disclaimer || '';
      disclaimerEl.hidden = !data.disclaimer;
    }
    if (loadingEl) loadingEl.hidden = true;
    legendEl.hidden = legend.length === 0;
    bodyEl.hidden = false;
  }

  async function loadGuestAllergenCard() {
    if (loadGuestAllergenCard.loaded || loadGuestAllergenCard.loading) return;
    loadGuestAllergenCard.loading = true;
    const loadingEl = document.getElementById('allergen-card-loading');
    if (loadingEl) loadingEl.hidden = false;
    try {
      const res = await fetch('/api/menu/allergens');
      if (!res.ok) throw new Error('load failed');
      renderGuestAllergenCard(await res.json());
      loadGuestAllergenCard.loaded = true;
    } catch {
      if (loadingEl) {
        loadingEl.textContent = 'Allergieën even niet beschikbaar — vraag het aan de bar.';
        loadingEl.hidden = false;
      }
    } finally {
      loadGuestAllergenCard.loading = false;
    }
  }

  const allergenFoldEl = document.getElementById('allergen-fold');
  if (allergenFoldEl) {
    allergenFoldEl.addEventListener('toggle', () => {
      if (allergenFoldEl.open) loadGuestAllergenCard();
    });
  }

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
  const wheelCloseBtn = document.getElementById('wheel-close');
  const diceBtn = document.getElementById('menu-dice');
  const whoPaysBtn = document.getElementById('who-pays');

  // Cards-against-humanity-vibes: kort op het rad, de dolk in de toelichting
  const WHO_PAYS_CARDS = [
    { label: 'Nog single 💀', line: 'Wie single is, betaalt. Je spaart al genoeg op emotionele schade.' },
    { label: 'Studentenschuld 📚', line: 'Wie nog studieleningen aflost, betaalt. Je bent toch al gewend om te bloeden.' },
    { label: '“Ik drink niet meer” 🍷', line: 'Wie dat zei en hier zit: jij trakteert. Liegen was gratis, drinken niet.' },
    { label: 'Ghosting royalty 👻', line: 'Wie dit jaar iemand liet verdwijnen zonder uitleg, betaalt. Karma stuurt een factuur.' },
    { label: 'Situationship 🥀', line: 'Wie “het is complicated” nog steeds gebruikt: jij. Onduidelijkheid is een luxeproduct.' },
    { label: 'Ex stalker lite 📱', line: 'Wie z’n ex z’n stories nog bekijkt: betaal. Obsessief én arm is te veel.' },
    { label: 'Sunday scaries 😰', line: 'Wie al paniek heeft over maandag, betaalt. Je burnout sponsort de ronde.' },
    { label: '“Ik ga vroeg” 😴', line: 'Wie dat beloofde en bleef: jij. Consistency is voor losers én voor betalen.' },
    { label: 'LinkedIn clown 💼', line: 'Wie “grateful for this journey” postte terwijl-ie haatte: betalen. Performative gratitude tax.' },
    { label: 'Therapy cancelled 🛋️', line: 'Wie therapie skipte voor dit café: jij. Je trauma bestelt mee.' },
    { label: 'Gym-schuld 🏋️', line: 'Wie betaalt om níet te sporten: jij hier ook. Zelfsabotage als businessmodel.' },
    { label: 'Vape-leugenaar 💨', line: 'Wie “gestopt” is met een stick in de zak: betalen. Je longen zijn al failliet.' },
    { label: 'Main character delusion 🎬', line: 'Wie denkt dat vanavond over hen gaat: trakteer de extras. Spoiler: niemand kijkt.' },
    { label: 'Soft launch crush 📸', line: 'Wie een crush soft-launchte en daarna ghostte: jij. Content zonder commitment is duur.' },
    { label: 'Collectieve armoede 🧮', line: 'Splitsen. Jullie zijn allemaal broke, maar op verschillende levels van ontkenning.' },
    { label: 'Jij. Punt. 🫵', line: 'Het rad koos jou. Protesteer en we draaien nog eens — tot het erger wordt.' },
  ];

  const WHEEL_SEGMENTS = 8;
  const WHEEL_SIZE = 640;
  const wheelCtx = wheelCanvas ? wheelCanvas.getContext('2d') : null;

  /** @type {{ label: string, line: string }[]} */
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
    wheelResult.textContent = item.line;
    wheelResult.hidden = false;
    wheelSpinBtn.textContent = 'Nog eens draaien';
    burstConfetti();
  }

  function spinWheel(dir = 1, power = 1) {
    if (wheelSpinning || wheelItems.length === 0) return;
    wheelSpinning = true;
    wheelResult.hidden = true;
    const wheelGoto = document.getElementById('wheel-goto');
    if (wheelGoto) wheelGoto.hidden = true;
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

  function openWheel() {
    wheelTitle.textContent = 'Wie betaalt?';
    wheelSub.textContent = 'Zwier het rad — het rad kent geen genade';
    wheelItems = shuffle(WHO_PAYS_CARDS).slice(0, WHEEL_SEGMENTS);

    wheelRot = Math.random() * Math.PI * 2;
    wheelWinner = -1;
    wheelResult.hidden = true;
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

  /** Scroll naar een menukaart en laat hem even opvallen. */
  function revealOnMenu(addBtn) {
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
      spawnFloatingSticker(card, 'gekozen');
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

  /* ------------------------------------------------------------------ */
  /* WIE BETAALT — vingers op het scherm                                */
  /* ------------------------------------------------------------------ */
  const pickOverlay = document.getElementById('pick-overlay');
  const pickSurface = document.getElementById('pick-surface');
  const pickHint = document.getElementById('pick-hint');
  const pickHintText = document.getElementById('pick-hint-text');
  const pickCount = document.getElementById('pick-count');
  const pickRings = document.getElementById('pick-rings');
  const pickReveal = document.getElementById('pick-reveal');
  const pickRevealLine = document.getElementById('pick-reveal-line');
  const pickAgainBtn = document.getElementById('pick-again');
  const pickCloseBtn = document.getElementById('pick-close');
  const pickModeBtns = [...document.querySelectorAll('[data-pickmode]')];

  const FINGER_COLORS = [
    '#f0d9a8', '#6aa9f5', '#e8b4a0', '#8fd4a8', '#e89ac0', '#d4af70', '#b8a0e8', '#f5b969',
  ];

  const PICK_LOSER_LINES = [
    'Jij. Het scherm heeft je aangewezen 💸',
    'Deze vinger betaalt de hele ronde. Geen beroep mogelijk.',
    'Het toestel koos jou. Het universum knikt instemmend.',
    'Gefeliciteerd — sponsor van de avond 🎉',
    'Deze duim gaat pinnen.',
    'De telefoon liegt niet. Jij trakteert.',
    'Aangewezen. Aanvaard je lot met waardigheid (en cash).',
  ];
  const PICK_WINNER_LINES = [
    'Jij bent vrij! De rest mag splitsen 😇',
    'Deze vinger ontsnapt. De anderen: succes met de rekening.',
    'Immuun verklaard. De rest draait op voor de ronde.',
    'Jij drinkt gratis. De tafel haat je nu een beetje.',
    'Vrijgesteld door het toestel. Doe er niet moeilijk over.',
  ];

  const PICK_ALIASES = [
    'de gierigaard', 'mr. tikkie', 'het feestvarken', 'de spookbetaler',
    'de nagelbijter', 'sugar mama?', 'de bookkeeper', 'de chaoot',
    'het slachtoffer', 'de vrijgevige (lol)',
  ];

  let pickMode = 'loser';
  let pickState = 'idle'; // idle | waiting | counting | picking | revealed
  /** @type {Map<number, {x:number,y:number,el:HTMLElement,color:string}>} */
  const fingers = new Map();
  let pickStabilizeTimer = 0;
  let pickCountTimer = 0;
  let pickColorIdx = 0;
  let pickAliasBag = [];
  const pickScan = document.getElementById('pick-scan');
  const pickSpot = document.getElementById('pick-spot');
  const pickFlash = document.getElementById('pick-flash');
  const pickIris = document.getElementById('pick-iris');
  const pickOmen = document.getElementById('pick-omen');
  /** Loopt op bij elke reset — laat een lopend oordeel-script stilletjes sterven */
  let pickSeq = 0;

  const PICK_OMENS_SCAN = [
    'Het toestel proeft jullie schuld…',
    'Iemand hier ruikt naar onbetaalde rondes…',
    'Vingers gelezen. Zonden geteld.',
    'Het oordeel neemt de tijd. Altijd.',
  ];
  const PICK_OMENS_SAFE = [
    'Niet jij. Nog niet.',
    'Gespaard. Voorlopig.',
    'Vrijgesproken — kijk niet zo opgelucht.',
    'Deze mag blijven drinken.',
    'Het oog glijdt verder…',
  ];
  const PICK_OMENS_DUEL = [
    'Twee harten. Eén rekening.',
    'Eén van jullie gaat dit voelen.',
    'De laatste twee. Het toestel geniet.',
    'Nog één keer twijfelen…',
  ];

  /* Hartslag: hoe dichter bij de beslissing, hoe sneller hij slaat */
  let heartTimer = 0;
  let heartInterval = 0;

  function heartThump() {
    pickTone(58, 0.22, 'sine', 0.28);
    setTimeout(() => pickTone(46, 0.26, 'sine', 0.2), 110);
  }

  function heartBeatOnce() {
    heartThump();
    if (navigator.vibrate) navigator.vibrate(10);
    pickSurface.classList.remove('pick__surface--beat');
    void pickSurface.offsetWidth;
    pickSurface.classList.add('pick__surface--beat');
    heartTimer = setTimeout(() => {
      heartTimer = 0;
      if (heartInterval > 0) heartBeatOnce();
    }, heartInterval);
  }

  function setHeart(interval) {
    heartInterval = interval;
    if (interval <= 0) {
      clearTimeout(heartTimer);
      heartTimer = 0;
    } else if (!heartTimer) {
      heartBeatOnce();
    }
  }

  function flashScreen() {
    if (prefersReducedMotion) return;
    pickFlash.classList.remove('pick__flash--go');
    void pickFlash.offsetWidth;
    pickFlash.classList.add('pick__flash--go');
  }

  function shakeStage() {
    if (prefersReducedMotion) return;
    pickSurface.classList.remove('pick__surface--shake');
    void pickSurface.offsetWidth;
    pickSurface.classList.add('pick__surface--shake');
  }

  function syncScan() {
    const active =
      (pickState === 'waiting' && fingers.size >= 2) ||
      pickState === 'counting' ||
      pickState === 'picking';
    pickScan.hidden = !active;
    pickScan.classList.toggle(
      'pick__scan--fast',
      pickState === 'counting' || pickState === 'picking'
    );
  }

  function pickTone(freq, dur, type = 'sine', peak = 0.14) {
    try {
      if (!wheelAudioCtx) wheelAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (wheelAudioCtx.state === 'suspended') wheelAudioCtx.resume().catch(() => {});
      const t = wheelAudioCtx.currentTime;
      const osc = wheelAudioCtx.createOscillator();
      const gain = wheelAudioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(peak, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain);
      gain.connect(wheelAudioCtx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    } catch {
      /* stil mag ook */
    }
  }

  function positionRing(finger) {
    // Losse translate-property: schaal-effecten (suspect/safe) rekken de
    // verplaatsing dan niet mee uit — de ring blijft exact onder de vinger.
    finger.el.style.translate = `${finger.x}px ${finger.y}px`;
  }

  function updateHint() {
    if (pickState === 'counting' || pickState === 'picking' || pickState === 'revealed') {
      pickHint.hidden = true;
      return;
    }
    const n = fingers.size;
    pickHint.hidden = false;
    // Bij vingers op het scherm krimpt de hint tot een balkje bovenaan
    pickHint.classList.toggle('pick__hint--compact', n > 0);
    if (n === 0) {
      pickHintText.textContent = 'Leg allemaal een vinger op het scherm';
    } else if (n === 1) {
      pickHintText.textContent = 'Nog minstens één vinger erbij… 🖐️';
    } else {
      pickHintText.textContent = `${n} vingers — stil blijven liggen, aftellen begint…`;
    }
  }

  function clearPickTimers() {
    clearTimeout(pickStabilizeTimer);
    clearInterval(pickCountTimer);
    pickStabilizeTimer = 0;
    pickCountTimer = 0;
  }

  function showCount(n) {
    pickCount.hidden = false;
    pickCount.textContent = String(n);
    pickCount.classList.remove('pick__count--pop');
    void pickCount.offsetWidth;
    pickCount.classList.add('pick__count--pop');
  }

  /** Set van vingers is veranderd — telt opnieuw af of wacht. */
  function onFingerSetChanged() {
    if (pickState === 'revealed' || pickState === 'picking') return;
    clearPickTimers();
    pickCount.hidden = true;
    pickState = 'waiting';
    updateHint();
    if (fingers.size >= 2) {
      setHeart(880);
      pickStabilizeTimer = setTimeout(startPickCountdown, 1300);
    } else {
      setHeart(0);
    }
    syncScan();
  }

  const COUNT_HEART = { 3: 600, 2: 440, 1: 320 };

  function startPickCountdown() {
    if (fingers.size < 2) return;
    pickState = 'counting';
    pickHint.hidden = true;
    syncScan();
    let n = 3;
    showCount(n);
    setHeart(COUNT_HEART[n]);
    pickTone(660, 0.15);
    flashScreen();
    shakeStage();
    pickCountTimer = setInterval(() => {
      n -= 1;
      if (n > 0) {
        showCount(n);
        setHeart(COUNT_HEART[n]);
        pickTone(660 + (3 - n) * 120, 0.15);
        flashScreen();
        shakeStage();
      } else {
        clearInterval(pickCountTimer);
        pickCount.hidden = true;
        doPick();
      }
    }, 720);
  }

  /** Het zoekende oog: donker masker met lichtgat glijdt naar een vinger */
  function irisTo(finger, hole = 1) {
    if (!pickIris) return;
    const t = `translate(${finger.x}px, ${finger.y}px) scale(${hole})`;
    if (pickIris.hidden) {
      // Eerste keer: niet vanaf (0,0) aan komen glijden
      pickIris.style.transition = 'none';
      pickIris.hidden = false;
      pickIris.style.transform = t;
      void pickIris.offsetWidth;
      pickIris.style.transition = '';
    } else {
      pickIris.style.transform = t;
    }
  }

  function irisOff() {
    if (pickIris) pickIris.hidden = true;
  }

  function setOmen(text) {
    if (!pickOmen) return;
    pickOmen.classList.remove('pick__omen--in');
    pickOmen.textContent = text;
    if (!text) return;
    void pickOmen.offsetWidth;
    pickOmen.classList.add('pick__omen--in');
  }

  function markSuspect(id) {
    fingers.forEach((f, fid) =>
      f.el.classList.toggle('pick__ring--suspect', fid === id)
    );
  }

  function clearSuspects() {
    fingers.forEach((f) => f.el.classList.remove('pick__ring--suspect'));
  }

  /** Vrijspraak: ring valt terug het donker in, naamkaartje zegt "vrij" */
  function releaseFinger(id) {
    const f = fingers.get(id);
    if (!f) return;
    f.el.classList.remove('pick__ring--suspect');
    f.el.classList.add('pick__ring--safe');
    const tag = f.el.querySelector('.pick__ring-tag');
    if (tag) tag.textContent = 'vrij ✓';
    spawnGhost(f);
    pickTone(920, 0.16, 'triangle', 0.07);
    if (navigator.vibrate) navigator.vibrate(8);
  }

  /**
   * Het oordeel, in vier aktes: verhoor, vrijspraak, duel, stilte.
   * De verliezer staat vanaf het begin vast — de rest is theater.
   */
  async function doPick() {
    const ids = [...fingers.keys()];
    if (ids.length < 2) {
      onFingerSetChanged();
      return;
    }
    pickState = 'picking';
    const seq = pickSeq;
    pickHint.hidden = true;
    syncScan();
    const loserId = ids[Math.floor(Math.random() * ids.length)];

    if (prefersReducedMotion) {
      revealPick(loserId);
      return;
    }

    const alive = () => pickSeq === seq && pickState === 'picking';
    const beat = (ms) => new Promise((r) => setTimeout(r, ms));

    pickSurface.classList.add('pick__surface--tense');

    // AKTE 1 — verhoor: het oog neemt élke vinger even op
    setOmen(pick(PICK_OMENS_SCAN));
    setHeart(700);
    const order = shuffle([...ids]);
    for (let i = 0; i < order.length; i++) {
      if (!alive()) return;
      const f = fingers.get(order[i]);
      if (!f) continue;
      irisTo(f, 1);
      markSuspect(order[i]);
      pickTone(170 + i * 26, 0.14, 'triangle', 0.07);
      await beat(700 + Math.random() * 240);
    }
    if (!alive()) return;
    clearSuspects();

    // AKTE 2 — vrijspraak: wie het oog vangt, ontsnapt. Pauzes rekken uit.
    const others = shuffle(ids.filter((id) => id !== loserId));
    const duelist = others.pop();
    let stare = 950;
    let heart = 620;
    for (const id of others) {
      if (!alive()) return;
      const f = fingers.get(id);
      if (f) {
        irisTo(f, 0.94);
        markSuspect(id);
        setHeart(heart);
        pickTone(120, 0.2, 'sine', 0.1);
      }
      await beat(stare);
      if (!alive()) return;
      releaseFinger(id);
      setOmen(pick(PICK_OMENS_SAFE));
      stare = Math.min(1500, stare + 170);
      heart = Math.max(360, heart - 90);
      await beat(460);
    }
    if (!alive()) return;

    // AKTE 3 — duel: het oog twijfelt steeds trager tussen de laatste twee
    const duo = [duelist, loserId];
    setOmen(pick(PICK_OMENS_DUEL));
    setHeart(300);
    const holds = [520, 600, 700, 820, 980, 1250];
    for (let i = 0; i < holds.length; i++) {
      if (!alive()) return;
      const f = fingers.get(duo[i % 2]);
      if (f) {
        irisTo(f, 0.82);
        markSuspect(duo[i % 2]);
        spawnGhost(f);
        pickTone(105 + (i % 2) * 22, 0.16, 'sine', 0.12);
        if (navigator.vibrate) navigator.vibrate(10);
      }
      await beat(holds[i]);
    }
    if (!alive()) return;

    // AKTE 4 — doodse stilte: hartslag stopt, alles dooft. Dan het vonnis.
    clearSuspects();
    setOmen('');
    setHeart(0);
    pickScan.hidden = true;
    irisOff();
    pickSurface.classList.add('pick__surface--void');
    pickTone(36, 1.1, 'sine', 0.2);
    await beat(1050);
    if (!alive()) return;
    pickSurface.classList.remove('pick__surface--void');

    revealPick(loserId);
  }

  function spawnGhost(finger) {
    if (prefersReducedMotion) return;
    const ghost = document.createElement('div');
    ghost.className = 'pick__ghost';
    ghost.style.setProperty('--c', finger.color);
    ghost.style.translate = `${finger.x}px ${finger.y}px`;
    pickRings.appendChild(ghost);
    ghost.addEventListener('animationend', () => ghost.remove(), { once: true });
    setTimeout(() => ghost.remove(), 700);
  }

  function spawnWaves(finger) {
    if (prefersReducedMotion) return;
    for (let i = 0; i < 3; i++) {
      const wave = document.createElement('div');
      wave.className = 'pick__wave';
      wave.style.setProperty('--c', finger.color);
      wave.style.translate = `${finger.x}px ${finger.y}px`;
      wave.style.animationDelay = `${i * 0.18}s`;
      pickRings.appendChild(wave);
      wave.addEventListener('animationend', () => wave.remove(), { once: true });
      setTimeout(() => wave.remove(), 1600);
    }
  }

  function revealPick(loserId) {
    pickState = 'revealed';
    setHeart(0);
    syncScan();
    irisOff();
    setOmen('');
    pickSurface.classList.remove('pick__surface--tense', 'pick__surface--void');
    const chosen = fingers.get(loserId);

    // Fase 1: alles valt weg, alleen de uitverkorene blijft branden
    pickSurface.classList.add('pick__surface--blackout');
    fingers.forEach((f, id) => {
      f.el.classList.remove('pick__ring--chosen');
      if (id === loserId) f.el.classList.add('pick__ring--chosen');
      else f.el.classList.add('pick__ring--dimmed');
    });

    if (chosen) {
      // Spotlight van bovenaf op de gekozen vinger
      pickSpot.style.left = `${chosen.x}px`;
      pickSpot.style.height = `${Math.max(60, chosen.y)}px`;
      pickSpot.hidden = false;
      spawnWaves(chosen);
    }

    // Zware dubbele boem
    pickTone(50, 0.5, 'sine', 0.34);
    setTimeout(() => pickTone(42, 0.7, 'sine', 0.3), 180);
    if (navigator.vibrate) navigator.vibrate([60, 80, 160]);
    flashScreen();
    shakeStage();

    // Fase 2: het vonnis, nét even later — dat halve tellen is de spanning
    setTimeout(() => {
      pickRevealLine.textContent = pick(
        pickMode === 'winner' ? PICK_WINNER_LINES : PICK_LOSER_LINES
      );
      pickReveal.hidden = false;
      pickTone(180, 0.6, 'sine', 0.2);
      pickTone(360, 0.5, 'triangle', 0.1);
      celebrateOrderSuccess();
    }, prefersReducedMotion ? 0 : 650);
  }

  function resetPickRound() {
    pickSeq += 1;
    clearPickTimers();
    setHeart(0);
    pickReveal.hidden = true;
    pickCount.hidden = true;
    pickSpot.hidden = true;
    irisOff();
    setOmen('');
    pickSurface.classList.remove(
      'pick__surface--blackout',
      'pick__surface--tense',
      'pick__surface--void'
    );
    pickRings.innerHTML = '';
    fingers.clear();
    pickColorIdx = 0;
    pickAliasBag = shuffle(PICK_ALIASES);
    pickState = 'waiting';
    updateHint();
    syncScan();
  }

  function addFinger(ev) {
    if (pickState === 'revealed' || pickState === 'picking') return;
    const rect = pickSurface.getBoundingClientRect();
    const color = FINGER_COLORS[pickColorIdx % FINGER_COLORS.length];
    const alias = pickAliasBag[pickColorIdx % pickAliasBag.length] || '';
    pickColorIdx += 1;
    const el = document.createElement('div');
    el.className = 'pick__ring';
    el.style.setProperty('--c', color);
    el.innerHTML =
      `<span class="pick__ring-num">${fingers.size + 1}</span>` +
      `<span class="pick__ring-tag">${escapeHtml(alias)}</span>`;
    const finger = { x: ev.clientX - rect.left, y: ev.clientY - rect.top, el, color };
    pickRings.appendChild(el);
    positionRing(finger);
    fingers.set(ev.pointerId, finger);
    pickTone(340 + fingers.size * 60, 0.09, 'triangle', 0.07);
    if (navigator.vibrate) navigator.vibrate(6);
    onFingerSetChanged();
  }

  function moveFinger(ev) {
    const finger = fingers.get(ev.pointerId);
    if (!finger) return;
    const rect = pickSurface.getBoundingClientRect();
    finger.x = ev.clientX - rect.left;
    finger.y = ev.clientY - rect.top;
    positionRing(finger);
  }

  function removeFinger(ev) {
    const finger = fingers.get(ev.pointerId);
    if (!finger) return;
    // Tijdens de onthulling laten we de ringen staan
    if (pickState === 'revealed' || pickState === 'picking') return;
    finger.el.remove();
    fingers.delete(ev.pointerId);
    // Nummers hernummeren
    let i = 1;
    fingers.forEach((f) => {
      const num = f.el.querySelector('.pick__ring-num');
      if (num) num.textContent = String(i++);
    });
    onFingerSetChanged();
  }

  if (pickSurface) {
    pickSurface.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      addFinger(ev);
    });
    pickSurface.addEventListener('pointermove', moveFinger, { passive: true });
    pickSurface.addEventListener('pointerup', removeFinger);
    pickSurface.addEventListener('pointercancel', removeFinger);
  }

  pickModeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      pickMode = btn.dataset.pickmode;
      pickModeBtns.forEach((b) => b.classList.toggle('pick__mode--on', b === btn));
    });
  });

  function openPick() {
    pickMode = 'loser';
    pickModeBtns.forEach((b) => b.classList.toggle('pick__mode--on', b.dataset.pickmode === 'loser'));
    resetPickRound();
    pickState = 'waiting';
    updateHint();
    pickOverlay.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closePick() {
    clearPickTimers();
    resetPickRound();
    pickState = 'idle';
    pickOverlay.hidden = true;
    // Betaalscherm kan er nog onder liggen — scroll-lock dan behouden
    const payOpen = payOverlay && !payOverlay.hidden;
    if (!drawer.classList.contains('open') && !payOpen) document.body.style.overflow = '';
  }

  if (pickOverlay) {
    pickAgainBtn.addEventListener('click', resetPickRound);
    pickCloseBtn.addEventListener('click', closePick);
    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Escape' && !pickOverlay.hidden) {
          closePick();
          e.stopPropagation();
        }
      },
      true
    );
  }

  if (whoPaysBtn) whoPaysBtn.addEventListener('click', openPick);

  // Extra ingangen: vanuit het Bancontact-scherm en de footer
  const payWhoPaysBtn = document.getElementById('pay-whopays');
  if (payWhoPaysBtn) payWhoPaysBtn.addEventListener('click', openPick);
  const footerWhoPaysBtn = document.getElementById('footer-whopays');
  if (footerWhoPaysBtn) footerWhoPaysBtn.addEventListener('click', openPick);

  /* ------------------------------------------------------------------ */
  /* DOBBELSTEEN — schud, zes drankjes, nieuw assortiment per spel      */
  /* ------------------------------------------------------------------ */
  const diceOverlay = document.getElementById('dice-overlay');
  const diceGame = diceOverlay ? diceOverlay.querySelector('.dice-game') : null;
  const diceCube = document.getElementById('dice-cube');
  const diceStage = document.getElementById('dice-stage');
  const diceFloat = document.getElementById('dice-float');
  const diceFloor = document.getElementById('dice-floor');
  const diceShockwave = document.getElementById('dice-shockwave');
  const diceFlash = document.getElementById('dice-flash');
  const diceEmbers = document.getElementById('dice-embers');
  const diceSub = document.getElementById('dice-sub');
  const diceRollBtn = document.getElementById('dice-roll');
  const diceResult = document.getElementById('dice-result');
  const diceCloseBtn = document.getElementById('dice-close');

  const DICE_EMOJI = {
    bieren: '🍺',
    fris: '🥤',
    cocktails: '🍹',
    wijnen: '🍷',
    shots: '🥃',
    warme: '☕',
  };

  const DICE_LINES = [
    'De steen twijfelt nooit. Jij betaalt.',
    'Zes kanten. Eén rekening. De jouwe.',
    'Het lot heeft gesproken. Jouw dorst ook.',
    'Geen keuzestress meer — alleen een schuld.',
    'De steen kent je beter dan jijzelf.',
    'Twijfel is voor mensen zonder dobbelsteen.',
  ];

  /** Rotatie die vlak i naar de camera brengt */
  const DICE_SETTLE = [
    { x: 0, y: 0 },
    { x: 0, y: 180 },
    { x: 0, y: -90 },
    { x: 0, y: 90 },
    { x: -90, y: 0 },
    { x: 90, y: 0 },
  ];

  /** @type {{name:string,price:number,category:string,emoji:string,short:string,btn:Element}[]} */
  let diceFaces = [];
  /** @type {{name:string,price:number,category:string,emoji:string,short:string,btn:Element}|null} */
  let diceWinner = null;
  let diceRolling = false;
  let diceAngle = { x: -18, y: 32 };
  let shakeListening = false;
  let lastShake = { x: 0, y: 0, z: 0, t: 0 };
  let motionPermission = 'unknown';

  function diceShortName(name) {
    let s = name
      .replace(" van 't vat", '')
      .replace(' (6 stuks)', '')
      .replace(' (Minute Maid)', '')
      .replace('Chaudfontaine ', '')
      .replace(' DOC Frizzante', '')
      .replace(' Brut Réserve', '')
      .replace('Care ', '');
    const m = s.match(/^(.*?)\s*\((glas)\)$/);
    if (m) {
      const base = m[1].length > 12 ? `${m[1].slice(0, 11).trim()}…` : m[1];
      return `${base} (glas)`;
    }
    return s.length > 16 ? `${s.slice(0, 15).trim()}…` : s;
  }

  function buildDrinkPool() {
    // Alleen alcohol: vatbier, cocktails, wijn per glas, shots.
    // Geen fris, warme, flessen, alcoholvrij, 0,0 of eten.
    // Nooit uitverkocht — outOfStock is de bron van waarheid.
    const ALCOHOL_CATS = new Set(['bieren', 'cocktails', 'wijnen', 'shots']);
    const btns = [...document.querySelectorAll('[data-add]')].filter((btn) => {
      const name = btn.dataset.name || '';
      const cat = btn.dataset.category || '';
      if (!name || outOfStock.has(name)) return false;
      if (!ALCOHOL_CATS.has(cat)) return false;
      if (/\(fles\)$/.test(name)) return false;
      if (/0[,.]0/.test(name)) return false;
      return true;
    });
    const seen = new Set();
    return btns
      .filter((btn) => {
        const n = btn.dataset.name;
        if (seen.has(n)) return false;
        seen.add(n);
        return true;
      })
      .map((btn) => ({
        name: btn.dataset.name,
        price: parseFloat(btn.dataset.price) || 0,
        category: btn.dataset.category || 'cocktails',
        emoji: DICE_EMOJI[btn.dataset.category] || '🍸',
        short: diceShortName(btn.dataset.name),
        btn,
      }));
  }

  function diceFacesAreInStock() {
    return diceFaces.length >= 6 && diceFaces.every((item) => item.name && !outOfStock.has(item.name));
  }

  /** Elk nieuw spel: zes andere drankjes op de zijden */
  function dealNewFaces() {
    const pool = shuffle(buildDrinkPool());
    if (pool.length < 6) return null;
    diceFaces = pool.slice(0, 6);
    return diceFaces;
  }

  /** Als voorraad wijzigt terwijl de steen open is: opnieuw schudden of sluiten */
  function syncDiceWithStock() {
    if (!diceOverlay || diceOverlay.hidden || diceRolling) return;
    if (diceFacesAreInStock()) return;
    if (!dealNewFaces()) {
      showToast('Te weinig drankjes voor een dobbelsteen 🎲', true, 2600);
      closeDice();
      return;
    }
    paintCube();
    if (!diceResult.hidden || diceWinner) {
      resetDiceRound({ newAssortment: false });
      showToast('Dat drankje is net uitverkocht — nieuwe steen', true, 2800);
    }
  }

  function paintCube() {
    if (!diceCube) return;
    diceCube.innerHTML = '';
    diceFaces.forEach((item, i) => {
      const face = document.createElement('div');
      face.className = `dice__face dice__face--${i}`;
      face.innerHTML =
        `<span class="dice__face-emoji">${item.emoji}</span>` +
        `<span class="dice__face-name">${escapeHtml(item.short)}</span>` +
        `<span class="dice__face-price">${formatEuro(item.price)}</span>`;
      diceCube.appendChild(face);
    });
  }

  function applyCubeTransform(x, y, z = 0) {
    diceAngle = { x, y };
    if (diceCube) {
      diceCube.style.transform = `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`;
    }
  }

  function diceClack(pitch = 1) {
    try {
      if (!wheelAudioCtx) {
        wheelAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (wheelAudioCtx.state === 'suspended') wheelAudioCtx.resume().catch(() => {});
      const t = wheelAudioCtx.currentTime;
      const osc = wheelAudioCtx.createOscillator();
      const gain = wheelAudioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220 * pitch, t);
      osc.frequency.exponentialRampToValueAtTime(90 * pitch, t + 0.08);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.09, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
      osc.connect(gain);
      gain.connect(wheelAudioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    } catch {
      /* stil mag ook */
    }
  }

  /** Zware dreun bij de landing */
  function diceThud() {
    try {
      if (!wheelAudioCtx) {
        wheelAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (wheelAudioCtx.state === 'suspended') wheelAudioCtx.resume().catch(() => {});
      const t = wheelAudioCtx.currentTime;
      const osc = wheelAudioCtx.createOscillator();
      const gain = wheelAudioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, t);
      osc.frequency.exponentialRampToValueAtTime(42, t + 0.22);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.22, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      osc.connect(gain);
      gain.connect(wheelAudioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.32);
    } catch {
      /* stil mag ook */
    }
  }

  /** Gouden klingel bij de reveal */
  function diceChime() {
    try {
      if (!wheelAudioCtx) return;
      const notes = [880, 1174.7, 1568];
      notes.forEach((freq, i) => {
        const t = wheelAudioCtx.currentTime + i * 0.09;
        const osc = wheelAudioCtx.createOscillator();
        const gain = wheelAudioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.05, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
        osc.connect(gain);
        gain.connect(wheelAudioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.55);
      });
    } catch {
      /* stil mag ook */
    }
  }

  /** Zwevende sintels in de arena (eenmalig gezaaid) */
  function seedDiceEmbers() {
    if (!diceEmbers || diceEmbers.childElementCount || prefersReducedMotion) return;
    for (let i = 0; i < 18; i++) {
      const s = document.createElement('span');
      s.className = 'dice__ember';
      const size = 2 + Math.random() * 3;
      s.style.width = `${size.toFixed(1)}px`;
      s.style.height = `${size.toFixed(1)}px`;
      s.style.left = `${(Math.random() * 100).toFixed(1)}%`;
      s.style.setProperty('--drift', `${Math.round(Math.random() * 70 - 35)}px`);
      s.style.animationDuration = `${(6 + Math.random() * 9).toFixed(1)}s`;
      s.style.animationDelay = `${(Math.random() * 9).toFixed(1)}s`;
      diceEmbers.appendChild(s);
    }
  }

  /** Trage etalage-rotatie zolang er niet gerold wordt */
  let diceIdleRaf = 0;
  function startDiceIdleDrift() {
    if (prefersReducedMotion) return;
    cancelAnimationFrame(diceIdleRaf);
    let last = performance.now();
    const step = (now) => {
      if (
        !diceOverlay ||
        diceOverlay.hidden ||
        diceRolling ||
        diceGame.classList.contains('dice-game--landed')
      ) {
        diceIdleRaf = 0;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      applyCubeTransform(-16 + Math.sin(now / 1500) * 7, diceAngle.y + dt * 26);
      diceIdleRaf = requestAnimationFrame(step);
    };
    diceIdleRaf = requestAnimationFrame(step);
  }

  /** Flits + schokgolf + camera-shake + dreun bij de landing */
  function diceImpactFX() {
    if (prefersReducedMotion) return;
    if (diceFlash) {
      diceFlash.classList.remove('dice__flash--go');
      void diceFlash.offsetWidth;
      diceFlash.classList.add('dice__flash--go');
    }
    if (diceShockwave) {
      diceShockwave.classList.remove('dice__shockwave--go');
      void diceShockwave.offsetWidth;
      diceShockwave.classList.add('dice__shockwave--go');
    }
    diceGame.classList.remove('dice-game--impact');
    void diceGame.offsetWidth;
    diceGame.classList.add('dice-game--impact');
    diceThud();
    fireConfetti({
      particleCount: 34,
      spread: 100,
      startVelocity: 24,
      scalar: 0.75,
      origin: { y: 0.62 },
      colors: ROCHUS_CONFETTI_COLORS,
    });
  }

  function showDiceResult(item) {
    diceResult.innerHTML =
      `<p class="dice__result-eyebrow">Het lot heeft gesproken</p>` +
      `<p class="dice__result-pay">Jij betaalt</p>` +
      `<p class="dice__result-price">${formatEuro(item.price)}</p>` +
      `<p class="dice__result-name">${escapeHtml(item.name)}</p>` +
      `<p class="dice__result-line">${escapeHtml(pick(DICE_LINES))}</p>` +
      `<div class="dice__result-actions">` +
      `<button type="button" class="dice__result-btn dice__result-btn--take" id="dice-take">Zet op mijn bestelling</button>` +
      `<button type="button" class="dice__result-btn dice__result-btn--again" id="dice-again">Opnieuw rollen</button>` +
      `</div>`;
    if (diceRollBtn) diceRollBtn.hidden = true;
    diceResult.hidden = false;
  }

  function tumbleToFace(faceIdx) {
    return new Promise((resolve) => {
      const settle = DICE_SETTLE[faceIdx];
      const spinsX = 4 + Math.floor(Math.random() * 3);
      const spinsY = 5 + Math.floor(Math.random() * 3);
      const fromX = diceAngle.x;
      const fromY = diceAngle.y;
      const toX = settle.x + spinsX * 360;
      const toY = settle.y + spinsY * 360;
      const duration = prefersReducedMotion ? 0 : 2600;

      if (duration === 0) {
        applyCubeTransform(settle.x, settle.y);
        resolve();
        return;
      }

      if (diceCube) diceCube.style.transition = 'none';
      const start = performance.now();
      let lastTick = 0;
      // Impactmomenten van de worp: grote klap, stuit, laatste tikje
      const bounces = [
        { at: 0.52, height: -130 },
        { at: 0.8, height: -48 },
        { at: 0.95, height: -16 },
      ];
      const hit = new Set();

      const frame = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const x = fromX + (toX - fromX) * eased;
        const y = fromY + (toY - fromY) * eased;
        const z = Math.sin(t * Math.PI * 3) * 20 * (1 - t);
        applyCubeTransform(x, y, z);

        // Werpboog: omhoog, neer, stuiteren
        let hop = 0;
        if (t < 0.52) hop = Math.sin((t / 0.52) * Math.PI) * -130;
        else if (t < 0.8) hop = Math.sin(((t - 0.52) / 0.28) * Math.PI) * -48;
        else if (t < 0.95) hop = Math.sin(((t - 0.8) / 0.15) * Math.PI) * -16;

        // Squash net na elke landing
        const near = (c, w) => Math.max(0, 1 - Math.abs(t - c) / w);
        const squash =
          1 -
          0.14 *
            Math.max(near(0.52, 0.05), near(0.8, 0.045) * 0.7, near(1, 0.06));
        if (diceFloat) {
          diceFloat.style.transform = `translateY(${hop.toFixed(1)}px) scale(${(2 - squash).toFixed(3)}, ${squash.toFixed(3)})`;
        }
        if (diceFloor) {
          const lift = Math.min(0.5, -hop / 260);
          diceFloor.style.transform = `scale(${(1 - lift).toFixed(3)})`;
          diceFloor.style.opacity = `${(1 - lift * 0.9).toFixed(3)}`;
        }

        bounces.forEach((b, i) => {
          if (!hit.has(i) && t >= b.at) {
            hit.add(i);
            diceClack(1.1 - i * 0.2);
            if (navigator.vibrate) navigator.vibrate(12);
          }
        });
        if (t - lastTick > 0.14 && t < 0.5) {
          lastTick = t;
          diceClack(0.85 + Math.random() * 0.4);
        }

        if (t < 1) {
          requestAnimationFrame(frame);
        } else {
          applyCubeTransform(settle.x, settle.y);
          if (diceFloat) diceFloat.style.transform = '';
          if (diceFloor) {
            diceFloor.style.transform = '';
            diceFloor.style.opacity = '';
          }
          resolve();
        }
      };
      requestAnimationFrame(frame);
    });
  }

  async function ensureMotionPermission() {
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof DeviceMotionEvent.requestPermission === 'function' &&
      motionPermission !== 'granted'
    ) {
      try {
        motionPermission = await DeviceMotionEvent.requestPermission();
      } catch {
        motionPermission = 'denied';
      }
    } else if (typeof DeviceMotionEvent !== 'undefined') {
      motionPermission = 'granted';
    }
    return motionPermission === 'granted';
  }

  function onDeviceMotion(ev) {
    if (diceRolling || !diceOverlay || diceOverlay.hidden) return;
    const a = ev.accelerationIncludingGravity;
    if (!a || a.x == null) return;
    const now = Date.now();
    if (lastShake.t) {
      const dx = Math.abs(a.x - lastShake.x);
      const dy = Math.abs(a.y - lastShake.y);
      const dz = Math.abs(a.z - lastShake.z);
      if (dx + dy + dz > 28 && now - lastShake.t > 900) {
        lastShake.t = now;
        rollDice();
      }
    }
    lastShake = { x: a.x, y: a.y, z: a.z, t: lastShake.t || now };
  }

  function startShakeListen() {
    if (shakeListening || prefersReducedMotion) return;
    window.addEventListener('devicemotion', onDeviceMotion, { passive: true });
    shakeListening = true;
  }

  function stopShakeListen() {
    if (!shakeListening) return;
    window.removeEventListener('devicemotion', onDeviceMotion);
    shakeListening = false;
  }

  async function rollDice() {
    if (diceRolling) return;
    // Voorraad kan intussen gewijzigd zijn — nooit uitverkocht meenemen
    if (!diceFacesAreInStock()) {
      if (!dealNewFaces()) {
        showToast('Te weinig drankjes voor een dobbelsteen 🎲', true, 2600);
        closeDice();
        return;
      }
      paintCube();
    }
    if (diceFaces.length < 6) return;
    diceRolling = true;
    diceWinner = null;
    cancelAnimationFrame(diceIdleRaf);
    diceIdleRaf = 0;
    diceGame.classList.remove('dice-game--landed', 'dice-game--impact');
    diceGame.classList.add('dice-game--rolling');
    diceCube
      .querySelectorAll('.dice__face--win')
      .forEach((f) => f.classList.remove('dice__face--win'));
    diceResult.hidden = true;
    diceSub.textContent = 'De steen is onderweg…';
    if (diceRollBtn) {
      diceRollBtn.hidden = false;
      diceRollBtn.disabled = true;
      diceRollBtn.textContent = 'De steen rolt…';
    }
    if (navigator.vibrate) navigator.vibrate([12, 40, 12]);

    const faceIdx = Math.floor(Math.random() * 6);
    await tumbleToFace(faceIdx);

    // Landing: klap eerst, dan pas de uitspraak
    diceImpactFX();
    if (!prefersReducedMotion) {
      await new Promise((r) => setTimeout(r, 320));
    }

    const item = diceFaces[faceIdx];
    if (outOfStock.has(item.name)) {
      diceRolling = false;
      diceGame.classList.remove('dice-game--rolling');
      if (!dealNewFaces()) {
        showToast('Te weinig drankjes voor een dobbelsteen 🎲', true, 2600);
        closeDice();
        return;
      }
      paintCube();
      resetDiceRound({ newAssortment: false });
      showToast('Dat drankje is net uitverkocht — rol opnieuw', true, 2800);
      return;
    }
    diceWinner = item;
    diceGame.classList.remove('dice-game--rolling');
    diceGame.classList.add('dice-game--landed');
    const winFace = diceCube.querySelector(`.dice__face--${faceIdx}`);
    if (winFace) winFace.classList.add('dice__face--win');
    diceSub.textContent = 'Het lot heeft gekozen';
    showDiceResult(item);
    diceChime();
    burstConfetti();
    if (navigator.vibrate) navigator.vibrate([30, 50, 40]);

    diceRolling = false;
  }

  function resetDiceRound({ newAssortment }) {
    diceWinner = null;
    diceGame.classList.remove('dice-game--rolling', 'dice-game--landed', 'dice-game--impact');
    diceResult.hidden = true;
    if (diceFloat) diceFloat.style.transform = '';
    if (diceFloor) {
      diceFloor.style.transform = '';
      diceFloor.style.opacity = '';
    }
    if (newAssortment) {
      if (!dealNewFaces()) {
        showToast('Te weinig drankjes voor een dobbelsteen 🎲', true, 2600);
        return false;
      }
      paintCube();
    }
    applyCubeTransform(-18 + Math.random() * 10, 20 + Math.random() * 40);
    diceSub.textContent = 'Schud je telefoon — of tik op de steen';
    if (diceRollBtn) {
      diceRollBtn.hidden = false;
      diceRollBtn.disabled = false;
      diceRollBtn.textContent = 'Schud of tik — de steen beslist';
    }
    startDiceIdleDrift();
    return true;
  }

  async function openDice() {
    // Verse voorraad ophalen zodat uitverkochte drankjes niet op de steen komen
    await refreshAvailability({ notifyCart: false });
    if (!dealNewFaces()) {
      showToast('Te weinig drankjes voor een dobbelsteen 🎲', true, 2600);
      return;
    }
    paintCube();
    diceOverlay.hidden = false;
    seedDiceEmbers();
    resetDiceRound({ newAssortment: false });
    document.body.style.overflow = 'hidden';
    // iOS vraagt toestemming pas na een user-gesture; open telt als één
    await ensureMotionPermission();
    startShakeListen();
  }

  function closeDice() {
    stopShakeListen();
    cancelAnimationFrame(diceIdleRaf);
    diceIdleRaf = 0;
    diceOverlay.hidden = true;
    diceRolling = false;
    diceGame.classList.remove('dice-game--rolling', 'dice-game--landed', 'dice-game--impact');
    if (!drawer.classList.contains('open')) document.body.style.overflow = '';
  }

  if (diceOverlay) {
    diceCloseBtn.addEventListener('click', closeDice);
    diceOverlay.addEventListener('click', (e) => {
      if (e.target === diceOverlay) closeDice();
    });

    const triggerRoll = async () => {
      await ensureMotionPermission();
      startShakeListen();
      rollDice();
    };

    if (diceRollBtn) diceRollBtn.addEventListener('click', triggerRoll);
    if (diceStage) {
      diceStage.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        if (!diceResult.hidden) return;
        triggerRoll();
      });
    }

    diceResult.addEventListener('click', (e) => {
      if (e.target.closest('#dice-again')) {
        resetDiceRound({ newAssortment: true });
        return;
      }
      if (e.target.closest('#dice-take')) {
        if (!diceWinner) return;
        const item = diceWinner;
        if (outOfStock.has(item.name)) {
          showToast('Uitverkocht — rol opnieuw', true, 2600);
          resetDiceRound({ newAssortment: true });
          return;
        }
        closeDice();
        closeDrawer();
        addItem(item.name, item.price, item.category);
        revealOnMenu(item.btn);
        sparkToFab(item.btn);
        showToast(`${item.name} staat op je bestelling 🎲`, false, 2600);
      }
    });

    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Escape' && !diceOverlay.hidden) {
          closeDice();
          e.stopPropagation();
        }
      },
      true
    );
  }

  if (diceBtn) {
    diceBtn.addEventListener('click', () => {
      if (!prefersReducedMotion) {
        diceBtn.classList.remove('search-bar__dice--rolling');
        void diceBtn.offsetWidth;
        diceBtn.classList.add('search-bar__dice--rolling');
      }
      openDice();
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

  /* ------------------------------------------------------------------ */
  /* Telefoon-juice: dubbeltik-bursts, drink-lore                       */
  /* ------------------------------------------------------------------ */
  const CATEGORY_EMOJI = {
    bieren: '🍺',
    flessen: '🍻',
    alcoholvrij: '🫧',
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
    'Chaudfontaine Plat': 'Plat. Puur. En hardnekkig ontwijkend.',
    'Chaudfontaine Bruis': 'Bruis met trust issues. Vang eerst, drink later.',
    Koffie: 'Koffie op een zomerbar? Iemand heeft morgen een meeting.',
    "Sharing Nacho's": '“Sharing” is juridisch niet bindend.',
    Champagne: 'Voor als de groepschat “GROOT NIEUWS” zegt.',
    Kaasballetjes: 'Volgorde: kaasballetje, slokje, levensverhaal.',
    'Portie gemengd': 'Gemengd door Beestig Goe. Ottenburg weet het.',
    'Friet 105 Burger': 'Echte Friet 105. Wolfshaegen 105, Neerijse.',
    'Hugo Spritz': 'Hugo is de enige man die iedereen hier vertrouwt.',
    Bitterballen: 'Binnenkant: lava. Wacht. Echt. Wacht.',
    'Meter bier': 'Officieel meetinstrument: 100 cm geluk, ±11 glazen. Je gsm-scherm is er 7.',
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
