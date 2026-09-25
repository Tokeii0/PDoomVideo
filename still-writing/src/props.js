// props.js: the recurring sets and props, in world coordinates of a 1920x1080 frame.
//
// THE ROOM (her apartment; the main set). room(t, o) paints the whole room; frame parts of it with camBegin().
//   Layout (world px): wall everywhere · window x 170..830, y 110..610 (sill top y 610) · cork board x 1480..1840, y 90..360
//   desk top surface y 700 from x 640 to 1900 (front edge y 740) · monitor centre (1330, 470), screen ≈ 520x300
//   desk lamp base (905, 700) · sketchbook centre (1060, 712) · soda can (1560, 700) · mug (1680, 700) · plant (1800, 700)
//   chair: she sits at x ≈ 1160 with hero(1160, 905, 30, { sit: true }) · floor from y 900 · 团子's cushion (420, 935)
//   o: { lamp: 0..1 (desk lamp light), night: 0..1 (1 = night, 0 = morning), rain: 0..1, screen: fn(rect, t) or null,
//        screenOn: 0..1, book: 'open'|'closed'|'none', page: fn(rect, t), can: bool, clutter: 0..1, dark: 0..1 }
//   ROOM exposes the key rects after room() runs: ROOM.screen, ROOM.window, ROOM.book, ROOM.lamp, ROOM.seat.
// nightCity(t, o): exterior skyline (layers, lit windows, moon). o: { color: 0..1 grey → pastel, y (horizon), moon, stars, dawn }
// windowView(x, y, w, h, t, o): what the window shows (night city bokeh + rain on the glass; o.dawn 0..1).
// monitor(x, y, w, h, o) → screen rect; o.on 0..1, o.screen(rect) paints the screen content.
// appWindow(x, y, w, h, o): a soft rounded UI window (title dots, panels); o.content(rect) paints inside.
// sketchbook(x, y, w, h, o) → page rect; sodaCan(x, y, s, o) · mug · deskLamp · plant · paperBall · stickyNote · pencil
// sealStamp(x, y, s, o): the stern red 落款 seal creature. sighCloud(x, y, s, o): the grey "算了" cloud creature.
// moonFace(x, y, r, o): the crescent moon with a sleepy face. rainStreaks, bokehField, starField, cloudPuff.

const WALL = '#3B4178', WALL_DK = '#262B57', DESK = '#B98A5E', DESK_DK = '#7F5A3C', GLASS = '#1E2552';
const ROOM = { screen: null, window: null, book: null, lamp: null, seat: [1160, 905] };

function room(t, o = {}) {
  const lamp = clamp(o.lamp ?? 1), night = clamp(o.night ?? 1), dark = clamp(o.dark || 0);
  const wall = mixCol(mixCol('#F2DCC3', WALL, night), '#141833', dark * .6);
  // wall + floor
  paint(rectPts(-600, -400, W + 1200, 1320), { wash: wall, fill: mixCol(wall, PAL.violet, .3), fillOp: 120, bleed: .06, tex: .5, border: .2, ink: null });
  glow(905, 620, 900, PAL.lamp, .42 * lamp);
  paint([[-600, 900 + jit(2)], [W + 600, 900 + jit(2)], [W + 600, H + 500], [-600, H + 500]], { wash: mixCol(mixCol('#C9A27E', '#4A3F6B', night), '#1A1D38', dark * .5), fill: DESK_DK, fillOp: 60, bleed: .05, tex: .6, border: .3, ink: PAL.ink, sw: 1 });
  for (let i = -3; i < 16; i++) inkLine([[i * 150 - 100, 905], [i * 170 - 180, H + 400]], .45, mixCol(DESK_DK, PAL.ink, .3), 'fine', 0, .5);
  // window
  ROOM.window = { x: 170, y: 110, w: 660, h: 500 };
  windowView(170, 110, 660, 500, t, { night, rain: o.rain ?? 1, dawn: o.dawn ?? 0 });
  paint(rectPts(150, 90, 700, 540, 2), { ink: PAL.ink, sw: 1.6 });
  paint(rectPts(150, 90, 700, 22), { wash: '#E9DCCB', ink: PAL.ink, sw: 1 });
  inkLine([[500, 100], [500, 620]], 3.2, '#E9DCCB', 'marker', 0); inkLine([[160, 360], [840, 360]], 3.2, '#E9DCCB', 'marker', 0);
  paint(rectPts(120, 606, 760, 30, 2), { wash: '#E9DCCB', fill: '#C9B8A6', fillOp: 90, tex: .4, ink: PAL.ink, sw: 1.1 });       // sill
  // curtains
  for (const [cx, sd] of [[140, -1], [860, 1]]) {
    const cw = 120, pts = [[cx - cw / 2, 60], [cx + cw / 2, 60]];
    for (let k = 0; k <= 6; k++) pts.push([cx + cw / 2 + Math.sin(k * 1.3 + t * .7) * 6 + sd * k * 3, 60 + k * 110]);
    for (let k = 6; k >= 0; k--) pts.push([cx - cw / 2 + Math.sin(k * 1.1 + t * .6 + 1) * 6 + sd * k * 3, 60 + k * 110]);
    paint(pts, { wash: mixCol('#E8A0A8', '#7A5A8E', night * .6), fill: '#C77C8C', fillOp: 70, bleed: .05, tex: .5, ink: PAL.ink, sw: 1, curv: .3 });
    for (let k = 1; k < 3; k++) inkLine([[cx - cw / 2 + k * cw / 3, 80], [cx - cw / 2 + k * cw / 3 + sd * 10, 720]], .7, mixCol('#C77C8C', PAL.ink, .3), 'fine', .4);
  }
  inkLine([[40, 58], [960, 58]], 3, PAL.woodDk, 'marker', 0);
  // cork board with doodles
  paint(rectPts(1480, 90, 360, 270, 2), { wash: '#C99A67', fill: '#A77A4E', fillOp: 90, tex: .8, ink: PAL.ink, sw: 1.2 });
  const notes = [[1530, 150, PAL.pinkLt, .1], [1640, 130, '#FFF1A8', -.08], [1760, 170, PAL.skyLt, .12], [1560, 270, '#D8F0D2', -.1], [1700, 280, PAL.pinkLt, .06]];
  notes.forEach(([nx, ny, nc, nr], i) => stickyNote(nx, ny, 1, nc, nr + Math.sin(t * 1.5 + i) * .02, i));
  // desk
  paint([[640, 700], [W + 60, 700], [W + 60, 742], [640, 742]], { wash: DESK, fill: DESK_DK, fillOp: 70, bleed: .04, tex: .6, border: .4, ink: PAL.ink, sw: 1.3 });
  paint([[640, 742], [W + 60, 742], [W + 60, 760], [640, 760]], { wash: DESK_DK, ink: PAL.ink, sw: 1 });
  for (const lx of [680, 1860]) paint(rectPts(lx - 16, 758, 32, 150), { wash: DESK_DK, ink: PAL.ink, sw: 1 });
  paint(rectPts(1480, 760, 340, 120, 2), { wash: mixCol(DESK, DESK_DK, .4), ink: PAL.ink, sw: 1 });                      // drawer
  paint(ellPts(1650, 820, 20, 8, 10), { wash: PAL.ink, ink: null });
  // monitor + things on the desk
  ROOM.screen = monitor(1330, 470, 560, 380, { on: o.screenOn ?? 1, screen: o.screen, t });
  ROOM.lamp = [905, 700];
  deskLamp(905, 700, 1, lamp);
  if (o.book !== 'none') ROOM.book = bookFlat(1040, 704, 250, o.book === 'closed');
  if (o.can !== false) sodaCan(1560, 700, 1, { drops: 1 });
  mug(1680, 700, 1, PAL.rose, lamp * .8);
  plant(1810, 700, 1, t);
  if ((o.clutter ?? .5) > .2) { paperBall(760, 704, 1, 1); paperBall(1450, 706, .8, 2); }
  if ((o.clutter ?? .5) > .6) { paperBall(820, 925, 1.2, 3); paperBall(1000, 950, 1, 4); paperBall(620, 960, 1.1, 5); }
  // 团子's cushion
  paint(ellPts(420, 935, 150, 38, 22), { wash: '#E78F9E', fill: '#C96A7C', fillOp: 70, tex: .4, ink: PAL.ink, sw: 1.1 });
  if (dark > 0) flash(dark * .55, '#0E1230');
}

