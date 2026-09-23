/* NIDEA · interacción del sitio */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => 1 - Math.pow(1 - t, 3);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const hex2rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const rgb2hex = c => '#' + c.map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(A.map((v, i) => lerp(v, B[i], clamp(t)))); };

  // Pista por fotogramas clave: [[hora, valor], ...] → valor interpolado
  const track = (keys, h) => {
    if (h <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (h <= keys[i][0]) {
        const [h0, v0] = keys[i - 1], [h1, v1] = keys[i];
        const t = (h - h0) / (h1 - h0 || 1);
        const s = t * t * (3 - 2 * t);
        return lerp(v0, v1, s);
      }
    }
    return keys[keys.length - 1][1];
  };

  /* ---------- Datos de energía (compartidos) ---------- */
  // Ejemplo ilustrativo: 6 kWp en León, día despejado. Consumos en kW.
  const G = (h, m, s) => Math.exp(-Math.pow((h - m) / s, 2));
  const solar = h => (h > 6.3 && h < 20.1) ? 6 * G(h, 13.2, 2.7) : 0;
  // Casa con paneles pero sin coordinar: picos en la mañana y en la noche
  const consConv = h => .45 + 1.7 * G(h, 7.4, 1) + .5 * G(h, 13, 3.5) + 3.0 * G(h, 20.3, 1.9);
  // Casa NIDEA: lo que puede esperar se mueve a las horas de sol
  const consNidea = h => .4 + .9 * G(h, 7.2, .9) + 2.9 * G(h, 13.1, 2.5) + 1.2 * G(h, 20, 1.7);

  /* ==========================================================
     Navegación
     ========================================================== */
  const nav = $('#nav');
  const navToggle = $('#navToggle');
  const navLinks = $('#navLinks');
  const onScrollNav = () => nav.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();
  const closeMenu = () => {
    navToggle.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('is-open');
    nav.classList.remove('menu-open');
    document.body.style.overflow = '';
  };
  navToggle.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') !== 'true';
    navToggle.setAttribute('aria-expanded', String(open));
    navLinks.classList.toggle('is-open', open);
    nav.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('a', navLinks).forEach(a => a.addEventListener('click', closeMenu));
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ==========================================================
     1 · Portada: amanecer dentro del nicho
     ========================================================== */
  (function heroSunrise() {
    const top = $('#hSkyTop'), mid = $('#hSkyMid'), low = $('#hSkyLow');
    const sun = $('#hSun'), far = $('#hHillFar'), near = $('#hHillNear');
    if (!top) return;
    const paint = t => {
      top.setAttribute('stop-color', mix('#3A4058', '#B7C6CF', t));
      mid.setAttribute('stop-color', mix('#8E7D86', '#E6DCCD', t));
      low.setAttribute('stop-color', mix('#E7B98F', '#F4E3C6', t));
      sun.setAttribute('transform', `translate(0 ${lerp(760, 556, t)})`);
      far.setAttribute('fill', mix('#6E6470', '#B9AA9D', t));
      near.setAttribute('fill', mix('#4E4450', '#9E8878', t));
    };
    if (reduced) { paint(1); return; }
    paint(0);
    const dur = 3400, start = performance.now() + 250;
    const step = now => {
      const t = clamp((now - start) / dur);
      paint(ease(t));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  })();

  /* ==========================================================
     2 · Un día en una casa NIDEA
     ========================================================== */
  (function dayInHouse() {
    const svg = $('#house');
    if (!svg) return;
    const trackEl = $('#dayTrack');
    const sticky = $('.day-sticky');
    const scene = $('#dayScene');
    const el = id => document.getElementById(id);
    const E = {
      skyTop: el('skyTop'), skyBottom: el('skyBottom'), stars: el('stars'), sun: el('sun'), sunDisc: el('sunDisc'),
      moon: el('moon'), moonShade: el('moonShade'), mtnFar: el('mtnFar'), mtnNear: el('mtnNear'), tint: el('tint'),
      winBed: el('winBed'), winLiving: el('winLiving'), winKitchen: el('winKitchen'),
      curBedL: el('curBedL'), curBedR: el('curBedR'), curLivL: el('curLivL'), curLivR: el('curLivR'), curKitL: el('curKitL'), curKitR: el('curKitR'),
      glowBed: el('glowBed'), glowLiving: el('glowLiving'), glowKitchen: el('glowKitchen'), glowGarage: el('glowGarage'),
      garageInside: el('garageInside'), gate: el('gate'), car: el('car'), carBody: el('carBody'), headGlow: el('headGlow'),
      panelGlint: el('panelGlint'), flow: el('flow'), lockLed: el('lockLed'), camLed: el('camLed'), pathLights: el('pathLights'),
      recognize: el('recognize'), livingInterior: el('livingInterior'),
      clock: el('dayClock'), roSolar: el('roSolar'), roHouse: el('roHouse'), roTemp: el('roTemp'), roState: el('roState'),
      progress: el('dayProgress')
    };
    const extGlows = $$('.ext-glow', svg);
    // Cada cortina lleva una capa de pliegues encima
    $$('.curtain', svg).forEach(c => {
      const p = c.cloneNode();
      p.removeAttribute('id'); p.setAttribute('fill', 'url(#pleat)'); p.setAttribute('class', 'pleat');
      c.after(p); c._pleat = p;
    });
    const garageLamp = el('garageLamp');

    // Etiquetas en la escena: [texto, x, y, desde, hasta] en coordenadas del dibujo
    const CHIPS = [
      ['Cortinas abriendo', 540, 330, 6.35, 7.35],
      ['Portón abriendo', 1020, 452, 8.0, 8.3],
      ['Portón cerrado', 1020, 452, 8.45, 8.95],
      ['Cámaras vigilando', 1092, 462, 8.6, 9.6],
      [h => `Sol a ${solar(h).toFixed(1)} kW`, 540, 258, 10.6, 15.6],
      ['Lavadora con sol', 800, 404, 12.2, 14.8],
      ['Cortinas al 50 %', 540, 466, 15.9, 17.7],
      ['Auto reconocido', 1020, 452, 18.88, 19.12],
      ['Portón abriendo', 1020, 452, 19.12, 19.5],
      ['Escena “Llegar a casa”', 540, 466, 19.25, 20.8],
      ['Puerta cerrada', 896, 474, 22.8, 23.2],
      ['Perímetro activo', 1020, 446, 23.1, 23.6]
    ].map(([t, x, y, a, b]) => {
      const n = document.createElement('span');
      n.className = 'chip-ev';
      if (typeof t === 'string') n.textContent = t;
      return { t, x, y, a, b, n };
    });
    const chipLayer = document.createElement('div');
    chipLayer.className = 'day-chips';
    chipLayer.setAttribute('aria-hidden', 'true');
    CHIPS.forEach(c => chipLayer.appendChild(c.n));
    scene.appendChild(chipLayer);
    const placeChips = h => {
      const m = svg.getScreenCTM(), sr = scene.getBoundingClientRect();
      if (!m) return;
      CHIPS.forEach(c => {
        const o = clamp((h - c.a) / .12) * clamp((c.b - h) / .12);
        c.n.style.opacity = o.toFixed(3);
        if (o <= 0) return;
        if (typeof c.t === 'function') c.n.textContent = c.t(h);
        const p = new DOMPoint(c.x, c.y).matrixTransform(m);
        c.n.style.transform = `translate(${(p.x - sr.left).toFixed(1)}px, ${(p.y - sr.top).toFixed(1)}px) translate(-50%, calc(-100% - 8px)) translateY(${((1 - o) * 6).toFixed(1)}px)`;
      });
    };
    const caps = $$('.day-cap');
    const stops = $$('.day-timeline button');

    // Estrellas
    const NS = 'http://www.w3.org/2000/svg';
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 70; i++) {
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', (-700 + rnd() * 2500).toFixed(1));
      c.setAttribute('cy', (-500 + rnd() * 880).toFixed(1));
      c.setAttribute('r', (0.6 + rnd() * 1.3).toFixed(2));
      c.setAttribute('opacity', (0.35 + rnd() * 0.65).toFixed(2));
      E.stars.appendChild(c);
    }

    // Cielo por hora: [hora, arriba, horizonte, tinte, opacidad del tinte]
    const SKY = [
      [5.0, '#161B2B', '#2B3048', '#0F1424', .62],
      [6.0, '#39405A', '#8D7C87', '#2A2438', .42],
      [6.6, '#7C8AA3', '#EBC3A0', '#6A4E5A', .22],
      [7.4, '#B3C4CF', '#F1DEC6', '#E9C39A', .07],
      [9.5, '#C2D2DA', '#EEEFEB', '#FFFFFF', 0],
      [14.0, '#BCCFD9', '#EDEFEC', '#FFFFFF', 0],
      [16.8, '#C0CCD2', '#F2E4CC', '#F1C48E', .06],
      [18.5, '#7F8BA5', '#EDB68E', '#B4715A', .2],
      [19.3, '#454D6C', '#A87C7E', '#3A3350', .36],
      [20.4, '#232A42', '#3A3E58', '#161C30', .52],
      [22.0, '#141A2C', '#232A40', '#0F1424', .62],
      [24.0, '#11162A', '#1E2438', '#0D1222', .64]
    ];
    const skyAt = h => {
      let i = SKY.findIndex(k => k[0] >= h);
      if (i <= 0) i = 1;
      const a = SKY[i - 1], b = SKY[i];
      const t = clamp((h - a[0]) / (b[0] - a[0]));
      return { top: mix(a[1], b[1], t), bottom: mix(a[2], b[2], t), tint: mix(a[3], b[3], t), tintO: lerp(a[4], b[4], t) };
    };

    // Comportamiento de la casa (1 = cerrada / encendida / abierta)
    const K = {
      curBed: [[6.3, 1], [7.2, .12], [21.6, .12], [22.2, 1]],
      curLiv: [[6.9, 1], [7.6, .12], [15.8, .12], [16.4, .55], [18.0, .55], [18.4, .12], [22.6, .12], [23.1, 1]],
      curKit: [[7.0, 1], [7.6, .12], [22.4, .12], [22.9, 1]],
      bed: [[6.15, 0], [6.4, .45], [7.3, .45], [7.6, 0], [21.5, 0], [21.8, .55], [22.7, .55], [23.0, 0]],
      liv: [[6.2, .06], [6.4, 0], [18.85, 0], [19.25, .95], [22.7, .95], [23.0, .06]],
      kit: [[6.9, 0], [7.2, .6], [8.0, .6], [8.15, 0], [19.3, 0], [19.6, .75], [22.3, .75], [22.6, 0]],
      garage: [[8.0, 0], [8.05, .8], [8.45, .8], [8.55, 0], [19.1, 0], [19.2, .9], [19.8, .9], [20.1, 0]],
      ext: [[6.4, .3], [6.8, 0], [18.7, 0], [19.0, 1], [22.9, 1], [23.2, .35]],
      path: [[6.4, .5], [6.8, 0], [18.9, 0], [19.2, .8], [22.9, .8], [23.2, .4]],
      gate: [[8.02, 0], [8.12, 1], [8.42, 1], [8.52, 0], [19.12, 0], [19.25, 1], [19.55, 1], [19.7, 0]],
      temp: [[6, 21.5], [8.5, 22], [9, 25], [12.5, 25], [13.3, 23], [16, 23], [18.5, 23.5], [19.2, 23], [22.5, 22.5], [23.5, 22]]
    };

    const curtain = (L, R, x, w, closed) => {
      const cw = Math.max(w / 2 * closed, 6).toFixed(1), rx = (x + w - cw).toFixed(1);
      [L, L._pleat].forEach(n => n.setAttribute('width', cw));
      [R, R._pleat].forEach(n => { n.setAttribute('x', rx); n.setAttribute('width', cw); });
    };
    const fmtTime = h => { const H = Math.floor(h), M = Math.floor((h - H) * 60); return `${H % 24}:${String(M).padStart(2, '0')}`; };
    const stageOf = h => h < 7.9 ? 0 : h < 11 ? 1 : h < 18.6 ? 2 : h < 21.4 ? 3 : 4;

    let lastStage = -1;
    function render(h) {
      const sky = skyAt(h);
      const dark = clamp(sky.tintO / .64);
      E.skyTop.setAttribute('stop-color', sky.top);
      E.skyBottom.setAttribute('stop-color', sky.bottom);
      scene.style.backgroundColor = sky.top;
      E.tint.setAttribute('fill', sky.tint);
      E.tint.setAttribute('opacity', sky.tintO.toFixed(3));
      E.mtnFar.setAttribute('fill', mix(sky.bottom, '#9C958E', .5));
      E.mtnNear.setAttribute('fill', mix(sky.bottom, '#8E8579', .72));
      E.stars.setAttribute('opacity', clamp(1 - (h - 5.6) / 1, 0, 1) + clamp((h - 19.8) / 1.4, 0, 1));

      // Sol y luna
      const f = (h - 6.55) / 12.7;
      const alt = Math.sin(Math.PI * clamp(f));
      E.sun.setAttribute('transform', `translate(${lerp(40, 1200, clamp(f)).toFixed(1)} ${(640 - alt * 540).toFixed(1)})`);
      E.sun.setAttribute('opacity', f > -0.05 && f < 1.05 ? 1 : 0);
      E.sunDisc.setAttribute('fill', mix('#F0A56A', '#FBE6BE', alt));
      let moonO = 0, mx = 0, my = 0;
      if (h > 19.4) { const m = clamp((h - 19.8) / 4); moonO = clamp((h - 19.6) / .8); mx = lerp(1060, 640, m); my = lerp(400, 130, m); }
      else if (h < 6.6) { moonO = clamp((6.5 - h) / .6); mx = 180; my = 140; }
      E.moon.setAttribute('opacity', moonO.toFixed(3));
      E.moon.setAttribute('transform', `translate(${mx} ${my})`);
      E.moonShade.setAttribute('fill', sky.top);

      // Energía
      const g = solar(h);
      const c = consNidea(h);
      E.panelGlint.setAttribute('opacity', (clamp(g / 6) * .32).toFixed(3));
      E.flow.setAttribute('opacity', clamp((g - .4) / 1.2).toFixed(3));
      E.roSolar.textContent = g.toFixed(1) + ' kW';
      E.roHouse.textContent = c.toFixed(1) + ' kW';
      E.roTemp.textContent = Math.round(track(K.temp, h)) + '°';
      const away = h > 8.3 && h < 19.2;
      const locked = h < 6.4 || away || h > 22.95;
      E.roState.textContent = (h < 6.4 || h > 22.95) ? 'Asegurada' : away ? 'Fuera de casa' : 'En casa';
      E.lockLed.setAttribute('fill', locked ? '#8FBF8A' : '#E2A650');
      E.camLed.setAttribute('opacity', (away || h > 22.95 || h < 6.4) ? 1 : 0);

      // Ventanas, cortinas y luces
      const baseGlass = mix(mix(sky.top, '#9AA6A8', .45), '#1A1D28', dark);
      const linen = mix('#EFE8DC', '#3A3B46', dark * .8);
      const lit = (L, warm) => mix(baseGlass, warm, L * .92);
      const Lb = track(K.bed, h), Ll = track(K.liv, h), Lk = track(K.kit, h), Lg = track(K.garage, h);
      E.winBed.setAttribute('fill', lit(Lb, h < 12 ? '#F8E0B4' : '#F6CD8E'));
      E.winLiving.setAttribute('fill', lit(Ll, '#F6CD8E'));
      E.winKitchen.setAttribute('fill', lit(Lk, h < 12 ? '#F8E2BC' : '#F6CD8E'));
      const curCol = L => mix(linen, '#F7D6A0', L * .85);
      [E.curBedL, E.curBedR].forEach(n => n.setAttribute('fill', curCol(Lb)));
      [E.curLivL, E.curLivR].forEach(n => n.setAttribute('fill', curCol(Ll)));
      [E.curKitL, E.curKitR].forEach(n => n.setAttribute('fill', curCol(Lk)));
      curtain(E.curBedL, E.curBedR, 428, 224, track(K.curBed, h));
      curtain(E.curLivL, E.curLivR, 420, 240, track(K.curLiv, h));
      curtain(E.curKitL, E.curKitR, 700, 145, track(K.curKit, h));
      E.livingInterior.style.setProperty('--sil', mix(mix('#8E948F', '#171922', dark), '#6A5440', Ll));
      const gl = L => (L * (.2 + .8 * dark)).toFixed(3);
      E.glowBed.setAttribute('opacity', gl(Lb));
      E.glowLiving.setAttribute('opacity', gl(Ll));
      E.glowKitchen.setAttribute('opacity', gl(Lk));
      E.glowGarage.setAttribute('opacity', gl(Lg));
      E.garageInside.setAttribute('fill', mix(mix('#3A3632', '#15161E', dark), '#8C7358', Lg * .55));
      garageLamp.setAttribute('opacity', Lg.toFixed(3));
      const ext = track(K.ext, h) * (.15 + .85 * dark);
      extGlows.forEach(n => n.setAttribute('opacity', ext.toFixed(3)));
      E.pathLights.setAttribute('opacity', (track(K.path, h) * dark).toFixed(3));

      // Portón y auto
      E.gate.setAttribute('transform', `translate(${(track(K.gate, h) * 128).toFixed(1)} 0)`);
      let carO = 0, cx = 1600, cy = 604, flip = false;
      if (h >= 8.08 && h < 8.5) { flip = true; carO = track([[8.08, 0], [8.13, 1]], h); cx = track([[8.1, 945], [8.45, 1600]], h); cy = track([[8.08, 590], [8.14, 604]], h); }
      else if (h >= 18.8 && h < 19.3) { carO = 1; cx = track([[18.8, 1600], [19.15, 945]], h); }
      else if (h >= 19.3 && h < 19.5) { cx = 945; cy = track([[19.3, 604], [19.48, 588]], h); carO = track([[19.36, 1], [19.5, 0]], h); }
      E.car.setAttribute('opacity', carO.toFixed(3));
      E.car.setAttribute('transform', `translate(${cx.toFixed(1)} ${cy.toFixed(1)})`);
      E.carBody.setAttribute('transform', flip ? 'translate(150 0) scale(-1 1)' : '');
      E.headGlow.setAttribute('opacity', h > 18 ? '1' : '0');
      const rc = clamp((h - 18.95) / .25);
      const ring = E.recognize.firstElementChild;
      E.recognize.setAttribute('opacity', (rc > 0 && rc < 1 ? Math.sin(rc * Math.PI) : 0).toFixed(3));
      ring.setAttribute('cx', 1092); ring.setAttribute('cy', 474);
      ring.setAttribute('r', (6 + rc * 90).toFixed(1));

      // Interfaz
      placeChips(h);
      E.clock.textContent = fmtTime(h);
      sticky.classList.toggle('is-night', dark > .45);
      const st = stageOf(h);
      if (st !== lastStage) {
        caps.forEach((c, i) => c.classList.toggle('is-active', i === st));
        stops.forEach((b, i) => { b.classList.toggle('is-active', i === st); b.setAttribute('aria-current', i === st ? 'step' : 'false'); });
        lastStage = st;
      }
    }

    // Recorte de la escena según pantalla
    function fitView() {
      const W = scene.clientWidth, H = scene.clientHeight;
      if (!W || !H) return;
      let x, y, w, hh;
      if (innerWidth > 900) {
        hh = 720; w = W / H * 720;
        if (w < 1260) { w = 1260; hh = w * H / W; }
        x = 1235 - w; y = 720 - hh;
      } else {
        w = 860; hh = w * H / W;
        if (hh < 520) { hh = 520; w = hh * W / H; }
        x = 770 - w / 2; y = 690 - hh;
      }
      svg.setAttribute('viewBox', `${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${hh.toFixed(1)}`);
    }

    // Scroll → hora
    const MAP = [[0, 5.9], [0.08, 6.4], [0.18, 7.4], [0.24, 8.0], [0.32, 8.6], [0.40, 12.0], [0.50, 15.2], [0.56, 16.4], [0.62, 18.7], [0.72, 19.8], [0.80, 21.2], [0.90, 23.0], [1, 23.5]];
    const pToH = p => { for (let i = 1; i < MAP.length; i++) if (p <= MAP[i][0]) return lerp(MAP[i - 1][1], MAP[i][1], (p - MAP[i - 1][0]) / (MAP[i][0] - MAP[i - 1][0])); return 23.5; };
    const hToP = h => { for (let i = 1; i < MAP.length; i++) if (h <= MAP[i][1]) return lerp(MAP[i - 1][0], MAP[i][0], (h - MAP[i - 1][1]) / (MAP[i][1] - MAP[i - 1][1])); return 1; };
    const progress = () => {
      const r = trackEl.getBoundingClientRect();
      const total = trackEl.offsetHeight - sticky.offsetHeight;
      return clamp(-r.top / (total || 1));
    };

    let cur = pToH(progress()), target = cur, raf = 0;
    const loop = () => {
      const d = target - cur;
      cur = Math.abs(d) < .002 || reduced ? target : cur + d * .14;
      render(cur);
      raf = cur !== target ? requestAnimationFrame(loop) : 0;
    };
    const onScroll = () => {
      const p = progress();
      E.progress.style.width = (p * 100).toFixed(2) + '%';
      target = pToH(p);
      if (!raf) raf = requestAnimationFrame(loop);
    };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', () => { fitView(); onScroll(); });
    fitView(); render(cur); onScroll();

    const JUMP = [6.9, 8.25, 14.2, 19.25, 23.1];
    stops.forEach((b, i) => b.addEventListener('click', () => {
      const total = trackEl.offsetHeight - sticky.offsetHeight;
      const top = trackEl.getBoundingClientRect().top + scrollY + hToP(JUMP[i]) * total;
      scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    }));
  })();

  /* ==========================================================
     4 · El problema
     ========================================================== */
  (function problem() {
    const field = $('#appsField'), after = $('#problemAfter');
    const btns = $$('.problem .seg button');
    btns.forEach(b => b.addEventListener('click', () => {
      const mode = b.dataset.mode;
      field.dataset.mode = mode;
      btns.forEach(x => x.setAttribute('aria-selected', String(x === b)));
      after.classList.toggle('is-on', mode === 'calm');
    }));
  })();

  /* ==========================================================
     3 · La app: dispositivos a escala real
     ========================================================== */
  const stages = $$('.scale-stage');
  const scaleDevices = () => stages.forEach(st => {
    const w = +st.dataset.w, h = +st.dataset.h, s = st.clientWidth / w;
    st.style.height = (h * s) + 'px';
    st.firstElementChild.style.transform = `scale(${s})`;
  });
  scaleDevices();
  addEventListener('resize', scaleDevices);
  if ('ResizeObserver' in window) { const ro = new ResizeObserver(scaleDevices); stages.forEach(s => ro.observe(s)); }

  (function appScreens() {
    const views = $$('.ph-view'), tabs = $$('.ph-tabs button'), feats = $$('.app-features button');
    const show = name => {
      views.forEach(v => v.classList.toggle('is-on', v.dataset.view === name));
      tabs.forEach(t => t.classList.toggle('is-on', t.dataset.screen === name));
      feats.forEach(f => f.setAttribute('aria-selected', String(f.dataset.screen === name)));
    };
    [...tabs, ...feats].forEach(b => b.addEventListener('click', () => show(b.dataset.screen)));

    // Escenas
    const title = $('#phHomeTitle');
    $$('#phScenes button').forEach(b => b.addEventListener('click', () => {
      $$('#phScenes button').forEach(x => x.classList.toggle('is-on', x === b));
      title.textContent = b.dataset.msg;
    }));

    // Interruptores
    $$('.ph-room').forEach(r => r.addEventListener('click', () => {
      r.classList.toggle('is-on');
      if (r.hasAttribute('data-lock')) r.querySelector('small').textContent = r.classList.contains('is-on') ? 'Cerrada con llave' : 'Abierta';
    }));

    // Portón
    const gate = $('#phGate'), gt = $('#phGateTitle'), gs = $('#phGateSub');
    let busy = false;
    gate.addEventListener('click', () => {
      if (busy) return;
      busy = true;
      gate.classList.add('is-busy'); gt.textContent = 'Abriendo…'; gs.textContent = 'Toma unos segundos';
      setTimeout(() => { gate.classList.remove('is-busy'); gate.classList.add('is-open'); gt.textContent = 'Portón abierto'; gs.textContent = 'Se cierra solo en 30 s'; }, 1600);
      setTimeout(() => { gate.classList.remove('is-open'); gt.textContent = 'Abrir portón'; gs.textContent = 'Cerrado'; busy = false; }, 5200);
    });

    // Gráfica del teléfono
    const ph = $('#phChart');
    if (ph) {
      const W = 340, H = 150, X = h => h / 24 * W, Y = v => H - 4 - v / 6.5 * (H - 12);
      let area = `M0 ${Y(0)}`, gl = '', cl = '';
      for (let h = 0; h <= 24; h += .25) {
        area += ` L${X(h).toFixed(1)} ${Y(solar(h)).toFixed(1)}`;
        gl += `${h ? 'L' : 'M'}${X(h).toFixed(1)} ${Y(solar(h)).toFixed(1)} `;
        cl += `${h ? 'L' : 'M'}${X(h).toFixed(1)} ${Y(consNidea(h)).toFixed(1)} `;
      }
      area += ` L${W} ${Y(0)} Z`;
      ph.innerHTML = `<path d="${area}" fill="rgba(226,166,80,.22)"/><path d="${gl}" fill="none" stroke="#E2A650" stroke-width="2" vector-effect="non-scaling-stroke"/><path d="${cl}" fill="none" stroke="#2A2420" stroke-width="2" vector-effect="non-scaling-stroke"/>`;
    }

    // iPad: barras de energía y planta
    const bars = $('.ip-bars');
    if (bars) for (let h = 5; h <= 21; h++) {
      const i = document.createElement('i'); const g = solar(h + .5);
      i.style.height = Math.max(4, g / 6 * 100) + '%';
      if (g < .2) i.className = 'off';
      bars.appendChild(i);
    }
    $$('#ipPlan .room').forEach(r => {
      const val = r.querySelector('.val');
      r.dataset.level = val.textContent === 'Apagada' ? '50 %' : val.textContent;
      r.addEventListener('click', () => {
        const on = r.classList.toggle('is-on');
        val.textContent = on ? r.dataset.level : 'Apagada';
      });
    });
  })();

  /* ==========================================================
     6 · Energía: generación contra consumo
     ========================================================== */
  (function energyChart() {
    const host = $('#energyChart');
    if (!host) return;
    const STEP = .25, HOURS = [];
    for (let h = 0; h <= 24.001; h += STEP) HOURS.push(+h.toFixed(2));
    const GEN = HOURS.map(solar);
    const C0 = HOURS.map(consConv), C1 = HOURS.map(consNidea);
    let mixT = 1, anim = 0;
    const cons = () => C0.map((v, i) => lerp(v, C1[i], mixT));

    const tip = document.createElement('div'); tip.className = 'tip'; host.appendChild(tip);
    let svgEl, dims;

    function stats(c) {
      const sumG = GEN.reduce((a, b) => a + b, 0);
      const used = GEN.reduce((a, g, i) => a + Math.min(g, c[i]), 0);
      const grid = c.reduce((a, v, i) => a + Math.max(v - GEN[i], 0), 0);
      const base = C0.reduce((a, b) => a + b, 0);
      $('#stSelf').textContent = Math.round(used / sumG * 100) + ' %';
      $('#stGrid').textContent = '−' + Math.round((1 - grid / base) * 100) + ' %';
    }

    function draw() {
      const W = host.clientWidth, H = host.clientHeight;
      const narrow = W < 560;
      const m = { l: narrow ? 34 : 46, r: 12, t: 18, b: 30 };
      const iw = W - m.l - m.r, ih = H - m.t - m.b;
      const X = h => m.l + h / 24 * iw, Y = v => m.t + ih - v / 7 * ih;
      dims = { W, H, m, iw, ih, X, Y };
      const c = cons();
      const line = arr => arr.map((v, i) => `${i ? 'L' : 'M'}${X(HOURS[i]).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
      const area = arr => `M${X(0)} ${Y(0)} ` + arr.map((v, i) => `L${X(HOURS[i]).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ') + ` L${X(24)} ${Y(0)} Z`;
      const used = GEN.map((g, i) => Math.min(g, c[i]));
      const ticksX = [0, 6, 12, 18, 24];
      const ticksY = [0, 2, 4, 6];
      const peakI = HOURS.indexOf(13.25);
      const labelCons = HOURS.indexOf(narrow ? 21 : 21.5);
      svgEl = `<svg width="${W}" height="${H}" aria-hidden="true">
        <g class="grid">${ticksY.map(v => `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(v)}" y2="${Y(v)}"/>`).join('')}</g>
        <g class="axis">${ticksY.map(v => `<text x="${m.l - 8}" y="${Y(v) + 4}" text-anchor="end">${v}${v ? ' kW' : ''}</text>`).join('')}
        ${ticksX.map(h => `<text x="${X(h)}" y="${H - 8}" text-anchor="${h === 0 ? 'start' : h === 24 ? 'end' : 'middle'}">${String(h).padStart(2, '0')}:00</text>`).join('')}</g>
        <path class="gen-area" d="${area(GEN)}"/>
        <path class="used-area" d="${area(used)}"/>
        <path class="gen-line" d="${line(GEN)}"/>
        <path class="cons-line" d="${line(c)}"/>
        <text class="dlabel" x="${X(13.2)}" y="${Y(GEN[peakI]) - 10}" text-anchor="middle">Sol</text>
        <text class="dlabel" x="${X(HOURS[labelCons])}" y="${Y(c[labelCons]) - 10}" text-anchor="middle">Casa</text>
        <g class="hover" style="display:none"><line class="cross" y1="${m.t}" y2="${m.t + ih}"/><circle class="dot-g" r="5"/><circle class="dot-c" r="5"/></g>
        <rect class="hit" x="${m.l}" y="${m.t}" width="${iw}" height="${ih}" fill="transparent"/>
      </svg>`;
      const old = host.querySelector('svg'); if (old) old.remove();
      host.insertAdjacentHTML('afterbegin', svgEl);
      stats(c);
      bindHover();
    }

    function bindHover() {
      const s = host.querySelector('svg'), hov = s.querySelector('.hover'), hit = s.querySelector('.hit');
      const cross = hov.querySelector('.cross'), dg = hov.querySelector('.dot-g'), dc = hov.querySelector('.dot-c');
      const move = e => {
        const r = s.getBoundingClientRect();
        const px = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
        const h = clamp((px - dims.m.l) / dims.iw) * 24;
        const i = Math.round(h / STEP), hh = HOURS[i];
        const c = cons()[i], g = GEN[i], x = dims.X(hh);
        hov.style.display = '';
        cross.setAttribute('x1', x); cross.setAttribute('x2', x);
        dg.setAttribute('cx', x); dg.setAttribute('cy', dims.Y(g));
        dc.setAttribute('cx', x); dc.setAttribute('cy', dims.Y(c));
        const H = Math.floor(hh), M = Math.round((hh - H) * 60);
        tip.innerHTML = `<b>${String(H).padStart(2, '0')}:${String(M).padStart(2, '0')}</b><br><i style="background:#E2A650"></i>Sol ${g.toFixed(1)} kW<br><i style="background:#F7F6F3"></i>Casa ${c.toFixed(1)} kW`;
        tip.style.left = clamp(x, 70, dims.W - 70) + 'px';
        tip.style.opacity = 1;
      };
      const leave = () => { hov.style.display = 'none'; tip.style.opacity = 0; };
      hit.addEventListener('pointermove', move);
      hit.addEventListener('pointerdown', move);
      hit.addEventListener('pointerleave', leave);
    }

    const btns = $$('.energy .seg button');
    btns.forEach(b => b.addEventListener('click', () => {
      btns.forEach(x => x.setAttribute('aria-selected', String(x === b)));
      const to = b.dataset.profile === 'nidea' ? 1 : 0, from = mixT, t0 = performance.now();
      cancelAnimationFrame(anim);
      const step = now => {
        const t = reduced ? 1 : clamp((now - t0) / 800);
        mixT = lerp(from, to, ease(t));
        draw();
        if (t < 1) anim = requestAnimationFrame(step);
      };
      anim = requestAnimationFrame(step);
    }));

    draw();
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(draw, 80); });
  })();

  /* ==========================================================
     5 · Pasos: el trazo se dibuja al entrar
     ========================================================== */
  const steps = $$('.step');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); } }), { threshold: .4 });
    steps.forEach(s => io.observe(s));
  } else steps.forEach(s => s.classList.add('in-view'));

  /* ==========================================================
     8 · Arquitectos: capas del plano
     ========================================================== */
  $$('.plan-layers button').forEach(b => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', String(on));
    $('.layer-' + b.dataset.layer).classList.toggle('is-off', !on);
  }));

  /* ==========================================================
     10 · Formulario
     ========================================================== */
  (function form() {
    const f = $('#visitForm');
    if (!f) return;
    const nota = $('#fNota'), etapa = $('#fEtapa');
    $$('[data-tier]').forEach(a => a.addEventListener('click', () => {
      const t = a.dataset.tier;
      if (t === 'Arquitecto o desarrollador') etapa.value = 'Soy arquitecto o desarrollador';
      else if (!nota.value.trim()) nota.value = `Me interesa el nivel ${t}.`;
    }));
    const setErr = (id, bad) => $('#' + id).closest('.field').classList.toggle('has-error', bad);
    f.addEventListener('input', e => { if (e.target.closest('.field.has-error')) setErr(e.target.id, false); });
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const name = $('#fNombre').value.trim();
      const tel = $('#fTel').value.replace(/\D/g, '');
      const badName = !name, badTel = tel.length < 10;
      setErr('fNombre', badName); setErr('fTel', badTel);
      if (badName || badTel) { (badName ? $('#fNombre') : $('#fTel')).focus(); return; }
      const data = Object.fromEntries(new FormData(f));
      // Para conectar con un CRM o correo: define window.NIDEA_FORM_ENDPOINT antes de este script.
      if (window.NIDEA_FORM_ENDPOINT) {
        try { await fetch(window.NIDEA_FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); } catch (_) { /* se muestra la confirmación de todos modos */ }
      }
      const first = name.split(/\s+/)[0];
      $('#doneTitle').textContent = `Gracias, ${first}. Ya tenemos tu solicitud.`;
      $('#doneText').textContent = data.tipo === 'llamada'
        ? 'Te escribimos por WhatsApp en menos de un día hábil para agendar tu llamada de diseño.'
        : 'Te escribimos por WhatsApp en menos de un día hábil para confirmar tu visita al showroom.';
      const done = $('#formDone');
      done.hidden = false;
      done.focus();
    });
  })();
})();
