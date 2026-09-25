// cast.js: the chibi cast. Everything is drawn around the ground point (x, y) between the feet, with unit s.
//
//   hero(x, y, s, o)    我: the singer. Dark bob, an expressive ahoge (呆毛), a star hair clip. Outfits: 'office' (cardigan +
//                       lanyard badge), 'home' (sage hoodie), 'pajama'.
//   momo(x, y, s, o)    桃桃: the pink-haired mascot she draws. Twin tails, a star on her antenna, cream dress.
//   person(x, y, s, o)  coworkers, the boss, users: o.seed picks hair and clothes (o.style/o.hair/o.top override).
//   cat(x, y, s, o)     团子: round cream cat. o.pose: 'sit', 'loaf', 'sleep', 'walk', 'pounce'.
//   qmark(x, y, s, o)   a living question mark. idea(x, y, s, o): the little star that becomes 桃桃.
//
// Chibi proportions (units of s): about 10.2s tall to the top of the head. Head centre (0, -6.7s), about 5.4s wide.
// Neck -4.3s, torso -4.35s..-1.35s, feet at 0. Shoulders (±.95s, -3.95s); arms are 1.8s long; hands r .36s.
// Arm angles as in the P(doom) cast: 0 = straight out sideways, positive = raised, about -1.25 = hanging.
// Hooks: o.draw(s, sw) body-local; o.handL/o.handR(s, sw) at the hand centre in arm space (+x = outward along the arm);
//        o.armFront: 'L' | 'R' | 'both' paints that arm (and what it holds) over the head instead of under it;
//        o.head(s, sw) in head-local space after the face (head centre at 0,0; face spans about ±2.5s).
//
// Pose: dy (units, negative = up), sq (squash; negative stretches), rot, flip, sx, walk (phase), run (phase), sit,
//       back (seen from behind), tilt (head tilt, radians), lookX/lookY (-1..1: eyes and face turn), bob.
// Face: eyes: normal, look, happy, closed, sleepy, sparkle, star, wide, teary, dot, spiral, heart, tired, wink, x.
//       mouth: smile, open, o, O, flat, wobble, cat, sad, yawn, grin, pout, tiny. brows: worried, angry, up, sad.
//       blush (0..1 or true), squint (from mood()), tears (0..1), sweat.
// Hair: ahoge: 'normal' | 'droop' | 'perk' | 'question' | 'heart' | 'spiral' | 'none'.

const SKIN = '#FCE5D4', SKIN_DK = '#F2C6AE', CHEEK = '#F59CA8';
const HERO_STYLE = { style: 'bob', hair: '#5A3A36', hairLt: '#8E6254', eye: '#3A2A3E', iris: '#9A70B8', clip: true, ahoge: 'normal',
  outfit: 'home', top: '#A9CFB5', topDk: '#7EA78E', pants: '#5B6583', shoe: '#8E5E48' };
const MOMO_STYLE = { style: 'twintails', hair: '#F3A0BF', hairLt: '#FCD3E1', eye: '#8B3563', iris: '#F07CA6', antenna: true, ahoge: 'none',
  outfit: 'dress', top: '#FFF6EE', topDk: '#F4CAD8', pants: '#FFF6EE', shoe: '#EC7FA3', starEyes: true };

function hero(x, y, s, o = {}) {
  const outfit = o.outfit || 'home';
  const sty = outfit === 'office' ? { top: '#3F4B7E', topDk: '#2D3761', pants: '#3A3F5E', shoe: '#6B4535', shirt: '#FBF7F0', badge: o.badge !== false }
    : outfit === 'pajama' ? { top: '#BFD9EE', topDk: '#94B7D6', pants: '#BFD9EE', shoe: SKIN, stars: true } : {};
  chibi(x, y, s, { ...HERO_STYLE, ...sty, ...o, outfit });
}
function momo(x, y, s, o = {}) {
  if (o.digital) glow(x, y - 5.5 * s, 9 * s, PAL.pink, .28 * clamp(o.digital));
  chibi(x, y, s, { ...MOMO_STYLE, ...o });
}
const PERSON_HAIR = ['#3A2E2E', '#5B4032', '#2E3348', '#7A5238', '#4A3B5C', '#A8763E', '#3B3B3B', '#6B4A3A'];
const PERSON_TOP = ['#8FB3D9', '#E8B86B', '#C9A0DC', '#9CC9A0', '#E89B8B', '#7E8CB8', '#D6C28E', '#B8C4CE'];
const PERSON_STYLES = ['short', 'bob', 'long', 'ponytail', 'bun', 'short', 'curly', 'short'];
function person(x, y, s, o = {}) {
  const k = o.seed || 0, pick = (a, j) => a[Math.floor(hash(k * 7.3 + j) * a.length)];
  chibi(x, y, s, { style: pick(PERSON_STYLES, 1), hair: pick(PERSON_HAIR, 2), eye: '#2F2A3A', iris: '#5C5470', top: pick(PERSON_TOP, 3), topDk: null,
    pants: '#4E5570', shoe: '#5A4034', outfit: o.suit ? 'suit' : 'plain', ahoge: 'none', eyes: o.eyes || 'dot', ...o });
}