// ---------- the view out of the window ----------
function windowView(x, y, w, h, t, o = {}) {
  const night = clamp(o.night ?? 1), dawn = clamp(o.dawn || 0), rain = clamp(o.rain ?? 1);
  clipTo(rectPts(x, y, w, h), () => {
    const top = mixCol(mixCol('#9CCBEA', GLASS, night), '#F4B394', dawn), bot = mixCol(mixCol('#FBE3C8', '#3B2F6B', night), '#FFD9A8', dawn);
    paint(rectPts(x - 20, y - 20, w + 40, h + 40), { grad: [top, bot, Math.PI / 2], ink: null });
    if (night > .3) for (let i = 0; i < 18; i++) dot(x + hash(i * 3.3) * w, y + hash(i * 7.1) * h * .45, 1.2 + hash(i) * 1.6, PAL.cream, (.4 + .5 * Math.sin(t * 2 + i)) * night * (1 - dawn));
    // far buildings
    for (let i = 0; i < 9; i++) {
      const bx = x - 30 + i * w / 8, bw = w / 8 * (.7 + hash(i * 2.7) * .5), bh = h * (.28 + hash(i * 5.1) * .35);
      paint(rectPts(bx, y + h - bh, bw, bh + 20), { wash: mixCol(mixCol('#B8C3D9', '#2A2F5E', night), '#C9A0A0', dawn * .5), washOp: 235, ink: null });
      for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) if (hash(i * 31 + r * 7 + c) > .55) {
        const on = night > .3 ? .85 : .25; fillRectA(bx + 8 + c * bw / 3.2, y + h - bh + 14 + r * 22, bw / 6, 9, hash(i + r + c) > .5 ? '#FFD98A' : '#FFB3A0', on * (1 - dawn * .6));
      }
    }
    // bokeh: blurry city lights close to the glass
    bokehField(t, { x, y: y + h * .35, w, h: h * .65 }, 16, ['#FFC77A', '#FF9FB0', '#8FE3D8', '#FFE7A8'], { a: .5 * night + .15, seed: 3 });
    if (rain > .01) rainStreaks(t, { x, y, w, h }, Math.round(26 * rain), '#D6E4FF', .45 * rain);
    // glass sheen
    paint([[x + w * .06, y + 10], [x + w * .22, y + 10], [x + w * .1, y + h * .55], [x + w * .02, y + h * .55]], { wash: '#FFFFFF', washOp: 18, ink: null });
  });
}
// streaks and trickling drops on glass (or falling rain when o.fall)
function rainStreaks(t, r, n, col = '#D6E4FF', a = .45, o = {}) {
  for (let i = 0; i < n; i++) {
    const sp = o.fall ? 900 + hash(i) * 500 : 60 + hash(i * 1.3) * 90, len = o.fall ? 40 + hash(i * 2) * 50 : 14 + hash(i * 4.1) * 30;
    const x = r.x + hash(i * 9.7) * r.w, y = r.y + ((hash(i * 5.3) * (r.h + 200) + t * sp) % (r.h + 200)) - 100;
    if (o.fall) inkLine([[x, y], [x - len * .15, y + len]], .6, col, 'fine', 0, a);
    else { inkLine([[x, y - len * 2.5], [x + Math.sin(y * .05) * 2, y]], .5, col, 'fine', .4, a * .5); dot(x, y, 2.4 + hash(i) * 2, col, a); dot(x - .8, y - .8, 1, '#FFFFFF', a); }
  }
}
function bokehField(t, r, n, pal, o = {}) {
  const sd = o.seed || 0, a = o.a ?? .5;
  for (let i = 0; i < n; i++) {
    const k = i + sd * 17, x = r.x + (hash(k * 3.1) * r.w + Math.sin(t * .2 + k) * 14 * (o.drift ?? 1)), y = r.y + hash(k * 7.7) * r.h + Math.cos(t * .17 + k) * 8 * (o.drift ?? 1);
    bokeh(x, y, (o.r || 26) * (.5 + hash(k * 1.9)), pal[i % pal.length], a * (.55 + .45 * Math.sin(t * .8 + k * 2)));
  }
}
function starField(t, r, n, o = {}) {
  for (let i = 0; i < n; i++) {
    const x = r.x + hash(i * 3.7 + (o.seed || 0)) * r.w, y = r.y + hash(i * 8.3 + (o.seed || 0)) * r.h, tw = .5 + .5 * Math.sin(t * (1.5 + hash(i) * 2) + i);
    if (hash(i * 1.1) > .8) paint(starPts(x, y, 5 + tw * 4, .35, 4, 0), { wash: PAL.cream, washOp: 200 * tw, ink: null });
    else dot(x, y, 1.3 + hash(i) * 1.5, PAL.cream, (.3 + .7 * tw) * (o.a ?? 1));
  }
}

