# Animation guide (read this before painting a chapter)

This folder renders a 290 s music video for the song 《还没写完》 ("Not finished writing yet") as painted watercolour-and-ink
animation with chibi (Q版) characters. It follows the approach of the P(doom) video in the repository root (chapters
as pure functions of time, painted shapes with boiling ink lines, a paper texture, karaoke), but the painter is a
CPU-friendly Canvas 2D engine, so a frame renders in well under half a second without a GPU.

The shot list is in [STORYBOARD.md](STORYBOARD.md) (Chinese). The direction: **cute, warm, gentle, picture-book
watercolour; lively animation with something happening in every shot; a ballad, so camera moves are slow and smooth,
with small beat-synced motion (bigger in the choruses).**

## How a chapter works

Each chapter is one file in `src/ch/`, wrapped in an IIFE so its helpers stay private:

```js
// src/ch/c02_desk.js
(() => {
  const B = n => beatT(n);                       // beat n's time: beats fall at 0.156 + n × 0.6 s
  function drafts(t, lt, dur) { ... }            // a shot
  chapter('desk', 28.956, 48.156, [[28.956, window], [33.756, drafts], ...]);
  transition(28.956, 'dissolve', .8);            // the chapter that STARTS at a boundary registers its transition
})();
```

- `chapter(name, start, end, shots)` registers the chapter. A shot fn is called as `fn(t, lt, dur)` (song time, time
  since the shot started, shot length) and must paint the **entire frame**, background included. Cuts land on each
  shot's start time.
- **Frames render in parallel and out of order.** Every shot must be a pure function of `t`: no state that carries
  between frames, no `Math.random()`. Use `hash(i)` for stable per-object randomness and `jit(a)` for hand-drawn jitter
  (reseeded 10×/s, which makes the linework "boil" like hand-drawn animation — wanted).
- Transitions run a shot slightly outside its time range (`lt < 0` or `lt > dur`), so shots must tolerate that
  (`seg`, `kf`, `ease` all clamp).
- `transition(time, type, duration, options)` registers a transition at a cut: `'dissolve'`, `'page'` (a paper page
  turns; `{ dir: 1 }` right-to-left, `-1` left-to-right), `'wash'` (`{ c1, c2 }` wet brush strokes), `'bloom'`
  (`{ x, y, col }` a watercolour blot swells and shrinks), `'dark'`, `'white'` (`{ col }`). Use them inside your chapter
  too, where a soft cut helps. The chapter that starts at a chapter boundary registers that boundary's transition (the
  storyboard says which one).
- Only edit your own chapter file. If a shared helper is missing, write it privately inside your IIFE. If you find a real
  bug in a shared file (core.js, cast.js, props.js, timeline.js, lyrics.js, render.mjs, studio.html), report it; don't
  edit it.

## Canvas and layout

- 1920×1080, y points down, origin top-left. Everything is in this space unless a camera is active.
- **The karaoke band covers the bottom (about y 970–1065) whenever a lyric is showing.** Keep faces and key action above
  about y 950.
- The paper texture is already under every frame, and a paper grain + vignette is multiplied over the top.

## Painting API (core.js)

`paint(pts, o)` paints one shape from a point list `[[x, y], ...]`:

| option | meaning |
|---|---|
| `wash, washOp` | flat colour (opacity 0–255). Characters and anything that must read solidly. |
| `grad: [c0, c1, angle]` | linear-gradient wash (skies, walls). |
| `fill, fillOp, bleed, tex, border` | watercolour: layered, slightly wandering washes with a darker pigment rim and granulation. `bleed` .02–.3, `tex` 0–1, `border` 0–1. Backgrounds, shading, pools of colour. |
| `hatch: { d, a, w, c, b }` | hatching lines (spacing, angle, weight, colour, brush). Use sparingly. |
| `ink, sw, br` | outline colour (default `PAL.ink`), weight (~.4–2.5), brush: `'ink'` (default, tapered), `'fine'`, `'pencil'` (grainy, broken), `'dry'` (bristly), `'marker'` (even). **`ink: null` means no outline.** |
| `curv` | smooth the outline through the points (0–1). |

Other drawing helpers:
- **Geometry:** `rectPts(x, y, w, h, jitter)`, `ellPts(cx, cy, rx, ry, n, jitter, rot)`, `rrPts(x, y, w, h, r, jitter)`,
  `starPts(cx, cy, r, inner, n, rot)`, `heartPts(cx, cy, r)`, `cloudPts(cx, cy, w, h, seed, n)`, `smoothPts(pts, curv, closed)`.
