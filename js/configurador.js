/* NIDEA · Configurador "Arma tu casa" */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Navegación (igual que en la portada) ---------- */
  const navToggle = $('#navToggle'), navLinks = $('#navLinks'), nav = $('#nav');
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

  /* ---------- Catálogo ---------- */
  const LEVELS = {
    esencial: { rank: 1, name: 'Esencial', tag: 'Lo importante, resuelto.' },
    confort: { rank: 2, name: 'Confort', tag: 'La casa que te conoce.' },
    integral: { rank: 3, name: 'Integral', tag: 'Todo el hogar, pensado desde el plano.' }
  };
  // at: punto del dibujo donde aparece la etiqueta al activar el módulo
  const MODULES = [
    { id: 'luz', short: 'Luz que cambia de tono y escenas para cada momento.', name: 'Iluminación', icon: 'i-bulb', desc: 'Luz que cambia de tono durante el día y escenas para cada momento.', retro: 'Apagadores inalámbricos, sin cablear de nuevo.',
      opts: [['principales', 'Áreas principales', 'esencial'], ['toda', 'Toda la casa', 'integral']], at: [540, 468], chip: 'Luz cálida al llegar' },
    { id: 'cortinas', short: 'Se abren con el sol y se cierran con el calor.', name: 'Cortinas motorizadas', icon: 'i-curtain', desc: 'Se abren con el primer sol y se cierran cuando entra el calor.', retro: 'Motores con batería, sin obra.',
      level: 'confort', at: [540, 468], chip: 'Cortinas a la mitad' },
    { id: 'porton', short: 'Se abre solo cuando llegas.', name: 'Portón automático', icon: 'i-gate', desc: 'Se abre solo cuando llegas y se cierra detrás de ti.', retro: 'Casi siempre se conecta al motor que ya tienes.',
      level: 'esencial', at: [1020, 490], chip: 'Portón abriendo' },
    { id: 'camaras', short: 'Tu casa en vivo, con avisos cuando importa.', name: 'Cámaras', icon: 'i-cam', desc: 'Tu casa en vivo desde donde estés, con avisos solo cuando importa.', retro: 'Puede requerir cableado puntual; lo revisamos en la visita.',
      opts: [['entrada', 'Entrada', 'esencial'], ['perimetro', 'Todo el perímetro', 'integral']], at: [1092, 468], chip: 'Cámaras vigilando' },
    { id: 'cerradura', short: 'Llaves temporales y cierre automático.', name: 'Cerradura inteligente', icon: 'i-lock', desc: 'Llaves temporales para quien tú decidas y cierre automático en la noche.', retro: 'Reemplaza la chapa actual en una mañana.',
      level: 'esencial', at: [868, 528], chip: 'Puerta cerrada' },
    { id: 'clima', short: 'La casa fresca antes de que llegues.', name: 'Clima', icon: 'i-temp', desc: 'La casa fresca antes de que llegues, sin desperdiciar energía.', retro: 'Se integra a los equipos que ya tienes, según el modelo.',
      opts: [['principales', 'Áreas principales', 'confort'], ['zonas', 'Por zonas', 'confort']], at: [614, 504], chip: 'Sala a 23°' },
    { id: 'sensores', short: 'Puertas, ventanas y fugas: se da cuenta sola.', name: 'Sensores', icon: 'i-sensor', desc: 'Puertas, ventanas, movimiento y fugas de agua: la casa se da cuenta sola.', retro: 'Inalámbricos, se instalan en minutos.',
      level: 'confort', at: [920, 482], chip: 'Sensores activos' },
    { id: 'solar', short: 'Usa el sol para bajar tu recibo de CFE.', name: 'Energía solar', icon: 'i-sun', desc: 'La casa aprovecha las horas de sol para bajar el recibo de CFE.', retro: 'Funciona con los paneles que ya tienes o con unos nuevos.',
      opts: [['monitoreo', 'Ver mi energía', 'confort'], ['gestion', 'La casa la administra', 'integral']], at: [540, 258], chip: 'Energía del sol' },
    { id: 'audio', short: 'Música en los espacios que elijas.', name: 'Audio', icon: 'i-speaker', desc: 'Música en los espacios que elijas, desde la app o la pared.', retro: 'Bocinas inalámbricas o empotradas, según el espacio.',
      level: 'integral', at: [598, 536], chip: 'Música en la sala' },
    { id: 'electro', short: 'Lavadora y calentador trabajan con sol.', name: 'Electrodomésticos', icon: 'i-fridge', desc: 'Lavadora y calentador trabajan cuando hay sol, no cuando cuesta más.', retro: 'Con equipos compatibles.',
      level: 'integral', at: [809, 512], chip: 'Lavadora con sol' }
  ];

  /* ---------- Viñetas de cada módulo (viewBox 160×100). Clases: .ln trazo, .on visible al activarse ---------- */
  const VIG = {
    luz: `<path class="ln" d="M80 0v24"/><path class="on cone" d="M66 38 34 92h92L94 38z"/><path class="ln shade" d="M64 40 72 24h16l8 16z"/><circle class="bulb" cx="80" cy="42" r="4"/><path class="ln" d="M40 76h80M52 76v16M108 76v16"/><path class="ln faint" d="M12 92h136"/>`,
    cortinas: `<circle class="on sun" cx="92" cy="40" r="11"/><path class="on sun-r ln" d="M92 22v-4M92 62v-4M74 40h-4M114 40h-4M79 27l-3-3M105 27l3-3"/><rect class="ln" x="44" y="16" width="72" height="72"/><path class="ln" d="M38 13h84"/><g class="cl"><rect class="cloth" x="44" y="16" width="36" height="72"/><path class="pleat" d="M53 16v72M62 16v72M71 16v72"/></g><g class="cr"><rect class="cloth" x="80" y="16" width="36" height="72"/><path class="pleat" d="M89 16v72M98 16v72M107 16v72"/></g><path class="ln faint" d="M12 92h136"/>`,
    porton: `<rect class="ln" x="26" y="34" width="108" height="58"/><rect class="dark" x="28" y="36" width="104" height="56"/><path class="on glow" d="M60 36h40l24 56H36z"/><g class="car"><path d="M52 84v-8l8-10h40l8 10v8z"/><circle cx="62" cy="86" r="5"/><circle cx="98" cy="86" r="5"/></g><g clip-path="url(#vgGateClip)"><g class="gt"><rect class="wood" x="28" y="36" width="104" height="56"/><path class="slat" d="M28 44h104M28 52h104M28 60h104M28 68h104M28 76h104M28 84h104"/></g></g><path class="ln faint" d="M8 92h144"/>`,
    camaras: `<path class="ln" d="M22 26v66"/><path class="on cone" d="M54 44 150 70v22H96z"/><rect class="ln" x="24" y="36" width="30" height="14" rx="3"/><circle class="ln" cx="49" cy="43" r="3.5"/><circle class="rec" cx="31" cy="41" r="2.2"/><g class="on person"><circle cx="122" cy="62" r="5"/><path d="M114 92v-14a8 8 0 0 1 16 0v14z"/></g><path class="ln faint" d="M8 92h144"/>`,
    cerradura: `<rect class="ln" x="60" y="10" width="44" height="82"/><path class="ln" d="M96 48v16"/><rect class="ln" x="44" y="40" width="10" height="20" rx="2"/><circle class="led" cx="49" cy="45" r="2.4"/><path class="ln faint" d="M49 51v5"/><g class="on"><rect class="ln" x="116" y="30" width="22" height="38" rx="4"/><path class="ln ok" d="m121 49 4 4 8-9"/><path class="ln wave" d="M110 42a10 10 0 0 0 0 14"/></g><path class="ln faint" d="M12 92h136"/>`,
    clima: `<circle class="ln" cx="62" cy="50" r="28"/><circle class="ln faint" cx="62" cy="50" r="21"/><text class="num" x="62" y="57" text-anchor="middle">23°</text><g class="on air"><path d="M100 36c8-5 14 5 22 0s14 5 22 0"/><path d="M100 50c8-5 14 5 22 0s14 5 22 0"/><path d="M100 64c8-5 14 5 22 0s14 5 22 0"/></g>`,
    sensores: `<rect class="ln" x="36" y="14" width="64" height="74"/><path class="ln" d="M68 14v74M36 51h64"/><rect class="dev" x="100" y="40" width="7" height="18" rx="2"/><circle class="rip" cx="103.5" cy="49" r="4"/><circle class="rip r2" cx="103.5" cy="49" r="4"/><circle class="dotl" cx="103.5" cy="44" r="1.6"/><path class="ln faint" d="M12 92h136"/>`,
    solar: `<circle class="sunb" cx="128" cy="44" r="10"/><path class="on ln sun-r" d="M128 29v-3M128 62v-3M113 44h-3M146 44h-3M118 34l-2-2M138 34l2-2"/><rect class="ln" x="30" y="50" width="76" height="42"/><path class="panel" d="M34 50l6-12h22l-6 12zM62 50l6-12h22l-6 12z"/><path class="on flow" d="M62 50v18h8"/><rect class="ln" x="70" y="62" width="22" height="30"/><path class="on glint" d="M34 50l6-12h22l-6 12zM62 50l6-12h22l-6 12z"/><path class="ln faint" d="M8 92h144"/>`,
    audio: `<rect class="ln" x="56" y="22" width="30" height="64" rx="4"/><circle class="ln" cx="71" cy="64" r="11"/><circle class="ln" cx="71" cy="64" r="3"/><circle class="ln" cx="71" cy="38" r="5"/><g class="wv"><path class="ln w1" d="M96 46a14 14 0 0 1 0 22"/><path class="ln w2" d="M104 38a26 26 0 0 1 0 38"/><path class="ln w3" d="M112 30a38 38 0 0 1 0 54"/></g>`,
    electro: `<rect class="ln" x="54" y="16" width="52" height="76" rx="4"/><path class="ln" d="M54 30h52"/><circle class="ln" cx="64" cy="23" r="2"/><circle class="ln" cx="72" cy="23" r="2"/><circle class="ln" cx="80" cy="60" r="18"/><g class="drum"><circle class="water" cx="80" cy="60" r="13"/><path class="ln" d="M72 58c4-5 12-5 16 0"/></g><g class="on"><circle class="sunb" cx="128" cy="50" r="7"/><path class="ln" d="M128 38v-3M128 65v-3M116 50h-3M143 50h-3"/></g><path class="ln faint" d="M12 92h136"/>`
  };
  const ETAPAS = { diseno: 'En diseño o por construir', obra: 'En obra', construida: 'Ya construida' };
  const M2 = { 'hasta-200': 'Hasta 200 m²', '200-350': '200 a 350 m²', '350-500': '350 a 500 m²', 'mas-500': 'Más de 500 m²' };
  const CONTROL = { botoneras: 'Botoneras de pared', voz: 'Control por voz' };

  /* ---------- Estado (con valores de ejemplo razonables) ---------- */
  const DEFAULT = {
    etapa: 'diseno', m2: '200-350', niveles: '2', ciudad: 'León',
    mods: { luz: 'principales', cortinas: true, porton: true, camaras: 'entrada', cerradura: true, clima: 'principales' },
    control: { botoneras: true, voz: false }
  };
  const state = JSON.parse(JSON.stringify(DEFAULT));

  // Leer una configuración compartida: #e=obra&m2=200-350&n=2&c=León&m=luz:toda,cortinas&k=botoneras
  (function readHash() {
    if (!location.hash || location.hash.length < 3) return;
    try {
      const q = new URLSearchParams(location.hash.slice(1));
      if (!q.has('m')) return;
      if (ETAPAS[q.get('e')]) state.etapa = q.get('e');
      if (M2[q.get('m2')]) state.m2 = q.get('m2');
      if (['1', '2', '3'].includes(q.get('n'))) state.niveles = q.get('n');
      if (q.get('c')) state.ciudad = q.get('c');
      state.mods = {};
      q.get('m').split(',').filter(Boolean).forEach(tok => {
        const [id, opt] = tok.split(':');
        const m = MODULES.find(x => x.id === id);
        if (!m) return;
        state.mods[id] = m.opts ? (m.opts.some(o => o[0] === opt) ? opt : m.opts[0][0]) : true;
      });
      const k = (q.get('k') || '').split(',');
      state.control = { botoneras: k.includes('botoneras'), voz: k.includes('voz') };
    } catch (_) { /* configuración inválida: se usan los valores de ejemplo */ }
  })();

  const writeHash = () => {
    const q = new URLSearchParams();
    q.set('e', state.etapa); q.set('m2', state.m2); q.set('n', state.niveles); q.set('c', state.ciudad);
    q.set('m', Object.entries(state.mods).map(([id, v]) => v === true ? id : `${id}:${v}`).join(','));
    q.set('k', Object.keys(state.control).filter(k => state.control[k]).join(','));
    history.replaceState(null, '', '#' + q.toString());
  };

  /* ---------- Paso 1: proyecto ---------- */
  const cfg = $('.cfg');
  const bindRadios = (name, key) => $$(`input[name="${name}"]`).forEach(r => {
    r.checked = r.value === state[key];
    r.addEventListener('change', () => { state[key] = r.value; update(); });
  });
  bindRadios('etapa', 'etapa'); bindRadios('m2', 'm2'); bindRadios('niveles', 'niveles');
  const ciudad = $('#cfgCiudad');
  ciudad.value = state.ciudad;
  if (ciudad.value !== state.ciudad) { ciudad.value = 'Otra'; state.ciudad = 'Otra'; }
  ciudad.addEventListener('change', () => { state.ciudad = ciudad.value; update(); });

  /* ---------- Paso 2: módulos ---------- */
  const modsEl = $('#cfgMods');
  const levelOf = (m, v) => m.opts ? (m.opts.find(o => o[0] === v) || m.opts[0])[2] : m.level;
  MODULES.forEach(m => {
    const wrap = document.createElement('div');
    wrap.className = 'mod';
    wrap.dataset.id = m.id;
    const lvl = m.opts ? LEVELS[m.opts[0][2]].name : LEVELS[m.level].name;
    wrap.innerHTML = `
      <button type="button" class="mod-main" role="switch" aria-checked="false" id="mod-${m.id}" title="${m.desc}">
        <span class="mod-vis"><svg class="vg vg-${m.id}" viewBox="0 0 160 100" aria-hidden="true">${VIG[m.id]}</svg><span class="mod-lvl">${lvl}</span><span class="mod-check" aria-hidden="true"></span></span>
        <span class="mod-body"><span class="mod-name">${m.name}</span><span class="mod-desc">${m.short}</span><span class="mod-retro">${m.retro}</span></span>
      </button>
      ${m.opts ? `<div class="mod-opts" hidden><div class="seg" role="radiogroup" aria-label="${m.name}">${m.opts.map(o => `<button type="button" role="radio" aria-checked="false" data-opt="${o[0]}">${o[1]}</button>`).join('')}</div></div>` : ''}`;
    modsEl.appendChild(wrap);

    $('.mod-main', wrap).addEventListener('click', () => {
      const on = !state.mods[m.id];
      if (on) { state.mods[m.id] = m.opts ? m.opts[0][0] : true; flash(m); }
      else delete state.mods[m.id];
      update();
    });
    $$('.mod-opts [data-opt]', wrap).forEach(b => b.addEventListener('click', () => {
      state.mods[m.id] = b.dataset.opt;
      flash(m);
      update();
    }));
  });

  /* ---------- Paso 3: control ---------- */
  $$('input[name="control"]').forEach(c => {
    c.checked = !!state.control[c.value];
    c.addEventListener('change', () => { state.control[c.value] = c.checked; update(); });
  });

  /* ---------- Escena ---------- */
  const visual = $('#cfgVisual'), svg = $('svg', visual), chip = $('#cfgChip');
  let chipTimer;
  function flash(m) {
    const vb = svg.viewBox.baseVal;
    const W = visual.clientWidth, H = visual.clientHeight;
    // preserveAspectRatio="xMidYMid slice": escala para cubrir y centra
    const s = Math.max(W / vb.width, H / vb.height);
    const ox = (W - vb.width * s) / 2, oy = (H - vb.height * s) / 2;
    const x = ox + (m.at[0] - vb.x) * s, y = oy + (m.at[1] - vb.y) * s;
    chip.textContent = m.chip;
    chip.style.left = Math.min(Math.max(x, 70), W - 70) + 'px';
    chip.style.top = Math.max(y, 40) + 'px';
    chip.classList.add('is-on');
    clearTimeout(chipTimer);
    chipTimer = setTimeout(() => chip.classList.remove('is-on'), reduced ? 3000 : 2200);
  }

  /* ---------- Resumen ---------- */
  const meter = $$('.cfg-meter span');
  const HINTS = {
    esencial: 'Para llegar a Confort: agrega cortinas, clima, sensores o ver tu energía solar.',
    confort: 'Para llegar a Integral: luz o cámaras en toda la casa, que la casa administre tu energía solar, audio o electrodomésticos.',
    integral: 'Es el nivel más completo: toda la casa trabaja en conjunto, y con el sol.'
  };
  const MARK_FILL = { esencial: '', confort: 'M7.1 38V26h19.8v12z', integral: 'M7.1 38V17a9.9 9.9 0 0 1 19.8 0v21z' };

  function recommended() {
    let best = 'esencial';
    Object.entries(state.mods).forEach(([id, v]) => {
      const m = MODULES.find(x => x.id === id);
      const l = levelOf(m, v);
      if (LEVELS[l].rank > LEVELS[best].rank) best = l;
    });
    return best;
  }

  function summaryRows() {
    const chosen = MODULES.filter(m => state.mods[m.id]).map(m => m.opts ? `${m.name} (${m.opts.find(o => o[0] === state.mods[m.id])[1].toLowerCase()})` : m.name);
    const ctl = ['App NIDEA', ...Object.keys(CONTROL).filter(k => state.control[k]).map(k => CONTROL[k])];
    const niveles = state.niveles === '3' ? '3 o más niveles' : state.niveles === '1' ? '1 nivel' : '2 niveles';
    return [
      ['Tu proyecto', `${ETAPAS[state.etapa]}. ${M2[state.m2]}, ${niveles}, en ${state.ciudad}.`],
      ['Tu casa hará', chosen.length ? chosen.join(', ') + '.' : 'Aún no eliges nada. Empieza por la iluminación o el portón.'],
      ['La van a usar con', ctl.join(', ') + '.'],
      ['Siempre incluido', 'Red profesional, app NIDEA, instalación y soporte continuo.']
    ];
  }

  function update() {
    // escena
    MODULES.forEach(m => {
      const v = state.mods[m.id];
      if (v) visual.dataset[m.id] = v === true ? '' : v; else delete visual.dataset[m.id];
    });
    cfg.dataset.etapa = state.etapa;
    $('#cfgRetro').hidden = state.etapa !== 'construida';

    // tarjetas de módulos
    $$('.mod', modsEl).forEach(w => {
      const v = state.mods[w.dataset.id];
      w.classList.toggle('is-on', !!v);
      $('.mod-main', w).setAttribute('aria-checked', String(!!v));
      const opts = $('.mod-opts', w);
      if (opts) {
        opts.hidden = !v;
        $$('[data-opt]', opts).forEach(b => b.setAttribute('aria-checked', String(b.dataset.opt === v)));
      }
    });

    // nivel
    const lvl = recommended(), L = LEVELS[lvl];
    meter.forEach(s => {
      s.classList.toggle('is-on', LEVELS[s.dataset.l].rank <= L.rank);
      s.classList.toggle('is-cur', s.dataset.l === lvl);
    });
    $('#cfgMeterLabel').setAttribute('aria-label', `Nivel recomendado: ${L.name}`);
    $('#cfgLevelText').innerHTML = `<b class="sans" style="font-weight:400;color:var(--nogal)">${L.name}: ${L.tag.toLowerCase()}</b> ${HINTS[lvl]}`;
    $('#sumLevel').textContent = L.name;
    $('#sumTag').textContent = L.tag;
    $('#barLevel').textContent = L.name;
    $('.cfg-result-mark .fill').setAttribute('d', MARK_FILL[lvl]);
    $('#cfgSum').innerHTML = summaryRows().map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');

    writeHash();
  }
  update();

  /* ---------- Copiar enlace ---------- */
  const copyBtn = $('#cfgCopy'), copyTxt = $('span', copyBtn);
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      copyTxt.textContent = 'Enlace copiado. Compártelo con quien decide contigo.';
    } catch (_) {
      copyTxt.textContent = 'Copia el enlace desde la barra de direcciones.';
    }
    setTimeout(() => { copyTxt.textContent = 'Copiar el enlace de esta configuración'; }, 3200);
  });

  /* ---------- Formulario ---------- */
  const form = $('#cfgForm');
  const setErr = (id, bad) => $('#' + id).closest('.field').classList.toggle('has-error', bad);
  form.addEventListener('input', e => { if (e.target.closest('.field.has-error')) setErr(e.target.id, false); });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = $('#qNombre').value.trim();
    const tel = $('#qTel').value.replace(/\D/g, '');
    const badName = !name, badTel = tel.length < 10;
    setErr('qNombre', badName); setErr('qTel', badTel);
    if (badName || badTel) { (badName ? $('#qNombre') : $('#qTel')).focus(); return; }
    const data = {
      origen: 'configurador',
      nombre: name, telefono: $('#qTel').value.trim(), nota: $('#qNota').value.trim(),
      nivel: LEVELS[recommended()].name,
      configuracion: Object.fromEntries(summaryRows()),
      enlace: location.href
    };
    // Para conectar con un CRM o correo: define window.NIDEA_FORM_ENDPOINT antes de este script.
    if (window.NIDEA_FORM_ENDPOINT) {
      try { await fetch(window.NIDEA_FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); } catch (_) { /* se muestra la confirmación de todos modos */ }
    }
    $('#qDoneTitle').textContent = `Gracias, ${name.split(/\s+/)[0]}. Ya tenemos tu configuración.`;
    const done = $('#qDone');
    done.hidden = false;
    done.focus();
  });

  /* ---------- Barra inferior: se oculta al llegar al resumen ---------- */
  const bar = $('#cfgBar');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { bar.style.transform = e.isIntersecting ? 'translateY(110%)' : ''; }, { threshold: .05 })
      .observe($('#cotizar'));
  }
  bar.style.transition = 'transform .35s cubic-bezier(.22,.61,.36,1)';
})();
