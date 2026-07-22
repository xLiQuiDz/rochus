/** Shared menu catalog — server validates prices against this list. */
const MENU_ITEMS = [
  { name: "Stella Artois van 't vat", price: 3, category: 'bieren' },
  { name: "Tripel Karmeliet van 't vat", price: 5, category: 'bieren' },
  { name: "Hoegaarden Rosé van 't vat", price: 4, category: 'bieren' },
  { name: 'Meter bier', price: 30, category: 'bieren' },
  { name: 'Corona', price: 5, category: 'flessen' },
  { name: 'Duvel', price: 5, category: 'flessen' },
  { name: 'Flying Fish', price: 5, category: 'flessen' },
  // Sportzot is 0,4% — verkocht als alcoholvrij
  { name: 'Stella 0,0', price: 3, category: 'alcoholvrij' },
  { name: 'Sportzot', price: 5, category: 'alcoholvrij' },
  { name: 'Tripel Karmeliet 0,0', price: 5, category: 'alcoholvrij' },
  { name: 'Corona 0,0', price: 5, category: 'alcoholvrij' },
  { name: 'Fruitsap (Minute Maid)', price: 3, category: 'fris' },
  { name: 'Coca-Cola', price: 3, category: 'fris' },
  { name: 'Coca-Cola Zero', price: 3, category: 'fris' },
  { name: 'Fanta', price: 3, category: 'fris' },
  { name: 'Lipton Ice Tea', price: 3, category: 'fris' },
  { name: 'Chaudfontaine Plat', price: 3, category: 'fris' },
  { name: 'Chaudfontaine Bruis', price: 3, category: 'fris' },
  { name: 'Royal Bliss Tonic', price: 3, category: 'fris' },
  { name: 'Aperol Spritz', price: 8, category: 'cocktails' },
  { name: 'Gin Tonic Bulldog', price: 9, category: 'cocktails' },
  { name: 'Rum Captain Morgan', price: 9, category: 'cocktails' },
  { name: 'Gin Tonic Tanqueray 0,0', price: 9, category: 'cocktails' },
  { name: 'Hugo Spritz', price: 9, category: 'cocktails' },
  { name: 'Limoncello Spritz', price: 9, category: 'cocktails' },
  { name: 'Vodka Cola', price: 9, category: 'cocktails' },
  { name: 'Vodka Red Bull', price: 10, category: 'cocktails' },
  { name: 'Vodka Orange', price: 9, category: 'cocktails' },
  { name: 'Sangria', price: 6, category: 'cocktails' },
  { name: 'Care Solidarity Rosé 2025 (glas)', price: 5, category: 'wijnen' },
  { name: 'Care Solidarity Rosé 2025 (fles)', price: 25, category: 'wijnen' },
  { name: 'Care Crianza Nativa (glas)', price: 5, category: 'wijnen' },
  { name: 'Care Crianza Nativa (fles)', price: 25, category: 'wijnen' },
  { name: 'Care Garnacha Blanca Nativa (glas)', price: 5, category: 'wijnen' },
  { name: 'Care Garnacha Blanca Nativa (fles)', price: 25, category: 'wijnen' },
  { name: 'Cava (glas)', price: 5, category: 'wijnen' },
  { name: 'Cava (fles)', price: 28, category: 'wijnen' },
  { name: 'Prosecco DOC Frizzante (fles)', price: 25, category: 'wijnen' },
  { name: 'Champagne Merreaux Brut Réserve (fles)', price: 50, category: 'wijnen' },
  { name: 'Tequila', price: 4, category: 'shots' },
  { name: 'Limoncello Bongiorno', price: 4, category: 'shots' },
  { name: 'Rum', price: 4, category: 'shots' },
  { name: 'Koffie', price: 3, category: 'warme' },
  { name: 'Thee (munt)', price: 4, category: 'warme' },
  { name: 'Thee (lemon)', price: 4, category: 'warme' },
  { name: 'Zak Chips (zout)', price: 2, category: 'fingerfood' },
  { name: 'Zak Chips (paprika)', price: 2, category: 'fingerfood' },
  { name: 'Zak Chips (gestoofde kip)', price: 2, category: 'fingerfood' },
  { name: 'Kaasballetjes (6 stuks)', price: 7, category: 'fingerfood' },
  { name: 'Mozzarella Fingers (6 stuks)', price: 7, category: 'fingerfood' },
  { name: 'Bitterballen (6 stuks)', price: 7, category: 'fingerfood' },
  { name: 'Kippen Nuggets (6 stuks)', price: 7, category: 'fingerfood' },
  { name: 'Kipfingers (6 stuks)', price: 7, category: 'fingerfood' },
  { name: "Sharing Nacho's", price: 15, category: 'fingerfood' },
  { name: 'Friet 105 Burger', price: 9, category: 'fingerfood' },
];