// ---------- exterior skyline ----------
// nightCity(t, o): three layers of buildings across [o.x0, o.x1] standing on y = o.y (default 900). o.color 0..1 turns
// the cold grey-blue city into pastel colours (for the "paint softness onto cold days" shots); o.paint = fn(x) → 0..1 per x.
function nightCity(t, o = {}) {
  const x0 = o.x0 ?? -200, x1 = o.x1 ?? W + 200, gy = o.y ?? 900, colK = o.color || 0, pk = o.paint || (() => colK);
  const pastel = ['#F7B6C8', '#FFD9A0', '#BFE3D0', '#C9D8F5', '#E3C8F0', '#FFE3B8'];
  const layers = [[.55, '#394079', .45, 260], [.8, '#2C3266', .7, 210], [1, '#20264F', 1, 170]];
  layers.forEach(([hk, base, dim, bw0], li) => {
    let x = x0 - 40 + hash(li * 13) * 60, i = 0;
    while (x < x1) {
      const bw = bw0 * (.6 + hash(li * 100 + i * 3.1) * .7), bh = (180 + hash(li * 50 + i * 7.3) * 420) * hk, k = clamp(pk(x + bw / 2));
      const col = mixCol(base, pastel[(i + li) % pastel.length], k * (.55 + .25 * li / 2));
      const roof = hash(li * 70 + i) > .7 ? [[x + bw * .5, gy - bh - 50 * hk]] : [];
      paint([[x, gy + 10], [x, gy - bh], ...roof, [x + bw, gy - bh], [x + bw, gy + 10]], { wash: col, fill: mixCol(col, PAL.ink, .2), fillOp: 60, bleed: .03, tex: .5, border: .3, ink: li === 2 ? PAL.ink : null, sw: .9 });
      const cols = Math.max(1, Math.floor(bw / 34)), rows = Math.floor(bh / 44);
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const hsh = hash(li * 999 + i * 97 + r * 13 + c * 7); if (hsh < .45) continue;
        const lit = (o.lit ?? .7) > hash(hsh * 50) ? 1 : 0;
        fillRectA(x + 10 + c * (bw - 16) / cols, gy - bh + 18 + r * 44, (bw - 16) / cols * .55, 18, lit ? (k > .5 ? '#FFE3A8' : '#FFD98A') : mixCol(col, PAL.ink, .25), lit ? .85 * dim : .6);
      }
      x += bw + 6 + hash(li * 30 + i) * 30; i++;
    }
  });
}

// ---------- screens and windows ----------
function monitor(cx, cy, w, h, o = {}) {
  const x = cx - w / 2, y = cy - h / 2, sw = clamp(w / 400, .8, 2), on = clamp(o.on ?? 1);
  if (on > 0) glow(cx, cy, w * .95, PAL.screen, .22 * on);
  paint([[cx - w * .09, y + h - 4], [cx + w * .09, y + h - 4], [cx + w * .07, y + h + 44], [cx - w * .07, y + h + 44]], { wash: '#D9CCBA', ink: PAL.ink, sw: sw * .8 });
  paint(rrPts(cx - w * .2, y + h + 38, w * .4, 18, 8), { wash: '#CDBFAC', ink: PAL.ink, sw: sw * .8 });
  paint(rrPts(x, y, w, h, 18, 1.5), { wash: '#F1E6D6', fill: '#CDBFAC', fillOp: 80, bleed: .04, tex: .5, border: .4, ink: PAL.ink, sw });
  const s = { x: x + 18, y: y + 18, w: w - 36, h: h - 50 };
  paint(rrPts(s.x, s.y, s.w, s.h, 8), { wash: mixCol('#22284F', '#EAF4F2', on), ink: PAL.ink, sw: sw * .8 });
  if (on > .02 && o.screen) { X.save(); X.clip(pathOf(rrPts(s.x, s.y, s.w, s.h, 8))); fadeIn(on, () => o.screen(s, o.t ?? T)); X.restore(); }
  paint([[s.x + s.w * .05, s.y + 6], [s.x + s.w * .2, s.y + 6], [s.x + s.w * .08, s.y + s.h * .45], [s.x + 6, s.y + s.h * .45]], { wash: '#FFFFFF', washOp: 22, ink: null });
  paint(ellPts(cx, y + h - 16, 5, 5, 8), { wash: on > .5 ? PAL.sage : PAL.gray, ink: null });
  return s;
}
// soft rounded UI window: title bar with three dots, optional side panel; o.content(rect) paints inside
function appWindow(x, y, w, h, o = {}) {
  const sw = o.sw ?? 1;
  paint(rrPts(x + 8, y + 10, w, h, 22), { wash: PAL.ink, washOp: 50, ink: null });
  paint(rrPts(x, y, w, h, 22), { wash: o.bg || '#FFF8F1', ink: PAL.ink, sw });
  paint(rrPts(x, y, w, 46, 22).map(p => [p[0], Math.min(p[1], y + 46)]), { wash: o.bar || PAL.pinkLt, ink: null });
  inkLine([[x + 4, y + 46], [x + w - 4, y + 46]], sw * .7, PAL.ink, 'fine', 0);
  ['#EE8A8A', '#F6C85F', '#8FD19E'].forEach((c, i) => paint(ellPts(x + 28 + i * 26, y + 23, 8, 8, 10), { wash: c, ink: PAL.ink, sw: .5 }));
  const r = { x: x + 16, y: y + 60, w: w - 32, h: h - 76 };
  if (o.content) { X.save(); X.clip(pathOf(rectPts(r.x, r.y, r.w, r.h))); o.content(r); X.restore(); }
  return r;
}