// ---------- the shared chibi builder ----------
function chibi(x, y, s, o) {
  const sw = clamp(s / 19, .32, 2.3) * (o.swMul || 1), J = s * .03, sq = (o.sq || 0) + (o.take || 0);
  const lx = clamp(o.lookX || 0, -1, 1), ly = clamp(o.lookY || 0, -1, 1);
  const top = o.top, topDk = o.topDk || mixCol(o.top, PAL.ink, .22);
  if (!o.noShadow) { const f = 1 - Math.min(.5, Math.abs(o.dy || 0) * .05); paint(ellPts(x, y + s * .1, s * 2.4 * f, s * .5 * f, 18), { fill: PAL.ink, fillOp: 70, bleed: .2, tex: .2, border: .1, ink: null }); }
  push();
  translate(x, y + (o.dy || 0) * s + (o.bob || 0) * s);
  if (o.rot) rotate(o.rot);
  scale((o.flip ? -1 : 1) * (o.sx ?? 1) * (1 + sq * .5), (o.sy ?? 1) * (1 - sq));

  const back = !!o.back;
  // --- tails / long hair behind the body ---
  if (!back) hairBehind(s, sw, o, lx);

  // --- legs ---
  const leg = (side, i) => {
    let h = o.sit ? .75 : 1.35, a = 0;
    if (o.walk != null) { const ph = Math.sin((o.walk + (i ? .5 : 0)) * TAU); if (ph > 0) h -= ph * .45; }
    if (o.run != null) a = Math.sin((o.run + (i ? .5 : 0)) * TAU) * .6;
    if (o.sit) a = side * .12;
    push(); translate(side * .5 * s, -1.5 * s); rotate(a);
    paint(rrPts(-.31 * s, 0, .62 * s, (h + .2) * s, .28 * s, J * .5), { wash: o.pants, ink: PAL.ink, sw: sw * .75 });
    paint(ellPts(side * .1 * s, (h + .15) * s, .44 * s, .26 * s, 12), { wash: o.shoe, ink: PAL.ink, sw: sw * .7 });
    pop();
  };
  leg(-1, 0); leg(1, 1);

  // --- torso ---
  const tp = [[-.98 * s, -4.4 * s], [.98 * s, -4.4 * s], [1.28 * s, -3.1 * s], [1.52 * s, -1.3 * s], [0, -1.22 * s], [-1.52 * s, -1.3 * s], [-1.28 * s, -3.1 * s]];
  paint(tp, { wash: top, ink: null, curv: .25 });
  paint([[-1.4 * s, -2.1 * s], [1.4 * s, -2.1 * s], [1.52 * s, -1.3 * s], [-1.52 * s, -1.3 * s]], { fill: topDk, fillOp: 110, bleed: .05, tex: .5, border: .4, ink: null });
  outfitDetail(s, sw, o, back);
  paint(tp, { ink: PAL.ink, sw: sw * .9, curv: .25 });

  // --- arms (in front of the torso) ---
  const arm = (side, a, hook) => {
    push(); translate(side * .95 * s, -3.95 * s); rotate(side < 0 ? a : -a);
    const len = 1.75 * s;
    paint(rrPts(side < 0 ? -len : 0, -.31 * s, len, .62 * s, .3 * s, J * .4), { wash: top, fill: topDk, fillOp: 50, tex: .3, border: .2, ink: PAL.ink, sw: sw * .75 });
    translate(side * (len + .12 * s), 0);
    paint(ellPts(0, 0, .37 * s, .35 * s, 12), { wash: o.gloves || SKIN, ink: PAL.ink, sw: sw * .6 });
    if (hook) { if (side < 0) scale(-1, 1); hook(s, sw); }
    pop();
  };
  const fL = o.armFront === 'L' || o.armFront === 'both', fR = o.armFront === 'R' || o.armFront === 'both';
  if (!fL) arm(-1, o.aL ?? -1.2, o.handL); if (!fR) arm(1, o.aR ?? -1.2, o.handR);
  if (o.draw) o.draw(s, sw);

  // --- head ---
  push(); translate(0, -4.3 * s); rotate(o.tilt || 0); translate(0, -2.4 * s);   // head centre is now (0, 0)
  if (back) {
    paint(ellPts(0, -.2 * s, 2.95 * s, 2.7 * s, 30, J), { wash: o.hair, fill: o.hairLt, fillOp: 60, tex: .4, border: .2, ink: PAL.ink, sw: sw * .9 });
    if (o.style === 'twintails') for (const sd of [-1, 1]) twinTail(sd, s, sw, o);
    if (o.style === 'bun') paint(ellPts(0, -2.9 * s, 1.1 * s, 1 * s, 16), { wash: o.hair, ink: PAL.ink, sw: sw * .8 });
    ahoge(s, sw, o);
  } else {
    headFront(s, sw, o, lx, ly);
    if (o.head) o.head(s, sw);
  }
  pop();
  if (fL) arm(-1, o.aL ?? -1.2, o.handL); if (fR) arm(1, o.aR ?? -1.2, o.handR);    // raised arms that must cover the head
  pop();
  if (o.emote) emote(o.emote, x + (o.flip ? -1 : 1) * (o.emoteSide ?? 1) * 3.4 * s, y + (o.dy || 0) * s - 10.2 * s, s * .9, o.emoteK ?? 1);
}

function outfitDetail(s, sw, o, back) {
  const of = o.outfit;
  if (of === 'home') {
    // hoodie: hood rolled behind the neck, kangaroo pocket, drawstrings
    paint(ellPts(0, -4.35 * s, 1.35 * s, .45 * s, 16), { wash: mixCol(o.top, PAL.cream, .25), ink: PAL.ink, sw: sw * .6 });
    if (!back) {
      paint(rrPts(-.85 * s, -2.75 * s, 1.7 * s, .95 * s, .3 * s), { wash: mixCol(o.top, PAL.ink, .08), ink: PAL.ink, sw: sw * .55 });
      for (const d of [-.3, .3]) inkLine([[d * s, -4.1 * s], [d * s * 1.1, -3.3 * s]], sw * .45, PAL.cream, 'fine', 0);
    }
  } else if (of === 'office') {
    if (!back) {
      paint([[-.55 * s, -4.4 * s], [.55 * s, -4.4 * s], [.35 * s, -1.4 * s], [-.35 * s, -1.4 * s]], { wash: o.shirt || PAL.cream, ink: null });  // shirt showing
      inkLine([[-.55 * s, -4.4 * s], [-.1 * s, -3.4 * s], [-.35 * s, -1.4 * s]], sw * .55, PAL.ink, 'fine', 0);
      inkLine([[.55 * s, -4.4 * s], [.1 * s, -3.4 * s], [.35 * s, -1.4 * s]], sw * .55, PAL.ink, 'fine', 0);
      paint([[-.5 * s, -4.45 * s], [0, -4.0 * s], [-.1 * s, -4.45 * s]], { wash: o.shirt || PAL.cream, ink: PAL.ink, sw: sw * .4 });     // collar
      paint([[.5 * s, -4.45 * s], [0, -4.0 * s], [.1 * s, -4.45 * s]], { wash: o.shirt || PAL.cream, ink: PAL.ink, sw: sw * .4 });
      if (o.badge) {
        inkLine([[-.62 * s, -4.4 * s], [-.25 * s, -3.2 * s], [0, -2.95 * s]], sw * .7, '#4F8FD6', 'marker', .4);
        inkLine([[.62 * s, -4.4 * s], [.25 * s, -3.2 * s], [0, -2.95 * s]], sw * .7, '#4F8FD6', 'marker', .4);
        badgeCard(0, -2.3 * s, s * .9, sw);
      }
    }
  } else if (of === 'pajama') {
    if (!back) for (let i = 0; i < 5; i++) { const px = (hash(i * 3.1) - .5) * 2.2 * s, py = (-3.9 + hash(i * 5.7) * 2.3) * s; paint(starPts(px, py, .2 * s, .45, 5), { wash: '#FFF3C4', ink: null }); }
    inkLine([[0, -4.35 * s], [0, -1.3 * s]], sw * .4, mixCol(o.top, PAL.ink, .3), 'fine', 0);
  } else if (of === 'dress') {
    // cream dress with a pink sailor-ish collar and a bow
    paint([[-1.0 * s, -4.4 * s], [1.0 * s, -4.4 * s], [.75 * s, -3.55 * s], [0, -3.3 * s], [-.75 * s, -3.55 * s]], { wash: o.hair, ink: PAL.ink, sw: sw * .5, curv: .3 });
    if (!back) {
      paint([[0, -3.6 * s], [-.62 * s, -3.95 * s], [-.62 * s, -3.25 * s]], { wash: '#E2557F', ink: PAL.ink, sw: sw * .45 });
      paint([[0, -3.6 * s], [.62 * s, -3.95 * s], [.62 * s, -3.25 * s]], { wash: '#E2557F', ink: PAL.ink, sw: sw * .45 });
      paint(ellPts(0, -3.6 * s, .16 * s, .16 * s, 8), { wash: '#E2557F', ink: null });
    }
    inkLine([[-1.5 * s, -1.55 * s], [1.5 * s, -1.55 * s]], sw * .6, o.hair, 'marker', .2);
  } else if (of === 'suit') {
    if (!back) {
      paint([[-.45 * s, -4.4 * s], [.45 * s, -4.4 * s], [0, -2.6 * s]], { wash: PAL.cream, ink: null });
      paint([[-.12 * s, -4.3 * s], [.12 * s, -4.3 * s], [.18 * s, -2.9 * s], [0, -2.6 * s], [-.18 * s, -2.9 * s]], { wash: o.tie || '#C8324A', ink: PAL.ink, sw: sw * .4 });
      inkLine([[-.45 * s, -4.4 * s], [0, -2.6 * s], [.45 * s, -4.4 * s]], sw * .55, PAL.ink, 'fine', 0);
    }
  } else if (!back) {
    paint(ellPts(0, -4.35 * s, .6 * s, .22 * s, 12), { wash: SKIN, ink: PAL.ink, sw: sw * .45 });                 // plain tee neckline
  }
}
function badgeCard(x, y, s, sw) {
  push(); translate(x, y); rotate(Math.sin(T * 3.1) * .06);
  paint(rrPts(-.5 * s, -.65 * s, 1 * s, 1.3 * s, .12 * s), { wash: '#FFFFFF', ink: PAL.ink, sw: sw * .55 });
  paint(rectPts(-.35 * s, -.45 * s, .7 * s, .55 * s), { wash: '#BFD3EA', ink: null });
  paint(ellPts(0, -.24 * s, .15 * s, .15 * s, 8), { wash: '#6C6A7E', ink: null });
  paint(rectPts(-.35 * s, .25 * s, .7 * s, .12 * s), { wash: '#4F8FD6', ink: null });
  pop();
}