/** Variants collapsed to one print row: first key is the display item. */
const PRINT_VARIANT_GROUPS = [
  {
    names: ['Thee (munt)', 'Thee (lemon)'],
    display: 'Thee',
    note: 'munt of lemon',
  },
  {
    names: ['Zak Chips (zout)', 'Zak Chips (paprika)', 'Zak Chips (gestoofde kip)'],
    display: 'Zak Chips',
    note: 'zout · paprika · gestoofde kip',
  },
];

const byName = new Map(MENU_ITEMS.map((item) => [item.name, item]));

function getMenuItem(name) {
  return byName.get(name) || null;
}

function toCents(euros) {
  return Math.round(Number(euros) * 100);
}

/** Ruim genoeg voor de grootste tafel, krap genoeg tegen grap-/floodorders. */
const MAX_LINE_QTY = 24;
const MAX_ORDER_LINES = 25;
const MAX_ORDER_QTY = 60;

/**
 * Validate client line items against catalog and price them.
 * @param {{ name: string, qty: number }[]} rawItems
 */
function validateAndPrice(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error('Bestelling is leeg');
  }
  if (rawItems.length > MAX_ORDER_LINES * 2) {
    throw new Error('Bestelling is te groot — splits ze op');
  }

  /** @type {Map<string, { name: string, qty: number, category: string, unit_price_cents: number }>} */
  const byLineName = new Map();

  for (const raw of rawItems) {
    const name = String(raw.name || '').trim();
    const qty = Number(raw.qty);
    if (!name || !Number.isInteger(qty) || qty < 1 || qty > MAX_LINE_QTY) {
      throw new Error('Ongeldige bestelregel');
    }
    const catalog = getMenuItem(name);
    if (!catalog) {
      throw new Error(`Onbekend item: ${name}`);
    }
    const existing = byLineName.get(catalog.name);
    const nextQty = (existing?.qty || 0) + qty;
    if (nextQty > MAX_LINE_QTY) {
      throw new Error(`Maximaal ${MAX_LINE_QTY}× hetzelfde item per bestelling`);
    }
    byLineName.set(catalog.name, {
      name: catalog.name,
      qty: nextQty,
      category: catalog.category,
      unit_price_cents: toCents(catalog.price),
    });
  }

  const lines = [...byLineName.values()];
  if (lines.length > MAX_ORDER_LINES) {
    throw new Error('Te veel verschillende items in één bestelling — splits ze op');
  }
  const totalQty = lines.reduce((sum, line) => sum + line.qty, 0);
  if (totalQty > MAX_ORDER_QTY) {
    throw new Error(`Maximaal ${MAX_ORDER_QTY} items per bestelling — splits je ronde op`);
  }

  let subtotalCents = 0;
  for (const line of lines) {
    subtotalCents += line.unit_price_cents * line.qty;
  }

  const items = lines.map((line) => ({
    name: line.name,
    qty: line.qty,
    category: line.category,
    unit_price_cents: line.unit_price_cents,
    free_qty: 0,
  }));

  return {
    items,
    subtotal_cents: subtotalCents,
    discount_cents: 0,
    total_cents: subtotalCents,
  };
}

