// Rakeeza site search: loads search.json once and ranks by matched words.
(function () {
  const box = document.getElementById('q'), out = document.getElementById('results'), count = document.getElementById('count');
  if (!box) return;
  const norm = s => (s || '').toLowerCase()
    .replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');
  const base = document.body.dataset.root || '';
  let data = [];
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function run() {
    const q = norm(box.value.trim());
    if (!q) { out.innerHTML = ''; count.textContent = ''; return; }
    const words = q.split(/\s+/).filter(w => w.length > 1);
    const hits = data.map(d => {
      const t = norm(d.t), x = norm(d.t + ' ' + d.d + ' ' + d.k);
      let s = 0;
      for (const w of words) { if (t.includes(w)) s += 3; else if (x.includes(w)) s += 1; else return null; }
      return [s, d];
    }).filter(Boolean).sort((a, b) => b[0] - a[0]).slice(0, 60);
    count.textContent = hits.length ? `${hits.length} نتيجة` : 'لا توجد نتائج، جرّب كلمة أخرى';
    out.innerHTML = hits.map(([, d]) => `<a class="card" href="${base}${d.u}"><span class="tag">${esc(d.y)}</span><h3>${esc(d.t)}</h3><p>${esc(d.d)}</p></a>`).join('');
    try { history.replaceState(null, '', '?q=' + encodeURIComponent(box.value)); } catch (e) {}
  }
  fetch(base + 'search.json').then(r => r.json()).then(j => {
    data = j;
    const q0 = new URLSearchParams(location.search).get('q');
    if (q0) box.value = q0;
    run();
  });
  box.addEventListener('input', run);
})();
