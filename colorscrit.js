/* ── Draw wheel ── */
const canvas = document.getElementById('colorWheel');
const ctx = canvas.getContext('2d');
const CX = 100, CY = 100, R = 98;

// Red ko top par laane ke liye -90 degree rotate
for (let deg = 0; deg < 360; deg++) {
  const a0 = (deg - 91) * Math.PI / 180, a1 = (deg - 89) * Math.PI / 180;
  const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, R);
  g.addColorStop(0, '#fff');
  g.addColorStop(1, `hsl(${deg},100%,50%)`);
  ctx.beginPath(); ctx.moveTo(CX, CY);
  ctx.arc(CX, CY, R, a0, a1); ctx.closePath();
  ctx.fillStyle = g; ctx.fill();
}

/* ── Drag dot ── */
const dot = document.getElementById('dot');
const pCirc = document.getElementById('pCircle');
const pHex = document.getElementById('pHex');
let dragging = false;

function pick(cx, cy) {
  const rect = canvas.getBoundingClientRect();
  let x = cx - rect.left;
  let y = cy - rect.top;
  const hw = rect.width / 2, hh = rect.height / 2;
  const dx = x - hw, dy = y - hh, dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > hw - 1) { x = hw + dx / dist * (hw - 1); y = hh + dy / dist * (hh - 1); }
  
  dot.style.left = (x / rect.width * 100) + '%';
  dot.style.top = (y / rect.height * 100) + '%';
  
  const sx = Math.round(x * canvas.width / rect.width);
  const sy = Math.round(y * canvas.height / rect.height);
  const p = ctx.getImageData(sx, sy, 1, 1).data;
  const hex = '#' + [p[0], p[1], p[2]].map(v => v.toString(16).padStart(2, '0')).join('');
  dot.style.background = hex;
  pCirc.style.background = hex;
  pHex.textContent = hex;
  setColor(hex, false); // false = dot ko dubara mat hila
}

/* Mouse events */
canvas.addEventListener('mousedown', e => { dragging = true; pick(e.clientX, e.clientY); });
window.addEventListener('mousemove', e => { if (dragging) pick(e.clientX, e.clientY); });
window.addEventListener('mouseup', () => { dragging = false; });