const PRINT_CATEGORY_ORDER = [
  'bieren',
  'flessen',
  'alcoholvrij',
  'fris',
  'cocktails',
  'wijnen',
  'shots',
  'warme',
  'fingerfood',
];

const PRINT_CATEGORY_LABELS = {
  bieren: "Bieren van 't vat",
  flessen: 'Flessenbier',
  alcoholvrij: 'Alcoholvrij',
  fris: 'Frisdranken',
  cocktails: 'Cocktails',
  wijnen: 'Wijnen & bubbels',
  shots: 'Shots',
  warme: 'Warme dranken',
  fingerfood: 'Fingerfood & snacks',
};

const PRINT_NOTES = {
  Corona: '4+2 op Corona Bucket',
};

const PRINT_SIGNATURES = new Set(["Tripel Karmeliet van 't vat"]);

const PRINT_VARIANT_BY_NAME = new Map();
for (const group of PRINT_VARIANT_GROUPS) {
  for (const name of group.names) {
    PRINT_VARIANT_BY_NAME.set(name, group);
  }
}

/**
 * Group catalog into print-ready sections (wines collapsed to glas/fles).
 */
function getPrintMenu() {
  /** @type {Map<string, { id: string, title: string, items: object[] }>} */
  const sections = new Map();
  for (const id of PRINT_CATEGORY_ORDER) {
    sections.set(id, {
      id,
      title: PRINT_CATEGORY_LABELS[id] || id,
      items: [],
    });
  }

  /** @type {Map<string, { name: string, glass: number|null, bottle: number|null }>} */
  const wines = new Map();
  /** @type {Set<string>} */
  const emittedVariantGroups = new Set();

  for (const item of MENU_ITEMS) {
    if (item.category === 'wijnen') {
      const glassMatch = item.name.match(/^(.*) \(glas\)$/);
      const bottleMatch = item.name.match(/^(.*) \(fles\)$/);
      const base = (glassMatch || bottleMatch)?.[1] || item.name;
      if (!wines.has(base)) {
        wines.set(base, { name: base, glass: null, bottle: null });
      }
      const row = wines.get(base);
      if (glassMatch) row.glass = item.price;
      else if (bottleMatch) row.bottle = item.price;
      else row.bottle = item.price;
      continue;
    }

    const variant = PRINT_VARIANT_BY_NAME.get(item.name);
    if (variant) {
      if (emittedVariantGroups.has(variant.display)) continue;
      emittedVariantGroups.add(variant.display);
      const section = sections.get(item.category);
      if (!section) continue;
      section.items.push({
        name: variant.display,
        price: item.price,
        note: variant.note,
        signature: undefined,
      });
      continue;
    }

    const section = sections.get(item.category);
    if (!section) continue;
    section.items.push({
      name: item.name,
      price: item.price,
      note: PRINT_NOTES[item.name] || null,
      signature: PRINT_SIGNATURES.has(item.name) || undefined,
    });
  }

  const wineSection = sections.get('wijnen');
  for (const wine of wines.values()) {
    wineSection.items.push({
      name: wine.name,
      glass: wine.glass,
      bottle: wine.bottle,
      note: null,
    });
  }

  return {
    brand: 'ROCHUS',
    subtitle: 'Summer pop-up bar',
    sections: PRINT_CATEGORY_ORDER.map((id) => sections.get(id)).filter(
      (s) => s && s.items.length > 0
    ),
  };
}

/** EU-14 keys used on the allergen card (NL labels). */
const ALLERGEN_LABELS = {
  gluten: 'Gluten',
  ei: 'Ei',
  melk: 'Melk',
  soja: 'Soja',
  noten: 'Noten',
  pinda: 'Pinda',
  selderij: 'Selderij',
  mosterd: 'Mosterd',
  sesam: 'Sesam',
  sulfiet: 'Sulfiet',
  schaaldieren: 'Schaaldieren',
  vis: 'Vis',
  lupine: 'Lupine',
  weekdieren: 'Weekdieren',
};

