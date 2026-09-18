// Siluety poloh – piktogramy dvou postav kreslené z kostry kloubů.
// Každá poloha je jen seznam postav: šablona postoje + posun, otočení a případné
// úpravy jednotlivých kloubů. Vykreslování je společné, takže styl zůstává jednotný.
(() => {
  'use strict';

  const GROUND = 112;

  // Šířky tahů a trupu podle role. Ona je celkově útlejší, on má širší ramena.
  const DIM = {
    m: { ua: 6.8, fa: 5.6, th: 8.8, sh: 7.0, neck: 5.8, hx: 7.2, hy: 8.2, sW: 11.0, wW: 8.2, hW: 9.0 },
    f: { ua: 5.8, fa: 4.8, th: 8.0, sh: 6.2, neck: 5.0, hx: 6.8, hy: 7.8, sW: 9.2, wW: 6.4, hW: 9.8 },
  };

  // Klouby v lokálních souřadnicích: počátek v pánvi, osa y míří dolů (jako v SVG),
  // postava je otočená doprava. hd = střed hlavy, nk = krk/ramena, e = loket, w = zápěstí,
  // k = koleno, a = kotník. Index 1 = bližší končetina, 2 = vzdálenější.
  const BODY = {
    stand: {
      hd: [1, -50], nk: [0, -34], pv: [0, 0],
      e1: [2, -18], w1: [4, -2], e2: [-2, -18], w2: [-4, -2],
      k1: [1, 26], a1: [2, 51], k2: [-2, 26], a2: [-2, 51],
    },
    // Předklon – opora dopředu (o zeď, opěradlo, kolena).
    bend: {
      hd: [-46, -18], nk: [-32, -14], pv: [0, 0],
      e1: [-34, 2], w1: [-36, 18], e2: [-36, 2], w2: [-38, 18],
      k1: [2, 26], a1: [3, 51], k2: [-1, 26], a2: [0, 51],
    },
    kneel: {
      hd: [1, -50], nk: [0, -34], pv: [0, 0],
      e1: [2, -18], w1: [4, -2], e2: [-2, -18], w2: [-4, -2],
      k1: [4, 24], a1: [-16, 26], k2: [1, 24], a2: [-19, 26],
    },
    // Klečí a je předkloněná – opora o předloktí.
    kneel_down: {
      hd: [-44, -18], nk: [-30, -14], pv: [0, 0],
      e1: [-32, 2], w1: [-38, 16], e2: [-34, 2], w2: [-40, 16],
      k1: [4, 24], a1: [-16, 26], k2: [1, 24], a2: [-19, 26],
    },
    all4: {
      hd: [-50, -6], nk: [-36, -4], pv: [0, 0],
      e1: [-36, 12], w1: [-37, 28], e2: [-38, 12], w2: [-39, 28],
      k1: [3, 14], a1: [-10, 28], k2: [0, 14], a2: [-13, 28],
    },
    sit_floor: {
      hd: [-1, -49], nk: [-2, -33], pv: [0, 0],
      e1: [-8, -17], w1: [-12, -2], e2: [-10, -17], w2: [-14, -2],
      k1: [24, 2], a1: [47, 6], k2: [22, 2], a2: [45, 6],
    },
    sit_chair: {
      hd: [1, -49], nk: [0, -33], pv: [0, 0],
      e1: [5, -17], w1: [13, -6], e2: [3, -17], w2: [11, -6],
      k1: [25, 1], a1: [27, 26], k2: [22, 1], a2: [24, 26],
    },
    squat: {
      hd: [2, -48], nk: [1, -33], pv: [0, 0],
      e1: [5, -17], w1: [12, -7], e2: [3, -17], w2: [10, -7],
      k1: [20, 4], a1: [13, 29], k2: [17, 4], a2: [10, 29],
    },
    // Sedí obkročmo – kolena dopředu dolů (klín, židle, on pod ní).
    straddle: {
      hd: [0, -49], nk: [-1, -33], pv: [0, 0],
      e1: [-6, -18], w1: [-13, -8], e2: [-8, -18], w2: [-15, -8],
      k1: [18, 10], a1: [4, 30], k2: [15, 10], a2: [1, 30],
    },
    lie_back: {
      hd: [-50, -5], nk: [-34, -3], pv: [0, 0],
      e1: [-20, -11], w1: [-5, -12], e2: [-22, -9], w2: [-7, -10],
      k1: [25, 1], a1: [50, 3], k2: [25, 4], a2: [50, 6],
    },
    lie_knees: {
      hd: [-50, -6], nk: [-34, -4], pv: [0, 0],
      e1: [-20, -12], w1: [-5, -13], e2: [-22, -10], w2: [-7, -11],
      k1: [20, -20], a1: [36, -4], k2: [18, -17], a2: [34, -1],
    },
    lie_legs_up: {
      hd: [-50, -6], nk: [-34, -4], pv: [0, 0],
      e1: [-20, -14], w1: [-6, -16], e2: [-22, -12], w2: [-8, -14],
      k1: [13, -24], a1: [2, -47], k2: [10, -22], a2: [-1, -45],
    },
    lie_front: {
      hd: [-50, 0], nk: [-34, 2], pv: [0, 0],
      e1: [-42, -10], w1: [-56, -4], e2: [-44, -8], w2: [-58, -2],
      k1: [25, 1], a1: [48, -8], k2: [25, 4], a2: [48, -5],
    },
    // Leží na boku s pokrčenýma nohama (lžička).
    lie_side: {
      hd: [-50, -6], nk: [-34, -4], pv: [0, 0],
      e1: [-18, -12], w1: [-3, -8], e2: [-20, -10], w2: [-5, -6],
      k1: [20, -15], a1: [38, -2], k2: [18, -12], a2: [36, 1],
    },
  };

  // ---------- Geometrie ----------
  const r = n => Math.round(n * 10) / 10;
  const P = pt => `${r(pt[0])} ${r(pt[1])}`;

  function joints(f) {
    const base = BODY[f.tpl];
    const j = {};
    for (const k of Object.keys(base)) j[k] = (f.j && f.j[k]) || base[k];
    return j;
  }

  // Lokální bod → souřadnice obrázku (stejné pořadí jako transform v <g>).
  function toGlobal(f, pt) {
    const s = f.s || 1;
    let x = pt[0] * s * (f.flip ? -1 : 1);
    let y = pt[1] * s;
    if (f.rot) {
      const a = f.rot * Math.PI / 180, c = Math.cos(a), si = Math.sin(a);
      [x, y] = [x * c - y * si, x * si + y * c];
    }
    return [x + f.x, y + f.y];
  }

  // Trup jako plný tvar se zúžením v pase.
  function torsoPath(nk, pv, d) {
    const dx = pv[0] - nk[0], dy = pv[1] - nk[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const at = (t, wd) => [nk[0] + dx * t + nx * wd, nk[1] + dy * t + ny * wd];
    return `M${P(at(0.04, d.sW))}` +
      `C${P(at(0.28, d.sW * 0.94))} ${P(at(0.44, d.wW))} ${P(at(0.6, d.wW))}` +
      `C${P(at(0.78, d.hW * 0.96))} ${P(at(0.94, d.hW))} ${P(at(1, d.hW * 0.7))}` +
      `L${P(at(1, -d.hW * 0.7))}` +
      `C${P(at(0.94, -d.hW))} ${P(at(0.78, -d.hW * 0.96))} ${P(at(0.6, -d.wW))}` +
      `C${P(at(0.44, -d.wW))} ${P(at(0.28, -d.sW * 0.94))} ${P(at(0.04, -d.sW))}Z`;
  }

  // Bod na kyčli – odkud vychází noha.
  function hip(j, side, d) {
    const dx = j.pv[0] - j.nk[0], dy = j.pv[1] - j.nk[1];
    const len = Math.hypot(dx, dy) || 1;
    return [j.pv[0] - dy / len * d.hW * 0.45 * side, j.pv[1] + dx / len * d.hW * 0.45 * side];
  }

  // Končetina = dva navazující tahy, spodní část je tenčí.
  function limb(a, b, c, w1, w2) {
    return [{ d: `M${P(a)}L${P(b)}`, w: w1 }, { d: `M${P(b)}L${P(c)}`, w: w2 }];
  }

  const dot = (pt, rad) => ({ d: `M${P(pt)}l0 0`, w: rad * 2 });

  function figureParts(f) {
    const d = DIM[f.role];
    const j = joints(f);

    const far = [
      ...limb(j.nk, j.e2, j.w2, d.ua * 0.92, d.fa * 0.92),
      dot(j.w2, d.fa * 0.55),
      ...limb(hip(j, -1, d), j.k2, j.a2, d.th * 0.92, d.sh * 0.92),
      dot(j.a2, d.sh * 0.5),
    ];

    // Krk, trup, hlava; u ženy navíc vlasy za hlavou.
    const ang = Math.atan2(j.hd[1] - j.nk[1], j.hd[0] - j.nk[0]);
    const deg = r(ang * 180 / Math.PI + 90);
    const core = [
      { d: `M${P(j.nk)}L${P(j.hd)}`, w: d.neck },
      { d: torsoPath(j.nk, j.pv, d), fill: true, w: 4.5 },
    ];
    if (f.role === 'f') {
      const back = [j.hd[0] - Math.cos(ang + Math.PI / 2) * 3.2, j.hd[1] - Math.sin(ang + Math.PI / 2) * 3.2];
      core.push({ ellipse: [back, d.hx * 1.04, d.hy * 1.34, deg], w: 2.5 });
    }
    core.push({ ellipse: [j.hd, d.hx, d.hy, deg], w: 2.5 });

    const near = [
      ...limb(hip(j, 1, d), j.k1, j.a1, d.th, d.sh),
      dot(j.a1, d.sh * 0.55),
      ...limb(j.nk, j.e1, j.w1, d.ua, d.fa),
      dot(j.w1, d.fa * 0.6),
    ];
    return { far, core, near };
  }

  // Barva se dědí přes CSS vlastnost color, geometrie kreslí currentColor –
  // díky tomu se obrázek přebarvuje podle úrovně a nic nepřebíjí CSS.
  function shapeSvg(s, halo) {
    const st = `stroke="currentColor" stroke-width="${r((s.w || 0) + (halo ? 6.5 : 0))}"`;
    const fill = s.fill || s.ellipse ? 'fill="currentColor"' : 'fill="none"';
    if (s.ellipse) {
      const [c, rx, ry, deg] = s.ellipse;
      return `<ellipse ${st} ${fill} cx="${r(c[0])}" cy="${r(c[1])}" rx="${r(rx)}" ry="${r(ry)}" transform="rotate(${deg} ${r(c[0])} ${r(c[1])})"/>`;
    }
    return `<path ${st} ${fill} d="${s.d}"/>`;
  }

  function figureSvg(f) {
    const { far, core, near } = figureParts(f);
    const draw = (list, halo) => list.map(s => shapeSvg(s, halo)).join('');
    const t = [
      `translate(${r(f.x)} ${r(f.y)})`,
      f.rot ? `rotate(${r(f.rot)})` : '',
      `scale(${r((f.s || 1) * (f.flip ? -1 : 1))} ${r(f.s || 1)})`,
    ].filter(Boolean).join(' ');
    return `<g transform="${t}">` +
      `<g class="ph">${draw([...far, ...core, ...near], true)}</g>` +
      `<g class="${f.role === 'm' ? 'fm' : 'ff'}">` +
      `<g class="far">${draw(far)}</g>${draw(core)}${draw(near)}</g>` +
      '</g>';
  }

  // ---------- Kulisy ----------
  // Jen tenkou linkou a jen tam, kde bez nich poloha nedává smysl.
  const pp = d => `<path d="${d}" stroke="currentColor" fill="none" stroke-width="2.4"/>`;
  const G = GROUND;
  const PROPS = {
    floor: pp(`M14 ${G}H186`),
    bed: pp(`M16 ${G - 11}h168v11H16z`),
    headboard: pp(`M28 ${G - 11}h156v11H28z`) + pp(`M28 ${G - 50}v39`),
    bed_edge: pp(`M40 ${G - 38}h144v38H40z`),
    chair: pp(`M92 ${G - 28}h46`) + pp(`M138 ${G - 28}v-34`) + pp(`M96 ${G - 28}v28`) + pp(`M134 ${G - 28}v28`),
    chair_l: pp(`M62 ${G - 28}h46`) + pp(`M62 ${G - 28}v-34`) + pp(`M66 ${G - 28}v28`) + pp(`M104 ${G - 28}v28`),
    wall: pp(`M20 ${G - 96}v96`),
    wall_r: pp(`M180 ${G - 96}v96`),
    sofa: pp(`M46 ${G - 26}h108v26H46z`) + pp(`M46 ${G - 48}h12v22`),
    pillow: pp(`M104 ${G - 21}h34v10h-34z`),
  };
  const PROP_BOX = {
    floor: [14, G, 186, G],
    bed: [16, G - 11, 184, G],
    headboard: [28, G - 50, 184, G],
    bed_edge: [40, G - 38, 184, G],
    chair: [92, G - 62, 138, G],
    chair_l: [62, G - 62, 108, G],
    wall: [20, G - 96, 20, G],
    wall_r: [180, G - 96, 180, G],
    sofa: [46, G - 48, 154, G],
    pillow: [104, G - 21, 138, G - 11],
  };

  // ---------- Polohy ----------
  const m = (tpl, x, y, o) => Object.assign({ role: 'm', tpl, x, y }, o);
  const w = (tpl, x, y, o) => Object.assign({ role: 'f', tpl, x, y }, o);

  const POSES = {
    objeti: {
      name: 'Objetí ve stoje', props: ['floor'], figs: [
        w('stand', 84, 61, { j: { e1: [12, -24], w1: [26, -26], e2: [10, -22], w2: [24, -24] } }),
        m('stand', 116, 61, { flip: true, j: { e1: [14, -14], w1: [30, -12], e2: [12, -12], w2: [28, -10] } }),
      ],
    },
    stoje_zezadu: {
      name: 'On zezadu ve stoje', props: ['floor'], figs: [
        m('stand', 118, 61, { flip: true, j: { e1: [16, -18], w1: [32, -16], e2: [14, -16], w2: [30, -14] } }),
        w('stand', 98, 61, { j: { e1: [-7, -20], w1: [-16, -31], e2: [-9, -18], w2: [-18, -29] } }),
      ],
    },
    klin_celem: {
      name: 'Ona na klíně čelem', props: ['chair'], figs: [
        m('sit_chair', 130, 82, { flip: true, j: { e1: [10, -8], w1: [24, -4], e2: [8, -6], w2: [22, -2] } }),
        w('straddle', 106, 70, { j: { k1: [8, 14], a1: [-12, 30], k2: [5, 14], a2: [-15, 30], e1: [-8, -20], w1: [-18, -28], e2: [-10, -18], w2: [-20, -26] } }),
      ],
    },
    klin_zady: {
      name: 'Ona na klíně zády', props: ['chair'], figs: [
        m('sit_chair', 130, 82, { flip: true, j: { e1: [10, -12], w1: [26, -16], e2: [8, -10], w2: [24, -14] } }),
        w('straddle', 108, 70, { flip: true, j: { k1: [8, 14], a1: [-12, 30], k2: [5, 14], a2: [-15, 30] } }),
      ],
    },
    lzicka: {
      name: 'Lžička', props: ['bed'], figs: [
        m('lie_side', 146, 84, { j: { k1: [22, -10], a1: [42, 2], k2: [20, -7], a2: [40, 5], e1: [-24, -16], w1: [-40, -10], e2: [-26, -14], w2: [-42, -8] } }),
        w('lie_side', 124, 96),
      ],
    },
    misionar: {
      name: 'Misionář', props: ['bed'], figs: [
        w('lie_knees', 120, 95, { j: { k1: [24, -30], a1: [44, -20], k2: [22, -27], a2: [42, -17] } }),
        m('all4', 134, 70),
      ],
    },
    nohy_ramena: {
      name: 'Nohy na ramenou', props: ['bed'], figs: [
        w('lie_legs_up', 122, 95),
        m('kneel', 142, 60, { flip: true, j: { e1: [18, -6], w1: [34, -2], e2: [16, -4], w2: [32, 0] } }),
      ],
    },
    zezadu: {
      name: 'Zezadu na kolenou', props: ['bed'], figs: [
        w('all4', 110, 73),
        m('kneel', 140, 75, { flip: true, j: { e1: [16, -12], w1: [32, -8], e2: [14, -10], w2: [30, -6] } }),
      ],
    },
    ona_nahore: {
      name: 'Ona nahoře čelem', props: ['bed'], figs: [
        m('lie_back', 124, 93, { j: { k1: [25, -15], a1: [48, -6], k2: [23, -12], a2: [46, -3] } }),
        w('straddle', 118, 66, { flip: true }),
      ],
    },
    ona_nahore_zady: {
      name: 'Ona nahoře zády', props: ['bed'], figs: [
        m('lie_back', 124, 93, { j: { k1: [25, -15], a1: [48, -6], k2: [23, -12], a2: [46, -3] } }),
        w('straddle', 118, 66),
      ],
    },
    p69: {
      name: '69 vleže', props: ['bed'], figs: [
        m('lie_back', 124, 96, { j: { hd: [-50, -13], nk: [-34, -7], e1: [-20, -16], w1: [-6, -18] } }),
        w('lie_front', 74, 74, { flip: true, j: { hd: [-50, 8], nk: [-34, 5], e1: [-42, -6], w1: [-56, 2] } }),
      ],
    },
    oral_klek: {
      name: 'On klečí mezi jejími koleny', props: ['bed'], figs: [
        w('lie_knees', 114, 93),
        m('kneel_down', 156, 76, { flip: true }),
      ],
    },
    oral_ona_klek: {
      name: 'Ona klečí před ním', props: ['floor'], figs: [
        m('stand', 76, 61, { j: { e1: [7, -18], w1: [16, -8], e2: [5, -16], w2: [14, -6] } }),
        w('kneel', 112, 86, { flip: true, j: { e1: [11, -16], w1: [24, -14], e2: [9, -14], w2: [22, -12] } }),
      ],
    },
    zidle_celem: {
      name: 'Obkročmo na židli čelem', props: ['chair'], figs: [
        m('sit_chair', 130, 82, { flip: true, j: { e1: [12, -10], w1: [26, -6], e2: [10, -8], w2: [24, -4] } }),
        w('straddle', 104, 70, { j: { k1: [8, 14], a1: [-12, 30], k2: [5, 14], a2: [-15, 30], e1: [-11, -22], w1: [-24, -28], e2: [-13, -20], w2: [-26, -26] } }),
      ],
    },
    zed: {
      name: 'Ve stoje u zdi', props: ['floor', 'wall'], figs: [
        w('stand', 40, 61, { j: { e1: [-11, -22], w1: [-18, -34], e2: [-13, -20], w2: [-20, -32] } }),
        m('stand', 70, 61, { flip: true, j: { e1: [16, -16], w1: [32, -12], e2: [14, -14], w2: [30, -10] } }),
      ],
    },
    predklon: {
      name: 'Předkloněná přes opěradlo', props: ['sofa'], figs: [
        w('bend', 92, 61, { j: { w1: [-38, 22], w2: [-40, 22] } }),
        m('stand', 124, 61, { flip: true, j: { e1: [16, -12], w1: [32, -8], e2: [14, -10], w2: [30, -6] } }),
      ],
    },
    masaz_zada: {
      name: 'Masáž zad vleže', props: ['bed'], figs: [
        w('lie_front', 122, 95),
        m('kneel', 138, 73, { flip: true, j: { e1: [14, -6], w1: [28, 6], e2: [12, -4], w2: [26, 8] } }),
      ],
    },
    // --- předehra a doteky ---
    svlekani: {
      name: 'Svlékání ve stoje', props: ['floor'], figs: [
        w('stand', 88, 61, { j: { e1: [-6, -18], w1: [-12, -4], e2: [-8, -16], w2: [-14, -2] } }),
        m('stand', 120, 61, { flip: true, j: { e1: [14, -26], w1: [30, -28], e2: [12, -24], w2: [28, -26] } }),
      ],
    },
    klin_podlaha: {
      name: 'Na klíně na podlaze', props: ['floor'], figs: [
        m('sit_floor', 128, 103, { flip: true, j: { e1: [-10, -12], w1: [-20, -4], e2: [-12, -10], w2: [-22, -2] } }),
        w('straddle', 104, 96, { j: { k1: [10, 10], a1: [-14, 16], k2: [7, 10], a2: [-17, 16], e1: [-8, -20], w1: [-18, -28], e2: [-10, -18], w2: [-20, -26] } }),
      ],
    },
    sed_zady: {
      name: 'Sed zády k sobě', props: ['floor'], figs: [
        m('sit_floor', 114, 103),
        w('sit_floor', 104, 104, { flip: true }),
      ],
    },
    sed_celem: {
      name: 'Sed čelem k sobě', props: ['floor'], figs: [
        m('sit_floor', 74, 103),
        w('sit_floor', 126, 104, { flip: true }),
      ],
    },
    masaz_vsede: {
      name: 'Masáž ramen vsedě', props: ['floor'], figs: [
        w('sit_floor', 96, 103),
        m('kneel', 126, 86, { flip: true, j: { e1: [12, -24], w1: [26, -26], e2: [10, -22], w2: [24, -24] } }),
      ],
    },
    masaz_chodidla: {
      name: 'Masáž chodidel', props: ['bed'], figs: [
        w('lie_back', 108, 94, { j: { k1: [25, -5], a1: [48, -2], k2: [25, -2], a2: [48, 1] } }),
        m('kneel', 178, 75, { flip: true, j: { e1: [14, -6], w1: [26, 2], e2: [12, -4], w2: [24, 4] } }),
      ],
    },
    vedle_ona_lezi: {
      name: 'Ona leží, on vedle', props: ['bed'], figs: [
        w('lie_back', 116, 96),
        m('lie_side', 150, 84, { flip: true, j: { e1: [12, 4], w1: [26, 10], e2: [10, 6], w2: [24, 12] } }),
      ],
    },
    vedle_on_lezi: {
      name: 'On leží, ona vedle', props: ['bed'], figs: [
        m('lie_back', 116, 96),
        w('lie_side', 150, 84, { flip: true, j: { e1: [12, 4], w1: [26, 10], e2: [10, 6], w2: [24, 12] } }),
      ],
    },
    klek_ruce_za_zady: {
      name: 'Klek s rukama za zády', props: ['floor'], figs: [
        w('kneel', 106, 86, { j: { e1: [-10, -16], w1: [-18, -6], e2: [-12, -14], w2: [-20, -4] } }),
        m('stand', 140, 61, { flip: true, j: { e1: [14, -18], w1: [28, -16], e2: [12, -16], w2: [26, -14] } }),
      ],
    },
    klek_ruce_hlava: {
      name: 'Klek s rukama za hlavou', props: ['bed'], figs: [
        w('kneel', 104, 75, { j: { e1: [-8, -32], w1: [4, -44], e2: [-10, -30], w2: [2, -42] } }),
        m('kneel', 134, 75, { flip: true, j: { e1: [14, -14], w1: [28, -12], e2: [12, -12], w2: [26, -10] } }),
      ],
    },
    tanec: {
      name: 'Tanec před ním', props: ['floor', 'chair'], figs: [
        m('sit_chair', 132, 82, { flip: true }),
        w('stand', 78, 61, { j: { e1: [-4, -34], w1: [4, -48], e2: [-6, -32], w2: [2, -46] } }),
      ],
    },

    // --- orální ---
    oral_vsede: {
      name: 'Ona sedí na kraji, on u ní klečí', props: ['bed_edge', 'floor'], figs: [
        w('sit_chair', 150, 66, { flip: true, j: { e1: [-6, -16], w1: [-12, -4], e2: [-8, -14], w2: [-14, -2] } }),
        m('kneel_down', 100, 86, { flip: true, j: { hd: [-44, -16], nk: [-30, -10], e1: [-32, -2], w1: [-40, 10] } }),
      ],
    },
    oral_on_vsede: {
      name: 'On sedí na kraji, ona u něj klečí', props: ['bed_edge', 'floor'], figs: [
        m('sit_chair', 150, 66, { flip: true, j: { e1: [-6, -16], w1: [-12, -4], e2: [-8, -14], w2: [-14, -2] } }),
        w('kneel_down', 100, 86, { flip: true, j: { hd: [-44, -16], nk: [-30, -10], e1: [-32, -2], w1: [-40, 10] } }),
      ],
    },
    oral_on_vleze: {
      name: 'On leží, ona nad ním', props: ['bed'], figs: [
        m('lie_back', 122, 94),
        w('kneel_down', 156, 77, { j: { hd: [-42, 16], nk: [-29, 4], e1: [-30, 16], w1: [-38, 24], e2: [-32, 18], w2: [-40, 26] } }),
      ],
    },
    oral_ona_vleze: {
      name: 'Ona leží, on nad ní', props: ['bed'], figs: [
        w('lie_back', 122, 94),
        m('kneel_down', 156, 77, { j: { hd: [-42, 16], nk: [-29, 4], e1: [-30, 16], w1: [-38, 24], e2: [-32, 18], w2: [-40, 26] } }),
      ],
    },
    oral_ona_nad_nim: {
      name: 'Ona nad jeho obličejem', props: ['bed'], figs: [
        m('lie_back', 134, 96),
        w('squat', 80, 70, { j: { e1: [-6, -20], w1: [-14, -10], e2: [-8, -18], w2: [-16, -8] } }),
      ],
    },
    p69_bok: {
      name: '69 na boku', props: ['bed'], figs: [
        m('lie_side', 128, 86, { j: { hd: [-50, 2], nk: [-34, -2] } }),
        w('lie_side', 78, 98, { flip: true, j: { hd: [-50, -14], nk: [-34, -8] } }),
      ],
    },
    oral_okraj: {
      name: 'Hlava přes okraj', props: ['bed_edge', 'floor'], figs: [
        w('lie_back', 106, 70, { j: { hd: [-52, 4], nk: [-35, 0], k1: [25, -8], a1: [48, -4], k2: [25, -5], a2: [48, -1] } }),
        m('stand', 44, 61, { j: { e1: [6, -16], w1: [14, -6], e2: [4, -14], w2: [12, -4] } }),
      ],
    },
    oral_zidle: {
      name: 'Ona na židli, on před ní', props: ['chair_l', 'floor'], figs: [
        w('sit_chair', 96, 82, { j: { e1: [3, -18], w1: [8, -8], e2: [1, -16], w2: [6, -6] } }),
        m('kneel_down', 162, 86, { j: { hd: [-46, 0], nk: [-32, -6], e1: [-34, 4], w1: [-42, 16] } }),
      ],
    },

    // --- sex a polohy ---
    misionar_polstar: {
      name: 'Polštář pod boky', props: ['bed', 'pillow'], figs: [
        w('lie_knees', 120, 88, { j: { k1: [24, -28], a1: [44, -18], k2: [22, -25], a2: [42, -15] } }),
        m('all4', 134, 66),
      ],
    },
    propletene: {
      name: 'Propletené nohy', props: ['bed'], figs: [
        w('lie_back', 116, 96, { j: { k1: [25, -8], a1: [48, -4], k2: [25, -5], a2: [48, -1] } }),
        m('lie_front', 122, 80, { j: { e1: [-44, 4], w1: [-58, 10], e2: [-46, 6], w2: [-60, 12] } }),
      ],
    },
    predklon_stoje: {
      name: 'Předkloněná ve stoje', props: ['floor'], figs: [
        w('bend', 96, 61, { j: { e1: [-26, 8], w1: [-12, 22], e2: [-28, 10], w2: [-14, 24] } }),
        m('stand', 128, 61, { flip: true, j: { e1: [16, -8], w1: [32, -4], e2: [14, -6], w2: [30, -2] } }),
      ],
    },
    na_brise: {
      name: 'Na břiše s polštářem', props: ['bed', 'pillow'], figs: [
        w('lie_front', 120, 90),
        m('lie_front', 126, 74),
      ],
    },
    zezadu_vzpr: {
      name: 'Zezadu vzpřímeně na kolenou', props: ['bed'], figs: [
        w('kneel', 106, 75, { j: { e1: [-8, -18], w1: [-16, -8], e2: [-10, -16], w2: [-18, -6] } }),
        m('kneel', 134, 75, { flip: true, j: { e1: [14, -10], w1: [28, -6], e2: [12, -8], w2: [26, -4] } }),
      ],
    },
    drep: {
      name: 'Dřep nad ním', props: ['bed'], figs: [
        m('lie_back', 128, 96, { j: { k1: [25, -13], a1: [48, -5], k2: [23, -10], a2: [46, -2] } }),
        w('squat', 114, 64, { flip: true }),
      ],
    },
    lotos: {
      name: 'Sed obkročmo na podlaze', props: ['floor'], figs: [
        m('sit_floor', 122, 103, { flip: true, j: { e1: [-12, -10], w1: [-24, -4], e2: [-14, -8], w2: [-26, -2] } }),
        w('straddle', 98, 96, { j: { k1: [10, 10], a1: [-14, 16], k2: [7, 10], a2: [-17, 16], e1: [-8, -20], w1: [-18, -28], e2: [-10, -18], w2: [-20, -26] } }),
      ],
    },
    kraj_postele: {
      name: 'Ona na kraji postele', props: ['bed_edge', 'floor'], figs: [
        w('lie_back', 106, 66, { j: { k1: [25, -14], a1: [46, -8], k2: [23, -11], a2: [44, -5] } }),
        m('stand', 156, 61, { flip: true, j: { e1: [16, -8], w1: [32, -4], e2: [14, -6], w2: [30, -2] } }),
      ],
    },
    zvednuta: {
      name: 'Zvednutá v náručí', props: ['floor'], figs: [
        m('stand', 124, 61, { flip: true, j: { k1: [1, 27], a1: [4, 51], k2: [-2, 27], a2: [0, 51], e1: [12, -4], w1: [26, 2], e2: [10, -2], w2: [24, 4] } }),
        w('straddle', 104, 56, { j: { k1: [16, 12], a1: [34, 8], k2: [13, 14], a2: [31, 10], e1: [-8, -22], w1: [-16, -32], e2: [-10, -20], w2: [-18, -30] } }),
      ],
    },

    // --- hardcore ---
    pouta_postel: {
      name: 'Přivázaná k čelu postele', props: ['headboard'], figs: [
        w('lie_back', 92, 94, { j: { e1: [-46, -8], w1: [-62, -6], e2: [-48, -6], w2: [-64, -4], k1: [25, -12], a1: [48, -6], k2: [23, -9], a2: [46, -3] } }),
        m('kneel', 146, 75, { flip: true, j: { e1: [16, -12], w1: [32, -8], e2: [14, -10], w2: [30, -6] } }),
      ],
    },
    klek_pouta: {
      name: 'Spoutané ruce vkleče', props: ['floor'], figs: [
        w('kneel', 100, 86, { j: { e1: [-12, -14], w1: [-20, -2], e2: [-14, -12], w2: [-22, 0] } }),
        m('stand', 136, 61, { flip: true, j: { e1: [16, -20], w1: [32, -18], e2: [14, -18], w2: [30, -16] } }),
      ],
    },
    kontrola_vsede: {
      name: 'Drží mu ruce nad hlavou', props: ['bed'], figs: [
        m('lie_back', 128, 96, { j: { e1: [-40, -12], w1: [-54, -14], e2: [-42, -10], w2: [-56, -12] } }),
        w('straddle', 118, 66, { flip: true, j: { e1: [22, -8], w1: [38, 4], e2: [20, -6], w2: [36, 6] } }),
      ],
    },
    dvojita_bok: {
      name: 'Dvojitá stimulace na boku', props: ['bed'], figs: [
        w('lie_side', 112, 96),
        m('kneel', 160, 75, { flip: true, j: { e1: [16, -4], w1: [32, 4], e2: [14, -2], w2: [30, 6] } }),
      ],
    },
    deprivace: {
      name: 'Šátek a sluchátka vleže', props: ['bed'], figs: [
        w('lie_back', 112, 96, { j: { e1: [-30, -14], w1: [-44, -12], e2: [-32, -12], w2: [-46, -10] } }),
        m('kneel', 152, 75, { flip: true, j: { e1: [16, -8], w1: [32, 0], e2: [14, -6], w2: [30, 2] } }),
      ],
    },
  };

  // ---------- Výstup ----------
  // Rám se dopočítá z kloubů a kulis, aby postavy vždy vyplnily obrázek.
  function viewBox(pose) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    const add = (x, y, pad) => {
      x0 = Math.min(x0, x - pad); y0 = Math.min(y0, y - pad);
      x1 = Math.max(x1, x + pad); y1 = Math.max(y1, y + pad);
    };
    for (const f of pose.figs) {
      const j = joints(f);
      const pad = 8 * (f.s || 1);
      for (const k of Object.keys(j)) {
        const [gx, gy] = toGlobal(f, j[k]);
        add(gx, gy, pad);
      }
    }
    for (const p of pose.props || []) {
      const b = PROP_BOX[p];
      if (b) { add(b[0], b[1], 2); add(b[2], b[3], 2); }
    }
    // Dorovnání na poměr stran 3:2.
    let bw = x1 - x0, bh = y1 - y0;
    const ratio = 3 / 2;
    if (bw / bh < ratio) { const nw = bh * ratio; x0 -= (nw - bw) / 2; bw = nw; }
    else { const nh = bw / ratio; y0 -= (nh - bh) / 2; bh = nh; }
    return `${r(x0)} ${r(y0)} ${r(bw)} ${r(bh)}`;
  }

  function renderPose(id) {
    const pose = POSES[id];
    if (!pose) return null;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', viewBox(pose));
    svg.setAttribute('class', 'pose-svg');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Poloha: ' + pose.name);
    svg.innerHTML = `<g class="pp">${(pose.props || []).map(p => PROPS[p] || '').join('')}</g>` +
      pose.figs.map(figureSvg).join('');
    return svg;
  }

  window.POSES = POSES;
  window.renderPose = renderPose;
})();
