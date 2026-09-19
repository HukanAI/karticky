// Kontrola, že se každá karta vejde na displej bez posouvání.
//
// Měří se v opravdové `.card-front` přes headless Chromium – včetně štítků pomůcek
// a bezpečnostního pruhu. Bez nich měření lže: karta s obrázkem, časovačem a štítkem
// je o desítky pixelů vyšší než holý text.
//
// Hlídají se dvě věci:
//   1. obsah karty se vejde po doběhnutí `fitCard()` (žádné posouvání uvnitř karty),
//   2. neposouvá se ani celá stránka.
//
// Spuštění:  node tools/check-fit.mjs
// Vyžaduje Playwright (`npm i -g playwright` nebo systémovou instalaci).

import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Displeje, na kterých hra musí fungovat. Nízké výšky odpovídají telefonu,
// kde velkou část okna sežere lišta prohlížeče.
const VIEWPORTS = [
  [360, 480], [360, 520], [360, 560], [375, 560],
  [390, 540], [390, 620], [412, 600], [414, 896],
];

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json',
};

async function loadChromium() {
  for (const spec of ['playwright', '/opt/node22/lib/node_modules/playwright/index.mjs']) {
    try { return (await import(spec)).chromium; } catch { /* zkusit další */ }
  }
  console.error('CHYBA: Playwright není k dispozici – bez něj se karty proměřit nedají.');
  console.error('       npm i -g playwright  (a pak: playwright install chromium)');
  process.exit(1);
}

function serve() {
  const server = http.createServer(async (req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
    try {
      const body = await fs.readFile(file);
      res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' });
      res.end(body);
    } catch { res.writeHead(404).end('404'); }
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

// Vykreslí každou kartu přesně tak, jak to dělá aplikace, a vrátí ty, co se nevejdou.
// Běží uvnitř stránky, takže si pravidla pro štítky a pruh nese s sebou.
function measure() {
  // Stejné štítky jako v app.js – jiné popisky by daly jinou výšku, a tím i jiný výsledek.
  const TAGS = [
    [/pírk/i, '🪶 pírko'],
    [/pouta|pout[yuaie]|spout/i, '⛓️ pouta'],
    [/bičík/i, '〰️ bičík'],
    [/(oba|obou|obě|dva|dvěma|druhý|druhým) vibrátor/i, '💜💜 2 vibrátory'],
    [/vibrátor/i, '💜 vibrátor'],
    [/šátk|zavázan|zavaž|pásk[au] přes oči/i, '🎭 šátek'],
    [/kravat/i, '👔 kravata'],
    [/lubrikant|olej/i, '💧 lubrikant/olej'],
    [/kostk[ay] ledu|kostku ledu|ledov|\bled[uem]?\b/i, '🧊 led'],
    [/erekční kroužek|kroužek na penis|kroužk[eu]m/i, '⭕ kroužek'],
    [/štětc|štětec|štětečk/i, '🖌️ štětec'],
    [/žínk/i, '🧽 žínka'],
    [/sluchátk/i, '🎧 sluchátka'],
    [/telefon|mobil/i, '📱 telefon'],
  ];
  const SAFE = /pouta|pout[yuaie]|spout|bičík|svaž|přivaž|kravatou|za vlasy|na krku|anál/i;
  const GOAL = /^([^:.!?]{2,40}): (.+?) Cíl: (.+)$/;
  const MAX_FIT = 6;

  const front = document.querySelector('.card-front');
  const textEl = document.querySelector('#cardText');
  const poseEl = document.querySelector('#cardPose');
  const tagsEl = document.querySelector('#cardTags');
  const safeEl = document.querySelector('#cardSafe');
  const timerEl = document.querySelector('#timer');
  const dbg = window.__karticky;

  const renderText = (el, text) => {
    el.textContent = '';
    el.classList.toggle('long', text.length > 170);
    const m = text.match(GOAL);
    if (!m) { el.textContent = text; return; }
    const title = document.createElement('span');
    title.className = 'card-title';
    title.textContent = m[1];
    const goal = document.createElement('span');
    goal.className = 'card-goal';
    goal.textContent = '🎯 ' + m[3];
    el.append(title, m[2], goal);
  };

  const bad = [];
  for (const cat of window.CATEGORIES) {
    for (const role of ['male', 'female']) {
      for (const raw of cat[role]) {
        const card = dbg.parse(raw, role);
        renderText(textEl, card.text);

        poseEl.innerHTML = '';
        const svg = card.pose && window.renderPose ? window.renderPose(card.pose) : null;
        if (svg) poseEl.appendChild(svg);
        poseEl.hidden = !svg;

        tagsEl.innerHTML = '';
        const seen = new Set();
        for (const [re, label] of TAGS) {
          if (!re.test(card.text)) continue;
          if (label.includes('vibrátor') && [...seen].some(l => l.includes('vibrátor'))) continue;
          seen.add(label);
          const s = document.createElement('span');
          s.textContent = label;
          tagsEl.appendChild(s);
        }
        safeEl.hidden = !SAFE.test(card.text);
        timerEl.hidden = !card.timer;

        let fits = false;
        for (let step = 0; step <= MAX_FIT; step++) {
          front.dataset.fit = String(step);
          if (front.scrollHeight <= front.clientHeight + 1) { fits = true; break; }
        }
        if (!fits) {
          bad.push({
            cat: cat.id, role,
            over: front.scrollHeight - front.clientHeight,
            text: card.text.slice(0, 70),
          });
        }
      }
    }
  }
  const doc = document.documentElement;
  return { bad, pageOver: Math.max(0, doc.scrollHeight - window.innerHeight) };
}

const chromium = await loadChromium();
const server = await serve();
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch();
let errors = 0;

for (const [width, height] of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width, height } });
  const consoleErrors = [];
  page.on('pageerror', e => consoleErrors.push(String(e)));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.click('#gateOk');
  await page.waitForSelector('#setup:not([hidden])');
  await page.fill('#nameMale', 'Petr');
  await page.fill('#nameFemale', 'Eva');
  await page.click('form button[type=submit]');
  await page.click('#levelGo');
  await page.waitForSelector('#game:not([hidden])');

  const { bad, pageOver } = await page.evaluate(measure);

  const parts = [`${width}×${height}`.padEnd(9)];
  if (pageOver > 0) {
    parts.push(`CHYBA: stránka se posouvá o ${pageOver} px`);
    errors++;
  }
  if (bad.length) {
    const perCat = {};
    for (const b of bad) perCat[b.cat] = (perCat[b.cat] ?? 0) + 1;
    parts.push(`CHYBA: ${bad.length} karet přetéká (${Object.entries(perCat).map(([k, v]) => `kat ${k}: ${v}`).join(', ')})`);
    errors += bad.length;
  }
  if (consoleErrors.length) {
    parts.push(`CHYBA: konzole – ${consoleErrors[0]}`);
    errors += consoleErrors.length;
  }
  if (parts.length === 1) parts.push('v pořádku');
  console.log(parts.join(' '));

  for (const b of bad.sort((a, c) => c.over - a.over).slice(0, 5)) {
    console.log(`            +${b.over} px  kat ${b.cat}/${b.role}: ${b.text}`);
  }
  await page.close();
}

await browser.close();
server.close();
console.log(errors ? `\n${errors} chyb` : '\nOK – každá karta se vejde na všechny displeje');
process.exit(errors ? 1 : 0);