function hairBehind(s, sw, o, lx) {
  const hy = -6.7 * s, hx = lx * .25 * s;
  if (o.style === 'long') paint([[hx - 3.0 * s, hy - .5 * s], [hx + 3.0 * s, hy - .5 * s], [hx + 2.6 * s, -2.9 * s], [hx, -2.6 * s], [hx - 2.6 * s, -2.9 * s]], { wash: o.hair, fill: o.hairLt, fillOp: 50, tex: .4, ink: PAL.ink, sw: sw * .85, curv: .35 });
  if (o.style === 'twintails') for (const sd of [-1, 1]) { push(); translate(0, hy); twinTail(sd, s, sw, o); pop(); }
  if (o.style === 'ponytail') {
    push(); translate(hx + 2.2 * s, hy - 1.2 * s); rotate(.5 + Math.sin(T * 2.3) * .08);
    paint([[0, 0], [1.2 * s, .6 * s], [1.5 * s, 2.4 * s], [.9 * s, 3.6 * s], [.3 * s, 2.2 * s]], { wash: o.hair, ink: PAL.ink, sw: sw * .8, curv: .5 });
    pop();
  }
}
function twinTail(sd, s, sw, o) {
  // attached high on the side of the head (head-local coordinates), swinging a little
  push(); translate(sd * 2.2 * s, -2.0 * s); rotate(sd * (.12 + Math.sin(T * 2.2 + sd) * .06 + (o.tailSwing || 0)));
  const pts = [[0, -.5 * s], [sd * 1.2 * s, -.35 * s], [sd * 2.05 * s, .9 * s], [sd * 2.2 * s, 2.7 * s], [sd * 1.75 * s, 4.4 * s], [sd * 1.05 * s, 5.3 * s],
    [sd * .55 * s, 5.05 * s], [sd * .95 * s, 4.45 * s], [sd * 1.15 * s, 3.2 * s], [sd * .95 * s, 1.6 * s], [sd * .3 * s, .5 * s]];
  paint(pts, { wash: o.hair, fill: o.hairLt, fillOp: 90, bleed: .06, tex: .4, border: .2, ink: PAL.ink, sw: sw * .85, curv: .55 });
  inkLine([[sd * .75 * s, .4 * s], [sd * 1.55 * s, 1.9 * s], [sd * 1.6 * s, 3.4 * s], [sd * 1.25 * s, 4.5 * s]], sw * .45, mixCol(o.hair, PAL.ink, .3), 'fine', .6);
  push(); translate(sd * .2 * s, -.1 * s); rotate(sd * .5);                                       // ribbon tie
  for (const k of [-1, 1]) paint([[0, 0], [k * .75 * s, -.42 * s], [k * .85 * s, .38 * s]], { wash: '#E2557F', ink: PAL.ink, sw: sw * .45, curv: .2 });
  paint(ellPts(0, 0, .2 * s, .2 * s, 8), { wash: '#C63F68', ink: PAL.ink, sw: sw * .4 });
  pop();
  pop();
}
function headFront(s, sw, o, lx, ly) {
  const J = s * .025, fx = lx * .38 * s, fy = ly * .22 * s;
  // back hair mass (behind the face): a rounded dome, bob length at the sides
  if (o.style !== 'short') {
    const bot = o.style === 'bob' ? 2.1 * s : o.style === 'curly' ? 1.5 * s : .9 * s, dome = [];
    for (let i = 0; i <= 14; i++) { const a = Math.PI + i / 14 * Math.PI; dome.push([Math.cos(a) * 3.0 * s, -.25 * s + Math.sin(a) * 2.85 * s]); }
    dome.push([3.02 * s, .9 * s], [2.9 * s, bot], [2.3 * s, bot + .2 * s], [-2.3 * s, bot + .2 * s], [-2.9 * s, bot], [-3.02 * s, .9 * s]);
    paint(dome, { wash: o.hair, fill: o.hairLt, fillOp: 45, tex: .4, border: .2, ink: PAL.ink, sw: sw * .85, curv: .35 });
  } else paint(ellPts(0, -.4 * s, 2.9 * s, 2.65 * s, 26), { wash: o.hair, ink: PAL.ink, sw: sw * .85 });
  if (o.style === 'bun') paint(ellPts(.2 * s, -2.9 * s, 1.05 * s, .95 * s, 16), { wash: o.hair, fill: o.hairLt, fillOp: 50, ink: PAL.ink, sw: sw * .8 });
  // face
  const face = ellPts(fx * .25, .1 * s, 2.5 * s, 2.28 * s, 30, J * .5);
  paint(face, { wash: SKIN, ink: null });
  paint(ellPts(fx * .25, 1.6 * s, 1.9 * s, .6 * s, 16), { fill: SKIN_DK, fillOp: 60, bleed: .2, tex: .2, border: 0, ink: null });
  paint(face, { ink: PAL.ink, sw: sw * .85 });
  // cheeks
  const bl = o.blush === true ? 1 : (o.blush || .45);
  if (bl > .02) for (const bx of [-1.65, 1.65]) { paint(ellPts(bx * s + fx, .95 * s + fy, .5 * s, .26 * s, 14), { fill: CHEEK, fillOp: 150 * bl, bleed: .25, tex: .2, border: .1, ink: null }); if (bl > .6 && s > 8) for (const k of [-.18, 0, .18]) inkLine([[bx * s + fx + k * s - .06 * s, .85 * s + fy], [bx * s + fx + k * s + .06 * s, 1.02 * s + fy]], sw * .35, '#E0707E', 'fine', 0); }
  faceFeatures(s, sw, o, fx, fy);
  // bangs and side locks (in front of the face)
  hairFront(s, sw, o, fx);
  browsOf(s, sw, o, fx, fy);
  ahoge(s, sw, o);
  if (o.clip) { push(); translate(-1.55 * s + fx * .4, -1.75 * s); rotate(-.3); paint(starPts(0, 0, .42 * s, .48, 5), { wash: '#F6C85F', ink: PAL.ink, sw: sw * .45 }); pop(); }
  if (o.antenna) antennaStar(s, sw, o);
}
function hairFront(s, sw, o, fx) {
  const st = o.style, sx = fx * .35;
  if (st === 'short' || st === 'curly') {
    const pts = [[-2.85 * s, -.2 * s], [-2.7 * s, -1.9 * s], [-1.3 * s, -2.8 * s], [.6 * s, -2.9 * s], [2.4 * s, -2.2 * s], [2.85 * s, -.4 * s], [2.2 * s, -1.2 * s], [1.3 * s, -.9 * s], [.5 * s, -1.35 * s], [-.4 * s, -.95 * s], [-1.3 * s, -1.35 * s], [-2.1 * s, -.95 * s]];
    paint(pts.map(p => [p[0] + sx, p[1]]), { wash: o.hair, fill: o.hairLt, fillOp: 50, tex: .4, border: .2, ink: PAL.ink, sw: sw * .85, curv: st === 'curly' ? .6 : .3 });
    return;
  }
  // bangs: a dome cap with five side-swept clumps whose tips stop just above the eyes
  const fr = [];
  for (let i = 0; i <= 12; i++) { const a = Math.PI * 1.02 + i / 12 * Math.PI * .96; fr.push([Math.cos(a) * 2.98 * s + sx * .3, -.3 * s + Math.sin(a) * 2.8 * s]); }
  fr.push([2.74 * s, -.4 * s]);
  const clumps = [[1.62, 2.4, -.28], [.5, 1.3, -.58], [-.62, .12, -.42], [-1.72, -1.02, -.7], [-2.74, -2.2, -.32]];   // [left base x, tip x, tip y], right → left
  let xr = 2.74;
  for (const [xl, tx, ty] of clumps) {
    fr.push([(xr - .08) * s + sx, (ty - .5) * s], [(tx + .12) * s + sx, (ty - .12) * s], [tx * s + sx, ty * s], [(tx - .3) * s + sx, (ty - .42) * s]);
    if (xl > -2.7) fr.push([xl * s + sx, -1.5 * s]);
    xr = xl;
  }
  fr.push([-2.74 * s, -.4 * s]);
  paint(fr.map(p => [p[0], p[1] + .3 * s]), { fill: SKIN_DK, fillOp: 110, bleed: .1, tex: .2, border: 0, ink: null, curv: .4 });   // forehead shadow
  paint(fr, { wash: o.hair, fill: o.hairLt, fillOp: 55, bleed: .05, tex: .45, border: .25, ink: PAL.ink, sw: sw * .85, curv: .38 });
  // angel-ring shine, broken into three dashes
  for (const [a0, a1] of [[1.2, 1.36], [1.42, 1.62], [1.68, 1.8]]) {
    const arc = []; for (let k = 0; k <= 5; k++) { const a = Math.PI * lerp(a0, a1, k / 5); arc.push([Math.cos(a) * 2.25 * s + sx * .3, -.55 * s + Math.sin(a) * 2.0 * s]); }
    inkLine(arc, sw * 2.2, o.hairLt, 'marker', .5, .75);
  }
  // side locks framing the cheeks
  for (const sd of [-1, 1]) paint([[sd * 2.45 * s, -1.25 * s], [sd * 2.98 * s, -.3 * s], [sd * 2.95 * s, 1.3 * s], [sd * 2.62 * s, 2.3 * s], [sd * 2.38 * s, 1.45 * s], [sd * 2.25 * s, -.2 * s]], { wash: o.hair, fill: o.hairLt, fillOp: 40, tex: .3, ink: PAL.ink, sw: sw * .7, curv: .45 });
}
function ahoge(s, sw, o) {
  const a = o.ahoge || 'none'; if (a === 'none') return;
  const w = Math.sin(T * 4.2 + (o.seed || 0)) * .06, col = o.hair;
  let pts;
  if (a === 'droop') pts = [[.2 * s, -2.85 * s], [.9 * s, -3.2 * s], [1.6 * s, -2.9 * s], [1.9 * s, -2.35 * s]];
  else if (a === 'perk') pts = [[.1 * s, -2.9 * s], [.25 * s, -3.9 * s], [.05 * s, -4.7 * s], [.45 * s, -5.1 * s]];
  else if (a === 'question') pts = [[.1 * s, -2.9 * s], [.1 * s, -3.6 * s], [.8 * s, -3.9 * s], [.9 * s, -4.6 * s], [.3 * s, -4.95 * s], [-.25 * s, -4.6 * s]];
  else if (a === 'spiral') { pts = []; for (let i = 0; i < 16; i++) { const an = i * .55 + T * 3, r = (1 - i / 16) * .5 * s; pts.push([.3 * s + Math.cos(an) * r, -4.0 * s + Math.sin(an) * r + (i < 3 ? (3 - i) * .35 * s : 0)]); } pts.reverse(); }
  else if (a === 'heart') {
    for (const sd of [-1, 1]) inkLine([[0, -2.9 * s], [sd * .3 * s, -3.7 * s], [sd * .75 * s, -4.1 * s], [sd * .45 * s, -4.5 * s], [0, -4.05 * s]], sw * 1.1, col, 'ink', .6);
    return;
  } else pts = [[.15 * s, -2.9 * s], [.5 * s, -3.8 * s], [1.25 * s, -4.1 * s], [1.3 * s, -3.6 * s]];
  push(); translate(0, -2.9 * s); rotate(w); translate(0, 2.9 * s);
  inkLine(pts, sw * 1.25, col, 'ink', .6);
  pop();
}
function antennaStar(s, sw, o) {
  const sway = Math.sin(T * 3 + 1) * .12, glowK = o.starGlow ?? 1;
  push(); translate(.1 * s, -2.85 * s); rotate(sway);
  inkLine([[0, 0], [.15 * s, -.8 * s], [-.1 * s, -1.5 * s]], sw * .9, o.hair, 'ink', .6);
  glow(-.1 * s, -1.85 * s, 1.1 * s, '#FFE7A0', .5 * glowK);
  paint(starPts(-.1 * s, -1.85 * s, .55 * s * (1 + .08 * Math.sin(T * 7)), .45, 5), { wash: '#FFE59A', ink: PAL.ink, sw: sw * .5 });
  pop();
}
function browsOf(s, sw, o, fx, fy) {
  const b = o.brows || (o.eyes === 'teary' ? 'sad' : null); if (!b) return;
  for (const sd of [-1, 1]) {
    const bx = sd * 1.05 * s + fx, by = -1.2 * s + fy;
    const tilt = b === 'worried' || b === 'sad' ? -sd * .22 : b === 'angry' ? sd * .28 : 0, lift = b === 'up' ? -.25 * s : 0;
    inkLine([[bx - .35 * s, by + lift + tilt * s], [bx + .35 * s, by + lift - tilt * s]], sw * .85, mixCol(o.hair, PAL.ink, .7), 'ink', 0);
  }
}
function faceFeatures(s, sw, o, fx, fy) {
  const e = (o.squint || 0) > .6 ? 'closed' : (o.eyes || 'normal'), ex = 1.05 * s, ey = .15 * s + fy;
  const blink = (e === 'normal' || e === 'look' || e === 'sparkle') && ((T * .9 + (o.seed || 0) * 1.7) % 3.4) < .11;
  const sqz = clamp(o.squint || 0) * .8;
  for (const sd of [-1, 1]) {
    const cx = sd * ex + fx, cy = ey;
    push(); translate(cx, cy); if (sqz > 0) scale(1 + sqz * .1, 1 - sqz);
    if (blink) inkLine([[-.38 * s, .1 * s], [0, .22 * s], [.38 * s, .1 * s]], sw * 1.1, PAL.ink, 'ink', .5);
    else eyeShape(e, sd, s, sw, o);
    pop();
  }
  if (o.tears) for (const sd of [-1, 1]) { const k = clamp(o.tears), tx = sd * (ex + .1 * s) + fx; paint([[tx, ey + .55 * s], [tx + .18 * s, ey + (.9 + k * .7) * s], [tx, ey + (1.05 + k * .8) * s], [tx - .18 * s, ey + (.9 + k * .7) * s]], { wash: '#BFE3F5', ink: PAL.ink, sw: sw * .4, curv: .6 }); }
  mouthOf(o.mouth || 'smile', s, sw, fx, fy);
}
function eyeShape(e, sd, s, sw, o) {
  const dark = o.eye || PAL.ink, iris = o.iris || '#6B5A8A';
  if (e === 'normal' || e === 'look' || e === 'sparkle' || e === 'teary' || e === 'wink' && sd > 0) {
    const lx = e === 'look' ? 0 : 0;
    paint(ellPts(lx, 0, .44 * s, .6 * s, 18), { wash: dark, ink: null });
    paint(ellPts(lx, .22 * s, .34 * s, .3 * s, 14), { wash: iris, washOp: 230, ink: null });
    if (e === 'sparkle' || o.starEyes) paint(starPts(lx - .1 * s, -.14 * s, .26 * s, .45, 4, 0), { wash: '#FFFFFF', ink: null });
    else paint(ellPts(lx - .13 * s, -.2 * s, .16 * s, .17 * s, 10), { wash: '#FFFFFF', ink: null });
    paint(ellPts(lx + .15 * s, .3 * s, .07 * s, .07 * s, 8), { wash: '#FFFFFF', washOp: 220, ink: null });
    if (e === 'sparkle') { glow(0, 0, 1.1 * s, '#FFE59A', .35); paint(starPts(sd * .55 * s, -.75 * s, .2 * s, .4, 4, 0), { wash: '#FFF3C0', ink: null }); }
    inkLine([[-.5 * s, -.42 * s], [0, -.66 * s], [.5 * s, -.45 * s], [.62 * s * 1, -.58 * s]].map(p => [p[0] * (sd < 0 ? -1 : 1), p[1]]), sw * 1.05, PAL.ink, 'ink', .5);
    if (e === 'teary') paint(ellPts(0, .45 * s, .42 * s, .16 * s, 12), { wash: '#DDF2FB', washOp: 200, ink: null });
  } else if (e === 'wink' && sd < 0 || e === 'happy') inkLine([[-.45 * s, .15 * s], [0, -.3 * s], [.45 * s, .15 * s]], sw * 1.2, PAL.ink, 'ink', .5);
  else if (e === 'closed') inkLine([[-.45 * s, -.05 * s], [0, .25 * s], [.45 * s, -.05 * s]], sw * 1.1, PAL.ink, 'ink', .5);
  else if (e === 'sleepy') { paint([[-.44 * s, 0], [.44 * s, 0], [.36 * s, .38 * s], [0, .55 * s], [-.36 * s, .38 * s]], { wash: dark, ink: null, curv: .4 }); inkLine([[-.52 * s, 0], [.52 * s, 0]], sw * 1.1, PAL.ink, 'ink', 0); }
  else if (e === 'tired') { inkLine([[-.45 * s, .05 * s], [.45 * s, .05 * s]], sw * 1.1, PAL.ink, 'ink', 0); inkLine([[-.35 * s, .45 * s], [0, .55 * s], [.35 * s, .45 * s]], sw * .5, '#9A8AA8', 'fine', .5); }
  else if (e === 'star') { glow(0, 0, .9 * s, '#FFE59A', .4); paint(starPts(0, 0, .55 * s * (1 + .1 * Math.sin(T * 12 + sd)), .45, 5), { wash: '#FFD86B', ink: PAL.ink, sw: sw * .5 }); }
  else if (e === 'wide') { paint(ellPts(0, 0, .45 * s, .58 * s, 16), { wash: '#FFFFFF', ink: PAL.ink, sw: sw * .6 }); paint(ellPts(0, .05 * s, .16 * s, .2 * s, 10), { wash: dark, ink: null }); }
  else if (e === 'dot') paint(ellPts(0, .05 * s, .17 * s, .22 * s, 10), { wash: PAL.ink, ink: null });
  else if (e === 'x') { inkLine([[-.35 * s, -.3 * s], [.35 * s, .35 * s]], sw, PAL.ink, 'ink', 0); inkLine([[.35 * s, -.3 * s], [-.35 * s, .35 * s]], sw, PAL.ink, 'ink', 0); }
  else if (e === 'heart') paint(heartPts(0, .05 * s, .5 * s), { wash: '#EE5A83', ink: PAL.ink, sw: sw * .5 });
  else if (e === 'spiral') { const sp = []; for (let k = 0; k < 16; k++) { const a = k * .75 + T * 6 * sd, r = k * .03 * s; sp.push([Math.cos(a) * r, Math.sin(a) * r]); } inkLine(sp, sw * .6, PAL.ink, 'fine', .6); }
}
function mouthOf(m, s, sw, fx, fy) {
  const mx = fx * 1.1, my = 1.3 * s + fy;
  if (m === 'smile') inkLine([[mx - .32 * s, my - .05 * s], [mx, my + .18 * s], [mx + .32 * s, my - .05 * s]], sw * .75, PAL.ink, 'ink', .6);
  else if (m === 'tiny') inkLine([[mx - .15 * s, my], [mx, my + .08 * s], [mx + .15 * s, my]], sw * .6, PAL.ink, 'ink', .6);
  else if (m === 'open' || m === 'grin') {
    const w = m === 'grin' ? .55 : .4;
    paint([[mx - w * s, my - .1 * s], [mx + w * s, my - .1 * s], [mx + w * .6 * s, my + .38 * s], [mx, my + .48 * s], [mx - w * .6 * s, my + .38 * s]], { wash: '#9B3B4F', ink: PAL.ink, sw: sw * .6, curv: .4 });
    paint(ellPts(mx, my + .3 * s, w * .5 * s, .12 * s, 10), { wash: '#F08A9A', ink: null });
  } else if (m === 'o') paint(ellPts(mx, my + .08 * s, .17 * s, .2 * s, 10), { wash: '#9B3B4F', ink: PAL.ink, sw: sw * .5 });
  else if (m === 'O' || m === 'yawn') paint(ellPts(mx, my + .2 * s, m === 'yawn' ? .42 * s : .3 * s, m === 'yawn' ? .5 * s : .36 * s, 14), { wash: '#9B3B4F', ink: PAL.ink, sw: sw * .6 });
  else if (m === 'flat') inkLine([[mx - .28 * s, my + .05 * s], [mx + .28 * s, my + .05 * s]], sw * .7, PAL.ink, 'ink', 0);
  else if (m === 'wobble') inkLine([[mx - .4 * s, my + .05 * s], [mx - .2 * s, my - .07 * s], [mx, my + .05 * s], [mx + .2 * s, my - .07 * s], [mx + .4 * s, my + .05 * s]], sw * .6, PAL.ink, 'ink', .3);
  else if (m === 'cat') inkLine([[mx - .4 * s, my - .02 * s], [mx - .2 * s, my + .15 * s], [mx, my], [mx + .2 * s, my + .15 * s], [mx + .4 * s, my - .02 * s]], sw * .65, PAL.ink, 'ink', .5);
  else if (m === 'sad') inkLine([[mx - .3 * s, my + .15 * s], [mx, my - .02 * s], [mx + .3 * s, my + .15 * s]], sw * .7, PAL.ink, 'ink', .6);
  else if (m === 'pout') paint(ellPts(mx, my + .05 * s, .14 * s, .1 * s, 8), { wash: '#C9566B', ink: null });
}