const ALLERGEN_ORDER = Object.keys(ALLERGEN_LABELS);

const BEER_ALLERGEN_CATEGORIES = new Set(['bieren', 'flessen', 'alcoholvrij']);

/** Explicit allergens for non-beer/wine items (indicatief). */
const ITEM_ALLERGENS = {
  'Aperol Spritz': ['sulfiet'],
  'Hugo Spritz': ['sulfiet'],
  'Limoncello Spritz': ['sulfiet'],
  Sangria: ['sulfiet'],
  'Zak Chips (gestoofde kip)': ['melk', 'selderij'],
  'Kaasballetjes (6 stuks)': ['gluten', 'ei', 'melk'],
  'Mozzarella Fingers (6 stuks)': ['gluten', 'ei', 'melk'],
  'Bitterballen (6 stuks)': ['gluten', 'ei', 'melk', 'selderij'],
  'Kippen Nuggets (6 stuks)': ['gluten', 'ei', 'soja'],
  'Kipfingers (6 stuks)': ['gluten', 'ei'],
  "Sharing Nacho's": ['melk'],
  'Friet 105 Burger': ['gluten', 'ei', 'mosterd', 'vis', 'soja', 'selderij'],
};

/**
 * @param {{ name: string, category: string }} item
 * @returns {string[]|null} allergen keys, or null if omitted from allergen card
 */
function getItemAllergens(item) {
  if (ITEM_ALLERGENS[item.name]) return ITEM_ALLERGENS[item.name];
  if (BEER_ALLERGEN_CATEGORIES.has(item.category)) return ['gluten'];
  if (item.category === 'wijnen') return ['sulfiet'];
  return null;
}

const ALLERGEN_DISCLAIMER =
  'Indicatief op basis van typische samenstelling. Vraag bij twijfel de bar / check verpakking.';

/**
 * Print-ready allergen card: drinks + fingerfood with EU allergen keys.
 */
function getAllergenCard() {
  /** @type {Map<string, { name: string, allergens: string[] }>} */
  const drinkRows = new Map();
  /** @type {{ name: string, allergens: string[] }[]} */
  const foodRows = [];
  /** @type {Set<string>} */
  const used = new Set();

  for (const item of MENU_ITEMS) {
    const allergens = getItemAllergens(item);
    if (!allergens || allergens.length === 0) continue;

    for (const key of allergens) used.add(key);

    if (item.category === 'fingerfood') {
      foodRows.push({ name: item.name, allergens: [...allergens] });
      continue;
    }

    let displayName = item.name;
    if (item.category === 'wijnen') {
      const glassMatch = item.name.match(/^(.*) \(glas\)$/);
      const bottleMatch = item.name.match(/^(.*) \(fles\)$/);
      displayName = (glassMatch || bottleMatch)?.[1] || item.name;
    }

    if (drinkRows.has(displayName)) continue;
    drinkRows.set(displayName, { name: displayName, allergens: [...allergens] });
  }

  const legend = ALLERGEN_ORDER.filter((key) => used.has(key)).map((key) => ({
    key,
    label: ALLERGEN_LABELS[key],
  }));

  return {
    brand: 'ROCHUS',
    subtitle: 'Summer pop-up bar',
    title: 'Allergieën',
    disclaimer: ALLERGEN_DISCLAIMER,
    legend,
    sections: [
      {
        id: 'dranken',
        title: 'Dranken',
        items: [...drinkRows.values()],
      },
      {
        id: 'fingerfood',
        title: 'Fingerfood & snacks',
        items: foodRows,
      },
    ].filter((s) => s.items.length > 0),
  };
}

module.exports = {
  MENU_ITEMS,
  getMenuItem,
  toCents,
  validateAndPrice,
  getPrintMenu,
  getAllergenCard,
  ALLERGEN_LABELS,
  MAX_LINE_QTY,
  MAX_ORDER_LINES,
  MAX_ORDER_QTY,
};
