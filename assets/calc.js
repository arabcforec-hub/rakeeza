// Rakeeza calculators. Each form has data-calc="<name>"; outputs have data-out="<key>".
(function () {
  const fmt = (n, d = 0) => isFinite(n) ? n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) : '-';
  const up = x => Math.ceil(x - 1e-9);
  const num = (f, k) => parseFloat(f.elements[k] && f.elements[k].value) || 0;

  const CALCS = {
    // Concrete: cement by mix content, sand and gravel by typical site ratios
    concrete(f) {
      const vol = num(f, 'l') * num(f, 'w') * num(f, 'h') * Math.max(1, num(f, 'n'));
      const v = vol * (1 + num(f, 'waste') / 100);
      const cement = num(f, 'mix');           // kg per m3
      const bags = v * cement / 50;
      const sand = v * 0.45, gravel = v * 0.85; // m3 per m3 of concrete, typical
      const water = v * cement * 0.5;          // w/c 0.5
      return { vol: fmt(v, 2), bags: fmt(Math.ceil(bags)), sand: fmt(sand, 2), gravel: fmt(gravel, 2), water: fmt(water) };
    },
    // Blocks: count per m2 from block face + joint
    blocks(f) {
      const area = Math.max(0, num(f, 'len') * num(f, 'ht') - num(f, 'open'));
      const [bl, bh] = f.elements.size.value.split('x').map(Number);
      const j = 0.01;
      const perM2 = 1 / ((bl / 100 + j) * (bh / 100 + j));
      const n = area * perM2 * (1 + num(f, 'waste') / 100);
      const mortar = area * (bl === 40 && f.elements.thick.value === '20' ? 0.022 : 0.015);
      return { area: fmt(area, 2), perm2: fmt(perM2, 1), count: fmt(Math.ceil(n)), mortar: fmt(mortar, 2), bags: fmt(Math.ceil(mortar * 300 / 50)) };
    },
    // Rebar: weight per metre = d^2 / 162
    rebar(f) {
      const d = num(f, 'd'), wpm = d * d / 162;
      const len = num(f, 'len') * num(f, 'count');
      const kg = wpm * len * (1 + num(f, 'waste') / 100);
      const bars = Math.ceil(len / 12);
      return { wpm: fmt(wpm, 3), kg: fmt(kg, 1), ton: fmt(kg / 1000, 3), bars: fmt(bars) };
    },
    // Plaster and paint
    finish(f) {
      const area = Math.max(0, num(f, 'area') - num(f, 'open'));
      const t = num(f, 'thick') / 1000;
      const mortar = area * t * 1.27;              // wet to dry
      const bags = mortar * 350 / 50;
      const sand = mortar * 1.0;
      const paint = area * num(f, 'coats') / Math.max(1, num(f, 'cover'));
      return { area: fmt(area, 2), mortar: fmt(mortar, 2), bags: fmt(Math.ceil(bags)), sand: fmt(sand, 2), paint: fmt(Math.ceil(paint)), cans: fmt(Math.ceil(paint / 18)) };
    },
    // Tiles
    tiles(f) {
      const area = num(f, 'l') * num(f, 'w');
      const [a, b] = f.elements.tile.value.split('x').map(Number);
      const tileM2 = a * b / 10000;
      const total = area * (1 + num(f, 'waste') / 100);
      const count = up(total / tileM2);
      const box = Math.max(0.01, num(f, 'box'));
      const adh = area * 5;                         // kg per m2 typical
      return { area: fmt(area, 2), total: fmt(total, 2), count: fmt(count), boxes: fmt(up(total / box)), adh: fmt(Math.ceil(adh / 20)) };
    },
    // Cost estimate from user rates
    cost(f) {
      const a = num(f, 'area');
      const rows = ['struct', 'finish', 'mep'].map(k => a * num(f, k));
      const sub = rows.reduce((s, x) => s + x, 0);
      const ext = sub * num(f, 'extra') / 100;
      const tot = sub + ext;
      return { struct: fmt(rows[0]), finish: fmt(rows[1]), mep: fmt(rows[2]), extra: fmt(ext), total: fmt(tot), perm2: fmt(a ? tot / a : 0) };
    }
  };

  document.querySelectorAll('form[data-calc]').forEach(f => {
    const run = () => {
      const out = CALCS[f.dataset.calc](f);
      Object.entries(out).forEach(([k, v]) => { const el = f.querySelector(`[data-out="${k}"]`); if (el) el.textContent = v; });
    };
    f.addEventListener('input', run);
    f.addEventListener('submit', e => { e.preventDefault(); run(); });
    run();
  });

  const btn = document.querySelector('.menu-btn'), nav = document.querySelector('nav');
  if (btn) btn.addEventListener('click', () => { nav.classList.toggle('open'); btn.setAttribute('aria-expanded', nav.classList.contains('open')); });
})();