// ---------- desk props ----------
function deskLamp(x, y, s = 1, on = 1) {
  if (on > .01) {
    paint([[x + 70 * s, y - 250 * s], [x + 135 * s, y - 262 * s], [x + 330 * s, y + 4], [x - 40 * s, y + 4]], { fill: PAL.lamp, fillOp: 70 * on, bleed: .2, tex: .2, border: 0, ink: null });
    glow(x + 110 * s, y - 225 * s, 120 * s, '#FFE3A0', .55 * on);
  }
  paint(ellPts(x, y - 8 * s, 60 * s, 15 * s, 16), { wash: '#E7D8C2', ink: PAL.ink, sw: .9 });
  inkLine([[x, y - 10 * s], [x - 30 * s, y - 160 * s], [x + 80 * s, y - 255 * s]], 3 * s, '#E7D8C2', 'marker', 0);
  inkLine([[x, y - 10 * s], [x - 30 * s, y - 160 * s], [x + 80 * s, y - 255 * s]], .7 * s, PAL.ink, 'fine', 0);
  paint(ellPts(x - 30 * s, y - 160 * s, 8 * s, 8 * s, 8), { wash: PAL.ink, ink: null });
  push(); translate(x + 105 * s, y - 250 * s); rotate(.6);
  paint([[-34 * s, -26 * s], [34 * s, -26 * s], [58 * s, 30 * s], [-58 * s, 30 * s]], { wash: '#F6C8A0', fill: '#E0A070', fillOp: 60, tex: .4, ink: PAL.ink, sw: .9, curv: .2 });
  paint(ellPts(0, 30 * s, 26 * s, 9 * s, 12), { wash: on > .3 ? '#FFF6D6' : '#8C8272', ink: null });
  pop();
}
function sketchbook(cx, cy, w, h, o = {}) {
  const x = cx - w / 2, y = cy - h / 2;
  paint(rrPts(x - 6, y - 4, w + 12, h + 10, 6), { wash: '#6F86B8', ink: PAL.ink, sw: 1 });
  if (o.closed) {
    paint(rrPts(x, y - 8, w, h, 6), { wash: '#8DA3D1', fill: '#6F86B8', fillOp: 80, tex: .5, ink: PAL.ink, sw: 1 });
    paint(starPts(cx, cy - 8, 20, .45, 5), { wash: '#F6C85F', ink: PAL.ink, sw: .6 });
    return { x, y, w, h };
  }
  paint(rrPts(x, y - 8, w, h, 4), { wash: '#FFFBF2', ink: PAL.ink, sw: .9 });
  inkLine([[cx, y - 8], [cx, y + h - 8]], .8, PAL.ink, 'fine', 0);
  for (let i = 0; i < 9; i++) paint(ellPts(cx, y - 2 + i * h / 9, 5, 3, 6), { ink: PAL.ink, sw: .4 });
  const r = { x: x + 8, y: y, w: w - 16, h: h - 16 };
  if (o.page) o.page(r, o.t ?? T);
  return r;
}
function sodaCan(x, y, s = 1, o = {}) {
  const sw = clamp(s, .5, 2);
  push(); translate(x, y); if (o.rot) rotate(o.rot); scale(s);
  paint(rrPts(-24, -86, 48, 86, 10), { wash: '#F8B99A', fill: '#EE8A6D', fillOp: 90, bleed: .03, tex: .4, ink: PAL.ink, sw });
  paint(rectPts(-24, -60, 48, 26), { wash: '#FFF3E6', ink: null });
  paint(ellPts(0, -47, 9, 9, 10), { wash: '#F6A0B8', ink: null });                                        // peach logo
  inkLine([[-2, -56], [2, -60]], .5, PAL.sage, 'fine', 0);
  paint(ellPts(0, -86, 24, 6, 14), { wash: '#DADCE6', ink: PAL.ink, sw: sw * .7 });
  paint(rrPts(-6, -90, 12, 6, 3), { wash: '#B8BCCB', ink: PAL.ink, sw: sw * .4 });
  inkLine([[-15, -80], [-15, -8]], 1.4, '#FFFFFF', 'marker', 0, .5);
  const d = o.drops ?? 1;
  for (let i = 0; i < 9 * d; i++) { const dx = -18 + hash(i * 3.3) * 36, dy = -78 + hash(i * 5.1) * 70; paint(ellPts(dx, dy, 2.2 + hash(i) * 1.8, 2.8 + hash(i) * 2, 8), { wash: '#FFFFFF', washOp: 140, ink: '#9FB8D6', sw: .25 }); }
  pop();
}
function mug(x, y, s = 1, col = PAL.rose, steam = 0) {
  push(); translate(x, y); scale(s);
  paint(ellPts(28, -30, 13, 14, 12), { ink: PAL.ink, sw: 1.2 });
  paint(rrPts(-26, -56, 52, 56, 9), { wash: col, fill: PAL.ink, fillOp: 25, tex: .5, ink: PAL.ink, sw: 1 });
  paint(ellPts(0, -54, 22, 5, 12), { wash: '#6A4A3A', ink: null });
  if (steam > .02) for (const k of [-9, 8]) inkLine([[k, -64], [k + 9 * Math.sin(T * 3 + k), -84], [k - 5, -106]], .7, PAL.cream, 'fine', .6, steam);
  pop();
}
function plant(x, y, s = 1, t = T) {
  push(); translate(x, y); scale(s);
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .45 + Math.sin(t * 1.2 + i) * .05; push(); translate(0, -46); rotate(a + Math.PI / 2); paint(ellPts(0, -34, 13, 34, 12), { wash: PAL.sage, fill: '#5E8F6A', fillOp: 80, tex: .4, ink: PAL.ink, sw: .8 }); pop(); }
  paint([[-26, -50], [26, -50], [20, 0], [-20, 0]], { wash: '#E8A38C', ink: PAL.ink, sw: 1 });
  pop();
}
function paperBall(x, y, s = 1, seed = 0) {
  const pts = []; for (let i = 0; i < 11; i++) { const a = i / 11 * TAU, r = 16 * s * (.8 + .35 * hash(seed * 11 + i)); pts.push([x + Math.cos(a) * r, y - 15 * s + Math.sin(a) * r]); }
  paint(pts, { wash: '#FFFBF2', fill: PAL.grayLt, fillOp: 60, tex: .3, ink: PAL.ink, sw: .7 * clamp(s, .6, 1.6) });
  for (let k = 0; k < 3; k++) inkLine([[x + (hash(seed + k) - .5) * 20 * s, y - 15 * s + (hash(seed + k + 3) - .5) * 20 * s], [x + (hash(seed + k + 6) - .5) * 20 * s, y - 15 * s + (hash(seed + k + 9) - .5) * 20 * s]], .4, PAL.gray, 'fine', 0);
}
function stickyNote(x, y, s = 1, col = '#FFF1A8', rot = 0, doodle = 0) {
  push(); translate(x, y); rotate(rot); scale(s);
  paint(rectPts(-44, -40, 88, 84, 1), { wash: col, fill: mixCol(col, PAL.ink, .15), fillOp: 50, tex: .4, ink: PAL.ink, sw: .7 });
  paint(ellPts(0, -36, 5, 5, 8), { wash: '#E2557F', ink: null });
  const d = doodle % 5;
  if (d === 0) paint(heartPts(0, 4, 16), { ink: '#E2557F', sw: .6 });
  else if (d === 1) paint(starPts(0, 4, 20, .45, 5), { ink: PAL.ochre, sw: .6 });
  else if (d === 2) { for (let k = 0; k < 3; k++) inkLine([[-28, -14 + k * 14], [28 - k * 12, -14 + k * 14]], .45, PAL.steel, 'pencil', 0); }
  else if (d === 3) { paint(ellPts(0, 4, 18, 16, 14), { ink: PAL.ink, sw: .5 }); for (const sd of [-1, 1]) dot(sd * 6, 2, 1.8, PAL.ink); inkLine([[-5, 10], [0, 13], [5, 10]], .4, PAL.ink, 'fine', .5); }
  else inkLine([[-26, 12], [-8, -8], [8, 8], [26, -12]], .5, PAL.teal, 'pencil', .4);
  pop();
}
function pencil(x, y, s = 1, rot = 0, col = '#F6C85F') {
  push(); translate(x, y); rotate(rot); scale(s);
  paint(rectPts(-10, -120, 20, 100), { wash: col, fill: mixCol(col, PAL.ink, .2), fillOp: 50, tex: .3, ink: PAL.ink, sw: .9 });
  paint(rectPts(-10, -140, 20, 22), { wash: PAL.pink, ink: PAL.ink, sw: .8 });
  paint(rectPts(-11, -124, 22, 8), { wash: '#C9CED6', ink: PAL.ink, sw: .6 });
  paint([[-10, -20], [10, -20], [0, 8]], { wash: '#F3D6B0', ink: PAL.ink, sw: .8 });
  paint([[-3.5, -2], [3.5, -2], [0, 8]], { wash: PAL.ink, ink: null });
  pop();
}

