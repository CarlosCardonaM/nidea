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
    { id: 'luz', name: 'Iluminación', icon: 'i-bulb', desc: 'Luz que cambia de tono durante el día y escenas para cada momento.', retro: 'Apagadores inalámbricos, sin cablear de nuevo.',
      opts: [['principales', 'Áreas principales', 'esencial'], ['toda', 'Toda la casa', 'integral']], at: [540, 468], chip: 'Luz cálida al llegar' },
    { id: 'cortinas', name: 'Cortinas motorizadas', icon: 'i-curtain', desc: 'Se abren con el primer sol y se cierran cuando entra el calor.', retro: 'Motores con batería, sin obra.',
      level: 'confort', at: [540, 468], chip: 'Cortinas a la mitad' },
    { id: 'porton', name: 'Portón automático', icon: 'i-gate', desc: 'Se abre solo cuando llegas y se cierra detrás de ti.', retro: 'Casi siempre se conecta al motor que ya tienes.',
      level: 'esencial', at: [1020, 490], chip: 'Portón abriendo' },
    { id: 'camaras', name: 'Cámaras', icon: 'i-cam', desc: 'Tu casa en vivo desde donde estés, con avisos solo cuando importa.', retro: 'Puede requerir cableado puntual; lo revisamos en la visita.',
      opts: [['entrada', 'Entrada', 'esencial'], ['perimetro', 'Todo el perímetro', 'integral']], at: [1092, 468], chip: 'Cámaras vigilando' },
    { id: 'cerradura', name: 'Cerradura inteligente', icon: 'i-lock', desc: 'Llaves temporales para quien tú decidas y cierre automático en la noche.', retro: 'Reemplaza la chapa actual en una mañana.',
      level: 'esencial', at: [868, 528], chip: 'Puerta cerrada' },
    { id: 'clima', name: 'Clima', icon: 'i-temp', desc: 'La casa fresca antes de que llegues, sin desperdiciar energía.', retro: 'Se integra a los equipos que ya tienes, según el modelo.',
      opts: [['principales', 'Áreas principales', 'confort'], ['zonas', 'Por zonas', 'confort']], at: [614, 504], chip: 'Sala a 23°' },
    { id: 'sensores', name: 'Sensores', icon: 'i-sensor', desc: 'Puertas, ventanas, movimiento y fugas de agua: la casa se da cuenta sola.', retro: 'Inalámbricos, se instalan en minutos.',
      level: 'confort', at: [920, 482], chip: 'Sensores activos' },
    { id: 'solar', name: 'Energía solar', icon: 'i-sun', desc: 'La casa aprovecha las horas de sol para bajar el recibo de CFE.', retro: 'Funciona con los paneles que ya tienes o con unos nuevos.',
      opts: [['monitoreo', 'Ver mi energía', 'confort'], ['gestion', 'La casa la administra', 'integral']], at: [540, 258], chip: 'Energía del sol' },
    { id: 'audio', name: 'Audio', icon: 'i-speaker', desc: 'Música en los espacios que elijas, desde la app o la pared.', retro: 'Bocinas inalámbricas o empotradas, según el espacio.',
      level: 'integral', at: [598, 536], chip: 'Música en la sala' },
    { id: 'electro', name: 'Electrodomésticos', icon: 'i-fridge', desc: 'Lavadora y calentador trabajan cuando hay sol, no cuando cuesta más.', retro: 'Con equipos compatibles.',
      level: 'integral', at: [809, 512], chip: 'Lavadora con sol' }
  ];
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
      <button type="button" class="mod-main" role="switch" aria-checked="false" id="mod-${m.id}">
        <svg aria-hidden="true"><use href="#${m.icon}"/></svg>
        <span><span class="mod-name">${m.name}</span><span class="mod-desc">${m.desc}</span><span class="mod-retro">${m.retro}</span></span>
        <span class="mod-side"><span class="mod-lvl">Desde ${lvl}</span><span class="tg" aria-hidden="true"></span></span>
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