// ---------- emotes: little painted reaction marks near a character's head. k = 0..1 pop progress ----------
function emote(kind, x, y, s, k = 1) {
  const p = backOut(k); if (p < .02) return;
  if (kind === 'zzz') { letter('z', x, y, s * 2, PAL.cream, { pop: k * 3, font: 'cute' }); letter('z', x + s * 1.6, y - s * 1.8, s * 1.5, PAL.cream, { pop: k * 3 - .3, font: 'cute' }); return; }
  if (kind === '!' || kind === '?' || kind === '!?' || kind === '!!' || kind === '…') { letter(kind, x, y, s * 3.2, kind.includes('?') ? PAL.sky : kind === '…' ? PAL.cream : PAL.ochre, { pop: k * 1.5, rot: .12, font: 'cute' }); return; }
  push(); translate(x, y); scale(p);
  const sw = clamp(s / 15, .35, 1.8);
  if (kind === 'sweat') paint([[0, -1.5 * s], [.8 * s, .2 * s], [0, .9 * s], [-.8 * s, .2 * s]], { wash: PAL.sky, ink: PAL.ink, sw: sw * .6, curv: .7 });
  else if (kind === 'spark') { paint(starPts(0, 0, 1.5 * s, .4, 4, 0), { wash: '#FFF3C0', ink: PAL.ink, sw: sw * .5 }); paint(starPts(1.8 * s, 1.1 * s, .7 * s, .4, 4, 0), { wash: PAL.ochre, ink: PAL.ink, sw: sw * .4 }); }
  else if (kind === 'heart') paint(heartPts(0, 0, s * 1.6), { wash: '#EE5A83', ink: PAL.ink, sw: sw * .6 });
  else if (kind === 'anger') for (let i = 0; i < 4; i++) { push(); rotate(i * Math.PI / 2 + Math.PI / 4); inkLine([[.4 * s, -.5 * s], [1.3 * s, -.2 * s], [1.3 * s, .4 * s]], sw * .9, '#D8394E', 'ink', .5); pop(); }
  else if (kind === 'music') {                                            // cream halo first, so the note reads on dark rooms too
    paint(ellPts(0, 1.2 * s, .95 * s, .75 * s, 12, 0, -.3), { wash: PAL.cream, washOp: 200, ink: null }); inkLine([[.6 * s, 1.1 * s], [.6 * s, -1.6 * s], [1.6 * s, -1 * s]], sw * 2, PAL.cream, 'marker', 0, .8);
    paint(ellPts(0, 1.2 * s, .7 * s, .5 * s, 12, 0, -.3), { wash: PAL.ink, ink: null }); inkLine([[.6 * s, 1.1 * s], [.6 * s, -1.6 * s], [1.6 * s, -1 * s]], sw * .8, PAL.ink, 'ink', 0);
  }
  else if (kind === 'swirl') { const sp = []; for (let i = 0; i < 18; i++) { const a = i * .6 + T * 5, r = i * .09 * s; sp.push([Math.cos(a) * r, Math.sin(a) * r]); } inkLine(sp, sw * .7, PAL.violet, 'fine', .6); }
  else if (kind === 'bulb') { glow(0, 0, 2.4 * s, '#FFE59A', .5); paint(ellPts(0, -.3 * s, 1 * s, 1.1 * s, 16), { wash: '#FFE59A', ink: PAL.ink, sw: sw * .6 }); paint(rectPts(-.45 * s, .75 * s, .9 * s, .5 * s), { wash: PAL.gray, ink: PAL.ink, sw: sw * .5 }); }
  else if (kind === 'flower') { for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; paint(ellPts(Math.cos(a) * .7 * s, Math.sin(a) * .7 * s, .55 * s, .55 * s, 10), { wash: PAL.pinkLt, ink: PAL.ink, sw: sw * .4 }); } paint(ellPts(0, 0, .45 * s, .45 * s, 10), { wash: '#F6C85F', ink: null }); }
  pop();
}

