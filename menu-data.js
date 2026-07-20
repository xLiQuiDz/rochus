/** Shared menu catalog — server validates prices against this list. */
const MENU_ITEMS = [
  { name: "Stella Artois van 't vat", price: 3, category: 'bieren' },
  { name: "Tripel Karmeliet van 't vat", price: 5, category: 'bieren' },
  { name: "Hoegaarden Rosé van 't vat", price: 4, category: 'bieren' },
  { name: 'Stella 0,0', price: 3, category: 'flessen' },
  { name: 'Sportzot', price: 5, category: 'flessen' },
  { name: 'Tripel Karmeliet 0,0', price: 5, category: 'flessen' },
  { name: 'Corona', price: 5, category: 'flessen' },
  { name: 'Duvel', price: 5, category: 'flessen' },
  { name: 'Flying Fish', price: 5, category: 'flessen' },
  { name: 'Fruitsap (Minute Maid)', price: 3, category: 'fris' },
  { name: 'Coca-Cola', price: 3, category: 'fris' },
  { name: 'Coca-Cola Zero', price: 3, category: 'fris' },
  { name: 'Fanta', price: 3, category: 'fris' },
  { name: 'Lipton Ice Tea', price: 3, category: 'fris' },
  { name: 'Chaudfontaine Plat', price: 3, category: 'fris' },
  { name: 'Chaudfontaine Bruis', price: 3, category: 'fris' },
  { name: 'Royal Bliss Tonic', price: 3, category: 'fris' },
  // Prijs 0 is bewust: gratis, maar alleen bestelbaar wie het water-spel wint
  { name: 'Water', price: 0, category: 'fris' },
  { name: 'Aperol Spritz', price: 8, category: 'cocktails' },
  { name: 'Gin Tonic Bulldog', price: 9, category: 'cocktails' },
  { name: 'Rum Captain Morgan', price: 9, category: 'cocktails' },
  { name: 'Gin Tonic Tanqueray 0,0', price: 9, category: 'cocktails' },
  { name: 'Hugo Spritz', price: 9, category: 'cocktails' },
  { name: 'Limoncello Spritz', price: 9, category: 'cocktails' },
  { name: 'Care Solidarity Rosé 2025 (glas)', price: 5, category: 'wijnen' },
  { name: 'Care Solidarity Rosé 2025 (fles)', price: 25, category: 'wijnen' },
  { name: 'Care Crianza Nativa (glas)', price: 5, category: 'wijnen' },
  { name: 'Care Crianza Nativa (fles)', price: 25, category: 'wijnen' },
  { name: 'Care Garnacha Blanca Nativa (glas)', price: 5, category: 'wijnen' },
  { name: 'Care Garnacha Blanca Nativa (fles)', price: 25, category: 'wijnen' },
  { name: 'Prosecco DOC Frizzante (glas)', price: 6, category: 'wijnen' },
  { name: 'Prosecco DOC Frizzante (fles)', price: 28, category: 'wijnen' },
  { name: 'Champagne Merreaux Brut Réserve (fles)', price: 55, category: 'wijnen' },
  { name: 'Tequila', price: 4, category: 'shots' },
  { name: 'Limoncello Bongiorno', price: 4, category: 'shots' },
  { name: 'Rum', price: 4, category: 'shots' },
  { name: 'Koffie', price: 3, category: 'warme' },
  { name: 'Thee', price: 4, category: 'warme' },
  { name: 'Zak Chips', price: 2, category: 'fingerfood' },
  { name: 'Kaasballetjes (6 stuks)', price: 6, category: 'fingerfood' },
  { name: 'Mozzarella Fingers (6 stuks)', price: 6, category: 'fingerfood' },
  { name: 'Bitterballen (6 stuks)', price: 6, category: 'fingerfood' },
  { name: 'Kippen Nuggets (6 stuks)', price: 6, category: 'fingerfood' },
  { name: 'Kipfingers (6 stuks)', price: 6, category: 'fingerfood' },
  { name: "Sharing Nacho's", price: 15, category: 'fingerfood' },
  { name: 'Friet 105 Burger', price: 9, category: 'fingerfood' },
];

const byName = new Map(MENU_ITEMS.map((item) => [item.name, item]));

function getMenuItem(name) {
  return byName.get(name) || null;
}

function toCents(euros) {
  return Math.round(Number(euros) * 100);
}

/**
 * Validate client line items against catalog and price them.
 * @param {{ name: string, qty: number }[]} rawItems
 */
function validateAndPrice(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error('Bestelling is leeg');
  }

  /** @type {{ name: string, qty: number, category: string, unit_price_cents: number }[]} */
  const lines = [];

  for (const raw of rawItems) {
    const name = String(raw.name || '').trim();
    const qty = Math.floor(Number(raw.qty));
    if (!name || !Number.isFinite(qty) || qty < 1 || qty > 99) {
      throw new Error('Ongeldige bestelregel');
    }
    const catalog = getMenuItem(name);
    if (!catalog) {
      throw new Error(`Onbekend item: ${name}`);
    }
    lines.push({
      name: catalog.name,
      qty,
      category: catalog.category,
      unit_price_cents: toCents(catalog.price),
    });
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
  fris: 'Frisdranken',
  cocktails: 'Cocktails',
  wijnen: 'Wijnen & bubbels',
  shots: 'Shots',
  warme: 'Warme dranken',
  fingerfood: 'Fingerfood & snacks',
};

const PRINT_NOTES = {
  Corona: '4+2 op Corona Bucket',
  'Zak Chips': 'Paprika',
  Water: 'gratis — als je hem kan vangen',
};

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

    const section = sections.get(item.category);
    if (!section) continue;
    section.items.push({
      name: item.name,
      price: item.price,
      note: PRINT_NOTES[item.name] || null,
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

module.exports = {
  MENU_ITEMS,
  getMenuItem,
  toCents,
  validateAndPrice,
  getPrintMenu,
};
