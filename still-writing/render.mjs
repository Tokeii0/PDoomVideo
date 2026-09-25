// render.mjs: paint frames of the MV in Node with @napi-rs/canvas (Skia, CPU) and encode them with ffmpeg.
//   node render.mjs --sheet=23,23.5,24 [--cols=3] [--w=640] --out=out/check.jpg   contact sheet (fast visual check)
//   node render.mjs --stills=0.8,3,23.8 --out=out/test                          full-res PNG stills
//   node render.mjs --clip=10:20 [--workers=4] --out=out/test.mp4                short clip with audio
//   node render.mjs --frames=0:290 --workers=4                                  full-res JPEG frames → out/frames (resumable)
//   node render.mjs --encode [--out=out/still-writing.mp4]                       frames + song → MP4
//   node render.mjs --loop=name --len=4 [--out=out/loop_name]                   one cycle of a standalone loop (PNGs)
// Options: --fps=24, --ffmpeg=<path>. Scripts are loaded in the order studio.html lists them.
import { createCanvas, Path2D, GlobalFonts } from '@napi-rs/canvas';
import { fork, spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, renameSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import os from 'node:os';

const ROOT = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const fps = +(args.fps || 24), FFMPEG = args.ffmpeg || 'ffmpeg';
const FRAMES_DIR = resolve(args.dir || join(ROOT, 'out/frames'));
const SONG = join(ROOT, 'assets/song.mp3');
const FONT_FILES = [['LXGWWenKai-Medium.ttf', 'LXGW WenKai'], ['ZCOOLKuaiLe-Regular.ttf', 'ZCOOL KuaiLe'], ['MaShanZheng-Regular.ttf', 'Ma Shan Zheng'], ['LongCang-Regular.ttf', 'Long Cang']];

// ---------- load the painter (same classic scripts the studio page uses) ----------
function loadPainter() {
  for (const [f, fam] of FONT_FILES) {
    const p = join(ROOT, 'assets/fonts', f);
    if (!existsSync(p)) { console.error(`missing font ${p}: run  node fetch-fonts.mjs`); process.exit(1); }
    GlobalFonts.registerFromPath(p, fam);
  }
  globalThis.ENV = { canvas: (w, h) => createCanvas(w, h), Path2D };
  const html = readFileSync(join(ROOT, 'studio.html'), 'utf8');
  const files = [...html.matchAll(/<script src="(src\/[^"]+)"><\/script>/g)].map(m => m[1]);
  if (args.extra) files.push(...String(args.extra).split(','));                  // scratch scripts for tests
  for (const f of files) {
    const p = resolve(ROOT, f);
    if (!existsSync(p)) { if (!args.worker && !args.quiet) console.warn('(not painted yet: ' + f + ')'); continue; }
    try { vm.runInThisContext(readFileSync(p, 'utf8'), { filename: f }); }
    catch (e) {                                                                    // one broken chapter must not stop the others
      if (!f.includes('/ch/') && !args.extra?.includes(f)) throw e;
      console.warn(`!! ${f} failed to load, skipped: ${e.message}`);
    }
  }
  const api = vm.runInThisContext('({ initCore, renderFrame, W, H, DUR, LOOPS })');
  const canvas = createCanvas(api.W, api.H), ctx = canvas.getContext('2d');
  api.initCore(ctx);
  const render = t => { try { api.renderFrame(t); } catch (e) { console.error(`!! error painting t=${t}: ${e.stack.split('\n').slice(0, 4).join(' | ')}`); } };
  return { ...api, renderFrame: render, canvas };
}
const times = s => String(s).split(',').map(Number);
const run = (cmd, a) => new Promise((ok, bad) => { const p = spawn(cmd, a, { stdio: 'inherit' }); p.on('close', c => c ? bad(new Error(cmd + ' exited ' + c)) : ok()); });

// ---------- worker: render the frames it is sent, reply when each is written ----------
if (args.worker) {
  const P = loadPainter();
  if (args.loop) globalThis.LOOP = P.LOOPS[args.loop];
  process.on('message', ({ i, file, type }) => {
    P.renderFrame(i / fps);
    const buf = type === 'png' ? P.canvas.toBuffer('image/png') : P.canvas.toBuffer('image/jpeg', 93);
    writeFileSync(file + '.tmp', buf); renameSync(file + '.tmp', file);
    process.send({ i });
  });
  process.send({ ready: true });
} else if (args.encode) {
  const out = resolve(args.out || join(ROOT, 'out/still-writing.mp4')), n = readdirSync(FRAMES_DIR).filter(f => f.endsWith('.jpg')).length;
  console.log(`encoding ${n} frames → ${out}`);
  mkdirSync(dirname(out), { recursive: true });
  await run(FFMPEG, ['-y', '-loglevel', 'error', '-stats', '-framerate', String(fps), '-i', `${FRAMES_DIR}/f%05d.jpg`, '-i', SONG,
    '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k',
    '-movflags', '+faststart', '-shortest', out]);
  console.log('wrote ' + out);
} else if (args.sheet) {
  const P = loadPainter(), ts = times(args.sheet), cols = +(args.cols || 3), w = +(args.w || 640), h = Math.round(w * 9 / 16);
  const sheet = createCanvas(cols * w, Math.ceil(ts.length / cols) * h), c = sheet.getContext('2d'), ms = [];
  if (args.loop) globalThis.LOOP = P.LOOPS[args.loop];
  ts.forEach((t, i) => {
    const t0 = performance.now(); P.renderFrame(t); ms.push(Math.round(performance.now() - t0));
    const x = (i % cols) * w, y = Math.floor(i / cols) * h;
    c.drawImage(P.canvas, x, y, w, h); c.fillStyle = 'rgba(0,0,0,.65)'; c.fillRect(x, y, 100, 26); c.fillStyle = '#fff'; c.font = '16px sans-serif'; c.fillText(t.toFixed(2) + 's', x + 6, y + 18);
  });
  const out = resolve(args.out || join(ROOT, 'out/sheet.jpg')); mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, sheet.toBuffer('image/jpeg', 88));
  console.log(`${out}  ms/frame: ${ms.join(' ')}`);
} else if (args.stills) {
  const P = loadPainter(), out = resolve(args.out || join(ROOT, 'out/stills')); mkdirSync(out, { recursive: true });
  if (args.loop) globalThis.LOOP = P.LOOPS[args.loop];
  for (const s of times(args.stills)) {
    const t0 = performance.now(); P.renderFrame(s);
    const f = `${out}/t${s.toFixed(2).replace('.', '_')}.png`; writeFileSync(f, P.canvas.toBuffer('image/png'));
    console.log(`${f}  ${Math.round(performance.now() - t0)} ms`);
  }
} else if (args.frames || args.clip || args.loop) {
  // Parallel and resumable: worker processes pull the next missing frame; files are written atomically.
  const workers = +(args.workers || Math.max(1, os.cpus().length));
  let dir = FRAMES_DIR, first, last, ext = 'jpg', DURV = 290;
  if (args.loop) { dir = resolve(args.out || join(ROOT, `out/loop_${args.loop}`)); first = 0; last = Math.round(+(args.len || 4) * fps) - 1; ext = 'png'; }
  else {
    const [a, b] = String(args.frames || args.clip).split(':').map(Number);
    if (args.clip) { dir = resolve(join(ROOT, 'out/clip_frames')); rmSync(dir, { recursive: true, force: true }); }
    first = Math.round(a * fps); last = Math.min(Math.ceil(DURV * fps) - 1, Math.round(b * fps) - 1);
  }
  mkdirSync(dir, { recursive: true });
  const name = i => `${dir}/${args.loop ? 'l' : 'f'}${String(i).padStart(5, '0')}.${ext}`;
  const todo = []; for (let i = first; i <= last; i++) { const f = name(i); if (!existsSync(f) || statSync(f).size < 1000) todo.push(i); }
  console.log(`${todo.length} frames to render (${last - first + 1 - todo.length} already done), ${workers} workers`);
  let next = 0, done = 0; const start = Date.now();
  await Promise.all(Array.from({ length: Math.min(workers, todo.length) }, () => new Promise((ok, bad) => {
    const wa = ['--worker', `--fps=${fps}`]; if (args.loop) wa.push(`--loop=${args.loop}`); if (args.extra) wa.push(`--extra=${args.extra}`);
    const p = fork(fileURLToPath(import.meta.url), wa, { stdio: ['ignore', 'inherit', 'inherit', 'ipc'] });
    const feed = () => { if (next < todo.length) { const i = todo[next++]; p.send({ i, file: name(i), type: ext }); } else { p.kill(); ok(); } };
    p.on('message', m => {
      if (!m.ready && (++done % 48 === 0 || done === todo.length)) {
        const el = (Date.now() - start) / 1000;
        console.log(`frame ${done}/${todo.length}  ${(el / done * 1000).toFixed(0)} ms/frame effective  eta ${((todo.length - done) * el / done / 60).toFixed(1)} min`);
      }
      feed();
    });
    p.on('exit', c => { if (c && next < todo.length) bad(new Error('worker exited ' + c)); });
  })));
  if (args.clip) {
    const [a, b] = String(args.clip).split(':').map(Number), out = resolve(args.out || join(ROOT, 'out/clip.mp4'));
    mkdirSync(dirname(out), { recursive: true });
    await run(FFMPEG, ['-y', '-loglevel', 'error', '-framerate', String(fps), '-start_number', String(first), '-i', `${dir}/f%05d.jpg`,
      '-ss', String(a), '-t', String(b - a), '-i', SONG, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19',
      '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', out]);
    console.log('wrote ' + out);
  }
} else console.log('nothing to do: see the usage at the top of render.mjs');
