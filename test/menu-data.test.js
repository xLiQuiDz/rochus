const test = require('node:test');
const assert = require('node:assert/strict');

const {
  MENU_ITEMS,
  getMenuItem,
  toCents,
  validateAndPrice,
  getPrintMenu,
} = require('../menu-data');

test('catalog has unique names and sane prices', () => {
  const names = MENU_ITEMS.map((i) => i.name);
  assert.equal(new Set(names).size, names.length, 'duplicate item names');
  for (const item of MENU_ITEMS) {
    assert.ok(Number.isFinite(item.price) && item.price >= 0, `${item.name} price`);
    assert.ok(item.category, `${item.name} category`);
  }
});

test('Water is orderable and free (water-game reward)', () => {
  const water = getMenuItem('Water');
  assert.ok(water, 'Water must exist in the catalog');
  assert.equal(water.price, 0);

  const priced = validateAndPrice([{ name: 'Water', qty: 2 }]);
  assert.equal(priced.total_cents, 0);
  assert.equal(priced.items[0].unit_price_cents, 0);
});

test('validateAndPrice prices lines against the catalog', () => {
  const priced = validateAndPrice([
    { name: "Stella Artois van 't vat", qty: 2 },
    { name: 'Aperol Spritz', qty: 1 },
  ]);
  assert.equal(priced.subtotal_cents, toCents(3) * 2 + toCents(8));
  assert.equal(priced.total_cents, priced.subtotal_cents);
  assert.equal(priced.discount_cents, 0);
});

test('validateAndPrice rejects bad input', () => {
  assert.throws(() => validateAndPrice([]), /leeg/i);
  assert.throws(() => validateAndPrice([{ name: 'Bestaat Niet', qty: 1 }]), /Onbekend/);
  assert.throws(() => validateAndPrice([{ name: 'Duvel', qty: 0 }]), /Ongeldige/);
  assert.throws(() => validateAndPrice([{ name: 'Duvel', qty: 100 }]), /Ongeldige/);
  assert.throws(() => validateAndPrice([{ name: 'Duvel', qty: 1.5 }]), /Ongeldige/);
});

test('getPrintMenu collapses wines into glas/fles rows', () => {
  const menu = getPrintMenu();
  const wines = menu.sections.find((s) => s.id === 'wijnen');
  assert.ok(wines, 'wijnen section exists');

  const rose = wines.items.find((i) => i.name === 'Care Solidarity Rosé 2025');
  assert.ok(rose, 'rosé merged into one row');
  assert.equal(rose.glass, 5);
  assert.equal(rose.bottle, 25);

  const champagne = wines.items.find((i) => i.name.startsWith('Champagne'));
  assert.ok(champagne, 'champagne present');
  assert.equal(champagne.glass, null);
  assert.equal(champagne.bottle, 55);
});

test('getPrintMenu keeps section order and the water joke', () => {
  const menu = getPrintMenu();
  const ids = menu.sections.map((s) => s.id);
  assert.deepEqual(
    ids,
    ['bieren', 'flessen', 'fris', 'cocktails', 'wijnen', 'shots', 'warme', 'fingerfood']
  );

  const fris = menu.sections.find((s) => s.id === 'fris');
  const water = fris.items.find((i) => i.name === 'Water');
  assert.ok(water, 'water on the printed card');
  assert.match(water.note || '', /vangen/);
});