- **Lines:** `inkLine(pts, sw, colour, brush, curvature, opacity)` — a tapered, boiling stroke along a path.
- **Light:** `glow(x, y, r, colour, a)` soft radial pool (lamps, halos); `light(x, y, r, colour, a)` the same but screen-
  blended so it brightens what is under it (screen glow on a face); `bokeh(x, y, r, colour, a)` out-of-focus light disc;
  `dot(x, y, r, colour, a)` cheap disc; `fillRectA(x, y, w, h, colour, a)`.
- **Transforms:** `push()/pop()/translate()/rotate()/scale()` (Canvas save/restore underneath).
- **Palette** `PAL`: `paper, ink, cream, night, indigo, navy, lamp, ochre, peach, rose, pink, pinkLt, sakura, mint, sage,
  teal, sky, skyLt, violet, lilac, coral, gray, grayLt, steel, wood, woodDk, screen`. `mixCol(a, b, k)` mixes two hex
  colours. Any hex colour is fine; keep it soft and harmonious. Avoid pure black and white: use `PAL.ink` / `PAL.night`
  and `PAL.cream`.
- **Timing:** `bpOf(t)` beat position (100 BPM: beat = 0.6 s, bar = 2.4 s, beats at `0.156 + n × 0.6`), `beatN(t)`,
  `beatT(n)` (time of beat n), `pulse(t, k)` (1 on each beat, decays), `pulse2` (eighths), `seg(t, a, b)` 0..1 progress,
  `smooth01(t, a, b, c, d)` fade in over [a,b] and out over [c,d], `kf(t, [[t0, v0], [t1, v1], ...], easeFn)` keyframes
  (values may be arrays). Easings: `ease`, `easeOut`, `easeIn`, `easeInOut`, `backOut` (overshoot), `elasticOut`. Also
  `lerp`, `clamp`, `frac`, `wob(t, freq, phase)`, `hash(i)`, `TAU`, `shakeXY(t, amount)`.
- **Camera:** `camBegin(cx, cy, zoom, rot)` puts world point (cx, cy) at the screen centre; `camEnd()` restores. Use it
  for pushes, pans, tilts, zoom-outs. One level only; always pair with `camEnd()`.
- **Lettering:** `letter(txt, x, y, size, colour, { font, pop, rot, alpha, ink: false, stroke, align })` draws text in the
  current transform (so it goes through the camera). Fonts: `'cute'` (ZCOOL KuaiLe, default — sound effects), `'kai'`
  (LXGW WenKai — gentle handwriting-book text), `'brush'` (Ma Shan Zheng — the title), `'hand'` (Long Cang — scribbles in
  the sketchbook). `pop` 0..1 is an appear with overshoot. `sfx(txt, x, y, size, colour, age, { life, rot })` is a sound
  effect that pops, wobbles and fades.
- **Layers and fades:** `fadeIn(k, fn)` paints `fn` with every shape's opacity × k (cheap; no layer). `layer(fn)` paints
  into an offscreen full-frame canvas and returns it; `stamp(canvas, alpha, clipPts)` draws it in screen space (optionally
  clipped to a polygon); `scene(fn)` = a layer with the paper under it; `dissolve(k, drawA, drawB)`; `clipTo(pts, fn)`.
- **Sketch mode:** `sketch(k, fn)` paints `fn` as a graphite pencil drawing (k = 1), a painting (k = 0), or anything in
  between. Every character and prop works in it. This is how 桃桃 exists as a draft and then comes alive.
- **Full-frame effects** (screen space): `flash(k, colour)`, `iris(cx, cy, r, colour)`, `irisShape(pts, colour)` (paint
  everything outside a shape), `vignette(k, colour)`, `grade(k, mode, colour)` (`'saturation'` + grey desaturates,
  `'color'` tints, `'multiply'` darkens, `'screen'` lifts), `bloomCover(p, cx, cy, colour)`.

## Characters (cast.js)

All characters stand on the ground point `(x, y)` between their feet, with unit `s`. Chibi proportions: about **10.2s
tall**, the head about 5.4s wide. Size guide: tiny s ≈ 5–10, normal s ≈ 22–34, close-up s ≈ 50–100 (use a big `y` below
the frame to show only the head and shoulders).