// ---------- recurring motifs ----------
// the 落款 seal: a pale jade seal with a round knob, red-inked face and a stern little face; s = 1 is ~230 px tall.
// o.face: 'stern' | 'dizzy' | 'sad'. sealPrint(x, y, s) paints the red square imprint it leaves.
function sealStamp(x, y, s = 1, o = {}) {
  const sw = clamp(1.3 * s, .5, 2.4), J = '#CFE6D2', J_DK = '#8FB89A';
  push(); translate(x, y); rotate(o.rot || 0); scale(s * (1 + (o.sq || 0) * .4), s * (1 - (o.sq || 0)));
  paint(rrPts(-62, -26, 124, 26, 5), { wash: '#C8324A', fill: '#9E2238', fillOp: 90, tex: .5, ink: PAL.ink, sw });          // inked face
  paint(rrPts(-58, -170, 116, 146, 14), { wash: J, fill: J_DK, fillOp: 90, bleed: .05, tex: .7, border: .5, ink: PAL.ink, sw });
  paint(ellPts(0, -186, 40, 30, 18), { wash: J, fill: J_DK, fillOp: 90, tex: .6, ink: PAL.ink, sw });                          // knob
  paint(rectPts(-20, -176, 40, 12), { wash: J_DK, ink: null });
  inkLine([[-40, -150], [-44, -60]], sw * 1.4, '#FFFFFF', 'marker', 0, .5);
  const f = o.face || 'stern';
  if (f === 'dizzy') for (const sd of [-1, 1]) { const sp = []; for (let k = 0; k < 12; k++) { const a = k * .8 + T * 6 * sd, r = k * .9; sp.push([sd * 22 + Math.cos(a) * r, -104 + Math.sin(a) * r]); } inkLine(sp, sw * .5, PAL.ink, 'fine', .6); }
  else for (const sd of [-1, 1]) { paint(ellPts(sd * 22, -102, 6, 8, 8), { wash: PAL.ink, ink: null }); inkLine([[sd * 34, -124], [sd * 12, f === 'sad' ? -124 : -116]], sw * .8, PAL.ink, 'ink', 0); }
  inkLine(f === 'sad' ? [[-12, -74], [0, -80], [12, -74]] : [[-12, -78], [12, -78]], sw * .7, PAL.ink, 'ink', .4);
  paint(ellPts(-36, -86, 9, 5, 8), { fill: CHEEK, fillOp: 120, ink: null }); paint(ellPts(36, -86, 9, 5, 8), { fill: CHEEK, fillOp: 120, ink: null });
  pop();
}
function sealPrint(x, y, s = 1, k = 1, ch = '完') {
  if (k <= .01) return;
  paint(rrPts(x - 55 * s, y - 55 * s, 110 * s, 110 * s, 8 * s), { wash: '#C8324A', washOp: 220 * k, fill: '#9E2238', fillOp: 80 * k, tex: .8, ink: null });
  letter(ch, x, y + 4 * s, 70 * s, '#FFF3E6', { font: 'brush', ink: false, alpha: k });
}
// the grey "算了" sigh cloud; o.mood 'gloom' | 'pop' (0..1 bursting) ; s = 1 is ~260 px wide
function sighCloud(x, y, s = 1, o = {}) {
  const pk = o.pop || 0; if (pk >= 1) return;
  push(); translate(x, y + Math.sin(T * 1.6) * 6 * s); scale(s * (1 + pk * .5));
  fadeIn(1 - pk, () => {
    paint(cloudPts(0, 0, 260, 70, 5, 6), { wash: '#9A9CAE', fill: '#6F7288', fillOp: 90, bleed: .1, tex: .5, ink: PAL.ink, sw: 1.1, curv: .4 });
    for (const sd of [-1, 1]) inkLine([[sd * 38 - 12, -20], [sd * 38 + 12, -14]], 1.1, PAL.ink, 'ink', 0);
    inkLine([[-14, 8], [0, 2], [14, 8]], 1, PAL.ink, 'ink', .5);
    if (o.rain !== false) for (let i = 0; i < 5; i++) { const ry = ((T * 160 + i * 37) % 90); inkLine([[-80 + i * 40, 30 + ry], [-84 + i * 40, 44 + ry]], .8, '#8FA3C8', 'fine', 0); }
  });
  pop();
}
// crescent moon with a sleepy face; r = radius
function moonFace(x, y, r, o = {}) {
  glow(x, y, r * 2.4, '#FFF1C2', .35);
  const pts = [];
  for (let i = 0; i <= 20; i++) { const a = -Math.PI * .5 + i / 20 * Math.PI; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
  for (let i = 20; i >= 0; i--) { const a = -Math.PI * .5 + i / 20 * Math.PI; pts.push([x + r * .35 + Math.cos(a) * r * .72 - r * .5, y + Math.sin(a) * r * .9]); }
  push(); translate(x, y); rotate(o.rot ?? -.35); translate(-x, -y);
  paint(pts, { wash: '#FFE9A8', fill: '#F6C85F', fillOp: 70, bleed: .05, tex: .4, ink: PAL.ink, sw: clamp(r / 90, .6, 2), curv: .2 });
  const ex = x + r * .62, ey = y - r * .1;
  if (o.eyes === 'open') paint(ellPts(ex, ey, r * .05, r * .07, 8), { wash: PAL.ink, ink: null });
  else inkLine([[ex - r * .08, ey], [ex, ey + r * .05], [ex + r * .07, ey]], clamp(r / 110, .5, 1.6), PAL.ink, 'ink', .5);
  inkLine([[ex - r * .02, ey + r * .22], [ex + r * .05, ey + r * .26], [ex + r * .1, ey + r * .21]], clamp(r / 120, .5, 1.4), PAL.ink, 'ink', .5);
  paint(ellPts(ex + r * .02, ey + r * .12, r * .06, r * .035, 8), { fill: CHEEK, fillOp: 160, bleed: .2, ink: null });
  pop();
}
function cloudPuff(x, y, s = 1, col = '#FFFFFF', o = {}) {
  paint(cloudPts(x, y, 240 * s, 60 * s, o.seed || 1, 6), { wash: col, washOp: o.op ?? 235, fill: o.shade || PAL.skyLt, fillOp: 90, bleed: .08, tex: .3, ink: o.ink === false ? null : PAL.ink, sw: clamp(s, .5, 1.4), curv: .45 });
}

// an open (or closed) sketchbook lying on the desk, seen from the room's eye level
function bookFlat(cx, y, w, closed = false) {
  const h = 22, pts = [[cx - w / 2, y], [cx + w / 2, y], [cx + w / 2 - 26, y - h], [cx - w / 2 + 26, y - h]];
  paint(pts.map(p => [p[0], p[1] + 5]), { wash: '#6F86B8', ink: PAL.ink, sw: .9 });
  paint(pts, { wash: closed ? '#8DA3D1' : '#FFFBF2', ink: PAL.ink, sw: .9 });
  if (!closed) { inkLine([[cx, y], [cx, y - h]], .7, PAL.ink, 'fine', 0); inkLine([[cx - w * .32, y - 9], [cx - w * .12, y - 12]], .5, PAL.steel, 'pencil', 0); inkLine([[cx + w * .1, y - 10], [cx + w * .3, y - 8]], .5, PAL.steel, 'pencil', 0); }
  return { x: cx - w / 2, y: y - h, w, h };
}
// office chair on the floor at (x, floorY). o.seat = seat height in units (default 2.6). A sitting hero goes at
// hero(x, floorY - (seat - 1.5) * s, s, { sit: true }). o.backOnly draws only the chair back (paint it AFTER a back-view
// hero so it hides her torso); o.back: false omits the back; o.col colour.
// seatedAtDesk(t, o): the standard pose in the room view — her back to us, in the chair, facing the monitor.
function seatedAtDesk(t, o = {}) {
  const x = o.x ?? 1160, fy = o.floor ?? 985, s = o.s ?? 34, seat = 3.2;
  chair(x, fy, s, { seat, back: false });
  hero(x, fy - (seat - 1.5) * s, s, { sit: true, back: true, aL: .35, aR: .35, ...move(o.move || 'type', t), ...o.hero });
  chair(x, fy, s, { seat, backOnly: true });
}
function chair(x, floorY, s, o = {}) {
  const col = o.col || '#8E7BB8', sw = clamp(s / 20, .4, 2), seatY = floorY - (o.seat ?? 2.6) * s;
  if (!o.backOnly) {
    paint(ellPts(x, floorY + .05 * s, 2.6 * s, .45 * s, 16), { fill: PAL.ink, fillOp: 70, bleed: .2, tex: .2, ink: null });
    paint(rectPts(x - .18 * s, seatY, .36 * s, floorY - seatY - .4 * s), { wash: '#6D6A80', ink: PAL.ink, sw: sw * .6 });
    for (const dx of [-1.9, -.8, .8, 1.9]) { inkLine([[x, floorY - .5 * s], [x + dx * s, floorY - .15 * s]], sw * 1.1, PAL.ink, 'ink', 0); dot(x + dx * s, floorY - .1 * s, .22 * s, PAL.ink); }
    paint(rrPts(x - 2.1 * s, seatY - .35 * s, 4.2 * s, .75 * s, .35 * s), { wash: col, fill: mixCol(col, PAL.ink, .3), fillOp: 60, tex: .4, ink: PAL.ink, sw });
  }
  if (o.back !== false) paint(rrPts(x - 1.9 * s, seatY - 4.1 * s, 3.8 * s, 4.0 * s, 1.1 * s), { wash: col, fill: mixCol(col, PAL.ink, .3), fillOp: 70, bleed: .05, tex: .5, border: .3, ink: PAL.ink, sw });
}
// THE REVERSE ANGLE: looking back into the room from behind the monitor. She sits facing the camera behind the desk.
//   Layout: wall + fairy lights · bookshelf x 110..520 · door x 690..960 · wall clock (1500, 230) r 72 · bed x 1240..1990
//   desk surface in the foreground from y 880 down · her seat: hero(960, 1000, 44, { sit: true }) shows her from the chest up;
//   then light(960, 700, 420, PAL.screen, .25) for the screen glow on her face, then deskFront(t, o) over her lap.
//   o: { lamp: 0..1, screen: 0..1 (teal glow on her face), clock: hours (e.g. 1.5 = 1:30), night: 0..1, dark: 0..1, desk: fn() extra desk items }
function roomReverse(t, o = {}) {
  const night = clamp(o.night ?? 1), lamp = clamp(o.lamp ?? 1), scr = clamp(o.screen ?? 1), dark = clamp(o.dark || 0);
  const wall = mixCol('#F3DDC9', '#474C86', night);
  paint(rectPts(-600, -400, W + 1200, 1400), { wash: wall, fill: mixCol(wall, PAL.violet, .35), fillOp: 110, bleed: .06, tex: .5, ink: null });
  glow(400, 700, 700, PAL.lamp, .35 * lamp);
  paint([[-600, 900], [W + 600, 900], [W + 600, H + 400], [-600, H + 400]], { wash: mixCol('#C9A27E', '#433A66', night), ink: PAL.ink, sw: 1 });
  // fairy lights
  const fl = []; for (let i = 0; i <= 24; i++) { const x = -40 + i * 85; fl.push([x, 150 + Math.sin(i * .9) * 26 + (i % 2) * 10]); }
  inkLine(fl, .8, PAL.ink, 'fine', .5);
  fl.forEach(([x, y], i) => { if (i % 2) return; const on = .6 + .4 * Math.sin(t * 2 + i * 1.7); glow(x, y + 12, 34, ['#FFD98A', '#FFB3C6', '#BFF0E0'][i % 3], .5 * on * night); dot(x, y + 12, 7, ['#FFE7A8', '#FFC9D8', '#D6FFF2'][i % 3], .95); });
  // bookshelf
  paint(rectPts(110, 260, 410, 640, 2), { wash: '#A77A55', fill: '#7F5A3C', fillOp: 80, tex: .6, ink: PAL.ink, sw: 1.2 });
  for (let r = 0; r < 4; r++) {
    const sy = 300 + r * 150; paint(rectPts(124, sy + 118, 382, 14), { wash: '#7F5A3C', ink: PAL.ink, sw: .8 });
    let bx = 132; for (let k = 0; k < 9 && bx < 490; k++) { const bw = 24 + hash(r * 20 + k) * 22, bh = 70 + hash(r * 9 + k) * 40; if (hash(r * 5 + k * 3) > .82) { plant(bx + 30, sy + 118, .6, t); bx += 64; continue; } paint(rectPts(bx, sy + 118 - bh, bw, bh, 1), { wash: [PAL.rose, PAL.sky, '#F6C85F', PAL.sage, PAL.lilac, PAL.peach][(r + k) % 6], ink: PAL.ink, sw: .6 }); bx += bw + 3; }
  }
  // door
  paint(rectPts(690, 200, 270, 700, 2), { wash: mixCol('#E8D6C0', '#6A6296', night * .7), fill: '#B8A48E', fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.2 });
  paint(ellPts(925, 560, 10, 10, 10), { wash: '#F6C85F', ink: PAL.ink, sw: .6 });
  // clock
  wallClock(1500, 230, 72, o.clock ?? (T / 60 + 1));
  // bed with a star blanket
  paint(rrPts(1240, 610, 800, 330, 40), { wash: '#F4E9DC', ink: PAL.ink, sw: 1.2 });
  paint(rrPts(1300, 580, 260, 110, 40), { wash: '#FFF8EE', fill: PAL.skyLt, fillOp: 60, ink: PAL.ink, sw: 1 });
  paint([[1250, 700], [2040, 690], [2040, 950], [1250, 950]], { wash: '#8FA8D8', fill: '#6F86B8', fillOp: 80, bleed: .05, tex: .5, ink: PAL.ink, sw: 1.1, curv: .15 });
  for (let i = 0; i < 9; i++) paint(starPts(1300 + hash(i * 3.3) * 700, 730 + hash(i * 7.7) * 190, 12, .45, 5), { wash: '#FFF1A8', ink: null });
  if (o.behind) o.behind(t);                                              // chapter hook: things between the room and her
  glow(960, 700, 520, PAL.screen, .18 * scr);
}
// the desk in the foreground of the reverse angle (paint after her so it hides her lap). o.items: fn() for props on it
function deskFront(t, o = {}) {
  paint([[-100, 880], [W + 100, 880], [W + 100, H + 100], [-100, H + 100]], { wash: DESK, fill: DESK_DK, fillOp: 70, bleed: .04, tex: .6, border: .4, ink: PAL.ink, sw: 1.4 });
  inkLine([[-100, 905], [W + 100, 905]], .7, DESK_DK, 'fine', 0);
  for (let i = 0; i < 6; i++) inkLine([[i * 400 - 100 + hash(i) * 100, 930 + hash(i + 2) * 100], [i * 400 + 200, 940 + hash(i + 5) * 100]], .4, DESK_DK, 'fine', .3, .6);
  if (o.items) o.items(t);
}
function wallClock(x, y, r, hours) {
  paint(ellPts(x, y, r, r, 28), { wash: '#FFF8EE', ink: PAL.ink, sw: 1.3 });
  paint(ellPts(x, y, r, r, 28), { fill: PAL.pinkLt, fillOp: 60, bleed: .1, ink: null });
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; dot(x + Math.sin(a) * r * .8, y - Math.cos(a) * r * .8, i % 3 ? 2 : 4, PAL.ink); }
  const ha = (hours % 12) / 12 * TAU, ma = (hours % 1) * TAU;
  inkLine([[x, y], [x + Math.sin(ha) * r * .5, y - Math.cos(ha) * r * .5]], 2.2, PAL.ink, 'marker', 0);
  inkLine([[x, y], [x + Math.sin(ma) * r * .75, y - Math.cos(ma) * r * .75]], 1.4, PAL.ink, 'marker', 0);
  dot(x, y, 5, '#E2557F');
}
// TOP-DOWN DESK: for drawing / writing close-ups. Open sketchbook spread centred at (960, 540); pages are
// 440x600 each. o.page(rect, side, t) paints each page (side -1 left, 1 right). o.lamp 0..1 warm pool; o.items(t).
function deskTop(t, o = {}) {
  paint(rectPts(-400, -400, W + 800, H + 800), { wash: DESK, fill: DESK_DK, fillOp: 90, bleed: .03, tex: .7, border: .2, ink: null });
  for (let i = 0; i < 14; i++) { const y = -60 + i * 90 + hash(i) * 30, pts = []; for (let k = 0; k <= 10; k++) pts.push([-100 + k * 220, y + Math.sin(k * .8 + i) * 14]); inkLine(pts, .5, DESK_DK, 'fine', .5, .55); }
  glow(760, 380, 900, PAL.lamp, .35 * (o.lamp ?? 1));
  paint(rrPts(480, 210, 960, 660, 12).map(p => [p[0] + 14, p[1] + 16]), { wash: PAL.ink, washOp: 60, ink: null });
  paint(rrPts(468, 206, 984, 668, 12), { wash: '#6F86B8', ink: PAL.ink, sw: 1.3 });
  const L = { x: 490, y: 225, w: 460, h: 630 }, R = { x: 970, y: 225, w: 460, h: 630 };
  for (const [r, sd] of [[L, -1], [R, 1]]) {
    paint(rectPts(r.x, r.y, r.w, r.h, 1), { wash: '#FFFBF2', fill: '#EFE6D6', fillOp: 50, tex: .3, ink: PAL.ink, sw: .9 });
    if (o.page) { X.save(); X.clip(pathOf(rectPts(r.x, r.y, r.w, r.h))); o.page(r, sd, t); X.restore(); }
  }
  paint([[950, 225], [970, 225], [970, 855], [950, 855]], { fill: PAL.ink, fillOp: 40, bleed: .2, ink: null });
  for (let i = 0; i < 14; i++) paint(ellPts(960, 245 + i * 44, 9, 5, 8), { ink: PAL.ink, sw: .6 });
  if (o.items) o.items(t);
}
