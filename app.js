(() => {
  'use strict';

  const CARDS_PER_LEVEL = 6;
  const ROLES = ['male', 'female'];
  const other = role => (role === 'male' ? 'female' : 'male');

  const $ = sel => document.querySelector(sel);
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* ignore */ } },
  };

  // Štítky pomůcek se odvozují z textu karty.
  const TAGS = [
    { re: /pírk/i, label: '🪶 pírko' },
    { re: /pouta|pout[yuaie]|spout/i, label: '⛓️ pouta' },
    { re: /bičík/i, label: '〰️ bičík' },
    { re: /(oba|obou|obě|dva|dvěma|druhý|druhým) vibrátor/i, label: '💜💜 2 vibrátory' },
    { re: /vibrátor/i, label: '💜 vibrátor' },
    { re: /šátk|zavázan|zavaž|pásk[au] přes oči/i, label: '🎭 šátek' },
    { re: /lubrikant|olej/i, label: '💧 lubrikant/olej' },
  ];
  const SAFE_RE = /pouta|pout[yuaie]|spout|bičík|svaž|přivaž/i;

  // ---------- Obrazovky ----------
  const SCREENS = ['gate', 'setup', 'level', 'game', 'end'];
  function show(id) {
    for (const s of SCREENS) $('#' + s).hidden = s !== id;
    window.scrollTo(0, 0);
    if (id === 'game') requestWakeLock();
  }

  function setLevelTheme(level) {
    document.body.dataset.level = String(level + 1);
  }

  // ---------- Stav hry ----------
  let state = null;

  function newGame(names, starter) {
    state = {
      names,
      turn: starter,
      level: 0,
      done: 0,
      used: new Set(),
      card: null,
      endless: false,
    };
  }

  const cardKey = (level, role, index) => `${level}-${role}-${index}`;

  function available(level, role) {
    const list = CATEGORIES[level][role];
    const out = [];
    for (let i = 0; i < list.length; i++) {
      if (!state.used.has(cardKey(level, role, i))) out.push(i);
    }
    return out;
  }

  function randomInt(max) {
    if (window.crypto && crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      return buf[0] % max;
    }
    return Math.floor(Math.random() * max);
  }

  function parseCard(raw) {
    const [text, timer] = raw.split('|');
    return { text: text.trim(), timer: timer ? parseInt(timer, 10) : 0 };
  }

  // Vylosuje kartu pro hráče na tahu. Vrací false, pokud už žádná nezbývá.
  function draw() {
    const pool = available(state.level, state.turn);
    if (!pool.length) { state.card = null; return false; }
    const index = pool[randomInt(pool.length)];
    state.used.add(cardKey(state.level, state.turn, index));
    state.card = { level: state.level, role: state.turn, index, ...parseCard(CATEGORIES[state.level][state.turn][index]) };
    return true;
  }

  // ---------- Vykreslení ----------
  function renderLevelScreen() {
    const cat = CATEGORIES[state.level];
    setLevelTheme(state.level);
    $('#levelUpBadge').hidden = state.level === 0;
    $('#levelNum').textContent = `Úroveň ${state.level + 1} / ${CATEGORIES.length}`;
    $('#levelName').textContent = cat.name;
    $('#levelDesc').textContent = cat.description;
    $('#levelGo').textContent = state.level === 0 ? 'Líznout první kartu' : 'Pokračovat';
    const steps = $('#levelSteps');
    steps.innerHTML = '';
    CATEGORIES.forEach((_, i) => {
      const s = document.createElement('span');
      if (i < state.level) s.className = 'on';
      if (i === state.level) s.className = 'now';
      steps.appendChild(s);
    });
    show('level');
  }

  function renderGame() {
    const cat = CATEGORIES[state.level];
    setLevelTheme(state.level);
    $('#topLevel').textContent = state.endless ? 'Volná hra' : `Úroveň ${state.level + 1} / ${CATEGORIES.length}`;
    $('#topName').textContent = cat.name;

    const dots = $('#dots');
    dots.classList.toggle('endless', state.endless);
    dots.innerHTML = '';
    for (let i = 0; i < CARDS_PER_LEVEL; i++) {
      const d = document.createElement('span');
      if (i < state.done) d.className = 'on';
      dots.appendChild(d);
    }

    const who = state.turn === 'male' ? '♂' : '♀';
    const turn = $('#turn');
    turn.innerHTML = '';
    turn.append(`${who} Na tahu: `);
    const strong = document.createElement('strong');
    strong.textContent = state.names[state.turn];
    turn.appendChild(strong);

    const card = $('#card');
    card.classList.remove('flipped');
    $('#swapBtn').disabled = true;
    $('#doneBtn').disabled = true;

    // Obsah přední strany nastavíme až po otočení zpět, aby nebyl vidět při animaci.
    clearTimeout(fillTimeout);
    fillTimeout = setTimeout(fillCardFront, card.dataset.wasFlipped === '1' ? 320 : 0);
    card.dataset.wasFlipped = '0';
  }
  let fillTimeout = null;

  function fillCardFront() {
    fillTimeout = null;
    const c = state.card;
    const cat = CATEGORIES[state.level];
    $('#cardCat').textContent = `${cat.name} · pro ${state.turn === 'male' ? 'ni' : 'něj'}`;
    const tags = $('#cardTags');
    tags.innerHTML = '';
    if (!c) {
      $('#cardText').textContent = 'V této úrovni už pro tebe nejsou žádné další karty. Vymysli si vlastní úkol, nebo pokračujte dál.';
      $('#cardSafe').hidden = true;
      setupTimer(0);
      return;
    }
    renderCardText($('#cardText'), c.text);
    const seen = new Set();
    for (const t of TAGS) {
      if (t.re.test(c.text)) {
        if (t.label.includes('vibrátor') && [...seen].some(l => l.includes('vibrátor'))) continue;
        seen.add(t.label);
        const s = document.createElement('span');
        s.textContent = t.label;
        tags.appendChild(s);
      }
    }
    $('#cardSafe').hidden = !SAFE_RE.test(c.text);
    setupTimer(c.timer);
  }

  // Karty ve tvaru „Název: úkol. Cíl: …“ se zobrazí s nadpisem a zvýrazněným cílem.
  function renderCardText(el, text) {
    el.textContent = '';
    el.classList.toggle('long', text.length > 170);
    const m = text.match(/^([^:.!?]{2,40}): (.+?) Cíl: (.+)$/);
    if (!m) { el.textContent = text; return; }
    const title = document.createElement('span');
    title.className = 'card-title';
    title.textContent = m[1];
    const goal = document.createElement('span');
    goal.className = 'card-goal';
    goal.textContent = '🎯 ' + m[3];
    el.append(title, m[2], goal);
  }

  function flipCard() {
    const card = $('#card');
    if (card.classList.contains('flipped')) return;
    if (fillTimeout) { clearTimeout(fillTimeout); fillCardFront(); }
    card.classList.add('flipped');
    card.dataset.wasFlipped = '1';
    $('#doneBtn').disabled = false;
    $('#swapBtn').disabled = !state.card || available(state.level, state.turn).length === 0;
  }

  // ---------- Akce ----------
  function onDone() {
    stopTimer();
    if (!state.endless) state.done++;
    state.turn = other(state.turn);

    if (!state.endless && state.done >= CARDS_PER_LEVEL) {
      state.done = 0;
      state.level++;
      if (state.level >= CATEGORIES.length) {
        state.level = CATEGORIES.length - 1;
        return renderEnd();
      }
      return renderLevelScreen();
    }

    if (state.endless) {
      if (!draw()) {
        state.turn = other(state.turn);
        if (!draw()) return renderEnd(true);
      }
    } else {
      draw();
    }
    renderGame();
  }

  function onSwap() {
    stopTimer();
    if (!draw()) return;
    renderGame();
  }

  function renderEnd(exhausted) {
    stopTimer();
    setLevelTheme(CATEGORIES.length - 1);
    const left = ROLES.some(r => available(CATEGORIES.length - 1, r).length > 0);
    $('#endText').textContent = exhausted || !left
      ? 'Prošli jste úplně všechny hardcore karty. Klobouk dolů!'
      : `Prošli jste všech ${CATEGORIES.length} úrovní. Chcete ještě?`;
    $('#endlessBtn').hidden = !left;
    show('end');
  }

  // ---------- Časovač ----------
  const timer = { total: 0, left: 0, end: 0, id: null };
  let audioCtx = null;

  function fmt(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function renderTimer() {
    $('#timerTime').textContent = fmt(timer.left);
    const el = $('#timer');
    el.classList.toggle('running', !!timer.id);
    el.classList.toggle('over', !timer.id && timer.total > 0 && timer.left === 0);
    $('#timerBtn').textContent = timer.id ? '❚❚ Pauza' : (timer.left === 0 ? '▶ Znovu' : '▶ Start');
  }

  function setupTimer(sec) {
    stopTimer();
    timer.total = sec;
    timer.left = sec;
    $('#timer').hidden = !sec;
    renderTimer();
  }

  function stopTimer() {
    if (timer.id) clearInterval(timer.id);
    timer.id = null;
  }

  function toggleTimer() {
    if (timer.id) {
      stopTimer();
    } else {
      if (timer.left <= 0) timer.left = timer.total;
      timer.end = Date.now() + timer.left * 1000;
      timer.id = setInterval(tick, 200);
      unlockAudio();
    }
    renderTimer();
  }

  function tick() {
    timer.left = Math.max(0, Math.ceil((timer.end - Date.now()) / 1000));
    if (timer.left === 0) {
      stopTimer();
      alarm();
    }
    renderTimer();
  }

  function unlockAudio() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch { audioCtx = null; }
  }

  function alarm() {
    try { navigator.vibrate && navigator.vibrate([400, 150, 400, 150, 400]); } catch { /* ignore */ }
    if (!audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      [0, 0.25, 0.5].forEach((offset, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = [660, 880, 1100][i];
        gain.gain.setValueAtTime(0.0001, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.3, now + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.22);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.25);
      });
    } catch { /* ignore */ }
  }

  // ---------- Displej nezhasíná ----------
  let wakeLock = null;
  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator && !wakeLock) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => { wakeLock = null; });
      }
    } catch { wakeLock = null; }
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !$('#game').hidden) requestWakeLock();
  });

  // ---------- Události ----------
  $('#gateOk').addEventListener('click', () => {
    store.set('karticky.adult', '1');
    openSetup();
  });

  function openSetup() {
    setLevelTheme(0);
    $('#nameMale').value = store.get('karticky.male') || '';
    $('#nameFemale').value = store.get('karticky.female') || '';
    show('setup');
  }

  $('#setupForm').addEventListener('submit', e => {
    e.preventDefault();
    const male = $('#nameMale').value.trim() || 'On';
    const female = $('#nameFemale').value.trim() || 'Ona';
    store.set('karticky.male', male);
    store.set('karticky.female', female);
    let starter = document.querySelector('input[name="starter"]:checked').value;
    if (starter === 'random') starter = ROLES[randomInt(2)];
    newGame({ male, female }, starter);
    renderLevelScreen();
  });

  $('#levelGo').addEventListener('click', () => {
    draw();
    renderGame();
    show('game');
  });

  const card = $('#card');
  card.addEventListener('click', e => {
    if (e.target.closest('.timer')) return;
    flipCard();
  });
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flipCard(); }
  });

  $('#doneBtn').addEventListener('click', onDone);
  $('#swapBtn').addEventListener('click', onSwap);
  $('#timerBtn').addEventListener('click', toggleTimer);
  $('#timerReset').addEventListener('click', () => { setupTimer(timer.total); });

  // Vlastní dialog místo confirm() – nainstalované PWA v telefonu systémové dialogy často potlačí.
  const quitModal = $('#quitModal');
  $('#quitBtn').addEventListener('click', () => { quitModal.hidden = false; });
  $('#quitNo').addEventListener('click', () => { quitModal.hidden = true; });
  quitModal.addEventListener('click', e => { if (e.target === quitModal) quitModal.hidden = true; });
  $('#quitYes').addEventListener('click', () => {
    quitModal.hidden = true;
    stopTimer();
    state = null;
    openSetup();
  });

  $('#endlessBtn').addEventListener('click', () => {
    state.endless = true;
    state.level = CATEGORIES.length - 1;
    if (!draw()) {
      state.turn = other(state.turn);
      if (!draw()) return renderEnd(true);
    }
    renderGame();
    show('game');
  });
  $('#newGameBtn').addEventListener('click', openSetup);

  // ---------- Start ----------
  CATEGORIES.sort((a, b) => a.id - b.id);
  if (store.get('karticky.adult') === '1') openSetup();
  else show('gate');

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }

  // Pro ladění
  window.__karticky = { get state() { return state; } };
})();