/* Touch events */
canvas.addEventListener('touchstart', e => {
  e.preventDefault(); dragging = true;
  pick(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  if (dragging) pick(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });
canvas.addEventListener('touchend', () => { dragging = false; });

/* ── Utilities ── */
function h2r(hex) { return { r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) }; }
function r2h(r, g, b) { return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
function r2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0, s = 0, l = (mx + mn) / 2;
  if (d) {
    s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
    switch (mx) { case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break; case g: h = ((b - r) / d + 2) / 6; break; default: h = ((r - g) / d + 4) / 6; }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
function hsl2r(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) };
}
function hsl2h(h, s, l) { const { r, g, b } = hsl2r(h, s, l); return r2h(r, g, b); }
function ldark(hex, p) {
  const { r, g, b } = h2r(hex);
  return p > 0 ? r2h(r + (255 - r) * p / 100, g + (255 - g) * p / 100, b + (255 - b) * p / 100) : r2h(r * (1 + p / 100), g * (1 + p / 100), b * (1 + p / 100));
}

/* ── Table builders ── */
function bShade(hex) {
  const t = document.getElementById('shadeTable');
  t.innerHTML = '<tr><th>%</th><th></th><th>#rrggbb</th></tr>';
  [-100, -90, -80, -70, -60, -50, -40, -30, -20, -10, 0, 10, 20, 30, 50, 70, 90, 100].forEach(p => {
    const c = p === 0 ? hex : ldark(hex, p), tr = document.createElement('tr');
    tr.innerHTML = `<td>${p > 0 ? '+' + p : p}%</td><td class="swatch" style="background:${c}"></td><td>${c}</td>`;
    tr.onclick = () => setColor(c, true); t.appendChild(tr);
  });
}
function bHue(hex) {
  const { r, g, b } = h2r(hex), { s, l } = r2hsl(r, g, b);
  const t = document.getElementById('hueTable');
  t.innerHTML = '<tr class="hdr"><td>Hue</td><td></td><td>#rrggbb</td></tr>';
  for (let h = 0; h <= 360; h += 30) {
    const c = hsl2h(h, s, l), tr = document.createElement('tr');
    tr.innerHTML = `<td>${h}°</td><td class="swatch" style="background:${c}"></td><td>${c}</td>`;
    tr.onclick = () => setColor(c, true); t.appendChild(tr);
  }
}
function bSat(hex) {
  const { r, g, b } = h2r(hex), { h, l } = r2hsl(r, g, b);
  const t = document.getElementById('satTable');
  t.innerHTML = '<tr><th>Sat</th><th></th><th>#rrggbb</th></tr>';
  for (let s = 0; s <= 100; s += 10) {
    const c = hsl2h(h, s, l), tr = document.createElement('tr');
    tr.innerHTML = `<td>${s}%</td><td class="swatch" style="background:${c}"></td><td>${c}</td>`;
    tr.onclick = () => setColor(c, true); t.appendChild(tr);
  }
}
function bLight(hex) {
  const { r, g, b } = h2r(hex), { h, s } = r2hsl(r, g, b);
  const t = document.getElementById('lightTable');
  t.innerHTML = '<tr><th>Light</th><th></th><th>#rrggbb</th></tr>';
  for (let l = 0; l <= 100; l += 10) {
    const c = hsl2h(h, s, l), tr = document.createElement('tr');
    tr.innerHTML = `<td>${l}%</td><td class="swatch" style="background:${c}"></td><td>${c}</td>`;
    tr.onclick = () => setColor(c, true); t.appendChild(tr);
  }
}

/* ── Main setColor ── FIXED */
let cur = '#003300';
function setColor(hex, updateDot = true) {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return;
  cur = hex.toLowerCase();
  const { r, g, b } = h2r(cur), { h, s, l } = r2hsl(r, g, b);
  
  document.getElementById('selectedColorBox').style.background = cur;
  document.getElementById('hexInput').value = cur;
  document.getElementById('html5picker').value = cur;
  document.getElementById('colorInfo').innerHTML = `${cur}<br>rgb(${r},${g},${b})<br>hsl(${h},${s}%,${l}%)`;
  document.getElementById('rS').value = r; document.getElementById('rV').textContent = r;
  document.getElementById('gS').value = g; document.getElementById('gV').textContent = g;
  document.getElementById('bS').value = b; document.getElementById('bV').textContent = b;
  document.getElementById('satSlider').value = s; document.getElementById('satVal').textContent = s + '%';
  document.getElementById('lightSlider').value = l; document.getElementById('lightVal').textContent = l + '%';
  pCirc.style.background = cur; pHex.textContent = cur; dot.style.background = cur;
  
  // FIX: Dot ki position update karo jab niche se color select ho
  if (updateDot) {
    const angle = (h - 90) * Math.PI / 180; // Red top par hai
    const radius = (s / 100) * R; // R = 98
    const dx = radius * Math.cos(angle);
    const dy = radius * Math.sin(angle);
    dot.style.left = (CX + dx) + 'px';
    dot.style.top = (CY + dy) + 'px';
  }
  
  bShade(cur); bHue(cur); bSat(cur); bLight(cur);
}

function applyHex() { let v = document.getElementById('hexInput').value.trim(); if (!v.startsWith('#')) v = '#' + v; setColor(v, true); }
function html5Change(v) { setColor(v, true); }
function setTM(m) { ['White', 'Black', 'Shadow'].forEach(x => document.getElementById('btn' + x).classList.toggle('active', x.toLowerCase() === m)); }
function updateRGB() {
  const r = +document.getElementById('rS').value, g = +document.getElementById('gS').value, b = +document.getElementById('bS').value;
  document.getElementById('rV').textContent = r; document.getElementById('gV').textContent = g; document.getElementById('bV').textContent = b;
  setColor(r2h(r, g, b), true);
}
function updateSliders() {
  const { r, g, b } = h2r(cur), { h } = r2hsl(r, g, b);
  const s = +document.getElementById('satSlider').value, l = +document.getElementById('lightSlider').value;
  document.getElementById('satVal').textContent = s + '%'; document.getElementById('lightVal').textContent = l + '%';
  setColor(hsl2h(h, s, l), true);
}

/* ── Init ── */
setColor('#003300', true);