// Mood timeline with animated changes: keys = [[t0, eyes, emote?, mouth?], ...]. Around each change the eyes squeeze
// shut, the body does a squash-stretch "take" and the emote pops. Spread the result into a character's options.
function mood(t, keys) {
  let i = 0; while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
  const [t0, eyes, em, mouth] = keys[i], age = t - t0, nextIn = i + 1 < keys.length ? keys[i + 1][0] - t : 9;
  let squint = 0, take = 0;
  if (i > 0 && age < .16) { squint = 1 - age / .16; take = -.12 * Math.sin(age / .16 * Math.PI); }
  if (nextIn < .08) squint = Math.max(squint, 1 - nextIn / .08);
  if (i > 0 && age >= .16 && age < .4) take = .08 * Math.sin((age - .16) / .24 * Math.PI) * (1 - (age - .16) / .24);
  const r = { eyes, squint, take, emote: em, emoteK: em ? seg(age, .05, .3) * (1 - seg(age, 1.6, 1.9)) : 0 };
  if (mouth) r.mouth = mouth;
  return r;
}
// Gentle, beat-synced body motion (this is a ballad: small bounces and sways, bigger in the choruses).
function move(style, t, seed = 0) {
  const bp = bpOf(t), bi = Math.floor(bp), bf = bp - bi, hit = Math.max(0, 1 - bf * 3.5), s1 = Math.sin(bp * Math.PI), ab = Math.abs(s1);
  const o = { dy: 0, sq: 0, aL: -1.15, aR: -1.15, rot: 0, walk: null, dx: 0, tilt: 0 };
  switch (style) {
    case 'idle': o.dy = -ab * .12; o.tilt = Math.sin(t * 1.3 + seed) * .03; break;
    case 'breathe': o.sq = Math.sin(t * 2.2 + seed) * .018; o.tilt = Math.sin(t * .9 + seed) * .03; break;
    case 'sway': o.dx = s1 * .35; o.rot = s1 * .05; o.tilt = -s1 * .06; o.aL = -1.0 + .15 * s1; o.aR = -1.0 - .15 * s1; break;
    case 'bounce': o.dy = -ab * .55; o.sq = hit * .06; o.aL = -.5 + .5 * s1; o.aR = -.5 - .5 * s1; break;
    case 'hop': o.dy = -ab * 1.6; o.sq = hit * .1; o.aL = o.aR = .2 + ab * .8; break;
    case 'cheer': o.dy = -ab * 1.0; o.sq = hit * .08; o.aL = o.aR = 1.1 + .25 * Math.sin(bp * TAU); break;
    case 'walk': o.walk = bp / 2; o.dy = -Math.abs(Math.sin(bp * Math.PI)) * .18; o.aL = -1.1 + .35 * s1; o.aR = -1.1 - .35 * s1; break;
    case 'run': o.walk = bp; o.dy = -Math.abs(Math.sin(bp * TAU)) * .45; o.aL = -.4 + .8 * Math.sin(bp * TAU); o.aR = -.4 - .8 * Math.sin(bp * TAU); o.rot = -.06; break;
    case 'dance': o.dx = Math.sin(bp * Math.PI) * .5; o.dy = -ab * .7; o.rot = s1 * .08; o.aL = .6 + .5 * Math.sin(bp * TAU); o.aR = .6 - .5 * Math.sin(bp * TAU); o.tilt = s1 * .1; break;
    case 'type': o.aL = -.35 + .12 * Math.sin(t * 22 + seed); o.aR = -.35 + .12 * Math.sin(t * 19 + 1 + seed); o.dy = -ab * .05; break;
  }
  return o;
}
function heroDancer(x, y, s, style, t, extra = {}) { const m = move(style, t, extra.seed || 0); hero(x + m.dx * s, y, s, { ...m, ...extra }); }
function momoDancer(x, y, s, style, t, extra = {}) { const m = move(style, t, (extra.seed || 0) + 3); momo(x + m.dx * s, y, s, { ...m, ...extra }); }

