const test = require('node:test');
const assert = require('node:assert/strict');

const {
  MENU_ITEMS,
  getMenuItem,
  toCents,
  validateAndPrice,
  getPrintMenu,
  getAllergenCard,
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

test('validateAndPrice caps order size against flood orders', () => {
  // Per-line cap
  assert.throws(() => validateAndPrice([{ name: 'Duvel', qty: 25 }]), /Ongeldige/);
  assert.equal(validateAndPrice([{ name: 'Duvel', qty: 24 }]).items[0].qty, 24);

  // Duplicate lines merge, and the merged qty still respects the cap
  const merged = validateAndPrice([
    { name: 'Duvel', qty: 2 },
    { name: 'Duvel', qty: 3 },
  ]);
  assert.equal(merged.items.length, 1);
  assert.equal(merged.items[0].qty, 5);
  assert.throws(
    () =>
      validateAndPrice([
        { name: 'Duvel', qty: 20 },
        { name: 'Duvel', qty: 20 },
      ]),
    /Maximaal 24/
  );

  // Total-qty cap across lines
  assert.throws(
    () =>
      validateAndPrice([
        { name: 'Duvel', qty: 24 },
        { name: 'Corona', qty: 24 },
        { name: 'Fanta', qty: 24 },
      ]),
    /Maximaal 60/
  );

  // Raw payload flood is rejected outright
  const flood = Array.from({ length: 60 }, () => ({ name: 'Fanta', qty: 1 }));
  assert.throws(() => validateAndPrice(flood), /te groot/);
});

test('alcohol-free beers live in their own section', () => {
  const menu = getPrintMenu();
  const av = menu.sections.find((s) => s.id === 'alcoholvrij');
  assert.ok(av, 'alcoholvrij section exists');
  assert.deepEqual(
    av.items.map((i) => i.name),
    ['Stella 0,0', 'Sportzot', 'Tripel Karmeliet 0,0', 'Corona 0,0']
  );

  const flessen = menu.sections.find((s) => s.id === 'flessen');
  assert.deepEqual(
    flessen.items.map((i) => i.name),
    ['Corona', 'Duvel', 'Flying Fish'],
    'flessenbier keeps only alcoholic bottles'
  );
});

test('getPrintMenu collapses wines into glas/fles rows', () => {
  const menu = getPrintMenu();
  const wines = menu.sections.find((s) => s.id === 'wijnen');
  assert.ok(wines, 'wijnen section exists');

  const rose = wines.items.find((i) => i.name === 'Care Solidarity Rosé 2025');
  assert.ok(rose, 'rosé merged into one row');
  assert.equal(rose.glass, 5);
  assert.equal(rose.bottle, 25);

  const cava = wines.items.find((i) => i.name === 'Cava');
  assert.ok(cava, 'cava present');
  assert.equal(cava.glass, 5);
  assert.equal(cava.bottle, 28);

  const prosecco = wines.items.find((i) => i.name.startsWith('Prosecco'));
  assert.ok(prosecco, 'prosecco present');
  assert.equal(prosecco.glass, null);
  assert.equal(prosecco.bottle, 25);

  const champagne = wines.items.find((i) => i.name.startsWith('Champagne'));
  assert.ok(champagne, 'champagne present');
  assert.equal(champagne.glass, null);
  assert.equal(champagne.bottle, 50);
});

test('getPrintMenu omits digital-only water and collapses tea/chips variants', () => {
  const menu = getPrintMenu();
  const ids = menu.sections.map((s) => s.id);
  assert.deepEqual(
    ids,
    ['bieren', 'flessen', 'alcoholvrij', 'fris', 'cocktails', 'wijnen', 'shots', 'warme', 'fingerfood']
  );

  const fris = menu.sections.find((s) => s.id === 'fris');
  assert.ok(!fris.items.find((i) => i.name === 'Water'), 'water stays off paper (digital game only)');

  const warme = menu.sections.find((s) => s.id === 'warme');
  const thee = warme.items.find((i) => i.name === 'Thee');
  assert.ok(thee, 'thee collapsed on print');
  assert.match(thee.note || '', /munt/i);
  assert.equal(warme.items.filter((i) => /Thee/i.test(i.name)).length, 1);

  const bites = menu.sections.find((s) => s.id === 'fingerfood');
  const chips = bites.items.find((i) => i.name === 'Zak Chips');
  assert.ok(chips, 'chips collapsed on print');
  assert.match(chips.note || '', /gestoofde kip/i);
  assert.equal(bites.items.filter((i) => /Chips/i.test(i.name)).length, 1);
});

test('getAllergenCard marks beer gluten and wine sulfite', () => {
  const card = getAllergenCard();
  assert.equal(card.title, 'Allergieën');
  assert.ok(card.disclaimer);

  const drinks = card.sections.find((s) => s.id === 'dranken');
  assert.ok(drinks, 'dranken section');

  const stella = drinks.items.find((i) => i.name === "Stella Artois van 't vat");
  assert.ok(stella);
  assert.deepEqual(stella.allergens, ['gluten']);

  const rose = drinks.items.find((i) => i.name === 'Care Solidarity Rosé 2025');
  assert.ok(rose, 'wine collapsed to base name');
  assert.deepEqual(rose.allergens, ['sulfiet']);
  assert.equal(
    drinks.items.filter((i) => i.name.startsWith('Care Solidarity')).length,
    1,
    'glas/fles not duplicated'
  );

  const aperol = drinks.items.find((i) => i.name === 'Aperol Spritz');
  assert.deepEqual(aperol.allergens, ['sulfiet']);

  assert.ok(!drinks.items.find((i) => i.name === 'Coca-Cola'), 'softs omitted');
  assert.ok(!drinks.items.find((i) => i.name === 'Gin Tonic Bulldog'), 'spirits omitted');
});

test('getAllergenCard lists fingerfood with expected allergens', () => {
  const card = getAllergenCard();
  const food = card.sections.find((s) => s.id === 'fingerfood');
  assert.ok(food);

  const bitterballen = food.items.find((i) => i.name.startsWith('Bitterballen'));
  assert.deepEqual(bitterballen.allergens, ['gluten', 'ei', 'melk', 'selderij']);

  const burger = food.items.find((i) => i.name === 'Friet 105 Burger');
  assert.deepEqual(burger.allergens, ['gluten', 'ei', 'mosterd', 'vis', 'soja', 'selderij']);

  const chipsKip = food.items.find((i) => i.name === 'Zak Chips (gestoofde kip)');
  assert.deepEqual(chipsKip.allergens, ['melk', 'selderij']);
  assert.ok(!food.items.find((i) => i.name === 'Zak Chips (zout)'), 'plain chips omitted');

  const legendKeys = card.legend.map((l) => l.key);
  assert.ok(legendKeys.includes('gluten'));
  assert.ok(legendKeys.includes('sulfiet'));
  assert.ok(legendKeys.includes('vis'));
  assert.ok(legendKeys.includes('mosterd'));
  assert.ok(!legendKeys.includes('sesam'), 'sesam unused after burger label');
  assert.ok(!legendKeys.includes('pinda'), 'unused allergens stay out of legend');
});
