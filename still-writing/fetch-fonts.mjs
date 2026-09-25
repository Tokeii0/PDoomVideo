// fetch-fonts.mjs: download the four (SIL OFL) fonts the MV paints with into assets/fonts/.
//   node fetch-fonts.mjs
import { mkdirSync, existsSync, writeFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = join(dirname(fileURLToPath(import.meta.url)), 'assets/fonts');
const FONTS = [
  ['LXGWWenKai-Medium.ttf', 'https://github.com/lxgw/LxgwWenKai/releases/download/v1.522/LXGWWenKai-Medium.ttf'],
  ['ZCOOLKuaiLe-Regular.ttf', 'https://raw.githubusercontent.com/google/fonts/main/ofl/zcoolkuaile/ZCOOLKuaiLe-Regular.ttf'],
  ['MaShanZheng-Regular.ttf', 'https://raw.githubusercontent.com/google/fonts/main/ofl/mashanzheng/MaShanZheng-Regular.ttf'],
  ['LongCang-Regular.ttf', 'https://raw.githubusercontent.com/google/fonts/main/ofl/longcang/LongCang-Regular.ttf']
];
mkdirSync(DIR, { recursive: true });
for (const [name, url] of FONTS) {
  const f = join(DIR, name);
  if (existsSync(f) && statSync(f).size > 100000) { console.log('have', name); continue; }
  process.stdout.write(`fetching ${name} … `);
  const r = await fetch(url);
  if (!r.ok) { console.log('failed: HTTP ' + r.status); process.exitCode = 1; continue; }
  writeFileSync(f, Buffer.from(await r.arrayBuffer()));
  console.log(`${(statSync(f).size / 1e6).toFixed(1)} MB`);
}
