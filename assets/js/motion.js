/* Gohar — extra motion & interaction layer (every page).
   Intro loader, image reveals, cursor follower, spotlight cards, scroll-speed tilt, hero depth,
   counting numbers, section reveals, header entrance, footer glow, back-to-top ring.
   Skipped entirely for visitors who prefer reduced motion; pointer effects only on mouse devices. */
(() => {
  const d = document, root = d.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const G = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const ss = { get(k) { try { return sessionStorage.getItem(k); } catch { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch {} } };
  const done = () => { ss.set('gohar-pl', '1'); root.classList.remove('pl-on'); d.dispatchEvent(new Event('gohar:pl-done')); };

  /* ---------------- 1. intro loader (first page of a visit) ---------------- */
  const pl = $('.pl');
  if (root.classList.contains('pl-on') && pl) {
    if (!G || reduce) { done(); }
    else {
      const n = $('.pl__n', pl), bar = $('.pl__bar i', pl), o = { v: 0 };
      let loaded = d.readyState === 'complete'; addEventListener('load', () => { loaded = true; });
      const tl = gsap.timeline();
      tl.fromTo('.pl__logo', { opacity: 0, y: 30, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'expo.out' })
        .fromTo('.pl__tag', { opacity: 0, letterSpacing: '0.6em' }, { opacity: 1, letterSpacing: '0.28em', duration: 1, ease: 'expo.out' }, 0.25)
        .to(o, { v: 100, duration: 1.4, ease: 'power2.inOut', onUpdate: () => { const v = Math.round(o.v); n.textContent = String(v).padStart(2, '0'); bar.style.transform = `scaleX(${v / 100})`; } }, 0.1)
        .add(() => { if (!loaded) tl.pause(); setTimeout(() => tl.resume(), loaded ? 0 : 900); })
        .to('.pl__in', { opacity: 0, y: -30, duration: 0.5, ease: 'power2.in' })
        .to('.pl__p--a', { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '-=0.1')
        .to('.pl__p--b', { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '-=0.78')
        .add(done, '-=0.55')
        .set(pl, { display: 'none' });
      setTimeout(() => { if (root.classList.contains('pl-on')) { gsap.set(pl, { display: 'none' }); done(); } }, 4500); // safety
    }
  } else if (pl) pl.remove();

  if (!G || reduce) return;
  gsap.registerPlugin(ScrollTrigger);
  const ease = 'expo.out';

  /* ---------------- 2. cursor follower (mouse only) ---------------- */
  if (fine) {
    const dot = d.createElement('div'); dot.className = 'cur-dot'; const ring = d.createElement('div'); ring.className = 'cur-ring';
    d.body.append(ring, dot); root.classList.add('has-cur');
    const xd = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' }), yd = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
    const xr = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' }), yr = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });
    addEventListener('pointermove', (e) => { xd(e.clientX); yd(e.clientY); xr(e.clientX); yr(e.clientY); root.classList.add('cur-on'); }, { passive: true });
    d.addEventListener('pointerleave', () => root.classList.remove('cur-on'));
    d.addEventListener('pointerover', (e) => {
      const t = e.target;
      const media = t.closest('img, video, .reel__item, .sig__p, .xcity, .vtile, .pc__media, .gal__item, .xview, .scard__media, .story-item__media');
      const link = t.closest('a, button, [role="tab"], input[type="range"], select, label');
      ring.classList.toggle('is-link', !!link && !media);
      ring.classList.toggle('is-media', !!media);
      ring.classList.toggle('is-dark', !!t.closest('.hero, .sig, .purp, .ab-tabs, .ab-hero, .vband, .ft, .calc-hero, .sv-hero, .phero, .ga'));
    });
    d.addEventListener('pointerdown', () => ring.classList.add('is-down'));
    d.addEventListener('pointerup', () => ring.classList.remove('is-down'));
  }

  const begin = () => {
    /* ---------------- 3. header entrance ---------------- */
    gsap.from('.hd .logo, .hd .nav > *, .hd__cta > *', { y: -28, opacity: 0, duration: 1, stagger: 0.06, ease, clearProps: 'transform,opacity' });

    /* ---------------- 4. every picture reveals as it comes into view ---------------- */
    const skipImg = '.hero, .phero, .ab-hero, .sv-hero, .calc-hero, .reel, .reveal-img, [data-parallax], .mb, .dd, .hbox, .lb, .ga-root, .xview, .xrow, .sig, .purp__img, .ab-pane, .ab-shot, .logo, .curtain, .pl, .cursor, .pick, .vtile, .ft, .next__media, .dd__img';
    $$('main img').forEach((img) => {
      if (img.closest(skipImg) || img.getBoundingClientRect().width < 90) return;
      gsap.fromTo(img, { clipPath: 'inset(14% 8% 14% 8% round 18px)', opacity: 0.001 }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', opacity: 1, duration: 1.5, ease: 'expo.inOut', scrollTrigger: { trigger: img, start: 'top 92%', once: true }, clearProps: 'clipPath' });
    });
    // tiles and next-project banner: soft rise
    $$('.vtile, .next').forEach((el) => gsap.from(el, { y: 50, opacity: 0, duration: 1.1, ease, scrollTrigger: { trigger: el, start: 'top 92%', once: true } }));

    /* ---------------- 5. big dark sections open out of a rounded frame ---------------- */
    $$('.sig, .purp, .ab-tabs, .reel, .xcities, .ctable, .cchart').forEach((s) => {
      gsap.fromTo(s, { clipPath: 'inset(0% 4% 0% 4% round 36px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: s, start: 'top bottom', end: 'top 35%', scrub: true }, clearProps: 'clipPath' });
    });

    /* ---------------- 6. numbers count up when they appear ---------------- */
    $$('main dd, .sig__facts dd, .cchart__stats b').forEach((el) => {
      if (el.closest('[data-count], .ga-root, .csum, .ctable__meta') || el.querySelector('*')) return;
      const txt = el.textContent.trim(); const m = txt.match(/^(\d{1,3}(?:,\d{3})*|\d+)$/); if (!m) return;
      const end = +m[1].replace(/,/g, ''); if (end < 2) return;
      const o = { v: 0 }; el.textContent = '0';
      gsap.to(o, { v: end, duration: 1.6, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 95%', once: true }, onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString('en-US'); } });
    });

    /* ---------------- 7. scroll-speed tilt on picture strips and panels ---------------- */
    const lenis = window.lenis;
    const skewEls = $$('.reel__row, .xcity, .pc__media, .scard, .story-feat, .gal');
    if (lenis && skewEls.length) {
      const setters = skewEls.map((el) => gsap.quickTo(el, 'skewY', { duration: 0.6, ease: 'power3' }));
      lenis.on('scroll', ({ velocity }) => { const s = gsap.utils.clamp(-4, 4, velocity * 0.18); setters.forEach((fn) => fn(s)); });
    }

    /* ---------------- 8. footer: columns rise, glow follows the mouse ---------------- */
    // (footer text already fades in via the main script; here the columns only glide up, without touching opacity)
    gsap.fromTo('.ft__cols > div', { y: 40 }, { y: 0, duration: 1.1, stagger: 0.1, ease, scrollTrigger: { trigger: '.ft__top', start: 'top 85%', once: true } });
    const ft = $('.ft');
    if (ft && fine) {
      const glow = d.createElement('i'); glow.className = 'ft__glow'; glow.setAttribute('aria-hidden', 'true'); ft.prepend(glow);
      ft.addEventListener('pointermove', (e) => { const r = ft.getBoundingClientRect(); ft.style.setProperty('--gx', `${e.clientX - r.left}px`); ft.style.setProperty('--gy', `${e.clientY - r.top}px`); });
    }
  };

  /* ---------------- 9. spotlight on cards (mouse only) ---------------- */
  if (fine) {
    const cards = $$('.pc, .scard, .story-item, .purp__v, .cval, .vcard, .xcity, .vtile, .hbox, .sv-card, .calc__form, .cres, .cplan, .ab-step, .ab-stat, .tchip, .dchip, .ga-card');
    cards.forEach((c) => {
      if (getComputedStyle(c).position === 'static') c.style.position = 'relative';
      const g = d.createElement('i'); g.className = 'spot'; g.setAttribute('aria-hidden', 'true'); c.appendChild(g);
      c.addEventListener('pointermove', (e) => { const r = c.getBoundingClientRect(); c.style.setProperty('--sx', `${e.clientX - r.left}px`); c.style.setProperty('--sy', `${e.clientY - r.top}px`); });
    });
  }

  /* ---------------- 10. home hero depth: headline and video shift with the mouse ---------------- */
  const hero = $('.hero--clean');
  if (hero && fine) {
    const c = $('.hero__center', hero), m = $('.hero__media', hero), b = $('.hero__boxes', hero);
    const cx = gsap.quickTo(c, 'x', { duration: 1, ease: 'power3' }), cy = gsap.quickTo(c, 'y', { duration: 1, ease: 'power3' });
    const bx = b && gsap.quickTo(b, 'x', { duration: 1.2, ease: 'power3' });
    const mx = gsap.quickTo(m, 'xPercent', { duration: 1.4, ease: 'power3' });
    gsap.set(m, { scale: 1.06 });
    hero.addEventListener('pointermove', (e) => { const r = hero.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5; cx(px * 26); cy(py * 18); if (bx) bx(px * -18); mx(px * -1.6); });
    hero.addEventListener('pointerleave', () => { cx(0); cy(0); if (bx) bx(0); mx(0); });
  }

  /* ---------------- 11. back-to-top button with a scroll-progress ring ---------------- */
  const top = d.createElement('button');
  top.type = 'button'; top.className = 'totop'; top.setAttribute('aria-label', 'Back to top');
  top.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true"><circle class="totop__bg" cx="24" cy="24" r="21"/><circle class="totop__p" cx="24" cy="24" r="21"/></svg><svg class="totop__a" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';
  d.body.appendChild(top);
  const ringP = $('.totop__p', top), C = 2 * Math.PI * 21;
  ringP.style.strokeDasharray = `${C}`;
  const onScroll = () => { const max = root.scrollHeight - innerHeight; const p = max > 0 ? scrollY / max : 0; ringP.style.strokeDashoffset = String(C * (1 - p)); top.classList.toggle('is-on', scrollY > innerHeight * 0.9); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  top.addEventListener('click', () => (window.lenis ? window.lenis.scrollTo(0, { duration: 1.6 }) : scrollTo({ top: 0, behavior: 'smooth' })));

  // start with the page animations (after the intro loader on a first visit)
  if (root.classList.contains('pl-on')) { let s = false; const go = () => { if (!s) { s = true; begin(); } }; d.addEventListener('gohar:pl-done', go, { once: true }); setTimeout(go, 4600); }
  else if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', begin); else begin();
})();

// "Now showing": names the Gohar project on screen while the home film plays
(() => {
  const box = document.querySelector('[data-fnow]'); if (!box) return;
  const hero = box.closest('[data-hero]'); const v = hero && hero.querySelector('video'); if (!v) return;
  let data; try { data = JSON.parse(box.dataset.fnow); } catch { return; }
  const name = box.querySelector('[data-fnow-name]'), meta = box.querySelector('[data-fnow-meta]');
  const idx = box.querySelector('[data-fnow-i]'), tot = box.querySelector('[data-fnow-n]');
  const bar = document.createElement('span'); bar.className = 'fnow__bar'; box.appendChild(bar);
  const pad = (n) => String(n).padStart(2, '0');
  let list = data.d, cur = -1, timer;
  const pick = () => { list = /hero-mobile/.test(v.currentSrc || v.src || '') ? data.m : data.d; tot.textContent = pad(list.length); };
  const show = (i, instant) => {
    if (i === cur) return; cur = i; const c = list[i];
    const apply = () => { name.textContent = c.name; meta.textContent = `${c.loc} · ${c.kind}`; idx.textContent = pad(i + 1); box.href = c.href; box.setAttribute('aria-label', `Now showing: ${c.name}, ${c.kind}`); box.classList.remove('is-swap'); };
    clearTimeout(timer); if (instant) return apply();
    box.classList.add('is-swap'); timer = setTimeout(apply, 380);
  };
  const tick = () => {
    if (!list.length) return; const t = v.currentTime + 0.4; let i = 0;
    for (let k = 0; k < list.length; k++) if (t >= list[k].t) i = k;
    show(i);
    const end = list[i + 1] ? list[i + 1].t : (v.duration || list[i].t + 5);
    bar.style.transform = `scaleY(${Math.min(1, Math.max(0, (t - list[i].t) / (end - list[i].t))).toFixed(3)})`;
  };
  v.addEventListener('loadedmetadata', () => { pick(); cur = -1; show(0, true); });
  v.addEventListener('timeupdate', tick);
  if (v.currentSrc) pick();
})();

// Project cards: the short Gohar film plays on hover (desktop) or while the card is in view (phones), one at a time
(() => {
  const cards = [...document.querySelectorAll('.pxc[data-film]')]; if (!cards.length) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  if (reduce || saveData) return;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  let active = null;
  const start = (c) => {
    const v = c.querySelector('.pxc__vid'); if (!v) return;
    if (active && active !== c) stop(active);
    active = c;
    if (!v.getAttribute('src')) v.src = v.dataset.src;
    const pr = v.play(); if (pr) pr.then(() => c.classList.add('is-playing')).catch(() => {});
    v.addEventListener('playing', () => c.classList.add('is-playing'), { once: true });
  };
  const stop = (c) => { const v = c.querySelector('.pxc__vid'); c.classList.remove('is-playing'); if (v) v.pause(); if (active === c) active = null; };
  if (fine) {
    cards.forEach((c) => {
      c.addEventListener('mouseenter', () => start(c));
      c.addEventListener('mouseleave', () => stop(c));
      c.addEventListener('focusin', () => start(c));
      c.addEventListener('focusout', () => stop(c));
    });
  } else if ('IntersectionObserver' in window) {
    const ratios = new Map();
    const pick = () => { let best = null, br = 0.6; ratios.forEach((r, c) => { if (r >= br && !c.hidden) { best = c; br = r; } }); if (best && best !== active) start(best); if (!best && active) stop(active); };
    // watch each card's picture; the most visible one (at least 60%) plays
    const io = new IntersectionObserver((es) => { es.forEach((e) => ratios.set(e.target.closest('.pxc'), e.isIntersecting ? e.intersectionRatio : 0)); pick(); }, { threshold: [0, 0.3, 0.6, 0.8, 1] });
    cards.forEach((c) => io.observe(c.querySelector('.pxc__media')));
  }
})();

// Project gallery: "Show all N pictures"
(() => {
  document.querySelectorAll('[data-gal-more]').forEach((b) => b.addEventListener('click', () => {
    const grid = b.closest('.pdg').querySelector('.pdg__grid'); grid.classList.add('is-all'); b.closest('.pdg__more').hidden = true;
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    const first = grid.querySelector('.is-extra'); if (first) first.focus({ preventScroll: true });
  }));
})();