// ---------- 团子, the cat ----------
// cat(x, y, s, o): ground point under the body. About 5s long (loaf) / 4.5s tall (sit). o.pose: sit | loaf | sleep | walk | pounce.
// o.zzz: true floats z's over a sleeping cat.
// o.eyes: open | closed | happy | wide (a sleeping cat defaults to happy-closed); o.flip; o.tail (phase override); o.look (-1..1).
const CAT = '#F6D3A1', CAT_DK = '#E3A15E', CAT_LT = '#FFF1DC';
function cat(x, y, s, o = {}) {
  const sw = clamp(s / 14, .35, 2), pose = o.pose || 'sit', e = o.eyes || (pose === 'sleep' ? 'happy' : 'open'), tw = Math.sin(T * 2.4 + (o.seed || 0)) * .35 + (o.tail || 0);
  if (!o.noShadow) paint(ellPts(x, y + s * .1, s * 2.6, s * .45, 16), { fill: PAL.ink, fillOp: 60, bleed: .2, tex: .2, border: .1, ink: null });
  push(); translate(x, y + (o.dy || 0) * s); if (o.rot) rotate(o.rot); scale((o.flip ? -1 : 1) * (1 + (o.sq || 0) * .4), 1 - (o.sq || 0));
  const head = (hx, hy, hs = 1) => {
    for (const sd of [-1, 1]) {
      paint([[hx + sd * .55 * s * hs, hy - 1.05 * s * hs], [hx + sd * 1.25 * s * hs, hy - 1.9 * s * hs], [hx + sd * 1.45 * s * hs, hy - .6 * s * hs]], { wash: CAT, ink: PAL.ink, sw: sw * .7 });
      paint([[hx + sd * .8 * s * hs, hy - 1.0 * s * hs], [hx + sd * 1.22 * s * hs, hy - 1.55 * s * hs], [hx + sd * 1.3 * s * hs, hy - .8 * s * hs]], { wash: PAL.pinkLt, ink: null });
    }
    const hp = ellPts(hx, hy, 1.6 * s * hs, 1.3 * s * hs, 22, s * .02);
    paint(hp, { wash: CAT, ink: null });
    for (const k of [-.35, 0, .35]) inkLine([[hx + k * s * hs, hy - 1.25 * s * hs], [hx + k * .8 * s * hs, hy - .8 * s * hs]], sw * .8, CAT_DK, 'marker', 0);
    paint(ellPts(hx, hy + .45 * s * hs, .9 * s * hs, .55 * s * hs, 14), { wash: CAT_LT, ink: null });
    paint(hp, { ink: PAL.ink, sw: sw * .85 });
    const lk = (o.look || 0) * .25 * s * hs;
    for (const sd of [-1, 1]) {
      const ex = hx + sd * .62 * s * hs + lk, ey = hy - .05 * s * hs;
      if (e === 'closed') inkLine([[ex - .25 * s * hs, ey], [ex, ey + .15 * s * hs], [ex + .25 * s * hs, ey]], sw * .8, PAL.ink, 'ink', .5);
      else if (e === 'happy') inkLine([[ex - .25 * s * hs, ey + .1 * s * hs], [ex, ey - .15 * s * hs], [ex + .25 * s * hs, ey + .1 * s * hs]], sw * .8, PAL.ink, 'ink', .5);
      else { const r = e === 'wide' ? .3 : .2; paint(ellPts(ex, ey, r * s * hs, (r + .06) * s * hs, 10), { wash: PAL.ink, ink: null }); paint(ellPts(ex - .06 * s * hs, ey - .08 * s * hs, .07 * s * hs, .07 * s * hs, 6), { wash: '#FFFFFF', ink: null }); }
    }
    paint([[hx - .12 * s * hs + lk, hy + .3 * s * hs], [hx + .12 * s * hs + lk, hy + .3 * s * hs], [hx + lk, hy + .45 * s * hs]], { wash: '#E88C9A', ink: null });
    inkLine([[hx - .25 * s * hs + lk, hy + .6 * s * hs], [hx + lk, hy + .5 * s * hs], [hx + .25 * s * hs + lk, hy + .6 * s * hs]], sw * .5, PAL.ink, 'fine', .5);
    for (const sd of [-1, 1]) for (const k of [-.1, .12]) inkLine([[hx + sd * 1.0 * s * hs, hy + (.35 + k) * s * hs], [hx + sd * 2.0 * s * hs, hy + (.25 + k * 2) * s * hs]], sw * .35, PAL.ink, 'fine', 0);
  };
  const tail = (tx, ty, dir = 1) => inkLine([[tx, ty], [tx + dir * 1.2 * s, ty - .3 * s], [tx + dir * 1.9 * s, ty - 1.3 * s + tw * s], [tx + dir * 1.6 * s + tw * .5 * s, ty - 2.2 * s + tw * .6 * s]], sw * 3.2, CAT_DK, 'marker', .6);
  if (pose === 'sit') {
    tail(1.1 * s, -.4 * s);
    const body = [[-1.5 * s, 0], [-1.35 * s, -1.8 * s], [-.8 * s, -2.8 * s], [.8 * s, -2.8 * s], [1.35 * s, -1.8 * s], [1.5 * s, 0]];
    paint(body, { wash: CAT, ink: PAL.ink, sw: sw * .85, curv: .5 });
    paint(ellPts(0, -1.1 * s, .75 * s, 1.0 * s, 14), { wash: CAT_LT, ink: null });
    for (const sd of [-1, 1]) paint(ellPts(sd * .55 * s, -.12 * s, .42 * s, .25 * s, 10), { wash: CAT_LT, ink: PAL.ink, sw: sw * .55 });
    head(0, -3.6 * s);
  } else if (pose === 'loaf' || pose === 'sleep') {
    if (pose === 'loaf') tail(2.0 * s, -.3 * s, 1);
    const body = pose === 'sleep' ? ellPts(0, -1.0 * s, 2.6 * s, 1.15 * s, 26) : [[-2.4 * s, 0], [-2.5 * s, -1.4 * s], [-1.6 * s, -2.2 * s], [1.8 * s, -2.1 * s], [2.5 * s, -1.2 * s], [2.4 * s, 0]];
    paint(body, { wash: CAT, ink: PAL.ink, sw: sw * .85, curv: .5 });
    for (const k of [-.6, 0, .6]) inkLine([[k * s + .5 * s, -2.05 * s], [k * s + .7 * s, -1.4 * s]], sw * .9, CAT_DK, 'marker', 0);
    if (pose === 'sleep') { inkLine([[2.2 * s, -.6 * s], [1.2 * s, -.1 * s], [-1.4 * s, -.1 * s], [-2.3 * s, -.5 * s]], sw * 3, CAT_DK, 'marker', .6); head(-1.3 * s, -1.4 * s, .85); }
    else head(-1.5 * s, -2.2 * s);
  } else if (pose === 'walk' || pose === 'pounce') {
    const ph = o.walk ?? T * 2, st = pose === 'pounce' ? -.5 : 0;
    tail(2.1 * s, -2.1 * s, 1);
    for (const [lx2, k] of [[-1.5, 0], [-.9, .5], [1.1, .5], [1.7, 0]]) { const a = Math.sin((ph + k) * TAU) * .35 + st * (lx2 < 0 ? 1 : -1); push(); translate(lx2 * s, -1.2 * s); rotate(a); paint(rrPts(-.28 * s, 0, .56 * s, 1.3 * s, .25 * s), { wash: CAT, ink: PAL.ink, sw: sw * .6 }); pop(); }
    paint([[-2.3 * s, -1.3 * s], [-2.1 * s, -2.6 * s], [2.0 * s, -2.7 * s], [2.4 * s, -1.4 * s], [0, -1.0 * s]], { wash: CAT, ink: PAL.ink, sw: sw * .85, curv: .5 });
    for (const k of [-.5, .2, .9]) inkLine([[k * s, -2.7 * s], [k * s + .2 * s, -2.0 * s]], sw * .9, CAT_DK, 'marker', 0);
    head(-2.4 * s, -3.1 * s, .9);
  }
  pop();
  if (pose === 'sleep' && o.zzz) emote('zzz', x - (o.flip ? -1 : 1) * 1 * s, y + (o.dy || 0) * s - 3.3 * s, s * .6, 1);   // opt-in z's
}

