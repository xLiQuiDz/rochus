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
  { name: 'Flying Fish', price: 4, category: 'flessen' },
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
  { name: 'Hugo Spritz', price: 8, category: 'cocktails' },
  { name: 'Limoncello Spritz', price: 8, category: 'cocktails' },
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
  { name: 'Zak Chips', price: 2.5, category: 'fingerfood' },
  { name: 'Kaasballetjes (6 stuks)', price: 6, category: 'fingerfood' },
  { name: 'Mozzarella Fingers (6 stuks)', price: 6, category: 'fingerfood' },
  { name: 'Garnaalballetjes (6 stuks)', price: 6, category: 'fingerfood' },
  { name: 'Bitterballen (6 stuks)', price: 6, category: 'fingerfood' },
  { name: "Mini-loempia's (6 stuks)", price: 6, category: 'fingerfood' },
  { name: 'Kippen Nuggets (6 stuks)', price: 6, category: 'fingerfood' },
  { name: 'Kipfingers (6 stuks)', price: 6, category: 'fingerfood' },
  { name: "Sharing Nacho's", price: 15, category: 'fingerfood' },
  { name: '105 Sharing Burger', price: 8, category: 'fingerfood' },
];

const byName = new Map(MENU_ITEMS.map((item) => [item.name, item]));

function getMenuItem(name) {
  return byName.get(name) || null;
}

function toCents(euros) {
  return Math.round(Number(euros) * 100);
}

/**
 * Validate client line items against catalog and apply 3+1 fingerfood.
 * @param {{ name: string, qty: number }[]} rawItems
 */
function validateAndPrice(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error('Bestelling is leeg');
  }

  /** @type {{ name: string, qty: number, price: number, category: string, unit_price_cents: number }[]} */
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
      price: catalog.price,
      category: catalog.category,
      unit_price_cents: toCents(catalog.price),
    });
  }

  let subtotalCents = 0;
  const fingerfoodUnits = [];

  for (const line of lines) {
    subtotalCents += line.unit_price_cents * line.qty;
    if (line.category === 'fingerfood') {
      for (let i = 0; i < line.qty; i++) {
        fingerfoodUnits.push({ name: line.name, unit_price_cents: line.unit_price_cents });
      }
    }
  }

  fingerfoodUnits.sort((a, b) => a.unit_price_cents - b.unit_price_cents);
  const freeCount = Math.floor(fingerfoodUnits.length / 4);
  let discountCents = 0;
  /** @type {Map<string, number>} */
  const freeByName = new Map();

  for (let i = 0; i < freeCount; i++) {
    const unit = fingerfoodUnits[i];
    discountCents += unit.unit_price_cents;
    freeByName.set(unit.name, (freeByName.get(unit.name) || 0) + 1);
  }

  const items = lines.map((line) => ({
    name: line.name,
    qty: line.qty,
    category: line.category,
    unit_price_cents: line.unit_price_cents,
    free_qty: freeByName.get(line.name) || 0,
  }));

  return {
    items,
    subtotal_cents: subtotalCents,
    discount_cents: discountCents,
    total_cents: subtotalCents - discountCents,
  };
}

module.exports = {
  MENU_ITEMS,
  getMenuItem,
  toCents,
  validateAndPrice,
};