**我 — `hero(x, y, s, o)`**: chestnut bob, a star hair clip, an expressive **ahoge** (呆毛).
- `outfit`: `'office'` (navy cardigan + blue lanyard with the work badge; `badge: false` hides it), `'home'` (mint hoodie),
  `'pajama'` (pale blue with stars).
- **Pose:** `dy` (units, negative = up), `sq` (squash; negative stretches), `rot`, `flip`, `sx`, `aL`/`aR` (arm angles:
  0 = out sideways, positive = raised, about −1.2 = hanging), `walk` or `run` (phase), `sit`, `back` (seen from behind),
  `tilt` (head tilt), `lookX`/`lookY` (−1..1: eyes and face turn), `bob`.
- **Face:** `eyes`: normal, look, happy, closed, sleepy, sparkle, star, wide, teary, dot, spiral, heart, tired, wink, x.
  `mouth`: smile, open, o, O, flat, wobble, cat, sad, yawn, grin, pout, tiny. `brows`: worried, angry, up, sad.
  `blush` (0..1 or true), `tears` (0..1), `ahoge`: `'normal'`, `'droop'` (tired), `'perk'` (inspired), `'question'`,
  `'heart'`, `'spiral'`.
- **Hooks:** `draw(s, sw)` body-local; `handL(s, sw)` / `handR(s, sw)` at the hand centre in arm space (+x = outward along
  the arm) for holding pencils, cans, cups; `head(s, sw)` in head-local space (head centre 0,0; the face spans about ±2.5s).
  `armFront: 'L' | 'R' | 'both'` paints that arm (and what it holds) over the head, for raised hands and props.
- **Emote:** `emote` + `emoteK`: sweat, spark, heart, anger, music, swirl, zzz, bulb, flower, !, ?, !?, !!, … .
- **Mood changes:** never snap between faces. Use `mood(t, [[t0, 'normal'], [t1, 'sparkle', 'spark', 'open'], ...])`
  (eyes, emote, mouth); spread the result into the options for a blink-squash-and-pop change.
- **Motion:** `move(style, t, seed)` returns beat-synced pose offsets: idle, breathe, sway, bounce, hop, cheer, walk, run,
  dance, type. `heroDancer(x, y, s, style, t, extra)` = `hero` + `move`.

**桃桃 — `momo(x, y, s, o)`**: the same builder and options, with pink twin tails, a star on her antenna, a cream dress
and pink star-highlight eyes. `digital: 0..1` adds her pink screen aura; `starGlow` scales the antenna star glow.
`momoDancer(...)` exists too. When she is on a screen she is small (s ≈ 6–14); in the fantasy shots she is about 0.8× the
hero's size.

**`person(x, y, s, o)`**: coworkers, the boss (`suit: true`), users. `seed` picks hair and clothes; default eyes are dots.