// ---------- the living question mark ----------
function qmark(x, y, s, o = {}) {
  const sw = clamp(s / 12, .4, 2), col = o.col || PAL.violet, w = Math.sin(T * 3 + (o.seed || 0)) * .1;
  push(); translate(x, y); rotate((o.rot || 0) + w); scale(1 + (o.sq || 0) * .4, 1 - (o.sq || 0));
  const curve = [[-1.6 * s, -5.4 * s], [-1.2 * s, -6.9 * s], [.4 * s, -7.4 * s], [1.7 * s, -6.5 * s], [1.6 * s, -5.0 * s], [.3 * s, -4.1 * s], [0, -2.9 * s], [0, -2.2 * s]];
  inkLine(curve, sw * 3.9 * 1.05, PAL.ink, 'marker', .6);
  inkLine(curve, sw * 3.9 * .82, col, 'marker', .6);
  inkLine([[-1.1 * s, -6.4 * s], [.2 * s, -6.9 * s]], sw * .8, mixCol(col, '#FFFFFF', .5), 'fine', .5, .7);
  paint(ellPts(0, -.7 * s, .7 * s, .7 * s, 14), { wash: col, ink: PAL.ink, sw: sw * .7 });
  // face on the hook
  const e = o.eyes || 'normal';
  for (const sd of [-1, 1]) {
    const ex = .55 * s + sd * .45 * s, ey = -6.5 * s;
    if (e === 'happy') inkLine([[ex - .2 * s, ey + .05 * s], [ex, ey - .15 * s], [ex + .2 * s, ey + .05 * s]], sw * .7, PAL.cream, 'ink', .5);
    else { paint(ellPts(ex, ey, .17 * s, .22 * s, 8), { wash: PAL.cream, ink: null }); paint(ellPts(ex, ey + .04 * s, .09 * s, .12 * s, 8), { wash: PAL.ink, ink: null }); }
  }
  inkLine([[.35 * s, -6.05 * s], [.55 * s, -5.9 * s], [.75 * s, -6.05 * s]], sw * .5, PAL.cream, 'fine', .5);
  if (o.arms !== false) for (const sd of [-1, 1]) inkLine([[sd * 1.4 * s + .2 * s, -5.3 * s], [sd * 2.1 * s + .2 * s, -5.0 * s + (o.wave && sd > 0 ? -Math.abs(Math.sin(T * 8)) * s : 0)]], sw * 1.2, col, 'marker', .3);
  pop();
}

