// Kontrola dat karet: node tools/check-cards.mjs
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const MIN = 165;
const ctx = { window: {} };
ctx.window = ctx;
vm.createContext(ctx);
for (let i = 1; i <= 5; i++) {
  vm.runInContext(readFileSync(new URL(`../cards/cat${i}.js`, import.meta.url), 'utf8'), ctx);
}

const PLACES = {
  'postel': /postel|čelo postele/i, 'gauč': /gauč|pohovk/i, 'kuchyň': /kuchy|link[ay]|lince/i,
  'stůl': /stůl|stol/i, 'židle/křeslo': /židl|křesl/i, 'sprcha/vana': /sprch|van[ayě]/i,
  'zrcadlo': /zrcad/i, 'chodba/zeď/dveře': /chodb|zeď|bzdib|dveř/i, 'podlaha/koberec': /podlah|koberec|zem/i,
  'pračka': /pračk/i, 'okno': /okn|parapet/i,
};
const TOYS = { 'pírko': /pírk/i, 'pouta': /pouta|pout[yuaie]|spout/i, 'bičík': /bičík/i, 'vibrátor': /vibrátor/i };

let errors = 0;
const seen = new Map();
const norm = t => t.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
let total = 0;

for (const cat of ctx.CATEGORIES.sort((a, b) => a.id - b.id)) {
  const line = [`\n${cat.id}. ${cat.name}`];
  for (const role of ['male', 'female']) {
    const list = cat[role];
    total += list.length;
    if (list.length < MIN) { console.error(`CHYBA: kat ${cat.id} ${role} má jen ${list.length} karet`); errors++; }
    const places = {}; const toys = {}; let timers = 0;
    list.forEach((raw, i) => {
      const [text, timer, extra] = raw.split('|');
      if (extra !== undefined || (timer !== undefined && !/^[1-9]\d*$/.test(timer))) {
        console.error(`CHYBA: špatný časovač ${cat.id}/${role}/${i}: ${raw}`); errors++;
      }
      if (timer) timers++;
      if (text.length < 15) { console.error(`CHYBA: krátký text ${cat.id}/${role}/${i}`); errors++; }
      const key = norm(text);
      if (seen.has(key)) { console.error(`CHYBA: duplicita ${cat.id}/${role}/${i} = ${seen.get(key)}: ${text}`); errors++; }
      else seen.set(key, `${cat.id}/${role}/${i}`);
      for (const [n, re] of Object.entries(PLACES)) if (re.test(text)) places[n] = (places[n] || 0) + 1;
      for (const [n, re] of Object.entries(TOYS)) if (re.test(text)) toys[n] = (toys[n] || 0) + 1;
    });
    line.push(`  ${role === 'male' ? 'muž ' : 'žena'}: ${list.length} karet, ${timers} s časovačem`);
    line.push(`        místa: ${Object.entries(places).map(([k, v]) => `${k} ${v}`).join(', ')}`);
    line.push(`        pomůcky: ${Object.entries(toys).map(([k, v]) => `${k} ${v}`).join(', ')}`);
  }
  console.log(line.join('\n'));
}
console.log(`\nCelkem karet: ${total}`);
if (errors) { console.error(`\n${errors} chyb`); process.exit(1); }
console.log('OK');