**团子 — `cat(x, y, s, o)`**: `pose`: sit, loaf, sleep (with z's; `zzz: false` hides them), walk, pounce; `eyes`: open,
closed, happy, wide; `look`, `flip`, `tail` (phase), `dy`, `sq`, `rot`. About 5s long.

**`qmark(x, y, s, o)`**: the living question mark (`col`, `eyes: 'happy'`, `wave`, `rot`, `sq`). About 7.5s tall.
**`idea(x, y, s, o)`**: the idea star with a face (`eyes: 'happy'`, `glow`, `rot`, `sq`, `trail: t => [x, y]`).
**`sparkle(x, y, r, colour, k)`**: a twinkle; k is 0..1 through its life.

## Sets and props (props.js)

- **The room — `room(t, o)`**: her apartment, always laid out the same (see the header of props.js for coordinates):
  window x 170–830, y 110–610 with rain and city bokeh; cork board top right; desk top y 700 from x 640; monitor centre
  (1330, 470); desk lamp at (905, 700); flat sketchbook on the desk; peach soda can, mug, plant; floor from y 900; 团子's
  pink cushion at (420, 935). Options: `lamp` 0..1, `night` 0..1, `dawn` 0..1, `rain` 0..1, `screen(rect, t)` paints the
  monitor content, `screenOn` 0..1, `book` ('open' | 'closed' | 'none'), `can`, `clutter` 0..1, `dark` 0..1.
  `seatedAtDesk(t, { hero: {...} })` puts her in the chair with her back to us, facing the monitor.
- **The reverse angle — `roomReverse(t, o)`**, then the hero, then `deskFront(t, { items })`: looking back into the room
  from behind the monitor (fairy lights, bookshelf, door, wall clock `o.clock` hours, bed with a star blanket). She sits at
  `hero(960, 1000, 44, { sit: true })`; add `light(960, 700, 420, PAL.screen, .25)` for the screen glow on her face.
- **Top-down desk — `deskTop(t, o)`**: an open sketchbook spread centred at (960, 540), pages 460×630;
  `o.page(rect, side, t)` paints each page (side −1 left, 1 right); `o.items(t)` adds things on the desk.
- **Exterior:** `nightCity(t, { x0, x1, y, color, paint: x => 0..1, lit })` skyline layers (grey-blue → pastel per x);
  `windowView(x, y, w, h, t, o)`; `rainStreaks(t, rect, n, colour, a, { fall })`; `bokehField(t, rect, n, palette, o)`;
  `starField(t, rect, n)`; `moonFace(x, y, r, o)`; `cloudPuff(x, y, s, colour, o)`.
- **Screens:** `monitor(cx, cy, w, h, { on, screen(rect, t) })` returns the screen rect; `appWindow(x, y, w, h,
  { content(rect), bar, bg })` a soft rounded UI window.
- **Desk props:** `deskLamp`, `sketchbook(cx, cy, w, h, { closed, page })`, `bookFlat`, `sodaCan(x, y, s, { drops, rot })`,
  `mug(x, y, s, colour, steam)`, `plant`, `paperBall(x, y, s, seed)`, `stickyNote(x, y, s, colour, rot, doodle)`,
  `pencil(x, y, s, rot, colour)` (the tip is at (x, y)), `chair(x, floorY, s, { seat, backOnly, back })`,
  `wallClock(x, y, r, hours)`.
- **Recurring motifs:** `sealStamp(x, y, s, { face: 'stern'|'dizzy'|'sad', rot, sq })` (the 落款 seal; its inked face is at
  (x, y)) and `sealPrint(x, y, s, k, ch)`; `sighCloud(x, y, s, { pop: 0..1, rain })` (the grey "算了" cloud);
  `moonFace(x, y, r, { eyes, rot })` (the crescent).

## Style rules

- **Look:** a warm picture book. Characters are flat `wash` colour with ink outlines; backgrounds are soft watercolour
  `fill` shapes, gradients and glows. Light matters: lamp pools (`glow` with `PAL.lamp`), screen glow (`PAL.screen`), bokeh.
- **Continuity:** follow the storyboard's outfits and props. She is in `office` in the office and on the street in
  chapter 1, `home` at home until the bridge, `pajama` from the bridge to the end. The idea star becomes 桃桃's antenna star
  in chapter 4; after that, 桃桃 exists. The peach soda can, the room layout, and 团子 stay the same everywhere.
- **Motion:** everything moves: the camera drifts or pushes, characters breathe and sway on the beat (`move`), hair and
  ahoge bounce, lights twinkle. Put the key action of a shot on beat times. Use squash and stretch, anticipation and
  overshoot (`backOut`, `elasticOut`). It is a ballad: prefer slow, smooth camera moves (ease in and out), gentle bounces.
- **Readability:** one clear focal action per shot, with a big readable silhouette. Shots are 2–7 s; the idea must read
  instantly. Keep contrast between the characters and the background.
- **Text-light:** no captions, no labels, no signs that repeat the lyric. A handful of sound effects in the whole video.
- **Performance:** aim for ≤ 400 ms per frame (the sheet prints ms/frame; the first frame of a run includes warm-up).
  Hundreds of shapes are fine; thousands of watercolour `fill`s are not. Prefer `glow`/`dot`/`bokeh` for many small lights.

## Checking your work

Run from `still-writing/`:

```
node render.mjs --sheet=29.2,30.4,31.6,32.8,34.0,35.2 --cols=3 --w=640 --out=out/check/c02_a.jpg
node render.mjs --stills=31.0 --out=out/check/c02_full
node render.mjs --clip=28:48 --workers=3 --out=out/check/c02.mp4
```

A sheet puts several times on one image; open it with the Read tool and look carefully. Check:
- the first and last frames of every shot, and a few in between;
- that motion reads across consecutive times (e.g. every 0.1 s around a hit);
- transitions into and out of your chapter;
- that nothing important sits under the karaoke band.

Iterate until every shot looks good: charming, readable, lively, on-model. Fix whatever looks off: scale, contrast,
clutter, stiffness, empty frames.