// ---------- the idea: a little star with a face (the seed of 桃桃) ----------
function idea(x, y, s, o = {}) {
  const sw = clamp(s / 10, .3, 1.6), pk = 1 + .08 * Math.sin(T * 6 + (o.seed || 0));
  glow(x, y, 4.2 * s * (o.glowMul || 1), o.col || '#FFD7E4', .55 * (o.glow ?? 1));
  glow(x, y, 2.0 * s, '#FFF1C2', .6 * (o.glow ?? 1));
  push(); translate(x, y); rotate((o.rot || 0) + Math.sin(T * 2.5 + (o.seed || 0)) * .12); scale(pk * (1 + (o.sq || 0) * .4), pk * (1 - (o.sq || 0)));
  paint(starPts(0, 0, 1.25 * s, .52, 5), { wash: '#FFE8A3', fill: '#FFC2D6', fillOp: 90, bleed: .05, tex: .2, ink: PAL.ink, sw: sw * .6, curv: .25 });
  const e = o.eyes || 'normal';
  for (const sd of [-1, 1]) {
    if (e === 'happy') inkLine([[sd * .3 * s - .12 * s, .02 * s], [sd * .3 * s, -.12 * s], [sd * .3 * s + .12 * s, .02 * s]], sw * .6, PAL.ink, 'ink', .5);
    else paint(ellPts(sd * .3 * s, -.02 * s, .08 * s, .11 * s, 8), { wash: PAL.ink, ink: null });
  }
  paint(ellPts(0, .22 * s, .1 * s, .06 * s, 8), { wash: '#C9566B', ink: null });
  for (const sd of [-1, 1]) paint(ellPts(sd * .55 * s, .18 * s, .14 * s, .07 * s, 8), { fill: CHEEK, fillOp: 150, bleed: .2, ink: null });
  if (o.tuft !== false) inkLine([[0, -1.15 * s], [.25 * s, -1.6 * s], [.05 * s, -1.9 * s]], sw * .9, PAL.pink, 'ink', .6);
  pop();
  if (o.trail) for (let i = 1; i <= 5; i++) { const tt = T - i * .07, [tx, ty] = o.trail(tt); paint(starPts(tx, ty, (.4 - i * .06) * s, .4, 4, 0), { wash: '#FFF1C2', washOp: 220 - i * 35, ink: null }); }
}

// tiny sparkle glint (4-point) that twinkles; age 0..1 over its life
function sparkle(x, y, r, col = '#FFF3C0', k = 1) {
  if (k <= .01) return; const p = Math.sin(clamp(k) * Math.PI);
  glow(x, y, r * 2.5 * p, col, .4 * p);
  paint(starPts(x, y, r * p, .28, 4, 0), { wash: col, ink: null });
}
