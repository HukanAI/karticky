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
    { re: /kravat/i, label: '👔 kravata' },
    { re: /lubrikant|olej/i, label: '💧 lubrikant/olej' },
    { re: /kostk[ay] ledu|kostku ledu|ledov|\bled[uem]?\b/i, label: '🧊 led' },
    { re: /erekční kroužek|kroužek na penis|kroužk[eu]m/i, label: '⭕ kroužek' },
    { re: /štětc|štětec|štětečk/i, label: '🖌️ štětec' },
    { re: /žínk/i, label: '🧽 žínka' },
    { re: /sluchátk/i, label: '🎧 sluchátka' },
    { re: /telefon|mobil/i, label: '📱 telefon' },
  ];
  const SAFE_RE = /pouta|pout[yuaie]|spout|bičík|svaž|přivaž|kravatou|za vlasy|na krku/i;

  // Polohy u starších karet se odhadnou z textu; nové karty mají id polohy přímo v datech.
  // asym = poloha, kde záleží, kdo je v pasivní roli (ve výchozím stavu ona).
  const POSE_HINTS = [
    { re: /\b69\b|navzájem ústy/i, pose: 'p69' },
    { re: /misionář/i, pose: 'misionar' },
    { re: /nohy na (tvých |jeho |svých )?ramen/i, pose: 'nohy_ramena' },
    { re: /polštář(em)? pod (jejím |její |jeho |svými )?(zadečk|bok|pánv)/i, pose: 'misionar_polstar' },
    { re: /na všech čtyřech|po čtyřech/i, pose: 'zezadu', asym: true },
    { re: /přes (kraj|okraj) postele|hlav[uou] přes okraj/i, pose: 'oral_okraj', asym: true },
    { re: /k čelu postele/i, pose: 'pouta_postel', asym: true },
    { re: /lžičk/i, pose: 'lzicka' },
    { re: /na kraji postele|na kraj postele/i, pose: 'kraj_postele', asym: true },
    { re: /obkročmo|na klíně|na klín/i, pose: 'klin_celem' },
    { re: /jezdi na něm|sedni si na něj|nasedni si|ona nahoře/i, pose: 'ona_nahore' },
    { re: /na břiše/i, pose: 'na_brise', asym: true },
    { re: /přes opěradlo/i, pose: 'predklon', asym: true },
    { re: /o zeď|ke zdi|u zdi/i, pose: 'zed' },
    { re: /na židli/i, pose: 'zidle_celem' },
    { re: /zvedni ji|v náruč/i, pose: 'zvednuta' },
    { re: /masíruj jí záda|masáž zad|záda olejem|masíruj mu záda/i, pose: 'masaz_zada', asym: true },
    { re: /chodidl|nohy od prstů/i, pose: 'masaz_chodidla', asym: true },
    { re: /obejmi (ji|ho) zezadu|zezadu (ji|ho) obejmi|přitiskni se k (němu|ní) zezadu|přitiskni si (ji|ho) zády|zezadu k sobě/i, pose: 'stoje_zezadu', asym: true },
    { re: /zezadu/i, pose: 'zezadu', asym: true },
    { re: /předkloň|předklon/i, pose: 'predklon_stoje', asym: true },
    { re: /klekni si mezi|mezi její koleno|mezi její nohy/i, pose: 'oral_klek' },
    { re: /klekni si před|klekni před n|klekni si k n/i, pose: 'oral_ona_klek' },
    { re: /kouři|do úst|vezmi ho do/i, pose: 'oral_on_vleze' },
    { re: /lízej|jazykem.*klitoris|klitoris.*jazyk/i, pose: 'oral_klek', poseF: 'oral_on_vleze' },
    { re: /svlékej|svlékni|svleč/i, pose: 'svlekani', asym: true },
    { re: /zády k sobě/i, pose: 'sed_zady' },
    { re: /dýchejte|sladěn|do očí a nic/i, pose: 'sed_celem' },
    { re: /obejmi|do náruč|objetí/i, pose: 'objeti' },
  ];
  // U karet pro ni se role prohodí, pokud věta nestaví do pozice ji samotnou.
  const POSE_SELF = /\btě\b|\btebe\b|\btvo[ujiéýáě]|klekni si|lehni si|sedni si|posaď se|opři se|předkloň se|nech se|nech si|drž se|dej si|lež |ležíš|klečíš|sedíš|svlékni se|svlékej se|svlékneš se/i;

  function poseFor(text, role) {
    const hit = POSE_HINTS.find(h => h.re.test(text));
    if (!hit) return '';
    const pose = (role === 'female' && hit.poseF) || hit.pose;
    if (role === 'female' && hit.asym && !POSE_SELF.test(text)) return pose + '!';
    return pose;
  }

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

  // Formát karty: "text", "text|sekundy", "text|sekundy|poloha" nebo "text||poloha".
  function parseCard(raw, role) {
    const [text, timer, pose] = raw.split('|');
    const clean = text.trim();
    return { text: clean, timer: timer ? parseInt(timer, 10) : 0, pose: (pose || '').trim() || poseFor(clean, role) };
  }

  // Vylosuje kartu pro hráče na tahu. Vrací false, pokud už žádná nezbývá.
  function draw() {
    const pool = available(state.level, state.turn);
    if (!pool.length) { state.card = null; return false; }
    const index = pool[randomInt(pool.length)];
    state.used.add(cardKey(state.level, state.turn, index));
    state.card = { level: state.level, role: state.turn, index, ...parseCard(CATEGORIES[state.level][state.turn][index], state.turn) };
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
    $('#levelSkip').hidden = state.level >= CATEGORIES.length - 1;
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

    $('#levelNav').hidden = state.endless;
    $('#prevLevelBtn').disabled = state.level === 0;
    $('#nextLevelBtn').disabled = state.level >= CATEGORIES.length - 1;

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
      showPose('');
      setupTimer(0);
      fitCard();
      return;
    }
    renderCardText($('#cardText'), c.text);
    showPose(c.pose);
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
    fitCard();
  }

  // Obsah karty se musí vejít bez posouvání – postupně zmenšíme obrázek, mezery a písmo.
  function fitCard() {
    const front = $('.card-front');
    if (!front.clientHeight) return;
    for (let step = 0; step <= 3; step++) {
      front.dataset.fit = String(step);
      if (front.scrollHeight <= front.clientHeight + 1) return;
    }
  }

  let fitTimeout = null;
  window.addEventListener('resize', () => {
    if ($('#game').hidden) return;
    clearTimeout(fitTimeout);
    fitTimeout = setTimeout(fitCard, 120);
  });

  // Silueta polohy nad textem karty. Když poloha není, obrázek se skryje.
  function showPose(id) {
    const box = $('#cardPose');
    box.innerHTML = '';
    const svg = id && window.renderPose ? window.renderPose(id) : null;
    if (svg) box.appendChild(svg);
    box.hidden = !svg;
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

  // Přeskočení kategorie (i zpět). Odehrané karty zůstávají odehrané,
  // takže při návratu se nic neopakuje.
  function goToLevel(level) {
    if (state.endless || level < 0 || level >= CATEGORIES.length) return;
    stopTimer();
    state.level = level;
    state.done = 0;
    draw();
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
  $('#prevLevelBtn').addEventListener('click', () => goToLevel(state.level - 1));
  $('#nextLevelBtn').addEventListener('click', () => goToLevel(state.level + 1));
  $('#levelSkip').addEventListener('click', () => {
    if (state.level >= CATEGORIES.length - 1) return;
    state.level++;
    state.done = 0;
    renderLevelScreen();
  });
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
  // Karty jedné kategorie jsou rozdělené do víc souborů – sloučíme je podle id.
  window.CATEGORIES = CATEGORIES
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
  if (store.get('karticky.adult') === '1') openSetup();
  else show('gate');

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }

  // Pro ladění
  window.__karticky = { get state() { return state; }, parse: parseCard };
})();
