/* Gohar Group of Companies — interactions & motion
   Core features (menu, dropdown, media, filters, gallery, forms) work without GSAP.
   Motion uses GSAP + ScrollTrigger + Lenis from CDN when available, and is skipped for prefers-reduced-motion. */
(() => {
  window.__goharBoot = true;
  const d = document, root = d.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const G = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const store = { get(k) { try { return sessionStorage.getItem(k); } catch { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch {} } };
  const WA = root.dataset.wa || '923373723420';
  const EMAIL = root.dataset.email || 'info@gohargoc.com';
  const ENDPOINT = (root.dataset.endpoint || '').trim();
  const params = new URLSearchParams(location.search);
  const anim = G && !reduce;
  if (!anim) root.classList.remove('js-ready'); // show everything statically
  if (G) gsap.registerPlugin(ScrollTrigger);
  const ease = 'expo.out';

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (anim && typeof window.Lenis !== 'undefined') {
    // the assistant panel scrolls natively (wheel and touch must not be captured by smooth scrolling)
    lenis = new Lenis({ duration: 1.1, smoothWheel: true, prevent: (node) => !!(node && node.closest && node.closest('.ga-root, [data-lenis-prevent]')) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.lenis = lenis;
  }
  const scrollToEl = (el) => { if (lenis) lenis.scrollTo(el, { offset: -90 }); else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); };
  const lock = (on) => { if (lenis) on ? lenis.stop() : lenis.start(); root.style.overflow = on ? 'hidden' : ''; };
  d.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const t = d.getElementById(id.slice(1)); if (!t) return;
    e.preventDefault(); scrollToEl(t); history.replaceState(null, '', id);
  });
  $$('[data-top]').forEach((b) => b.addEventListener('click', () => (lenis ? lenis.scrollTo(0) : scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }))));

  /* ---------- media: poster first, one video at a time, pause off-screen, fall back to the still ---------- */
  const players = [];
  const autoplayOK = !reduce && !saveData;
  let hoverActive = null;
  $$('[data-media]').forEach((m) => {
    const kind = m.dataset.media; if (kind === 'still' || m.dataset.mode === 'player') return;
    const v = $('video.mb__video', m); if (!v) return;
    const p = { m, v, ratio: 0, userPaused: !autoplayOK, failed: false, eager: v.hasAttribute('data-eager') };
    v.muted = true; v.playsInline = true;
    v.addEventListener('playing', () => m.classList.add('is-playing'));
    v.addEventListener('error', () => fail(p));
    players.push(p);
  });
  function fail(p) {
    p.failed = true; p.m.classList.add('mb--failed'); p.m.classList.remove('is-playing');
    try { p.v.pause(); p.v.removeAttribute('src'); p.v.load(); } catch {}
    const lab = $('[data-label]', p.m); if (lab) { lab.textContent = p.m.dataset.stillLabel || 'Image'; lab.removeAttribute('title'); }
    const hero = p.m.closest('[data-hero]'); if (hero) hero.classList.add('is-still');
    syncToggle(p);
  }
  const load = (p) => { if (!p.v.getAttribute('src') && p.v.dataset.src) { p.v.src = (innerWidth < 760 && p.v.dataset.srcMobile) || p.v.dataset.src; } };
  const play = (p) => { if (p.failed) return; load(p); const pr = p.v.play(); if (pr) pr.catch(() => {}); };
  // a player is "covered" when something outside its own section sits on top of it (e.g. stacked sticky panels)
  const covered = (p) => {
    const r = p.m.getBoundingClientRect();
    const x = Math.min(Math.max(r.left + r.width / 2, 1), innerWidth - 2), y = Math.min(Math.max((Math.max(r.top, 0) + Math.min(r.bottom, innerHeight)) / 2, 1), innerHeight - 2);
    const el = d.elementFromPoint(x, y); const box = p.m.closest('.panel, section, article, a, figure, .ft__hero') || p.m;
    return !!el && !box.contains(el) && !el.closest('.hd, .wa, .cursor, .float-img, .subnav, .filters, .ga-root, .ga-ui, .fnow, .totop');
  };
  const pick = () => {
    let best = null;
    // the hero plays as soon as any of it is on screen; other media need a third of their area visible
    players.forEach((p) => { if (!p.failed && !p.userPaused && p.ratio >= (p.eager ? 0.05 : 0.35) && p.ready && !covered(p) && (!best || p.ratio >= best.ratio)) best = p; });
    players.forEach((p) => { if (p === best && !hoverActive) play(p); else if (!p.v.paused) p.v.pause(); });
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((ents) => { ents.forEach((en) => { const p = players.find((x) => x.m === en.target); if (p) p.ratio = en.isIntersecting ? en.intersectionRatio : 0; }); pick(); }, { threshold: [0, 0.2, 0.35, 0.5, 0.75, 1] });
    players.forEach((p) => { if (!p.eager) p.ready = true; io.observe(p.m); });
  }
  let pickT; addEventListener('scroll', () => { clearTimeout(pickT); pickT = setTimeout(pick, 140); }, { passive: true });
  // hero: load its motion only after the page has loaded (poster paints first, navigation is never delayed)
  const heroP = players.find((p) => p.eager);
  if (heroP) {
    const go = () => { heroP.ready = true; pick(); };
    if (d.readyState === 'complete') setTimeout(go, 300); else { addEventListener('load', () => setTimeout(go, 300)); setTimeout(go, 2500); }
  }
  function syncToggle(p) {
    $$('[data-media-toggle]').forEach((b) => {
      const scope = b.closest('[data-hero]'); if (!scope || !scope.contains(p.m)) return;
      if (p.failed) { b.hidden = true; return; }
      b.setAttribute('aria-pressed', String(!!p.userPaused));
      b.setAttribute('aria-label', (p.userPaused ? 'Play' : 'Pause') + (p.m.dataset.media === 'film' ? ' video' : ' photographic preview'));
      const t = $('[data-ctrl-text]', b); if (t) t.textContent = p.userPaused ? 'Play' : 'Pause';
    });
  }
  $$('[data-media-toggle]').forEach((b) => {
    const scope = b.closest('[data-hero]'); const p = players.find((x) => scope && scope.contains(x.m));
    if (!p) { b.hidden = true; return; }
    syncToggle(p);
    b.addEventListener('click', () => { p.userPaused = !p.userPaused; if (p.userPaused) p.v.pause(); else { p.ready = true; p.ratio = Math.max(p.ratio, 0.5); } syncToggle(p); pick(); });
  });
  // hero caption follows the motion piece
  $$('[data-chapters]').forEach((m) => {
    const hero = m.closest('[data-hero]'); const v = $('video', m); if (!hero || !v) return;
    const ch = JSON.parse(m.dataset.chapters); const ticks = $$('.hero__ticks b', hero);
    const nm = $('[data-now-name]', hero), meta = $('[data-now-meta]', hero), idx = $('[data-now-idx]', hero), link = $('[data-now]', hero);
    let cur = 0;
    v.addEventListener('timeupdate', () => {
      const t = v.currentTime, dur = v.duration || 1;
      let i = 0; ch.forEach((c, k) => { if (t >= c.t) i = k; });
      ticks.forEach((b, k) => { const s = ch[k].t, e = k + 1 < ch.length ? ch[k + 1].t : dur; b.style.transform = `scaleX(${k < i ? 1 : k > i ? 0 : Math.min(1, (t - s) / (e - s))})`; });
      if (i !== cur && nm) {
        cur = i;
        const set = () => { nm.textContent = ch[i].name; meta.textContent = `${ch[i].loc} · ${ch[i].kind}`; idx.textContent = `${String(i + 1).padStart(2, '0')} / ${String(ch.length).padStart(2, '0')}`; link.href = ch[i].href; };
        if (anim) gsap.timeline().to(link, { opacity: 0, y: -6, duration: 0.3 }).add(set).fromTo(link, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5, ease });
        else set();
      }
    });
  });
  // project cards: preview their photographic motion on hover (desktop only)
  $$('.pc').forEach((card) => {
    const v = $('video[data-hover]', card); if (!v || !fine || !autoplayOK) return;
    const lab = $('[data-card-label]', card);
    v.muted = true;
    let failed = false;
    v.addEventListener('error', () => { failed = true; card.classList.remove('is-playing'); if (lab) lab.textContent = lab.dataset.still; });
    v.addEventListener('playing', () => { card.classList.add('is-playing'); if (lab && lab.dataset.motion) lab.textContent = lab.dataset.motion; });
    card.addEventListener('mouseenter', () => { if (failed) return; hoverActive = v; players.forEach((p) => p.v.pause()); if (!v.getAttribute('src')) v.src = v.dataset.src; const pr = v.play(); if (pr) pr.catch(() => {}); });
    card.addEventListener('mouseleave', () => { v.pause(); card.classList.remove('is-playing'); if (lab) lab.textContent = lab.dataset.still; hoverActive = null; pick(); });
  });
  // real films with controls: only one plays at a time
  $$('video[data-film]').forEach((v) => v.addEventListener('play', () => { $$('video').forEach((o) => { if (o !== v && !o.paused) o.pause(); }); players.forEach((p) => { p.userPaused = true; }); }));

  /* ---------- header ---------- */
  const hd = $('.hd');
  let lastY = 0;
  const onScroll = (y) => {
    if (!hd) return;
    hd.classList.toggle('is-solid', y > 40);
    if (!root.classList.contains('menu-open') && !d.querySelector('.nav__dd.is-open')) {
      const hide = y > lastY + 2 && y > 320; const show = y < lastY - 2 || y < 320;
      if (hide) hd.classList.add('is-hidden'); else if (show) hd.classList.remove('is-hidden');
    }
    root.classList.toggle('hd-shown', !hd.classList.contains('is-hidden'));
    lastY = y;
  };
  if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll)); else addEventListener('scroll', () => onScroll(scrollY), { passive: true });
  onScroll(scrollY);

  /* ---------- projects dropdown ---------- */
  $$('[data-dd]').forEach((dd) => {
    const btn = $('.nav__ddbtn', dd), img = $('.dd__img img', dd), cap = $('.dd__cap', dd);
    let tm;
    const set = (open) => { clearTimeout(tm); dd.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', String(open)); if (open) hd.classList.remove('is-hidden'); };
    btn.addEventListener('click', () => set(!dd.classList.contains('is-open')));
    if (fine) { dd.addEventListener('mouseenter', () => set(true)); dd.addEventListener('mouseleave', () => { tm = setTimeout(() => set(false), 180); }); }
    dd.addEventListener('focusout', (e) => { if (!dd.contains(e.relatedTarget)) set(false); });
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape' && dd.classList.contains('is-open')) { set(false); btn.focus(); } });
    d.addEventListener('click', (e) => { if (!dd.contains(e.target)) set(false); });
    $$('a[data-preview]', dd).forEach((a) => {
      const show = () => { if (!img || img.getAttribute('src') === a.dataset.preview) return; img.src = a.dataset.preview; cap.textContent = `${a.querySelector('span').textContent} · ${a.dataset.loc}`; if (anim) gsap.fromTo(img, { opacity: 0.3, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.7, ease }); };
      a.addEventListener('mouseenter', show); a.addEventListener('focus', show);
    });
  });

  /* ---------- mobile menu ---------- */
  const mm = $('#mm'), mbtn = $('.menu-btn');
  if (mm && mbtn) {
    const items = $$('.mm__item, .mm__cta, .mm__foot', mm);
    const set = (open) => {
      root.classList.toggle('menu-open', open);
      mbtn.setAttribute('aria-expanded', String(open)); mbtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      $('.menu-btn__t', mbtn).textContent = open ? 'Close' : 'Menu';
      if (open) {
        mm.hidden = false; lock(true); hd.classList.remove('is-hidden');
        if (anim) { gsap.fromTo(mm, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'expo.inOut' }); gsap.fromTo(items, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.05, ease, delay: 0.3 }); }
        setTimeout(() => { const f = $('.mm__a', mm); f && f.focus({ preventScroll: true }); }, anim ? 450 : 0);
      } else {
        lock(false);
        if (anim) gsap.to(mm, { clipPath: 'inset(0 0 100% 0)', duration: 0.6, ease: 'expo.inOut', onComplete: () => { if (!root.classList.contains('menu-open')) mm.hidden = true; } });
        else mm.hidden = true;
      }
    };
    mbtn.addEventListener('click', () => set(!root.classList.contains('menu-open')));
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.classList.contains('menu-open')) { set(false); mbtn.focus(); } });
    $$('.mm__more', mm).forEach((b) => b.addEventListener('click', () => { const sub = d.getElementById(b.getAttribute('aria-controls')); const open = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', String(open)); sub.hidden = !open; if (open && anim) gsap.fromTo(sub.children, { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.03, ease }); }));
    addEventListener('resize', () => { if (innerWidth > 1024 && root.classList.contains('menu-open')) set(false); });
  }

  /* ---------- rotator: one active item, opens on hover / click / focus, auto-advances while on screen ---------- */
  const rotator = (root, items, { interval = 6500, bar = null, counter = null, hover = true, onChange = null } = {}) => {
    if (!root || !items.length) return;
    let cur = Math.max(0, items.findIndex((x) => x.classList.contains('is-on'))), timer = null, inView = false, held = false;
    const restartBar = () => { if (!bar || reduce) return; bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = `rotbar ${interval}ms linear forwards`; bar.style.animationPlayState = held || !inView ? 'paused' : 'running'; };
    const set = (i, user) => {
      cur = (i + items.length) % items.length;
      items.forEach((x, k) => { x.classList.toggle('is-on', k === cur); x.setAttribute('aria-expanded', String(k === cur)); });
      if (counter) counter.textContent = String(cur + 1).padStart(2, '0');
      if (onChange) onChange(cur, items[cur]);
      restartBar(); schedule(); if (user) held = held || false;
    };
    const schedule = () => { clearTimeout(timer); if (reduce || held || !inView) return; timer = setTimeout(() => set(cur + 1), interval); };
    items.forEach((x, k) => {
      if (hover && fine) x.addEventListener('mouseenter', () => { if (k !== cur) set(k, true); });
      x.addEventListener('click', (e) => { if (k !== cur) { if (e.target.closest('a')) e.preventDefault(); set(k, true); } });
      x.addEventListener('focus', () => { if (k !== cur) set(k, true); });
      x.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); items[(k + 1) % items.length].focus(); } if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); items[(k - 1 + items.length) % items.length].focus(); } });
    });
    root.addEventListener('mouseenter', () => { held = true; clearTimeout(timer); if (bar) bar.style.animationPlayState = 'paused'; });
    root.addEventListener('mouseleave', () => { held = false; if (bar) bar.style.animationPlayState = inView ? 'running' : 'paused'; set(cur); });
    if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => { inView = en.isIntersecting; if (bar) bar.style.animationPlayState = inView && !held ? 'running' : 'paused'; schedule(); }, { threshold: 0.35 }).observe(root);
    set(cur);
  };
  window.__rotator = rotator;
  // home: signature developments deck
  $$('[data-sig]').forEach((deck) => rotator(deck, $$('[data-sig-p]', deck), { interval: 6500, bar: $('[data-sig-bar]'), counter: $('[data-sig-cur]') }));
  // about: purpose / promise / approach tabs, and what-we-build tabs (each tab swaps its picture and text)
  $$('[data-abtabs]').forEach((box) => { const panes = $$('[data-abpane]', box); rotator(box, $$('[data-abtab]', box), { interval: 7000, hover: false, onChange: (i) => panes.forEach((p, k) => p.classList.toggle('is-on', k === i)) }); });
  $$('[data-abbuild]').forEach((box) => { const shots = $$('[data-abshot]', box); rotator(box, $$('[data-abcat]', box), { interval: 7000, onChange: (i) => shots.forEach((p, k) => p.classList.toggle('is-on', k === i)) }); });

  /* ---------- home: development index — hovering a name shows its picture ---------- */
  $$('[data-xidx]').forEach((box) => {
    const rows = $$('[data-x]', box), figs = $$('[data-xv]', box), count = $('[data-xcount]', box);
    let cur = 0;
    const show = (i) => {
      if (i === cur) return; cur = i;
      rows.forEach((r, k) => r.classList.toggle('is-on', k === i));
      figs.forEach((f, k) => { f.classList.toggle('is-on', k === i); if (k === i) { f.style.zIndex = 2; const im = $('img', f); if (im && im.loading === 'lazy') im.loading = 'eager'; } else f.style.zIndex = 1; });
      if (count) count.textContent = String(i + 1).padStart(2, '0');
    };
    rows.forEach((r) => { r.addEventListener('mouseenter', () => show(+r.dataset.x)); r.addEventListener('focus', () => show(+r.dataset.x)); });
  });

  /* ---------- cursor label + floating list image (desktop) ---------- */
  if (fine && anim) {
    const c = d.createElement('div'); c.className = 'cursor'; c.innerHTML = '<div class="cursor__l"></div>'; d.body.appendChild(c);
    const l = $('.cursor__l', c);
    const cx = gsap.quickTo(c, 'x', { duration: 0.35, ease: 'power3' }), cy = gsap.quickTo(c, 'y', { duration: 0.35, ease: 'power3' });
    addEventListener('mousemove', (e) => { cx(e.clientX); cy(e.clientY); }, { passive: true });
    d.addEventListener('mouseover', (e) => { const t = e.target.closest('[data-cursor]'); c.classList.toggle('is-on', !!t); if (t) l.textContent = t.dataset.cursor; });
    $$('[data-float-list]').forEach((list) => {
      const box = d.createElement('div'); box.className = 'float-img'; const img = d.createElement('img'); img.alt = ''; box.appendChild(img); d.body.appendChild(box);
      const x = gsap.quickTo(box, 'x', { duration: 0.6, ease: 'power3' }), y = gsap.quickTo(box, 'y', { duration: 0.6, ease: 'power3' });
      list.addEventListener('mousemove', (e) => { x(e.clientX); y(e.clientY); });
      $$('[data-img]', list).forEach((row) => row.addEventListener('mouseenter', () => { img.src = row.dataset.img; gsap.to(box, { opacity: 1, scale: 1, duration: 0.6, ease }); gsap.fromTo(img, { scale: 1.25 }, { scale: 1, duration: 1, ease }); }));
      list.addEventListener('mouseleave', () => gsap.to(box, { opacity: 0, scale: 0.7, duration: 0.5, ease }));
    });
  }

  /* ---------- projects: filter + search ---------- */
  const pf = $('[data-pf]') || $('.pf');
  if (pf) {
    const newGrid = pf.hasAttribute('data-pf');
    const cards = $$(newGrid ? '[data-card]' : '.pc', pf), tabs = $$('.ftab'), q = $('#search'), empty = $('.empty'), out = $('[data-count-out]'), locOut = $('[data-loc-out]'), clears = $$('[data-clear]');
    const SH = ['feature', 'tall', 'wide', 'third', 'third', 'third', 'half', 'half', 'feature-r'];
    const all = ['pc--feature', 'pc--feature-r', 'pc--tall', 'pc--wide', 'pc--third', 'pc--half'];
    let cat = params.get('category') || 'all', loc = params.get('location') || '';
    if (cat !== 'all' && !tabs.some((t) => t.dataset.cat === cat)) cat = 'all';
    const apply = (animate = true) => {
      const term = (q?.value || '').trim().toLowerCase();
      const vis = cards.filter((c) => (cat === 'all' || c.dataset.cat === cat) && (!term || c.dataset.search.includes(term)) && (!loc || c.dataset.search.includes(loc.toLowerCase())));
      cards.forEach((c) => { c.hidden = !vis.includes(c); });
      const n = vis.length;
      const seq = n === 1 ? ['feature'] : n === 2 ? ['half', 'half'] : n === 3 ? ['feature', 'half', 'half'] : n === 4 ? ['feature', 'third', 'third', 'third'] : SH;
      if (!newGrid) vis.forEach((c, i) => { c.classList.remove(...all); c.classList.add('pc--' + seq[i % seq.length]); });
      tabs.forEach((t) => { const on = t.dataset.cat === cat; t.classList.toggle('is-on', on); t.setAttribute('aria-pressed', String(on)); });
      if (out) out.textContent = n;
      if (locOut) locOut.textContent = loc ? ` in ${loc}` : '';
      clears.forEach((b) => { if (b.closest('.pf-count')) b.hidden = cat === 'all' && !term && !loc; });
      if (empty) empty.hidden = n > 0;
      const u = new URL(location.href); cat === 'all' ? u.searchParams.delete('category') : u.searchParams.set('category', cat); loc ? u.searchParams.set('location', loc) : u.searchParams.delete('location'); history.replaceState(null, '', u);
      if (anim && animate) gsap.fromTo(vis, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.05, ease, overwrite: true });
      if (G) ScrollTrigger.refresh();
    };
    tabs.forEach((t) => t.addEventListener('click', () => { cat = t.dataset.cat; loc = ''; apply(); }));
    q && q.addEventListener('input', () => apply(false));
    clears.forEach((b) => b.addEventListener('click', () => { cat = 'all'; loc = ''; if (q) q.value = ''; apply(); }));
    if (cat !== 'all' || loc) apply(false);
    window.__goharFilter = { set: (c, l = '', term = '') => { cat = c; loc = l; if (q) q.value = term; apply(false); } };
  }

  /* ---------- drag to scroll (gallery, reel) ---------- */
  $$('[data-drag]').forEach((g) => {
    let down = false, sx = 0, sl = 0, moved = false;
    g.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' || e.button !== 0) return; down = true; moved = false; sx = e.clientX; sl = g.scrollLeft; });
    addEventListener('pointerup', () => { down = false; g.classList.remove('is-drag'); });
    g.addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 6) { moved = true; g.classList.add('is-drag'); } if (moved) g.scrollLeft = sl - dx; });
    g.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    g.addEventListener('dragstart', (e) => e.preventDefault());
  });

  /* ---------- lightbox ---------- */
  const lb = $('.lb');
  if (lb) {
    const img = $('img', lb), cap = $('.lb__cap', lb), count = $('.lb__count', lb);
    let set = [], i = 0, opener = null;
    const show = () => { const b = set[i]; img.src = b.dataset.full; img.alt = b.dataset.alt || ''; cap.innerHTML = ''; const k = d.createElement('b'); k.textContent = b.dataset.kind || ''; cap.append(k, d.createTextNode(b.dataset.alt || '')); count.textContent = `${i + 1} / ${set.length}`; $('.lb__prev', lb).hidden = $('.lb__next', lb).hidden = set.length < 2; if (anim) gsap.fromTo(img, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.6, ease }); };
    const open = (b) => { opener = b; set = $$(`[data-full][data-set="${b.dataset.set}"]`); i = set.indexOf(b); show(); lb.hidden = false; root.classList.add('lb-open'); lock(true); $('.lb__close', lb).focus(); };
    const close = () => { lb.hidden = true; root.classList.remove('lb-open'); lock(false); img.removeAttribute('src'); opener && opener.focus({ preventScroll: true }); };
    const step = (n) => { i = (i + n + set.length) % set.length; show(); };
    $$('[data-full]').forEach((b) => b.addEventListener('click', () => open(b)));
    $('.lb__close', lb).addEventListener('click', close);
    $('.lb__prev', lb).addEventListener('click', () => step(-1));
    $('.lb__next', lb).addEventListener('click', () => step(1));
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    let tx = null;
    lb.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50 && set.length > 1) step(dx < 0 ? 1 : -1); tx = null; });
    d.addEventListener('keydown', (e) => {
      if (lb.hidden) return;
      if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight') step(1); else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'Tab') { const f = $$('button:not([hidden])', lb); const first = f[0], last = f[f.length - 1]; if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); } }
    });
  }

  /* ---------- project sub-navigation: active section ---------- */
  const subLinks = $$('.subnav__links a');
  if (subLinks.length && 'IntersectionObserver' in window) {
    const map = new Map(subLinks.map((a) => [d.getElementById(a.getAttribute('href').slice(1)), a]).filter(([t]) => t));
    const so = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { subLinks.forEach((x) => x.classList.remove('is-on')); const a = map.get(en.target); a.classList.add('is-on'); a.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } }), { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, t) => so.observe(t));
  }

  /* ---------- forms: validate, then send to the endpoint (if configured) or hand off to WhatsApp / email ---------- */
  const status = (form, kind, html) => { const s = $('.form__status', form); if (!s) return; s.className = 'form__status' + (kind ? ' is-' + kind : ''); s.innerHTML = html || ''; if (kind === 'done' || kind === 'error') s.focus({ preventScroll: true }); };
  const escH = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // Remember the project a visitor picked, because some servers drop "?project=" when they tidy the address.
  d.addEventListener('click', (e) => { const a = e.target.closest('a[href*="project="]'); if (a) { try { store.set('gohar-project', new URL(a.href).searchParams.get('project') || ''); } catch {} } }, true);
  const savedProject = store.get('gohar-project'); store.set('gohar-project', '');
  $$('form[data-form]').forEach((form) => {
    const pre = params.get('project') || savedProject;
    if (pre && form.project && [...form.project.options].some((o) => o.value === pre)) form.project.value = pre;
    if (form.date) { const t = new Date(); t.setMinutes(t.getMinutes() - t.getTimezoneOffset()); form.date.min = t.toISOString().slice(0, 10); }
    const kind = form.dataset.form;
    const label = (el) => (el.closest('.field')?.querySelector('label')?.textContent || el.name).replace('*', '').replace('(optional)', '').trim();
    const data = () => {
      const o = {}; $$('input, select, textarea', form).forEach((el) => {
        if (!el.name || el.name === 'website' || el.type === 'checkbox') return;
        const v = el.tagName === 'SELECT' ? (el.value ? el.options[el.selectedIndex].text : '') : el.value.trim();
        if (v) o[el.name] = { label: label(el), value: v };
      });
      return o;
    };
    const text = () => { const o = data(); return [`New ${kind} from the Gohar website`, '', ...Object.values(o).map((f) => `${f.label}: ${f.value}`), '', `Page: ${location.href.split('?')[0]}`].join('\n'); };
    const valid = () => {
      let good = true;
      $$('input, select, textarea', form).forEach((el) => {
        if (!el.name || el.name === 'website') return;
        const f = el.closest('.field'); if (!f) return;
        const v = (el.value || '').trim();
        let bad = el.required && (el.type === 'checkbox' ? !el.checked : !v);
        if (!bad && v && el.type === 'email') bad = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
        if (!bad && v && el.type === 'tel') bad = v.replace(/\D/g, '').length < 7;
        if (!bad && v && el.type === 'url') bad = !/^(https?:\/\/)?[^\s.]+\.[^\s]{2,}/i.test(v);
        if (!bad && v && el.type === 'date') { const dt = new Date(v + 'T12:00:00'); bad = (el.min && v < el.min) || dt.getDay() === 0; }
        f.classList.toggle('invalid', !!bad);
        el.setAttribute('aria-invalid', String(!!bad));
        const err = $('.err', f); if (err) { err.id = err.id || `${el.id || el.name}-err`; el.setAttribute('aria-describedby', err.id); }
        if (bad) good = false;
      });
      if (!good) { const first = $('.invalid input, .invalid select, .invalid textarea', form); first && first.focus(); status(form, 'error', '<strong>Please check the highlighted fields.</strong>'); }
      return good;
    };
    const viaWhatsApp = () => {
      const url = `https://wa.me/${WA}?text=${encodeURIComponent(text())}`;
      status(form, 'loading', 'Opening WhatsApp with your message…');
      const w = window.open(url, '_blank');
      if (w) { try { w.opener = null; } catch {} status(form, 'done', `<strong>Your message is ready in WhatsApp.</strong>It has not been sent yet: press <b>Send</b> in WhatsApp to deliver it to our team${kind === 'site visit request' ? '. Your visit is confirmed only when our team calls you.' : ', and we’ll reply during office hours.'}${kind === 'job application' ? ' Please attach your CV in the chat.' : ''} WhatsApp didn’t open? <a href="${escH(url)}" target="_blank" rel="noopener">Open it here</a> or call <a href="tel:+9221111000061">+92 21 111 000 061</a>.`); }
      else status(form, 'error', `<strong>Your browser blocked the new tab.</strong><a href="${escH(url)}" target="_blank" rel="noopener">Open WhatsApp with your message</a>, or email <a href="mailto:${EMAIL}">${EMAIL}</a>.`);
    };
    const viaEmail = () => {
      const subject = `Website ${kind}${form.project && form.project.value ? ' – ' + form.project.options[form.project.selectedIndex].text : ''}`;
      const url = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text())}`;
      status(form, 'done', `<strong>Your email app should now be open.</strong>The message is written out but not sent yet: press <b>Send</b> in your email app${kind === 'job application' ? ' after attaching your CV' : ''}. If nothing opened, email us at <a href="mailto:${EMAIL}">${EMAIL}</a> or call <a href="tel:+9221111000061">+92 21 111 000 061</a>.`);
      location.href = url;
    };
    const viaEndpoint = async () => {
      const btn = $('button[type="submit"]', form); btn.disabled = true;
      status(form, 'loading', 'Sending your details…');
      const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 15000);
      try {
        const o = data(); const payload = { form: kind, page: location.href, consent: true, fields: Object.fromEntries(Object.entries(o).map(([k, f]) => [k, f.value])) };
        const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: ctl.signal });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        status(form, 'done', `<strong>Thank you, your ${kind === 'site visit request' ? 'request' : 'message'} has reached our team.</strong>${kind === 'site visit request' ? 'We will call you to confirm a time; the visit is confirmed only after that call.' : 'We reply during office hours (Monday to Saturday, 11:00 AM – 8:00 PM).'}`);
      } catch (err) {
        const url = `https://wa.me/${WA}?text=${encodeURIComponent(text())}`;
        status(form, 'error', `<strong>We couldn’t send that just now.</strong>Nothing was lost: <a href="${escH(url)}" target="_blank" rel="noopener">send it via WhatsApp instead</a>, email <a href="mailto:${EMAIL}">${EMAIL}</a> or call <a href="tel:+9221111000061">+92 21 111 000 061</a>.`);
      } finally { clearTimeout(to); btn.disabled = false; }
    };
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (form.website && form.website.value) return; // spam trap
      if (!valid()) return;
      if (ENDPOINT) viaEndpoint(); else if (form.dataset.prefer === 'mail') viaEmail(); else viaWhatsApp();
    });
    const mail = $('[data-mail]', form); mail && mail.addEventListener('click', () => { if (valid()) viaEmail(); });
    const wa = $('[data-wa]', form); wa && wa.addEventListener('click', () => { if (valid()) viaWhatsApp(); });
    form.addEventListener('input', (e) => { const f = e.target.closest('.field'); if (f && f.classList.contains('invalid')) { f.classList.remove('invalid'); e.target.setAttribute('aria-invalid', 'false'); } });
    form.addEventListener('change', (e) => { const f = e.target.closest('.field'); if (f) f.classList.remove('invalid'); });
  });
  // site visit: show the chosen project
  const vp = $('#v-project');
  if (vp) {
    const upd = () => { $$('[data-pick]').forEach((el) => { el.hidden = el.dataset.pick !== vp.value; }); };
    vp.addEventListener('change', () => { upd(); const el = $(`[data-pick="${vp.value}"]`); if (el && anim) gsap.fromTo(el, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease }); });
    upd();
    $$('[data-visit]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); vp.value = a.dataset.visit; upd(); history.replaceState(null, '', `?project=${a.dataset.visit}`); scrollToEl($('.vhero')); setTimeout(() => $('#v-date')?.focus({ preventScroll: true }), 600); }));
  }
  // site visit planner: project tiles, day chips, time chips, live summary, background follows the project
  const svForm = $('.sv__form');
  if (svForm && vp) {
    const tiles = $$('[data-visit-pick]'), bg1 = $('[data-sv-bg]'), bg2 = $('[data-sv-bg2]');
    let front = bg1;
    const swapBg = (src) => {
      if (!src || !bg1 || !bg2) return; const back = front === bg1 ? bg2 : bg1;
      if (front.getAttribute('src') === src) return;
      back.onload = () => { back.classList.add('is-on'); front.classList.remove('is-on'); front = back; };
      back.src = src;
    };
    if (bg1) bg1.classList.add('is-on');
    const syncTiles = () => {
      tiles.forEach((t) => { const on = t.dataset.visitPick === vp.value; t.classList.toggle('is-on', on); t.setAttribute('aria-pressed', String(on)); if (on) swapBg(t.dataset.bg); });
    };
    tiles.forEach((t) => t.addEventListener('click', () => {
      vp.value = t.dataset.visitPick; vp.dispatchEvent(new Event('change', { bubbles: true }));
      if (anim) gsap.fromTo(t, { scale: 0.96 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, .5)' });
    }));
    vp.addEventListener('change', syncTiles); syncTiles();

    // next 10 visiting days (Monday to Saturday)
    const dateIn = $('#v-date'), days = $('[data-days]');
    const fmt = (dt) => { const z = new Date(dt); z.setMinutes(z.getMinutes() - z.getTimezoneOffset()); return z.toISOString().slice(0, 10); };
    if (days && dateIn) {
      const list = []; const t = new Date(); t.setHours(12, 0, 0, 0);
      for (let k = 0; list.length < 10 && k < 20; k++) { const dt = new Date(t); dt.setDate(t.getDate() + k); if (dt.getDay() !== 0) list.push(dt); }
      days.innerHTML = list.map((dt, k) => `<button type="button" class="dchip" data-date="${fmt(dt)}" aria-pressed="false"><small>${k === 0 ? 'Today' : k === 1 && dt.getDate() === new Date(t.getTime() + 864e5).getDate() ? 'Tomorrow' : dt.toLocaleDateString('en-GB', { weekday: 'short' })}</small><b>${dt.getDate()}</b><span>${dt.toLocaleDateString('en-GB', { month: 'short' })}</span></button>`).join('');
      const syncDays = () => $$('.dchip', days).forEach((c) => { const on = c.dataset.date === dateIn.value; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', String(on)); });
      days.addEventListener('click', (e) => { const c = e.target.closest('.dchip'); if (!c) return; dateIn.value = c.dataset.date; dateIn.dispatchEvent(new Event('change', { bubbles: true })); });
      dateIn.addEventListener('change', syncDays);
      if (anim) gsap.from($$('.dchip', days), { y: 20, opacity: 0, duration: 0.8, stagger: 0.04, ease, scrollTrigger: { trigger: days, start: 'top 90%', once: true } });
    }
    // time window chips drive the (visually hidden) select
    const timeSel = $('#v-time');
    $$('.tchip').forEach((c) => c.addEventListener('click', () => { timeSel.value = c.dataset.time; timeSel.dispatchEvent(new Event('change', { bubbles: true })); }));
    const syncTime = () => $$('.tchip').forEach((c) => { const on = c.dataset.time === timeSel.value; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', String(on)); });
    timeSel.addEventListener('change', syncTime);
    // live summary
    const sum = (k, v) => { const el = $(`[data-sum="${k}"]`); if (!el) return; el.textContent = v; el.classList.toggle('is-set', v !== 'Not chosen yet'); if (anim) gsap.fromTo(el, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease }); };
    svForm.addEventListener('change', (e) => {
      if (e.target === dateIn) sum('date', dateIn.value ? new Date(dateIn.value + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Not chosen yet');
      if (e.target === timeSel) sum('time', timeSel.value || 'Not chosen yet');
      if (e.target.name === 'people') sum('people', e.target.value);
    });
  }

  /* ---------- instalment calculator: Gohar plan (no markup) or bank financing (reducing balance) ---------- */
  const calc = $('[data-calc]');
  if (calc) {
    const fmt = (n) => Math.round(n).toLocaleString('en-US');
    const rs = (n) => 'Rs. ' + fmt(n);
    // Pakistani short form: 1.19 Crore, 2.92 Lac
    const pk = (n, short) => { n = Math.round(n); if (n >= 1e7) return (n / 1e7).toFixed(2).replace(/\.00$/, '') + (short ? ' Cr' : ' Crore'); if (n >= 1e5) return (n / 1e5).toFixed(2).replace(/\.00$/, '') + ' Lac'; if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + ' Thousand'; return fmt(n); };
    const q = (s) => $(s, calc), qa = (s) => $$(s, calc);
    const priceIn = q('#c-price'), downIn = q('#c-down'), rateIn = q('#c-rate'), projIn = q('#c-project');
    const DEF = { plan: 'gohar', years: { gohar: 3, bank: 10 }, price: 15000000, down: 30, rate: 18 };
    const st = { plan: DEF.plan, years: { ...DEF.years }, view: 'month', page: 0 };
    const pre = params.get('project') || store.get('gohar-project'); if (pre && [...projIn.options].some((o) => o.value === pre)) projIn.value = pre;
    const parsePrice = () => +String(priceIn.value).replace(/[^\d]/g, '') || 0;
    let last = null, shownEmi = 0;

    const compute = () => {
      const price = parsePrice(), d = +downIn.value / 100, years = st.years[st.plan], n = years * 12;
      const down = Math.round(price * d), fin = price - down;
      const rate = st.plan === 'bank' ? +rateIn.value : 0, i = rate / 1200;
      const emi = n ? (i ? (fin * i) / (1 - Math.pow(1 + i, -n)) : fin / n) : 0;
      const emiR = Math.round(emi);
      const rows = []; let bal = fin;
      for (let k = 1; k <= n; k++) { const int = Math.round(bal * i); let prin = emiR - int; if (k === n) prin = bal; bal -= prin; rows.push({ k, emi: prin + int, prin, int, bal: Math.round(bal) }); } // final instalment absorbs rounding
      const totalInt = rows.reduce((a, r) => a + r.int, 0), paid = rows.reduce((a, r) => a + r.emi, 0);
      return { price, d, down, fin, rate, years, n, emi: emiR, rows, totalInt, total: down + paid };
    };

    const countTo = (el, to) => {
      if (!anim) { el.textContent = fmt(to); shownEmi = to; return; }
      const o = { v: shownEmi }; gsap.to(o, { v: to, duration: 0.9, ease: 'power3.out', overwrite: true, onUpdate: () => { el.textContent = fmt(o.v); } }); shownEmi = to;
    };

    // donut: three arcs on one circle
    const C2 = 2 * Math.PI * 48;
    const drawDonut = (c) => {
      const tot = Math.max(1, c.total), parts = { down: c.down / tot, fin: c.fin / tot, int: c.totalInt / tot }; let off = 0;
      ['down', 'fin', 'int'].forEach((k) => { const el = q(`[data-seg="${k}"]`); const len = parts[k] * C2; el.style.strokeDasharray = `${Math.max(0, len - (len > 2 ? 2 : 0))} ${C2}`; el.style.strokeDashoffset = String(-off); off += len; });
    };

    // chart + hover tooltip
    let chartPts = [];
    const drawChart = (c, animate) => {
      const svg = q('[data-chart]'); const W = 800, H = 250, max = Math.max(1, c.fin);
      chartPts = [c.fin, ...c.rows.map((r) => Math.max(0, r.bal))];
      const xy = chartPts.map((v, k) => [(k / Math.max(1, chartPts.length - 1)) * W, 10 + (1 - v / max) * (H - 10)]);
      const line = 'M' + xy.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L');
      const ln = $('.cchart__line', svg); ln.setAttribute('d', line);
      $('.cchart__area', svg).setAttribute('d', `${line}L${W} ${H + 10}L0 ${H + 10}Z`);
      if (anim && animate) { const L = ln.getTotalLength(); gsap.fromTo(ln, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }); gsap.fromTo($('.cchart__area', svg), { opacity: 0 }, { opacity: 1, duration: 1.2 }); }
      else { ln.style.strokeDasharray = 'none'; ln.style.strokeDashoffset = '0'; }
      const step = c.years > 10 ? 5 : c.years > 5 ? 2 : 1;
      q('[data-chart-x]').innerHTML = ['Start', ...Array.from({ length: Math.floor(c.years / step) }, (_, k) => `Year ${(k + 1) * step}`)].map((t) => `<span>${t}</span>`).join('');
      q('[data-ch-start]').textContent = rs(c.fin);
      q('[data-ch-end]').textContent = `${c.n} months`;
    };
    const box = q('[data-chartbox]'), cur = q('[data-ch-cursor]'), tip = q('[data-ch-tip]');
    const hover = (clientX) => {
      if (!last || !chartPts.length) return; const r = box.getBoundingClientRect(); const x = Math.min(Math.max(clientX - r.left, 0), r.width);
      const k = Math.round((x / r.width) * (chartPts.length - 1)); const v = chartPts[k];
      const px = (k / (chartPts.length - 1)) * 100, py = (10 + (1 - v / Math.max(1, last.fin)) * 240) / 260 * 100;
      cur.hidden = false; cur.style.left = px + '%'; $('.cchart__dot', cur).style.top = py + '%';
      const row = last.rows[k - 1];
      tip.innerHTML = k === 0 ? `<b>Start</b><span>Balance ${rs(last.fin)}</span>` : `<b>Month ${k} · Year ${Math.ceil(k / 12)}</b><span>Instalment ${rs(row.emi)}</span><span>Balance ${rs(row.bal)}</span>`;
      tip.classList.toggle('is-left', px > 70);
    };
    box.addEventListener('pointermove', (e) => hover(e.clientX));
    box.addEventListener('pointerdown', (e) => hover(e.clientX));
    box.addEventListener('pointerleave', () => { cur.hidden = true; });

    // schedule table with a year pager (no inner scrolling)
    const renderTable = (c, animate = true) => {
      const tb = q('[data-rows]'), tf = q('[data-foot]'), pager = q('[data-pager]');
      const pages = c.years; st.page = Math.min(st.page, pages - 1);
      const sum = (rows, key) => rows.reduce((a, r) => a + r[key], 0);
      let rows, html = '';
      if (st.view === 'month') {
        rows = c.rows.slice(st.page * 12, st.page * 12 + 12);
        html = rows.map((r, k) => `<tr style="--i:${k}"><th scope="row"><span class="ctable__m">${r.k}</span> Month</th><td>${fmt(r.emi)}</td><td>${fmt(r.prin)}</td><td>${fmt(r.int)}</td><td>${fmt(r.bal)}</td></tr>`).join('');
        tf.innerHTML = `<tr class="ctable__sub"><th scope="row">Year ${st.page + 1} total</th><td>${fmt(sum(rows, 'emi'))}</td><td>${fmt(sum(rows, 'prin'))}</td><td>${fmt(sum(rows, 'int'))}</td><td>${fmt(rows[rows.length - 1].bal)}</td></tr>` +
          `<tr class="ctable__grand"><th scope="row">All ${c.n} instalments</th><td>${fmt(sum(c.rows, 'emi'))}</td><td>${fmt(sum(c.rows, 'prin'))}</td><td>${fmt(sum(c.rows, 'int'))}</td><td>0</td></tr>`;
        pager.hidden = pages < 2;
      } else {
        for (let y = 0; y < c.years; y++) { const ys = c.rows.slice(y * 12, y * 12 + 12); html += `<tr style="--i:${y}"><th scope="row">Year ${y + 1}</th><td>${fmt(sum(ys, 'emi'))}</td><td>${fmt(sum(ys, 'prin'))}</td><td>${fmt(sum(ys, 'int'))}</td><td>${fmt(ys[ys.length - 1].bal)}</td></tr>`; }
        tf.innerHTML = `<tr class="ctable__grand"><th scope="row">All ${c.n} instalments</th><td>${fmt(sum(c.rows, 'emi'))}</td><td>${fmt(sum(c.rows, 'prin'))}</td><td>${fmt(sum(c.rows, 'int'))}</td><td>0</td></tr>`;
        pager.hidden = true;
      }
      tb.innerHTML = html;
      // year buttons
      const yb = q('[data-pager-years]');
      yb.innerHTML = Array.from({ length: pages }, (_, y) => `<button type="button" class="${y === st.page ? 'is-on' : ''}" data-yr="${y}">Year ${y + 1}<small>Months ${y * 12 + 1}–${y * 12 + 12}</small></button>`).join('');
      const on = $('.is-on', yb); if (on) yb.scrollTo({ left: on.offsetLeft - yb.clientWidth / 2 + on.clientWidth / 2, behavior: animate ? 'smooth' : 'auto' });
      $$('[data-page]', pager).forEach((b) => { b.disabled = (b.dataset.page === '-1' && st.page === 0) || (b.dataset.page === '1' && st.page >= pages - 1); });
      if (animate) { tb.classList.remove('is-in'); void tb.offsetWidth; tb.classList.add('is-in'); }
    };
    q('[data-pager]').addEventListener('click', (e) => {
      const y = e.target.closest('[data-yr]'), p = e.target.closest('[data-page]');
      if (y) st.page = +y.dataset.yr; else if (p) st.page = Math.max(0, Math.min(last.years - 1, st.page + +p.dataset.page)); else return;
      renderTable(last);
    });

    const update = ({ chart = true, table = true } = {}) => {
      const c = compute(); last = c; const bank = st.plan === 'bank';
      const rateTxt = (+rateIn.value).toFixed(2).replace(/\.?0+$/, '') + '%';
      q('[data-price-words]').textContent = c.price ? pk(c.price) : '';
      q('[data-out-down]').textContent = Math.round(c.d * 100) + '%';
      q('[data-out-rate]').textContent = rateTxt;
      q('[data-out-downamt]').textContent = `${rs(c.down)} · ${pk(c.down)}`;
      q('[data-out-plan]').textContent = bank ? `Bank Home Financing · ${rateTxt} markup` : 'Gohar Instalment Plan · no markup';
      countTo(q('[data-out-emi]'), c.emi);
      q('[data-out-sub]').textContent = `for ${c.n} months`;
      q('[data-out-emiwords]').textContent = pk(c.emi);
      q('[data-out-totalwords]').textContent = pk(c.total, true);
      q('[data-key-down]').textContent = rs(c.down);
      q('[data-key-finlbl]').textContent = bank ? 'Bank principal' : 'Instalments';
      q('[data-key-fin]').textContent = rs(c.fin);
      q('[data-key-intv]').textContent = rs(c.totalInt);
      q('[data-key-int]').hidden = !bank; q('[data-row-int]').hidden = !bank;
      q('[data-out-price]').textContent = rs(c.price);
      q('[data-out-downsum]').textContent = `${rs(c.down)} (${Math.round(c.d * 100)}%)`;
      q('[data-lbl-fin]').textContent = bank ? 'Bank financing' : 'Balance in instalments';
      q('[data-out-fin]').textContent = rs(c.fin);
      q('[data-out-tenure]').textContent = `${c.years} ${c.years === 1 ? 'Year' : 'Years'} · ${c.n} instalments`;
      q('[data-out-int]').textContent = rs(c.totalInt);
      q('[data-out-total]').textContent = rs(c.total);
      drawDonut(c);
      q('[data-m-price]').textContent = fmt(c.price);
      q('[data-m-down]').textContent = `${fmt(c.down)} (${Math.round(c.d * 100)}%)`;
      q('[data-m-finlbl]').textContent = bank ? 'Bank financing (Rs.)' : 'Balance in instalments (Rs.)';
      q('[data-m-fin]').textContent = fmt(c.fin);
      q('[data-m-tenure]').textContent = `${c.years} ${c.years === 1 ? 'Year' : 'Years'}`;
      q('[data-th-int]').textContent = bank ? 'Markup' : 'Markup (none)';
      q('[data-out-schedinfo]').textContent = `${c.n} monthly instalments of ${rs(c.emi)} (${pk(c.emi)})`;
      if (table) renderTable(c); else renderTable(c, false);
      drawChart(c, chart);
      const proj = projIn.value, pName = proj ? projIn.options[projIn.selectedIndex].text : 'a Gohar development';
      q('[data-calc-visit]').href = 'site-visit.html' + (proj ? `?project=${proj}` : '');
      const msg = `Hi, I used the instalment calculator on the Gohar website.\nProject: ${pName}\nPlan: ${bank ? `Bank financing at ${rateTxt} markup` : 'Gohar instalment plan'}\nProperty price: ${rs(c.price)}\nDown payment: ${rs(c.down)} (${Math.round(c.d * 100)}%)\nTenure: ${c.years} years (${c.n} instalments)\nEstimated monthly instalment: ${rs(c.emi)}\nPlease share the exact payment plan and availability.`;
      q('[data-calc-wa]').href = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
    };

    // inputs
    priceIn.addEventListener('input', () => { const pos = priceIn.value.length - priceIn.selectionStart; const v = Math.min(parsePrice(), 9e10); priceIn.value = v ? fmt(v) : ''; try { const p = Math.max(0, priceIn.value.length - pos); priceIn.setSelectionRange(p, p); } catch {} update({ chart: false, table: false }); });
    priceIn.addEventListener('change', () => update());
    qa('[data-quick]').forEach((b) => b.addEventListener('click', () => { priceIn.value = fmt(+b.dataset.quick); qa('[data-quick]').forEach((x) => x.classList.toggle('is-on', x === b)); update(); }));
    const fill = (el) => el.style.setProperty('--p', ((el.value - el.min) / (el.max - el.min)) * 100 + '%');
    [downIn, rateIn].forEach((el) => { fill(el); el.addEventListener('input', () => { fill(el); update({ chart: false, table: false }); }); el.addEventListener('change', () => update()); });
    projIn.addEventListener('change', () => update({ chart: false, table: false }));
    const setPlan = (plan) => {
      st.plan = plan; const bank = plan === 'bank';
      qa('[data-plan]').forEach((x) => { const on = x.dataset.plan === plan; x.classList.toggle('is-on', on); x.setAttribute('aria-checked', String(on)); });
      q('[data-years-a]').hidden = bank; q('[data-years-b]').hidden = !bank; q('[data-rate-field]').hidden = !bank;
      st.page = 0;
    };
    qa('[data-plan]').forEach((b) => b.addEventListener('click', () => { setPlan(b.dataset.plan); if (anim) gsap.from(st.plan === 'bank' ? [q('[data-years-b]'), q('[data-rate-field]')] : q('[data-years-a]'), { opacity: 0, y: 14, duration: 0.6, stagger: 0.08, ease }); update(); }));
    const syncTenure = () => qa('[data-tenure]').forEach((x) => { const grp = x.parentElement.hasAttribute('data-years-b') ? 'bank' : 'gohar'; const on = +x.dataset.tenure === st.years[grp]; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
    qa('[data-tenure]').forEach((b) => b.addEventListener('click', () => { st.years[b.parentElement.hasAttribute('data-years-b') ? 'bank' : 'gohar'] = +b.dataset.tenure; st.page = 0; syncTenure(); update(); }));
    qa('[data-view]').forEach((b) => b.addEventListener('click', () => { st.view = b.dataset.view; qa('[data-view]').forEach((x) => x.classList.toggle('is-on', x === b)); renderTable(last); }));
    q('[data-reset]').addEventListener('click', () => { setPlan(DEF.plan); st.years = { ...DEF.years }; syncTenure(); priceIn.value = fmt(DEF.price); downIn.value = DEF.down; rateIn.value = DEF.rate; [downIn, rateIn].forEach(fill); qa('[data-quick]').forEach((x) => x.classList.remove('is-on')); update(); });
    q('[data-csv]').addEventListener('click', () => {
      const c = last; const head = ['Payment number', 'Instalment', 'Principal', 'Markup', 'Balance'];
      const lines = ['Gohar Group of Companies - Instalment schedule (estimate)', `Plan,${st.plan === 'bank' ? 'Bank financing ' + rateIn.value + '%' : 'Gohar instalment plan'}`, `Property price,${c.price}`, `Down payment,${c.down}`, `Financed / balance,${c.fin}`, `Tenure (years),${c.years}`, '', head.join(','), ...c.rows.map((r) => [r.k, r.emi, r.prin, r.int, r.bal].join(','))];
      const blob = new Blob([lines.join('\n')], { type: 'text/csv' }); const a = d.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'gohar-instalment-schedule.csv'; d.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    });
    q('[data-print]').addEventListener('click', () => {
      // print the full schedule, every month
      const tb = q('[data-rows]'); const c = last;
      tb.innerHTML = c.rows.map((r) => `<tr><th scope="row">${r.k} Month</th><td>${fmt(r.emi)}</td><td>${fmt(r.prin)}</td><td>${fmt(r.int)}</td><td>${fmt(r.bal)}</td></tr>`).join('');
      const after = () => { removeEventListener('afterprint', after); renderTable(last, false); };
      addEventListener('afterprint', after); setTimeout(() => print(), 60);
    });
    update();
  }

  // map loads only on request; copy link
  $$('[data-map]').forEach((b) => b.addEventListener('click', () => { const f = d.createElement('iframe'); f.src = b.dataset.map; f.loading = 'lazy'; f.title = 'Map of the Gohar head office'; f.referrerPolicy = 'no-referrer-when-downgrade'; b.parentElement.appendChild(f); b.remove(); }));
  $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => { try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'Link copied'; } catch { b.textContent = b.dataset.copy; } }));
  $$('[data-year]').forEach((y) => { y.textContent = new Date().getFullYear(); });

  /* ---------- motion ---------- */
  const splitWords = (el) => {
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) { const fr = d.createDocumentFragment(); n.textContent.split(/(\s+)/).forEach((w) => { if (!w) return; if (/^\s+$/.test(w)) fr.appendChild(d.createTextNode(' ')); else { const s = d.createElement('span'); s.className = 'word'; s.textContent = w; fr.appendChild(s); } }); n.replaceWith(fr); }
      else if (n.nodeType === 1) walk(n);
    });
    walk(el); return $$('.word', el);
  };
  const reveals = () => {
    $$('.split-lines').forEach((el) => { if (el.closest('[data-intro]')) return; gsap.to($$('.line > span', el), { y: 0, yPercent: 0, transform: 'translateY(0%)', duration: 1.25, stagger: 0.08, ease, scrollTrigger: { trigger: el, start: 'top 90%', once: true } }); });
    $$('[data-fade]').forEach((el) => { if (el.closest('[data-intro]')) return; gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease, delay: +el.dataset.fade || 0, scrollTrigger: { trigger: el, start: 'top 92%', once: true } }); });
    $$('[data-stagger]').forEach((el) => gsap.to(el.children, { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease, scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
    $$('.reveal-img').forEach((el) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
      tl.to(el, { clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: 'expo.inOut' });
      const m = el.querySelector('img'); if (m && !m.hasAttribute('data-parallax')) tl.fromTo(m, { scale: 1.25 }, { scale: 1, duration: 2, ease }, 0);
    });
    $$('[data-parallax]').forEach((m) => { const w = m.closest('[data-parallax-wrap]') || m.parentElement; gsap.fromTo(m, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: w, start: 'top bottom', end: 'bottom top', scrub: true } }); });
    $$('[data-words]').forEach((el) => gsap.to(splitWords(el), { opacity: 1, stagger: 0.05, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 50%', scrub: true } }));
    $$('[data-count]').forEach((el) => { const end = +el.dataset.count, o = { v: 0 }; gsap.to(o, { v: end, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true }, onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString('en-US'); } }); });
    // stacked flagship panels: the outgoing panel settles back as the next one slides over it
    const panels = $$('.panel');
    panels.forEach((p, i) => {
      if (i === panels.length - 1) return;
      const dim = d.createElement('div'); dim.className = 'panel__dim'; p.appendChild(dim);
      gsap.timeline({ scrollTrigger: { trigger: panels[i + 1], start: 'top bottom', end: 'top top', scrub: true } })
        .to($('.panel__media', p), { scale: 0.92, ease: 'none' }, 0).to(dim, { opacity: 0.55, ease: 'none' }, 0);
    });
    panels.forEach((p) => { const body = $('.panel__body', p); gsap.from(body.children, { y: 40, opacity: 0, duration: 1.1, stagger: 0.07, ease, scrollTrigger: { trigger: p, start: 'top 60%', once: true } }); });
    // framed project hero opens to full width
    $$('[data-expand]').forEach((el) => gsap.to($('.phero__expand-in', el), { clipPath: 'inset(0px 0px)', ease: 'none', scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 15%', scrub: true } }));
    // footer architectural line draws once
    const fl = $('.ft__lines path'); if (fl) { const len = 6000; gsap.fromTo(fl, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 3.2, ease: 'power2.inOut', scrollTrigger: { trigger: '.ft', start: 'top 85%', once: true } }); }
    // hero scroll-out
    const hero = $('[data-hero]');
    if (hero && !hero.classList.contains('phero--split')) {
      const media = $('.hero__media, .phero__media', hero);
      if (media) gsap.to(media, { yPercent: 16, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
      const inner = $('.hero__in, .phero__in', hero);
      if (inner && hero.classList.contains('hero')) gsap.to([inner, $('.hero__bar', hero)], { opacity: 0, y: -40, ease: 'none', scrollTrigger: { trigger: hero, start: '35% top', end: 'bottom top', scrub: true } });
    }
  };
  const intro = () => {
    const el = $('[data-intro]'); if (!el) return;
    const tl = gsap.timeline({ delay: 0.05 });
    const hero = el.closest('[data-hero]') || $('[data-hero]');
    const m = hero && $('.mb', hero);
    if (m && !hero.classList.contains('phero--split')) tl.fromTo(m, { scale: 1.12 }, { scale: 1, duration: 2.4, ease: 'expo.out' }, 0);
    tl.to($$('.split-lines .line > span', el), { transform: 'translateY(0%)', duration: 1.35, stagger: 0.09, ease }, 0.15)
      .to($$('[data-fade]', el), { opacity: 1, y: 0, duration: 1.1, stagger: 0.07, ease }, 0.45);
    const bar = hero && $('.hero__bar[data-fade]', hero); if (bar) tl.to(bar, { opacity: 1, y: 0, duration: 1.1, ease }, 0.9);
  };

  /* ---------- site-wide motion layer: runs on every page ---------- */
  const motion = () => {
    const skip = '[data-intro], [data-fade], [data-stagger], .split-lines, .panel__body, .reel, .hd, .mm, .dd, .ft__marquee, .vband__marquee, .hero__track, .lb, .cursor, form .field, .hero__boxes, .vision__vals, .xview, .sig__deck, .commit__vals, .ab-tabs, .ab-vals, .ab-steps, .purp__vals, .purp__media, .calc__grid, .calc__more';
    // 1. scroll progress line
    const bar = d.createElement('div'); bar.className = 'progress'; d.body.appendChild(bar);
    gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
    // 2. every section heading rises word by word
    $$('main h2, main h3, .ft h2').forEach((h) => {
      if (h.closest(skip) || h.closest('.ft__cols') || h.querySelector('.word')) return;
      const words = splitWords(h); if (!words.length) return;
      gsap.from(words, { yPercent: 70, opacity: 0, rotate: 3, duration: 1, stagger: 0.045, ease, scrollTrigger: { trigger: h, start: 'top 90%', once: true } });
    });
    // 3. text, lists, buttons, cards fade up in small groups as they arrive
    const pieces = $$('main p, main li, main .btn, main .chip, main dl > div, main blockquote, main figure, main .scard, main .story-item, main details, main table, .ft__cols li, .ft__about, .ft__statement')
      .filter((el) => !el.closest(skip) && !el.closest('.hero, .phero, .eyebrow, .reveal-img, [data-parallax-wrap]') && !el.parentElement.closest('li, .scard, .story-item, .pc, figure, details'));
    gsap.set(pieces, { opacity: 0, y: 36 });
    ScrollTrigger.batch(pieces, { start: 'top 92%', once: true, onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 1, stagger: 0.07, ease, overwrite: 'auto' }) });
    // 4. images: slow zoom-out while scrolling past (living pictures)
    $$('main img').forEach((img) => {
      if (img.closest('.hero, .phero, .reel, .reveal-img, [data-parallax], .mb, .dd, .hbox, .lb, .prow, button, .vhero__card, .vision__bg, .xview, .xrow, .purp__img') || img.hasAttribute('data-parallax')) return;
      const box = img.parentElement; if (!box || getComputedStyle(box).overflow === 'visible') return;
      gsap.fromTo(img, { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    // 5. media blocks (videos and stills) drift slightly with scroll
    $$('main .mb').forEach((m) => {
      if (m.closest('.hero, .phero, .vband, .panel, .ft')) return;
      gsap.fromTo(m, { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: m.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    // 6. big video sections open up like a window as they come in
    $$('.vband, .ft__hero').forEach((s) => {
      gsap.fromTo($('.mb', s), { clipPath: 'inset(8% 6% 8% 6% round 24px)', scale: 1.1 }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', scale: 1, ease: 'none', scrollTrigger: { trigger: s, start: 'top bottom', end: 'top 25%', scrub: true } });
    });
    // purpose section: background drifts and slowly zooms, grid lines draw in, value cards cascade
    const vbg = $('[data-vbg]'); if (vbg) gsap.fromTo(vbg, { scale: 1.25, yPercent: -6 }, { scale: 1.05, yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.vision', start: 'top bottom', end: 'bottom top', scrub: true } });
    const vg = $('.vision__grid path'); if (vg) gsap.fromTo(vg, { strokeDasharray: 9000, strokeDashoffset: 9000 }, { strokeDashoffset: 0, duration: 3, ease: 'power2.inOut', scrollTrigger: { trigger: '.vision', start: 'top 70%', once: true } });
    const cv = $$('.cval'); if (cv.length) gsap.fromTo(cv, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.12, ease, scrollTrigger: { trigger: '.commit__vals', start: 'top 82%', once: true } });
    const vc = $$('.vcard'); if (vc.length) gsap.fromTo(vc, { x: 80, opacity: 0, rotateY: -12 }, { x: 0, opacity: 1, rotateY: 0, duration: 1.3, stagger: 0.14, ease, overwrite: 'auto', scrollTrigger: { trigger: '.vision__vals', start: 'top 80%', once: true } });
    // city cards: picture zooms out, big number counts up
    $$('.xcity').forEach((c, i) => gsap.fromTo(c, { clipPath: 'inset(12% 8% 12% 8% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'top 45%', scrub: true } }));
    // calculator: form and result cards glide in, lower panels rise on scroll
    if ($('.calc')) {
      gsap.from('.calc__form', { x: -50, opacity: 0, duration: 1.2, ease, delay: 0.2 });
      gsap.from('.calc__result', { x: 50, opacity: 0, duration: 1.2, ease, delay: 0.35 });
      gsap.from('.calc__form .cstep', { y: 24, opacity: 0, duration: 0.9, stagger: 0.08, ease, delay: 0.45 });
      $$('.cchart, .ctable, .cdisc').forEach((el) => gsap.from(el, { y: 60, opacity: 0, duration: 1.1, ease, scrollTrigger: { trigger: el, start: 'top 88%', once: true } }));
    }
    // our purpose: image opens like a curtain and slowly zooms, red rule draws, value cards cascade
    const pimg = $('[data-purp-img]');
    if (pimg) {
      gsap.fromTo(pimg, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: '.purp', start: 'top 70%', once: true } });
      gsap.fromTo($('img', pimg), { scale: 1.3 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.purp', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.from('.purp__badge, .purp__cap', { y: 30, opacity: 0, duration: 1, stagger: 0.12, ease, scrollTrigger: { trigger: '.purp', start: 'top 55%', once: true } });
      gsap.fromTo('.purp__rule i', { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: '.purp__rule', start: 'top 85%', once: true } });
      gsap.fromTo('.purp__v', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.1, ease, scrollTrigger: { trigger: '.purp__vals', start: 'top 85%', once: true } });
    }
    // signature gallery: panels rise in one after another
    const sp = $$('.sig__p'); if (sp.length) gsap.fromTo(sp, { y: 120, opacity: 0, clipPath: 'inset(30% 0% 0% 0% round 18px)' }, { y: 0, opacity: 1, clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 1.4, stagger: 0.12, ease, scrollTrigger: { trigger: '.sig__deck', start: 'top 85%', once: true } });
    // about: values follow the scroll (big counter + progress line on the left)
    const vals = $$('[data-val]'), vcount = $('[data-vcount]'), vbar = $('[data-vbar]');
    vals.forEach((v, i) => ScrollTrigger.create({ trigger: v, start: 'top 60%', end: 'bottom 60%', onToggle: (st) => { if (!st.isActive) return; vals.forEach((x, k) => x.classList.toggle('is-on', k === i)); if (vcount) { vcount.textContent = String(i + 1).padStart(2, '0'); gsap.fromTo(vcount, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease }); } } }));
    if (vbar && vals.length) gsap.fromTo(vbar, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.ab-vals__list', start: 'top 60%', end: 'bottom 60%', scrub: true } });
    // about: timeline line draws across and lights each step
    const sline = $('[data-stepline]'), steps = $$('[data-step]');
    if (sline) gsap.fromTo(sline, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '[data-steps]', start: 'top 75%', end: 'bottom 55%', scrub: true, onUpdate: (st) => steps.forEach((s, i) => s.classList.toggle('is-on', st.progress >= i / Math.max(1, steps.length - 1) - 0.02)) } });
    // about: collage, hero stats and tab stage entrances
    const abs = $$('.ab-stat'); if (abs.length) gsap.from(abs, { y: 40, opacity: 0, duration: 1.1, stagger: 0.1, ease, delay: 0.6 });
    const cb = $('.ab-collage__b'); if (cb) gsap.fromTo(cb, { yPercent: 25 }, { yPercent: -15, ease: 'none', scrollTrigger: { trigger: '.ab-collage', start: 'top bottom', end: 'bottom top', scrub: true } });
    $$('.ab-tabs__stage, .ab-build__stage').forEach((st) => gsap.fromTo(st, { clipPath: 'inset(10% 6% 10% 6% round 20px)' }, { clipPath: 'inset(0% 0% 0% 0% round 6px)', ease: 'none', scrollTrigger: { trigger: st, start: 'top bottom', end: 'top 40%', scrub: true } }));
    // footer wordmark: letters rise one after another
    const fw = $$('.ft__word b'); if (fw.length) gsap.fromTo(fw, { yPercent: 105 }, { yPercent: 0, duration: 1.4, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '.ft__word', start: 'top 92%', once: true } });
    // 7. hero action boxes slide in
    // (hero boxes slide in with CSS, see .hbox)
    // 8. section labels draw their line
    $$('main .eyebrow').forEach((e) => { if (e.closest(skip)) return; gsap.from(e, { opacity: 0, x: -24, duration: 0.9, ease, scrollTrigger: { trigger: e, start: 'top 92%', once: true } }); });
    // 9. desktop: cards tilt toward the pointer, buttons are magnetic
    if (fine) {
      $$('.pc, .scard, .story-item, .story-feat, .reel__item, .gal__item').forEach((c) => {
        c.classList.add('tilt');
        c.addEventListener('pointermove', (e) => { const r = c.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; gsap.to(c, { rotateY: x * 6, rotateX: -y * 6, transformPerspective: 900, duration: 0.6, ease: 'power3.out' }); });
        c.addEventListener('pointerleave', () => gsap.to(c, { rotateY: 0, rotateX: 0, duration: 0.9, ease: 'elastic.out(1, .5)' }));
      });
      $$('.btn, .ctrl, .wa').forEach((b) => {
        b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.5, ease: 'power3.out' }); });
        b.addEventListener('pointerleave', () => gsap.to(b, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, .4)' }));
      });
    }
  };

  /* ---------- page transitions (short, never blocks the next page from loading) ---------- */
  const curtain = $('.curtain');
  const internal = (a) => a.origin === location.origin && !a.hash && !a.target && !a.hasAttribute('download') && a.pathname !== location.pathname && !/^(mailto|tel):/.test(a.href);
  // The curtain's resting place comes from CSS (translateY(100%)). GSAP would read that as a pixel offset
  // and add it to yPercent, leaving the curtain over the page, so we always reset y to 0 explicitly.
  const hideCurtain = () => { if (curtain) { gsap.killTweensOf(curtain); gsap.set(curtain, { y: 0, yPercent: 100 }); } };
  if (curtain && anim) {
    gsap.set(curtain, { y: 0, yPercent: 100 });
    d.addEventListener('click', (e) => {
      const a = e.target.closest('a'); if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !internal(a)) return;
      e.preventDefault(); store.set('gohar-tx', '1');
      let gone = false; const go = () => { if (!gone) { gone = true; location.href = a.href; } };
      gsap.timeline({ onComplete: go })
        .fromTo(curtain, { y: 0, yPercent: 100 }, { y: 0, yPercent: 0, duration: 0.5, ease: 'expo.inOut' })
        .to($('img', curtain), { opacity: 1, duration: 0.2 }, '-=0.15');
      setTimeout(go, 900); // never wait longer than this
    });
    // back/forward from the browser cache: make sure the page is visible
    addEventListener('pageshow', (e) => { if (e.persisted) hideCurtain(); });
  }

  /* ---------- boot ---------- */
  if (anim) {
    const fromTx = store.get('gohar-tx') === '1'; store.set('gohar-tx', '0');
    let started = false;
    const start = () => { if (started) return; started = true; try { intro(); reveals(); motion(); } catch (err) { console.error(err); } ScrollTrigger.refresh(); d.dispatchEvent(new Event('gohar:started')); };
    if (root.classList.contains('pl-on')) {
      // first visit: the intro loader plays first (assets/js/motion.js), then the page animations start
      d.addEventListener('gohar:pl-done', start, { once: true });
      setTimeout(start, 4000); // never wait longer than this
    } else if (fromTx && curtain) {
      gsap.set(curtain, { y: 0, yPercent: 0 }); gsap.set($('img', curtain), { opacity: 1 });
      gsap.timeline().to($('img', curtain), { opacity: 0, duration: 0.2 }).to(curtain, { y: 0, yPercent: -100, duration: 0.7, ease: 'expo.inOut' }, 0.05).add(start, 0.25);
      // safety net: whatever happens, the page is uncovered within 1.5 s
      setTimeout(() => { const r = curtain.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) gsap.set(curtain, { y: 0, yPercent: -100 }); }, 1500);
    } else start();
    addEventListener('load', () => ScrollTrigger.refresh());
  }
  if (location.hash) { const t = d.getElementById(location.hash.slice(1)); if (t) setTimeout(() => scrollToEl(t), 400); }
})();
