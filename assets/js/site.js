/* Gohar Group of Companies — motion & interactions
   Uses GSAP + ScrollTrigger + Lenis (loaded from CDN in each page). */
(() => {
  const d = document, root = d.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const store = { get(k) { try { return sessionStorage.getItem(k); } catch { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch {} } };
  const WA = root.dataset.wa || '923373723420';

  if (!hasGsap) { root.classList.remove('js'); root.classList.add('loaded'); return; }
  gsap.registerPlugin(ScrollTrigger);
  const ease = 'expo.out';

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduce && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.lenis = lenis;
  }
  const scrollTo = (target) => lenis ? lenis.scrollTo(target, { offset: -80 }) : (typeof target === 'number' ? scrollTo(0, target) : target.scrollIntoView({ behavior: 'smooth' }));
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const t = $(id); if (!t) return; e.preventDefault(); scrollTo(t);
  }));
  $$('[data-top]').forEach((b) => b.addEventListener('click', () => lenis ? lenis.scrollTo(0) : scrollTo(0, 0)));

  /* ---------- Lazy videos: load + play only when visible ---------- */
  const vio = new IntersectionObserver((entries) => entries.forEach((en) => {
    const v = en.target;
    if (en.isIntersecting) {
      if (!v.src && v.dataset.src) { v.src = v.dataset.src; }
      const p = v.play(); if (p) p.catch(() => {});
    } else if (!v.paused) v.pause();
  }), { rootMargin: '200px 0px' });
  $$('video[data-src]:not([data-hover])').forEach((v) => { v.muted = true; v.playsInline = true; vio.observe(v); });

  /* ---------- Header ---------- */
  const header = $('.header');
  let lastY = 0;
  const onScroll = (y) => {
    if (!header) return;
    header.classList.toggle('is-solid', y > 60);
    if (!root.classList.contains('menu-open')) header.classList.toggle('is-hidden', y > lastY && y > 400);
    lastY = y;
  };
  if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll)); else addEventListener('scroll', () => onScroll(scrollY), { passive: true });
  onScroll(scrollY);

  /* ---------- Menu ---------- */
  const menu = $('.menu'), menuBtn = $('.menu-btn');
  if (menu && menuBtn) {
    const links = $$('.menu__links a span', menu);
    const tl = gsap.timeline({ paused: true })
      .set(menu, { visibility: 'visible' })
      .fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'expo.inOut' })
      .fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.06, ease }, 0.45)
      .fromTo('.menu__foot, .menu__media', { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0.6);
    const toggle = (open) => {
      root.classList.toggle('menu-open', open);
      menuBtn.setAttribute('aria-expanded', open);
      if (open) { lenis && lenis.stop(); tl.timeScale(1).play(); } else { lenis && lenis.start(); tl.timeScale(1.6).reverse(); }
    };
    menuBtn.addEventListener('click', () => toggle(!root.classList.contains('menu-open')));
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.classList.contains('menu-open')) toggle(false); });
  }

  /* ---------- Cursor ---------- */
  if (fine && !reduce) {
    root.classList.add('has-cursor');
    const c = d.createElement('div'); c.className = 'cursor';
    c.innerHTML = '<div class="cursor__dot"></div><div class="cursor__ring"></div>';
    d.body.appendChild(c);
    const dot = $('.cursor__dot', c), ring = $('.cursor__ring', c);
    const dx = gsap.quickTo(dot, 'x', { duration: 0.1 }), dy = gsap.quickTo(dot, 'y', { duration: 0.1 });
    const rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });
    addEventListener('mousemove', (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    d.addEventListener('mouseover', (e) => {
      const v = e.target.closest('[data-cursor]');
      const l = e.target.closest('a, button, summary, input, select, textarea, label');
      c.classList.toggle('is-view', !!v);
      ring.textContent = v ? v.dataset.cursor : '';
      c.classList.toggle('is-link', !v && !!l);
      c.classList.toggle('on-dark', !!e.target.closest('.dark, .hero, .phero, .footer, .cta, .quote, .menu, .film'));
    });
  }

  /* ---------- Split helpers ---------- */
  const splitWords = (el) => {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = d.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((w) => {
            if (!w) return;
            if (/^\s+$/.test(w)) frag.appendChild(d.createTextNode(' '));
            else { const s = d.createElement('span'); s.className = 'word'; s.textContent = w; frag.appendChild(s); }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains('word')) walk(n);
      });
    };
    walk(el); return $$('.word', el);
  };

  /* ---------- Reveal animations ---------- */
  const reveals = () => {
    $$('.split-lines').forEach((el) => {
      if (el.closest('[data-intro]')) return;
      gsap.to($$('.line > span', el), { yPercent: 0, y: 0, transform: 'translateY(0)', duration: 1.3, stagger: 0.09, ease,
        scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    $$('[data-fade]').forEach((el) => {
      if (el.closest('[data-intro]')) return;
      gsap.to(el, { opacity: 1, y: 0, duration: 1.2, ease, delay: +el.dataset.fade || 0, scrollTrigger: { trigger: el, start: 'top 90%' } });
    });
    $$('[data-stagger]').forEach((el) => {
      gsap.to(el.children, { opacity: 1, y: 0, duration: 1.1, stagger: 0.1, ease, scrollTrigger: { trigger: el, start: 'top 86%' } });
    });
    $$('.reveal-img').forEach((el) => {
      gsap.to(el, { clipPath: 'inset(0% 0 0 0)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 85%' } });
      const m = el.querySelector('img, video');
      if (m) gsap.from(m, { scale: 1.3, duration: 2, ease, scrollTrigger: { trigger: el, start: 'top 85%' } });
    });
    $$('[data-parallax]').forEach((el) => {
      const m = el.querySelector('img, video') || el;
      gsap.fromTo(m, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $$('.statement').forEach((el) => {
      const words = splitWords(el);
      gsap.to(words, { opacity: 1, stagger: 0.05, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } });
    });
    $$('[data-count]').forEach((el) => {
      const end = +el.dataset.count, o = { v: 0 };
      gsap.to(o, { v: end, duration: 2.2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' },
        onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString('en-US'); } });
    });
  };

  /* ---------- Hero ---------- */
  const heroIntro = () => {
    const intro = $('[data-intro]');
    if (!intro) return;
    const tl = gsap.timeline();
    const media = $('.hero__media video, .hero__media img, .phero__media video, .phero__media img');
    if (media) tl.fromTo(media, { scale: 1.35 }, { scale: media.closest('.hero') ? 1.12 : 1, duration: 2.6, ease: 'expo.out' }, 0);
    tl.to($$('.split-lines .line > span', intro), { transform: 'translateY(0)', duration: 1.5, stagger: 0.1, ease }, 0.25)
      .to($$('[data-fade]', intro), { opacity: 1, y: 0, duration: 1.3, stagger: 0.08, ease }, 0.6);
    // scroll-out
    const hero = $('.hero');
    if (hero) {
      gsap.to('.hero__media', { yPercent: 22, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero__content', { yPercent: -18, opacity: 0, ease: 'none', scrollTrigger: { trigger: hero, start: '30% top', end: 'bottom top', scrub: true } });
    }
    const ph = $('.phero');
    if (ph) gsap.to('.phero__media', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: ph, start: 'top top', end: 'bottom top', scrub: true } });
  };

  // hero film play / pause
  $$('[data-film-toggle]').forEach((b) => {
    const v = $(b.dataset.filmToggle);
    b.addEventListener('click', () => {
      if (!v) return;
      if (v.paused) { v.play(); b.classList.remove('paused'); b.querySelector('span').textContent = 'Pause film'; }
      else { v.pause(); b.classList.add('paused'); b.querySelector('span').textContent = 'Play film'; }
    });
  });

  /* ---------- Expanding film ---------- */
  const film = () => {
    const f = $('.film'); if (!f || reduce) return;
    const fr = $('.film__frame', f), m = $('video, img', fr);
    const tl = gsap.timeline({ scrollTrigger: { trigger: f, start: 'top top', end: '+=120%', scrub: true, pin: true } });
    tl.to(fr, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none' }, 0)
      .to(m, { scale: 1, ease: 'none' }, 0)
      .from($$('.film__caption .line > span', f), { yPercent: 110, stagger: 0.1, ease: 'power2.out', duration: 0.5 }, 0.35);
  };

  /* ---------- Horizontal project scroll ---------- */
  const hscroll = () => {
    const s = $('.hscroll'); if (!s) return;
    const track = $('.hscroll__track', s), bar = $('.progress i');
    ScrollTrigger.matchMedia({
      '(min-width: 861px)': () => {
        const dist = () => track.scrollWidth - innerWidth;
        const tw = gsap.to(track, { x: () => -dist(), ease: 'none',
          scrollTrigger: { trigger: s, start: 'top top', end: () => '+=' + dist(), scrub: 1, pin: true, invalidateOnRefresh: true,
            onUpdate: (st) => bar && gsap.set(bar, { scaleX: st.progress }) } });
        $$('.hcard__media video, .hcard__media img', s).forEach((m) => {
          gsap.fromTo(m, { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: m.closest('.hcard'), containerAnimation: tw, start: 'left right', end: 'center center', scrub: true } });
        });
      },
    });
  };

  /* ---------- Marquees (react to scroll speed) ---------- */
  const marquees = () => {
    $$('.marquee__track').forEach((t) => {
      const kids = [...t.children]; kids.forEach((k) => t.appendChild(k.cloneNode(true)));
      const dir = t.dataset.dir === 'right' ? 1 : -1;
      const tw = gsap.to(t, { xPercent: -50, duration: +t.dataset.speed || 40, ease: 'none', repeat: -1 });
      if (dir === 1) { tw.progress(1); tw.reverse(); tw.eventCallback('onReverseComplete', () => tw.progress(1).reverse()); }
      ScrollTrigger.create({ trigger: t, start: 'top bottom', end: 'bottom top', onUpdate: (st) => {
        const v = Math.min(Math.abs(st.getVelocity()) / 300, 5);
        gsap.to(tw, { timeScale: 1 + v, duration: 0.2, overwrite: true, onComplete: () => gsap.to(tw, { timeScale: 1, duration: 1 }) });
      } });
    });
  };

  /* ---------- Floating hover image (lists) ---------- */
  const floaters = () => {
    if (!fine) return;
    $$('[data-float-list]').forEach((list) => {
      const box = d.createElement('div'); box.className = 'float-img'; d.body.appendChild(box);
      const img = d.createElement('img'); img.alt = ''; box.appendChild(img);
      const x = gsap.quickTo(box, 'x', { duration: 0.6, ease: 'power3' }), y = gsap.quickTo(box, 'y', { duration: 0.6, ease: 'power3' });
      list.addEventListener('mousemove', (e) => { x(e.clientX); y(e.clientY); });
      $$('[data-img]', list).forEach((row) => {
        row.addEventListener('mouseenter', () => {
          img.src = row.dataset.img;
          gsap.to(box, { opacity: 1, scale: 1, duration: 0.6, ease });
          gsap.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1, ease });
        });
      });
      list.addEventListener('mouseleave', () => gsap.to(box, { opacity: 0, scale: 0.6, duration: 0.5, ease }));
    });
  };

  /* ---------- Project cards: play film on hover ---------- */
  $$('.pcard').forEach((card) => {
    const v = $('video[data-hover]', card); if (!v) return;
    v.muted = true; v.playsInline = true;
    const play = () => { if (!v.src) v.src = v.dataset.src; v.play().then(() => v.classList.add('ready')).catch(() => {}); };
    card.addEventListener('mouseenter', () => fine && play());
    card.addEventListener('mouseleave', () => { v.pause(); });
  });
  // on touch screens, play card films while they are on screen
  if (!fine) $$('.pcard video[data-hover]').forEach((v) => { v.classList.add('ready'); v.style.opacity = 1; vio.observe(v); });

  /* ---------- Projects filter + search ---------- */
  const grid = $('.pgrid');
  if (grid) {
    const cards = $$('.pcard', grid), tabs = $$('.ftab'), q = $('#search'), empty = $('.empty');
    let cat = new URLSearchParams(location.search).get('category') || 'all';
    let loc = new URLSearchParams(location.search).get('location') || '';
    const apply = () => {
      const term = (q?.value || '').trim().toLowerCase();
      let n = 0;
      cards.forEach((c) => {
        const ok = (cat === 'all' || c.dataset.cat === cat) && (!term || c.dataset.search.includes(term)) && (!loc || c.dataset.search.includes(loc.toLowerCase()));
        c.classList.toggle('is-hidden', !ok); if (ok) n++;
      });
      tabs.forEach((t) => t.classList.toggle('is-on', t.dataset.cat === cat));
      if (empty) empty.style.display = n ? 'none' : 'block';
      const vis = cards.filter((c) => !c.classList.contains('is-hidden'));
      gsap.fromTo(vis, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.06, ease });
      ScrollTrigger.refresh();
    };
    tabs.forEach((t) => t.addEventListener('click', () => { cat = t.dataset.cat; loc = ''; apply(); }));
    q && q.addEventListener('input', apply);
    if (cat !== 'all' || loc) apply();
  }

  /* ---------- Gallery: drag to scroll + lightbox ---------- */
  $$('.gallery').forEach((g) => {
    let down = false, sx = 0, sl = 0, moved = false;
    g.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = g.scrollLeft; g.classList.add('dragging'); });
    addEventListener('pointerup', () => { down = false; g.classList.remove('dragging'); });
    g.addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 5) moved = true; g.scrollLeft = sl - dx; });
    g.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  });
  const lb = $('.lb');
  if (lb) {
    const img = $('img', lb), count = $('.lb__count', lb);
    let set = [], i = 0;
    const show = () => { img.src = set[i].dataset.full; img.alt = set[i].dataset.alt || ''; count.textContent = `${i + 1} / ${set.length}`; gsap.fromTo(img, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.6, ease }); };
    const open = (btn) => { set = $$(`[data-full][data-set="${btn.dataset.set}"]`); i = set.indexOf(btn); show(); lb.classList.add('open'); lenis && lenis.stop(); $('.lb__close', lb).focus(); };
    const close = () => { lb.classList.remove('open'); lenis && lenis.start(); };
    $$('[data-full]').forEach((b) => b.addEventListener('click', () => open(b)));
    $('.lb__close', lb).addEventListener('click', close);
    $('.lb__prev', lb).addEventListener('click', () => { i = (i - 1 + set.length) % set.length; show(); });
    $('.lb__next', lb).addEventListener('click', () => { i = (i + 1) % set.length; show(); });
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    d.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') $('.lb__next', lb).click();
      if (e.key === 'ArrowLeft') $('.lb__prev', lb).click();
    });
  }

  /* ---------- Story modal ---------- */
  const modal = $('.modal');
  if (modal) {
    const close = () => { modal.classList.remove('open'); lenis && lenis.start(); };
    $$('[data-story]').forEach((b) => b.addEventListener('click', () => {
      const s = JSON.parse(b.dataset.story);
      $('.modal__img', modal).src = s.img; $('.modal__meta', modal).innerHTML = `<b>${s.tag}</b><span>${s.date}</span><span>${s.read}</span>`;
      $('.modal__title', modal).textContent = s.title; $('.modal__text', modal).textContent = s.text;
      modal.classList.add('open'); lenis && lenis.stop();
      gsap.fromTo('.modal__box', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease });
    }));
    $('.lb__close', modal).addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  /* ---------- Sub-navigation active state ---------- */
  const sub = $$('.subnav__in a[href^="#"]');
  sub.forEach((a) => {
    const t = $(a.getAttribute('href')); if (!t) return;
    ScrollTrigger.create({ trigger: t, start: 'top 50%', end: 'bottom 50%', onToggle: (st) => { if (st.isActive) { sub.forEach((x) => x.classList.remove('is-on')); a.classList.add('is-on'); } } });
  });

  /* ---------- Forms → WhatsApp / email ---------- */
  $$('form[data-form]').forEach((form) => {
    const params = new URLSearchParams(location.search);
    const pre = params.get('project');
    if (pre && form.project) [...form.project.options].forEach((o) => { if (o.value === pre) o.selected = true; });
    if (form.date) form.date.min = new Date().toISOString().slice(0, 10);
    const ok = $('.form__ok', form);
    const build = () => {
      const fd = new FormData(form), lines = [`New ${form.dataset.form} — Gohar website`];
      for (const [k, v] of fd.entries()) {
        if (!v || k === 'website' || k === 'consent') continue;
        const el = form.elements[k];
        const label = el?.closest?.('.field')?.querySelector('label')?.textContent?.replace('*', '').trim() || k;
        const val = el?.tagName === 'SELECT' ? el.options[el.selectedIndex].text : v;
        lines.push(`${label}: ${val}`);
      }
      return lines.join('\n');
    };
    const valid = () => {
      let good = true;
      $$('[required]', form).forEach((el) => {
        const f = el.closest('.field');
        let bad = el.type === 'checkbox' ? !el.checked : !el.value.trim();
        if (!bad && el.type === 'email') bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value);
        if (!bad && el.type === 'tel') bad = el.value.replace(/\D/g, '').length < 7;
        f && f.classList.toggle('invalid', bad);
        if (bad) good = false;
      });
      if (!good) { const first = $('.invalid input, .invalid select, .invalid textarea', form); first && first.focus(); }
      return good;
    };
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (form.website && form.website.value) return; // spam trap
      if (!valid()) return;
      window.open(`https://wa.me/${WA}?text=${encodeURIComponent(build())}`, '_blank', 'noopener');
      if (ok) { ok.classList.add('show'); }
    });
    const mail = $('[data-mail]', form);
    mail && mail.addEventListener('click', () => {
      if (!valid()) return;
      location.href = `mailto:info@gohargoc.com?subject=${encodeURIComponent('Website ' + form.dataset.form)}&body=${encodeURIComponent(build())}`;
      if (ok) ok.classList.add('show');
    });
    $$('input, select, textarea', form).forEach((el) => el.addEventListener('input', () => el.closest('.field')?.classList.remove('invalid')));
  });

  // contact map loads only on request
  $$('[data-map]').forEach((b) => b.addEventListener('click', () => {
    const f = d.createElement('iframe');
    f.src = b.dataset.map; f.loading = 'lazy'; f.title = 'Map of Gohar head office'; f.style.cssText = 'width:100%;height:100%;border:0;position:absolute;inset:0';
    b.parentElement.appendChild(f); b.remove();
  }));

  /* ---------- Page transitions ---------- */
  const curtain = $('.curtain');
  const internal = (a) => a.host === location.host && a.protocol === location.protocol && !a.hash && !a.target && !a.hasAttribute('download') && /\.html($|\?)|\/$/.test(a.pathname + a.search) && a.href !== location.href;
  if (curtain && !reduce) {
    d.addEventListener('click', (e) => {
      const a = e.target.closest('a'); if (!a || e.metaKey || e.ctrlKey || e.shiftKey || !internal(a)) return;
      e.preventDefault();
      store.set('gohar-transition', '1');
      gsap.timeline({ onComplete: () => { location.href = a.href; } })
        .set(curtain, { yPercent: 100, transform: 'translateY(100%)' })
        .to(curtain, { yPercent: 0, y: 0, transform: 'translateY(0%)', duration: 0.8, ease: 'expo.inOut' })
        .to($('img', curtain), { opacity: 1, duration: 0.3 }, '-=0.2');
    });
    addEventListener('pageshow', (e) => { if (e.persisted) gsap.set(curtain, { transform: 'translateY(100%)' }); });
  }

  /* ---------- Boot sequence ---------- */
  const start = () => {
    root.classList.add('loaded');
    heroIntro(); reveals(); film(); hscroll(); marquees(); floaters();
    ScrollTrigger.refresh();
  };
  const loader = $('.loader');
  const fromTransition = store.get('gohar-transition') === '1';
  store.set('gohar-transition', '0');

  if (fromTransition && curtain && !reduce) {
    loader && loader.remove();
    gsap.set(curtain, { transform: 'translateY(0%)' }); gsap.set($('img', curtain), { opacity: 1 });
    gsap.timeline({ delay: 0.15 })
      .to($('img', curtain), { opacity: 0, duration: 0.3 })
      .to(curtain, { transform: 'translateY(-100%)', duration: 1, ease: 'expo.inOut' }, 0.1)
      .add(start, 0.45);
  } else if (loader && !store.get('gohar-seen') && !reduce) {
    store.set('gohar-seen', '1');
    const n = $('.loader__count', loader), o = { v: 0 };
    gsap.timeline()
      .to('.loader__logo', { clipPath: 'inset(0 0% 0 0)', duration: 1.4, ease: 'expo.inOut' })
      .to('.loader__bar i', { scaleX: 1, duration: 1.6, ease: 'power2.inOut' }, 0.2)
      .to(o, { v: 100, duration: 1.6, ease: 'power2.inOut', onUpdate: () => { n.textContent = String(Math.round(o.v)).padStart(3, '0'); } }, 0.2)
      .to('.loader__inner', { opacity: 0, y: -20, duration: 0.5 }, '+=0.15')
      .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '-=0.1')
      .add(start, '-=0.7')
      .add(() => loader.remove());
  } else {
    loader && loader.remove();
    start();
  }
  addEventListener('load', () => ScrollTrigger.refresh());
  $$('[data-year]').forEach((y) => { y.textContent = new Date().getFullYear(); });
})();
