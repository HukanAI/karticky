// Kontrola dat karet: node tools/check-cards.mjs
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';

const MIN = 500;
const ctx = { window: {}, document: { createElementNS: () => ({ setAttribute() {}, set innerHTML(_v) {} }) } };
ctx.window = ctx;
vm.createContext(ctx);

const dir = new URL('../cards/', import.meta.url);
// Soubory kategorie: cat1.js, cat1b.js … – řadíme podle čísla a pak podle přípony.
const files = readdirSync(dir)
  .filter(f => /^cat\d+[a-z]?\.js$/.test(f))
  .sort((a, b) => {
    const pa = a.match(/^cat(\d+)([a-z]?)/), pb = b.match(/^cat(\d+)([a-z]?)/);
    return (+pa[1] - +pb[1]) || pa[2].localeCompare(pb[2]);
  });
vm.runInContext(readFileSync(new URL('../poses.js', import.meta.url), 'utf8'), ctx);
for (const f of files) vm.runInContext(readFileSync(new URL(f, dir), 'utf8'), ctx);

// Stejné sloučení podle id jako v app.js.
const CATEGORIES = ctx.CATEGORIES
  .sort((a, b) => a.id - b.id)
  .reduce((out, cat) => {
    const prev = out[out.length - 1];
    if (prev && prev.id === cat.id) {
      prev.male.push(...cat.male);
      prev.female.push(...cat.female);
    } else {
      out.push({ ...cat, male: [...cat.male], female: [...cat.female] });
    }
    return out;
  }, []);

const POSES = ctx.POSES || {};

const PLACES = {
  'postel': /postel|čelo postele/i, 'gauč': /gauč|pohovk/i, 'kuchyň': /kuchy|link[ay]|lince/i,
  'stůl': /stůl|stol/i, 'židle/křeslo': /židl|křesl/i, 'sprcha/vana': /sprch|van[ayě]/i,
  'zrcadlo': /zrcad/i, 'chodba/zeď/dveře': /chodb|zeď|bzdib|dveř/i, 'podlaha/koberec': /podlah|koberec|zem/i,
  'pračka': /pračk/i, 'okno': /okn|parapet/i,
};
const TOYS = {
  'pírko': /pírk/i, 'pouta': /pouta|pout[yuaie]|spout/i, 'bičík': /bičík/i, 'vibrátor': /vibrátor/i,
  'led': /kostk[ay] ledu|kostku ledu|ledov/i, 'kroužek': /kroužek|kroužk[eu]m/i, 'kravata': /kravat/i,
  'štětec': /štětc|štětec|štětečk/i, 'žínka': /žínk/i, 'sluchátka': /sluchátk/i, 'telefon': /telefon|mobil/i,
};

let errors = 0;
const seen = new Map();
const norm = t => t.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
let total = 0;
let withPose = 0;
const poseUse = {};

for (const cat of CATEGORIES) {
  const line = [`\n${cat.id}. ${cat.name}`];
  for (const role of ['male', 'female']) {
    const list = cat[role];
    total += list.length;
    if (list.length < MIN) { console.error(`CHYBA: kat ${cat.id} ${role} má jen ${list.length} karet`); errors++; }
    const places = {}; const toys = {}; let timers = 0;
    list.forEach((raw, i) => {
      const [text, timer, pose, extra] = raw.split('|');
      if (extra !== undefined) { console.error(`CHYBA: moc polí ${cat.id}/${role}/${i}: ${raw}`); errors++; }
      if (timer !== undefined && timer !== '' && !/^[1-9]\d*$/.test(timer)) {
        console.error(`CHYBA: špatný časovač ${cat.id}/${role}/${i}: ${raw}`); errors++;
      }
      if (pose !== undefined && pose !== '') {
        const base = pose.replace(/!$/, '');
        if (!POSES[base]) { console.error(`CHYBA: neznámá poloha „${pose}" ${cat.id}/${role}/${i}`); errors++; }
        else { withPose++; poseUse[base] = (poseUse[base] || 0) + 1; }
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

const unused = Object.keys(POSES).filter(id => !poseUse[id]);
console.log(`\nPolohy: ${Object.keys(POSES).length} definovaných, ${withPose} karet má polohu v datech`);
if (unused.length) console.log(`Nepoužité polohy: ${unused.join(', ')}`);
console.log(`Celkem karet: ${total}`);
if (errors) { console.error(`\n${errors} chyb`); process.exit(1); }
console.log('OK');
