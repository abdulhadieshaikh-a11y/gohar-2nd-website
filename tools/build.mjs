// Builds every HTML page from tools/data.mjs (+ stories.mjs, images.mjs).  Run: npm run build
import fs from 'node:fs';
import path from 'node:path';
import { company as C, heroMedia, aboutMedia, values, categories, projects, stories, faqs } from './data.mjs';
import { images } from './images.mjs';

/* ---------------------------------------------------------------- helpers */
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (s = '') => String(s).replace(/<[^>]+>/g, '');
const pad = (n) => String(n).padStart(2, '0');
const lines = (arr) => arr.map((l) => `<span class="line"><span>${l}</span></span>`).join('');
const ARR = `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>`;
const NE = `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>`;
const CHEV = `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`;
const SEARCH = `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`;
const WA_ICON = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg>`;
const PLAY = `<svg viewBox="0 0 24 24" aria-hidden="true"><path class="i-pause" d="M8 5h3v14H8zM13 5h3v14h-3z" fill="currentColor"/><path class="i-play" d="M8 5v14l11-7z" fill="currentColor"/></svg>`;

const catLabel = (p) => p.categoryLabel || categories[p.category].label;
const locOf = (p) => `${p.area}${p.city !== p.area ? ', ' + p.city : ''}`;
const bySlug = (s) => projects.find((p) => p.slug === s);
const waLink = (msg) => `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(msg)}`;
const WA_DEFAULT = waLink('Hi, I’m interested in Gohar Group’s projects. Please share the available options, prices, and payment plans.');
const mapsQ = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
const catCount = Object.fromEntries(Object.keys(categories).map((k) => [k, projects.filter((p) => p.category === k).length]));
const karachiAreas = [...new Set(projects.filter((p) => p.city === 'Karachi').map((p) => p.area))];
const featured = projects.filter((p) => p.featured);
const USE_ENDPOINT = !!C.formEndpoint;

/* ---------- image dimensions (for width/height attributes → no layout shift) ---------- */
const dimCache = {};
function dims(file) {
  if (dimCache[file]) return dimCache[file];
  let w = 0, h = 0;
  try {
    const b = fs.readFileSync(file);
    if (b[0] === 0xff && b[1] === 0xd8) { // JPEG: find SOFn
      let i = 2;
      while (i < b.length) {
        if (b[i] !== 0xff) { i++; continue; }
        const m = b[i + 1], len = b.readUInt16BE(i + 2);
        if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) { h = b.readUInt16BE(i + 5); w = b.readUInt16BE(i + 7); break; }
        i += 2 + len;
      }
    } else if (b.toString('ascii', 0, 4) === 'RIFF') { // WebP
      const t = b.toString('ascii', 12, 16);
      if (t === 'VP8 ') { w = b.readUInt16LE(26) & 0x3fff; h = b.readUInt16LE(28) & 0x3fff; }
      else if (t === 'VP8L') { const n = b.readUInt32LE(21); w = (n & 0x3fff) + 1; h = ((n >> 14) & 0x3fff) + 1; }
      else if (t === 'VP8X') { w = 1 + b.readUIntLE(24, 3); h = 1 + b.readUIntLE(27, 3); }
    } else if (b.toString('ascii', 1, 4) === 'PNG') { w = b.readUInt32BE(16); h = b.readUInt32BE(20); }
  } catch {}
  return (dimCache[file] = [w || 1600, h || 900]);
}
const imgMeta = (p) => images[p] || ['', 'Image'];

/* ---------- image usage tracking (avoid repeating the same photo on a page) ---------- */
const usage = {}; let curPage = '';
const track = (p, role) => { (usage[curPage] ||= []).push([p, role]); };

/* <img> with responsive WebP srcset (made by tools/optimize-images.mjs) */
function pic(r, p, { alt, sizes = '100vw', cls = '', eager = false, role = 'image', attrs = '' } = {}) {
  track(p, role);
  const file = `assets/img/${p}`;
  const [w, h] = dims(file);
  const dir = path.dirname(p), base = path.basename(p).replace(/\.\w+$/, '');
  const set = [800, 1600].filter((x) => x < w && fs.existsSync(`assets/img/${dir}/_w/${base}-${x}.webp`))
    .map((x) => `${r}assets/img/${dir}/_w/${base}-${x}.webp ${x}w`);
  set.push(`${r}${file} ${w}w`);
  const a = alt ?? imgMeta(p)[0];
  return `<img${cls ? ` class="${cls}"` : ''} src="${r}${file}" srcset="${set.join(', ')}" sizes="${sizes}" width="${w}" height="${h}" alt="${esc(a)}"${eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'} ${attrs}>`;
}

/* Media component: a still/poster that is always there, plus (optionally) real footage or a photographic
   motion piece that the script loads only when needed. Real footage → "Film"; motion → "Photographic preview". */
function media(r, { video = '', videoMobile = '', videoPoster = '', motion = '', poster = '', still, alt, cls = '', eager = false, mode = 'ambient', label = true, sizes = '100vw', role = 'media', chapters } = {}) {
  const kind = video ? 'film' : motion ? 'motion' : 'still';
  const stillHtml = still ? pic(r, still, { alt, eager, sizes, role, cls: 'mb__still' })
    : `<img class="mb__still" src="${r}${videoPoster || poster}" alt="${esc(alt || '')}"${eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}>`;
  let vid = '';
  if (kind === 'film' && mode === 'player') {
    vid = `<video class="mb__video" controls playsinline preload="none" poster="${r}${videoPoster || poster}" data-film><source src="${/^https?:/.test(video) ? video : r + video}" type="video/mp4">Your browser can’t play this film. <a href="${/^https?:/.test(video) ? video : r + video}">Download it</a>.</video>`;
  } else if (kind !== 'still') {
    const src = kind === 'film' ? (/^https?:/.test(video) ? video : r + video) : r + motion;
    vid = `<video class="mb__video" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1" data-src="${src}"${videoMobile ? ` data-src-mobile="${r}${videoMobile}"` : ''}${eager ? ' data-eager' : ''}></video>`;
  }
  const stillKind = still ? imgMeta(still)[1] : 'Architectural render';
  const lab = !label ? '' : kind === 'film' ? `<span class="mb__label" data-label>Film</span>`
    : kind === 'motion' ? `<span class="mb__label" data-label title="Animated from official renders and photographs. This is not video footage.">Photographic preview</span>`
    : `<span class="mb__label">${stillKind}</span>`;
  return `<div class="mb mb--${kind} ${cls}" data-media="${kind}" data-mode="${mode}" data-still-label="${esc(stillKind)}"${chapters ? ` data-chapters="${esc(JSON.stringify(chapters))}"` : ''}>${stillHtml}${vid}${lab}</div>`;
}
const projMedia = (r, p, o = {}) => media(r, { ...p.media, alt: o.alt, ...o, still: `${p.slug}/${o.still || p.hero}` });

/* ------------------------------------------------------------- layout */
const NAV = [['index.html', 'Home'], ['about.html', 'About'], ['projects.html', 'Projects'], ['calculator.html', 'Calculator'], ['stories.html', 'Gohar Stories'], ['careers.html', 'Careers'], ['contact.html', 'Contact']];

function layout({ r = '', file, title, desc, body, theme = 'dark', image = 'gohar-gateway/exterior.webp', tone = '', preload = '' }) {
  const img = (p) => `${r}assets/img/${p}`;
  const cur = (h) => (h === file || (h === 'projects.html' && file.startsWith('projects/')) || (h === 'stories.html' && file.startsWith('stories/')) ? ' aria-current="page"' : '');
  const ddItems = Object.keys(categories).map((k) => `<div class="dd__group"><span class="dd__cat">${categories[k].label}</span>${projects.filter((p) => p.category === k).map((p) =>
    `<a href="${r}projects/${p.slug}.html" data-preview="${r}assets/img/${p.slug}/_w/${p.card.replace(/\.\w+$/, '')}-800.webp" data-loc="${esc(locOf(p))}"><span>${p.name}</span><small>${p.area}</small></a>`).join('')}</div>`).join('');
  const navHtml = NAV.map(([h, l]) => h === 'projects.html'
    ? `<div class="nav__dd" data-dd><a class="nav__a" href="${r}${h}"${cur(h)}><span class="roll" data-t="${l}"><span>${l}</span></span></a><button class="nav__ddbtn" type="button" aria-expanded="false" aria-controls="dd-projects" aria-label="Show all projects">${CHEV}</button>
      <div class="dd" id="dd-projects"><div class="dd__in">
        <div class="dd__list">${ddItems}</div>
        <div class="dd__side"><div class="dd__img"><img src="${r}assets/img/${featured[0].slug}/_w/${featured[0].card.replace(/\.\w+$/, '')}-800.webp" alt="" loading="lazy"></div><p class="dd__cap">${featured[0].name} · ${featured[0].area}</p>
          <a class="btn btn--sm" href="${r}projects.html">All ${projects.length} projects ${ARR}</a></div>
      </div></div></div>`
    : `<a class="nav__a" href="${r}${h}"${cur(h)}><span class="roll" data-t="${l}"><span>${l}</span></span></a>`).join('');
  const mProjects = projects.map((p) => `<a href="${r}projects/${p.slug}.html">${p.name}<small>${p.area}</small></a>`).join('');
  const mLinks = NAV.map(([h, l], i) => h === 'projects.html'
    ? `<div class="mm__item"><a class="mm__a" href="${r}${h}"><small>${pad(i + 1)}</small>${l}</a><button class="mm__more" type="button" aria-expanded="false" aria-controls="mm-projects" aria-label="Show all projects">${CHEV}</button></div><div class="mm__sub" id="mm-projects" hidden>${mProjects}</div>`
    : `<div class="mm__item"><a class="mm__a" href="${r}${h}"><small>${pad(i + 1)}</small>${l}</a></div>`).join('');

  return `<!doctype html>
<html lang="en" class="js" data-root="${r}" data-assistant="${esc(C.assistantEndpoint || '')}" data-wa="${C.whatsapp}" data-email="${C.email}" data-endpoint="${esc(C.formEndpoint || '')}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#11100c">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${C.name}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${img(image)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${img(image)}">
<link rel="icon" href="${r}assets/img/brand/favicon.png">
${preload}<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Open+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${r}assets/css/site.css">
<script>try{if(!sessionStorage.getItem('gohar-pl')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('pl-on')}catch(e){}</script>
<script>document.documentElement.classList.add('js-ready');setTimeout(function(){if(!window.__goharBoot)document.documentElement.classList.remove('js-ready')},4000)</script>
</head>
<body class="hd-${theme}"${tone ? ` style="--tone:${tone}"` : ''}>
<a class="skip" href="#main">Skip to main content</a>
<div class="pl" aria-hidden="true"><div class="pl__in"><img class="pl__logo" src="${img('brand/gohar-logo-light-trim.png')}" alt=""><p class="pl__tag">Where relationships come first</p><div class="pl__bar"><i></i></div><span class="pl__n">00</span></div><i class="pl__p pl__p--a"></i><i class="pl__p pl__p--b"></i></div>
<div class="curtain" aria-hidden="true"><img src="${img('brand/gohar-logo-light-trim.png')}" alt=""></div>

<header class="hd">
  <div class="wrap hd__in">
    <a class="logo" href="${r}index.html" aria-label="Gohar Group of Companies, home">
      <img class="logo--light" src="${img('brand/gohar-logo-light-trim.png')}" alt="Gohar Group of Companies" width="1748" height="556">
      <img class="logo--dark" src="${img('brand/gohar-logo-dark-trim.png')}" alt="" width="1748" height="556">
    </a>
    <nav class="nav" aria-label="Main">${navHtml}</nav>
    <div class="hd__cta">
      <a class="btn btn--visit" href="${r}site-visit.html">Schedule a Site Visit</a>
      <button class="menu-btn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mm"><span class="menu-btn__t">Menu</span><i><span></span><span></span></i></button>
    </div>
  </div>
</header>
<div class="mm" id="mm" aria-label="Menu" hidden>
  <div class="mm__in">
    <nav class="mm__links" aria-label="Mobile">${mLinks}</nav>
    <a class="btn btn--red mm__cta" href="${r}site-visit.html">Schedule a Site Visit ${ARR}</a>
    <div class="mm__foot"><a href="${C.phoneHref}">${C.phone}</a><a href="mailto:${C.email}">${C.email}</a><span>${C.hours}</span></div>
  </div>
</div>

<main id="main">
${body}
</main>

<footer class="ft">
  <div class="ft__hero">
    <div class="ft__media">${media(r, { video: 'assets/video/stock/footer.mp4', videoPoster: 'assets/video/stock/footer.jpg', alt: '', label: false, role: 'footer' })}</div>
    <div class="ft__shade"></div>
    <div class="wrap ft__cta">
      <p class="eyebrow eyebrow--light">Start a conversation</p>
      <h2 class="ft__big split-lines">${lines(['Let’s find your', '<em>next address.</em>'])}</h2>
      <div class="ft__actions" data-fade>
        <a class="btn btn--red" href="${r}site-visit.html">Schedule a Site Visit ${ARR}</a>
        <a class="btn btn--light" href="${WA_DEFAULT}" target="_blank" rel="noopener">WhatsApp our team</a>
        <a class="btn btn--line-light" href="${C.phoneHref}">Call ${C.phone}</a>
      </div>
    </div>
  </div>
  <div class="ft__marquee" aria-hidden="true"><div class="ft__mtrack">${`<span>Gohar Group of Companies</span><i>✦</i><span class="o">Where relationships come first</span><i>✦</i>`.repeat(4)}</div></div>
  <svg class="ft__lines" viewBox="0 0 1600 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0 119.5H1600M40 119.5V40h220v79.5M260 70h180v49.5M440 20h140v99.5M580 55h260v64.5M840 8h120v111.5M960 48h300v71.5M1260 30h160v89.5M1420 64h140v55.5"/></svg>
  <div class="wrap">
    <div class="ft__top">
      <div class="ft__brand">
        <img class="ft__logo" src="${img('brand/gohar-logo-light-trim.png')}" alt="Gohar Group of Companies" width="1748" height="556" loading="lazy">
        <p class="ft__statement">Where relationships <em>come first.</em></p>
        <p class="ft__about">${C.intro}</p>
        <div class="btns"><a class="btn btn--light" href="${r}contact.html">Send an enquiry ${ARR}</a></div>
      </div>
      <div class="ft__cols">
        <div><h2 class="ft__h">Explore</h2><ul>${NAV.map(([h, l]) => `<li><a href="${r}${h}">${l}</a></li>`).join('')}<li><a href="${r}site-visit.html">Schedule a Site Visit</a></li></ul></div>
        <div><h2 class="ft__h">Developments</h2><ul>${projects.map((p) => `<li><a href="${r}projects/${p.slug}.html">${p.name}</a></li>`).join('')}</ul></div>
        <div><h2 class="ft__h">Head office</h2><ul>
          <li><a href="${C.mapUrl}" target="_blank" rel="noopener">${C.office}</a></li>
          <li><a href="${C.phoneHref}">${C.phone}</a> <span class="muted">(UAN)</span></li>
          <li><a href="mailto:${C.email}">${C.email}</a></li>
          <li><a href="${WA_DEFAULT}" target="_blank" rel="noopener">WhatsApp our team</a></li>
          <li class="muted">${C.hours}<br>${C.closed}</li>
        </ul></div>
      </div>
    </div>
    <div class="ft__word" aria-hidden="true">${'Gohar'.split('').map((ch) => `<span><b>${ch}</b></span>`).join('')}<em>Group of Companies</em></div>
    <div class="ft__bot">
      <span>© <span data-year>2026</span> ${C.name}</span>
      <span class="muted">Renders are artist’s impressions. Photographic previews are animated from official stills.${heroMedia.stock ? ' Background video footage is licensed stock for demonstration and does not show Gohar developments.' : ''}</span>
      <button class="to-top" type="button" data-top>Back to top ↑</button>
    </div>
  </div>
</footer>
<a class="wa" href="${WA_DEFAULT}" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">${WA_ICON}</a>

<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
<script src="https://unpkg.com/lenis@1.1.13/dist/lenis.min.js" defer></script>
<script src="${r}assets/js/site.js" defer></script>
<script src="${r}assets/js/motion.js" defer></script>
<script src="${r}assets/js/assistant.js" defer></script>
</body>
</html>
`;
}

/* ------------------------------------------------------- shared blocks */
const eyebrow = (n, t, cls = '') => `<p class="eyebrow ${cls}">${n ? `<span class="num">(${n})</span>` : ''}${t}</p>`;
const crumbs = (r, items) => `<nav class="crumbs" aria-label="Breadcrumb" data-fade><a href="${r}index.html">Home</a>${items.map(([h, l]) => h ? `<span>/</span><a href="${r}${h}">${l}</a>` : `<span>/</span><span aria-current="page">${l}</span>`).join('')}</nav>`;
const steps = (cls = '') => `<ol class="steps ${cls}" data-stagger>
  <li><b>01</b><span>Choose a project, a preferred day and a time window</span></li>
  <li><b>02</b><span>Our team calls to confirm availability</span></li>
  <li><b>03</b><span>Meet us on site at the agreed time</span></li>
</ol>`;

/* dark band that closes most pages */
const visitBand = (r, { title = ['Walk the site.', '<em>Meet the people</em> behind it.'], img = 'gohar-villas/gate-approach.webp', project = '', red = false } = {}) => `
<section class="band ${red ? 'band--red' : ''}">
  <div class="wrap band__in">
    <div class="band__text">
      ${eyebrow('', 'Schedule a site visit', 'eyebrow--light')}
      <h2 class="h1 split-lines">${lines(title)}</h2>
      <p class="band__p" data-fade>Choose a development and a time that suits you. This sends a request: our team calls you to confirm before your visit.</p>
      ${steps('steps--light')}
      <div class="btns" data-fade><a class="btn ${red ? 'btn--light' : 'btn--red'}" href="${r}site-visit.html${project ? '?project=' + project : ''}">Schedule a Site Visit ${ARR}</a><a class="btn btn--line-light" href="${WA_DEFAULT}" target="_blank" rel="noopener">WhatsApp our team</a></div>
    </div>
    <div class="band__media reveal-img">${pic(r, img, { sizes: '(min-width: 900px) 45vw, 100vw', role: 'band' })}<span class="mb__label">${imgMeta(img)[1]}</span></div>
  </div>
</section>`;

/* ---------- forms ---------- */
const projectOptions = (sel = '', blank = 'No specific project') => `<option value="">${blank}</option>` + projects.map((p) => `<option value="${p.slug}"${p.slug === sel ? ' selected' : ''}>${p.name} · ${p.area}</option>`).join('');
const CITIES = ['Karachi', 'Hyderabad', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Overseas', 'Other'];
const cityOptions = `<option value="">Select a city</option>` + CITIES.map((c) => `<option>${c}</option>`).join('');
const field = (id, label, input, err = '', full = false) => `<div class="field${full ? ' full' : ''}"><label for="${id}">${label}</label>${input}${err ? `<span class="err" id="${id}-err">${err}</span>` : ''}</div>`;
const formActions = (primaryWa = 'Send via WhatsApp') => `
  <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
  <div class="form__actions">
    <button class="btn btn--red" type="submit" data-label-endpoint="Send request">${USE_ENDPOINT ? 'Send request' : primaryWa} ${ARR}</button>
    ${USE_ENDPOINT ? '' : `<button class="link-u" type="button" data-mail>Or send by email</button>`}
  </div>
  <div class="form__status" role="status" aria-live="polite" tabindex="-1"></div>
  <p class="form__note">${USE_ENDPOINT ? 'Your details go straight to the Gohar team.' : 'Nothing is stored on this website: the button opens WhatsApp (or your email app) with your message written out, ready for you to send.'}</p>`;

const enquiryForm = (sel = '', id = 'f') => `
<form class="form" data-form="enquiry" novalidate>
  ${field(`${id}-type`, 'Enquiry type *', `<select id="${id}-type" name="type" required><option>Project or sales enquiry</option><option>Schedule a site visit</option><option>General enquiry</option><option>Careers</option><option>Other</option></select>`, 'Please choose a type.')}
  ${field(`${id}-project`, 'Project of interest', `<select id="${id}-project" name="project">${projectOptions(sel)}</select>`)}
  ${field(`${id}-name`, 'Full name *', `<input id="${id}-name" name="name" autocomplete="name" required>`, 'Please enter your name.')}
  ${field(`${id}-email`, 'Email *', `<input id="${id}-email" name="email" type="email" autocomplete="email" required>`, 'Please enter a valid email address.')}
  ${field(`${id}-phone`, 'Phone *', `<input id="${id}-phone" name="phone" type="tel" autocomplete="tel" required>`, 'Please enter a phone number (at least 7 digits).')}
  ${field(`${id}-city`, 'City (optional)', `<select id="${id}-city" name="city">${cityOptions}</select>`)}
  ${field(`${id}-msg`, 'Message *', `<textarea id="${id}-msg" name="message" maxlength="2000" rows="4" required></textarea>`, 'Please write a short message.', true)}
  <div class="field full check"><label><input type="checkbox" name="consent" required><span>I agree that Gohar Group of Companies may use these details to respond to my enquiry. *</span></label><span class="err">Please confirm to continue.</span></div>
  ${formActions()}
</form>`;

/* ======================================================= HOME */
function home() {
  const r = '';
  curPage = 'index.html';
  const filmHero = !!heroMedia.video;
  const chapters = heroMedia.frames.map(([f, s], i) => { const p = bySlug(s); return { t: +(i * (heroMedia.clip - heroMedia.fade) + (i ? heroMedia.fade / 2 : 0)).toFixed(2), name: p.name, loc: locOf(p), kind: imgMeta(f)[1], href: `projects/${s}.html` }; });
  const c0 = chapters[0];
  const ticker = projects.map((p) => `<a href="projects/${p.slug}.html">${p.name} <small>${p.area}</small></a><i aria-hidden="true">✦</i>`).join('');
  const heroBar = filmHero ? `
    <button class="ctrl" type="button" data-media-toggle aria-pressed="false" aria-label="Pause video">${PLAY}<span data-ctrl-text>Pause</span></button>
    <div class="hero__ticker" aria-label="Gohar developments"><div class="hero__track">${ticker}${ticker.replace(/<a /g, '<a tabindex="-1" aria-hidden="true" ')}</div></div>
    <span class="hero__scroll" aria-hidden="true"><i></i>Scroll</span>` : `
    <button class="ctrl" type="button" data-media-toggle aria-pressed="false" aria-label="Pause photographic preview">${PLAY}<span data-ctrl-text>Pause</span></button>
    <a class="hero__now" href="${c0.href}" data-now><span class="hero__idx" data-now-idx>01 / ${pad(chapters.length)}</span><span class="hero__name" data-now-name>${c0.name}</span><span class="hero__meta" data-now-meta>${c0.loc} · ${c0.kind}</span></a>
    <div class="hero__ticks" aria-hidden="true">${chapters.map(() => '<i><b></b></i>').join('')}</div>
    <span class="hero__note" title="Animated from official renders and photographs. This is not video footage.">Photographic preview</span>
    <span class="hero__scroll" aria-hidden="true"><i></i>Scroll</span>`;
  // running photo strips: every project's own photos
  const reelImg = (p, f) => { const b = f.replace(/\.\w+$/, ''); const w = `assets/img/${p.slug}/_w/${b}-800.webp`; return fs.existsSync(w) ? w : `assets/img/${p.slug}/${f}`; };
  const reelRow = (list) => { const items = list.map(([p, f]) => `<a class="reel__item" href="projects/${p.slug}.html"><img src="${reelImg(p, f)}" alt="${esc(p.name)}" loading="lazy" decoding="async"><span>${p.name}<small>${p.area}</small></span></a>`).join(''); return items + items.replace(/<a class="reel__item"/g, '<a class="reel__item" tabindex="-1" aria-hidden="true"').replace(/alt="[^"]*"/g, 'alt=""'); };
  const row1 = projects.map((p) => [p, p.hero]);
  const row2 = projects.flatMap((p) => (p.gallery || []).filter((g) => g !== p.hero).slice(0, 1).map((g) => [p, g]));
  const cleanHero = `
<section class="hero hero--film hero--clean" data-hero aria-label="Gohar Group of Companies">
  <div class="hero__media">${media(r, { video: heroMedia.video, videoMobile: heroMedia.videoMobile, videoPoster: heroMedia.videoPoster, alt: '', eager: true, label: false, role: 'hero' })}</div>
  <div class="hero__shade"></div>
  <div class="hero__center" data-intro>
    <p class="hero__kicker" data-fade><i></i>Gohar Group of Companies</p>
    <h1 class="hero__tag split-lines">${lines(['Where relationships', '<em>come first.</em>'])}</h1>
    <p class="hero__sub" data-fade>Homes, shopping centres and communities across Karachi &amp; Hyderabad</p>
  </div>
  <div class="hero__boxes">
    <a class="hbox" href="projects.html" data-hbox>
      <span class="hbox__img hbox__img--cycle">${featured.map((p) => `<img src="assets/img/${p.slug}/_w/${p.hero.replace(/\.\w+$/, '')}-800.webp" alt="">`).join('')}</span>
      <span class="hbox__txt"><small>${projects.length} developments</small><b>See our projects</b></span>
      <span class="hbox__arr">${ARR}</span>
    </a>
    <a class="hbox hbox--red" href="site-visit.html" data-hbox>
      <span class="hbox__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg></span>
      <span class="hbox__txt"><small>Karachi &amp; Hyderabad</small><b>Schedule a site visit</b></span>
      <span class="hbox__arr">${ARR}</span>
    </a>
  </div>
  <div class="hero__mini">
    <button class="ctrl ctrl--ghost" type="button" data-media-toggle aria-pressed="false" aria-label="Pause video">${PLAY}<span data-ctrl-text>Pause</span></button>
    <a class="hero__cue" href="#intro" aria-label="Scroll to content"><i></i></a>
  </div>
</section>`;
  const legacyHero = () => `
<section class="hero" data-hero>
  <div class="hero__media">${media(r, { ...heroMedia, video: '', still: heroMedia.frames[0][0], alt: '', eager: true, label: false, role: 'hero', chapters })}</div>
  <div class="hero__shade"></div>
  <div class="wrap hero__in" data-intro>
    <p class="eyebrow eyebrow--light" data-fade>Gohar Group of Companies <span class="sep"></span> Karachi &amp; Hyderabad</p>
    <h1 class="hero__title split-lines">${lines(['Where relationships', '<em>come first.</em>'])}</h1>
    <div class="hero__row">
      <p class="hero__lede" data-fade>Residential towers, shopping centres, mixed-use landmarks and gated communities, built around the families and businesses who live and work in them.</p>
      <div class="btns" data-fade><a class="btn btn--light" href="projects.html">Explore Projects ${ARR}</a><a class="btn btn--red" href="site-visit.html">Schedule a Site Visit</a></div>
    </div>
  </div>
  <div class="wrap hero__bar" data-fade>${heroBar}
  </div>
</section>`;
  const body = `${filmHero ? cleanHero : legacyHero()}

<section class="intro section" id="intro">
  <div class="wrap intro__grid">
    <div class="intro__text">
      ${filmHero ? eyebrow('', 'Gohar Group of Companies · Karachi &amp; Hyderabad') : eyebrow('01', 'About Gohar Group')}
      <h2 class="h1 split-lines">${lines(['Homes, workplaces', 'and communities,', '<em>built on trust.</em>'])}</h2>
      <p class="lead" data-fade>${C.intro}</p>
      ${filmHero ? `<div class="btns intro__btns" data-fade><a class="btn btn--dark" href="projects.html">Explore Projects ${ARR}</a><a class="btn btn--red" href="site-visit.html">Schedule a Site Visit</a></div>` : ''}
      <a class="link-u" href="about.html" data-fade>Discover our story ${ARR}</a>
    </div>
    <figure class="intro__fig reveal-img" data-parallax-wrap>${pic(r, 'gohar-residencia-shopping-mall/render-001.webp', { sizes: '(min-width: 900px) 34vw, 90vw', role: 'intro', alt: 'Gohar Residencia, architectural render', attrs: 'data-parallax' })}<figcaption>Gohar Residencia, Gulshan-e-Maymar · Architectural render</figcaption></figure>
  </div>
  <div class="wrap">
    <dl class="stats" data-stagger>
      <div><dt>Developments in the Gohar portfolio</dt><dd data-count="10">10</dd></div>
      <div><dt>Cities: Karachi and Hyderabad</dt><dd data-count="2">2</dd></div>
      <div><dt>Apartments at Gohar Residencia</dt><dd data-count="1033">1,033</dd></div>
      <div><dt>Shops at Gohar Green Corner</dt><dd data-count="411">411</dd></div>
    </dl>
  </div>
</section>

<section class="reel" aria-label="Gohar developments in pictures">
  <div class="reel__row"><div class="reel__track">${reelRow(row1)}</div></div>
  <div class="reel__row reel__row--rev"><div class="reel__track">${reelRow(row2)}</div></div>
</section>

<section class="sig" aria-labelledby="sig-h">
  <div class="wrap sig__head">
    <div>
      ${eyebrow('02', 'Signature developments', 'eyebrow--light')}
      <h2 class="sig__title split-lines" id="sig-h">${lines(['Architecture with', 'a <em>sense of place</em>'])}</h2>
    </div>
    <div class="sig__aside" data-fade>
      <p>${featured.length} landmark projects, from a golf-course residence in Karachi to a mixed-use address in Hyderabad.</p>
      <div class="sig__nav" aria-hidden="true"><span data-sig-cur>01</span><i><b data-sig-bar></b></i><span>${pad(featured.length)}</span></div>
    </div>
  </div>
  <div class="wrap">
    <div class="sig__deck" data-sig>
      ${featured.map((p, i) => {
        const b = p.hero.replace(/\.\w+$/, '');
        const img = fs.existsSync(`assets/img/${p.slug}/_w/${b}-1600.webp`) ? `assets/img/${p.slug}/_w/${b}-1600.webp` : `assets/img/${p.slug}/${p.hero}`;
        return `<article class="sig__p${i ? '' : ' is-on'}" data-sig-p="${i}" tabindex="0" aria-label="${esc(p.name)}">
        <div class="sig__img"><img src="${img}" alt="${esc(imgMeta(`${p.slug}/${p.hero}`)[0])}" loading="lazy"></div>
        <div class="sig__shade"></div>
        <div class="sig__closed" aria-hidden="true"><span class="sig__n">${pad(i + 1)}</span><span class="sig__v">${p.name}</span><span class="sig__plus">+</span></div>
        <div class="sig__open">
          <div class="sig__top"><span class="sig__n">${pad(i + 1)} / ${pad(featured.length)}</span><span class="tag">${catLabel(p)}</span>${p.status ? `<span class="tag tag--red">${p.status}</span>` : ''}</div>
          <div class="sig__body">
            <p class="sig__loc">${locOf(p)}</p>
            <h3 class="sig__name"><a href="projects/${p.slug}.html">${p.name}</a></h3>
            <p class="sig__sum">${p.summary}</p>
            <dl class="sig__facts">${p.keyStats.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
            <div class="btns"><a class="btn btn--light" href="projects/${p.slug}.html">Discover the project ${ARR}</a><a class="btn btn--line-light" href="site-visit.html?project=${p.slug}">Schedule a visit</a></div>
          </div>
        </div>
      </article>`; }).join('')}
    </div>
  </div>
</section>

<section class="section index-sec" aria-labelledby="idx-h">
  <div class="wrap">
    <div class="shead">
      <div>${eyebrow('03', 'The portfolio')}<h2 class="h1 split-lines" id="idx-h">${lines(['Explore every', '<em>development</em>'])}</h2></div>
      <div class="shead__aside" data-fade>
        <p>Ten developments across Karachi and Hyderabad. Hover a name to preview it; select it to open the project.</p>
        <div class="chips">${Object.entries(categories).map(([k, c]) => `<a class="chip" href="projects.html?category=${k}">${c.label} <sup>${catCount[k]}</sup></a>`).join('')}</div>
      </div>
    </div>
    <div class="xcities">
      ${[['Karachi', projects.filter((p) => p.city === 'Karachi'), 'kn-gohar-green-city/view-2.jpg', karachiAreas.map((a) => `<a href="projects.html?location=${encodeURIComponent(a)}">${a}</a>`).join('')],
         ['Hyderabad', projects.filter((p) => p.city === 'Hyderabad'), 'gohar-gateway/courtyard.jpg', `<a href="projects/gohar-gateway.html">Gohar Gateway</a><a href="projects/gohar-gateway.html">Main Hyderabad Bypass Road</a>`]]
        .map(([city, list, img, areas], k) => `
      <article class="xcity${k ? ' xcity--sm' : ''}">
        <div class="xcity__img">${pic(r, img, { sizes: k ? '(min-width: 900px) 34vw, 100vw' : '(min-width: 900px) 60vw, 100vw', role: 'city', alt: '' })}</div>
        <div class="xcity__shade"></div>
        <div class="xcity__in">
          <span class="xcity__n" data-count="${list.length}">${pad(list.length)}</span>
          <div class="xcity__body">
            <p class="xcity__k">${list.length === 1 ? 'Development' : 'Developments'} in</p>
            <h3 class="xcity__t">${city}</h3>
            <p class="xcity__areas">${areas}</p>
          </div>
        </div>
      </article>`).join('')}
    </div>
    <div class="xidx" data-xidx>
      <ol class="xlist">
        ${projects.map((p, i) => `<li><a class="xrow${i ? '' : ' is-on'}" href="projects/${p.slug}.html" data-x="${i}">
          <span class="xrow__n">${pad(i + 1)}</span>
          <span class="xrow__thumb"><img src="assets/img/${p.slug}/_w/${p.card.replace(/\.\w+$/, '')}-800.webp" alt="" loading="lazy" width="160" height="120"></span>
          <span class="xrow__t">${p.name}</span>
          <span class="xrow__m"><b>${locOf(p)}</b><i>${catLabel(p)}${p.status ? ` · ${p.status}` : ''}</i></span>
          <span class="xrow__a">${NE}</span></a></li>`).join('')}
      </ol>
      <div class="xview" aria-hidden="true">
        <div class="xview__frame">
          ${projects.map((p, i) => `<figure class="xview__fig${i ? '' : ' is-on'}" data-xv="${i}">
            <img src="assets/img/${p.slug}/_w/${p.hero.replace(/\.\w+$/, '')}-1600.webp" alt="" loading="lazy">
            <figcaption>
              <span class="xview__tag">${catLabel(p)}${p.status ? ` · ${p.status}` : ''}</span>
              <b>${p.name}</b><small>${locOf(p)}</small>
              <dl>${p.keyStats.slice(0, 3).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
            </figcaption>
          </figure>`).join('')}
          <span class="xview__count"><b data-xcount>01</b> / ${pad(projects.length)}</span>
        </div>
      </div>
    </div>
    <div class="center" data-fade><a class="btn btn--dark" href="projects.html">Search &amp; filter all projects ${ARR}</a></div>
  </div>
</section>

${filmHero ? `<section class="vband" aria-labelledby="vband-h">
  <div class="vband__media">${media(r, { video: 'assets/video/stock/band.mp4', videoPoster: 'assets/video/stock/band.jpg', alt: '', label: false, role: 'band' })}</div>
  <div class="vband__shade"></div>
  <div class="wrap vband__in">
    ${eyebrow('', 'The Gohar promise', 'eyebrow--light')}
    <h2 class="vband__title split-lines" id="vband-h">${lines(['Built with clarity.', '<em>Served with intent.</em>'])}</h2>
    <p class="vband__lede" data-fade>We design every interaction around long-term trust, from the first site visit to the day you receive your keys.</p>
    <div class="btns" data-fade><a class="btn btn--light" href="site-visit.html">Schedule a Site Visit ${ARR}</a><a class="btn btn--line-light" href="about.html">Our story</a></div>
  </div>
  <div class="vband__marquee" aria-hidden="true"><div class="vband__track">${'<span>Residential</span><i>✦</i><span>Commercial</span><i>✦</i><span>Mixed use</span><i>✦</i><span>Communities</span><i>✦</i>'.repeat(3)}</div></div>
</section>` : ''}

<section class="purp" aria-labelledby="purp-h">
  <div class="purp__media">
    <div class="purp__img" data-purp-img>${pic(r, 'gohar-golf-vista/exterior.webp', { sizes: '(min-width: 900px) 50vw, 100vw', role: 'purpose', alt: 'Gohar Golf Vista, architectural render' })}</div>
    <div class="purp__badge"><b>${projects.length}</b><span>Developments<br>Karachi &amp; Hyderabad</span></div>
    <p class="purp__cap">Gohar Golf Vista · Gulshan-e-Roomi · Architectural render</p>
  </div>
  <div class="purp__content">
    <p class="eyebrow eyebrow--light"><span class="num">(04)</span>Our purpose</p>
    <h2 class="purp__q" id="purp-h" data-words>To build safe, legally sound communities where trust is foundational and relationships <em>always come first.</em></h2>
    <div class="purp__rule" aria-hidden="true"><i></i></div>
    <p class="purp__promise">${C.promise}</p>
    <ol class="purp__vals">
      ${values.map(([t, d], i) => `<li class="purp__v"><span class="purp__vn">${pad(i + 1)}</span><h3 class="purp__vt">${t}</h3><p>${d}</p></li>`).join('')}
    </ol>
    <a class="btn btn--light" href="about.html">Discover our story ${ARR}</a>
  </div>
</section>

<section class="section section--paper">
  <div class="wrap">
    <div class="shead">
      <div>${eyebrow('04', 'Gohar Stories')}<h2 class="h1 split-lines">${lines(['News, project stories', '&amp; <em>buying guides</em>'])}</h2></div>
      <a class="btn btn--line" href="stories.html" data-fade>All stories ${ARR}</a>
    </div>
    ${storiesBlock(r)}
  </div>
</section>

${filmHero ? '' : visitBand(r, { red: true, img: '141-broadway-heights/terrace.jpg' })}`;
  return layout({ file: 'index.html', title: 'Gohar Group of Companies | Real Estate Developer in Karachi & Hyderabad', desc: 'Residential towers, shopping centres, mixed-use landmarks and gated communities in Karachi and Hyderabad. Where relationships come first.', body,
    preload: filmHero ? `<link rel="preload" as="image" href="${heroMedia.videoPoster}">\n` : `<link rel="preload" as="image" href="assets/img/${heroMedia.frames[0][0].replace(/([^/]+)\.\w+$/, '_w/$1-1600.webp')}" imagesrcset="assets/img/${heroMedia.frames[0][0].replace(/([^/]+)\.\w+$/, '_w/$1-800.webp')} 800w, assets/img/${heroMedia.frames[0][0].replace(/([^/]+)\.\w+$/, '_w/$1-1600.webp')} 1600w" imagesizes="100vw">\n` });
}

const storyHref = (r, s) => `${r}stories/${s.slug}.html`;
function storiesBlock(r) {
  const [f, ...rest] = stories;
  return `<div class="stories">
    <a class="story-feat" href="${storyHref(r, f)}" data-cursor="Read">
      <div class="story-feat__media reveal-img">${pic(r, f.img, { sizes: '(min-width: 900px) 55vw, 100vw', role: 'story' })}</div>
      <div class="story-meta"><b>${f.tag}</b><span>${f.date}</span><span>${f.read}</span></div>
      <h3 class="h3">${f.title}</h3><p>${f.text}</p><span class="link-u">Read story ${ARR}</span>
    </a>
    <ul class="story-list" data-stagger>
      ${rest.map((s) => `<li><a class="story-item" href="${storyHref(r, s)}"><span class="story-item__media">${pic(r, s.img, { sizes: '180px', alt: '', role: 'story' })}</span><span><span class="story-meta"><b>${s.tag}</b><span>${s.date}</span></span><span class="story-item__t">${s.title}</span></span></a></li>`).join('')}
    </ul>
  </div>`;
}

/* ======================================================= PROJECTS */
const SHAPES = ['feature', 'tall', 'wide', 'third', 'third', 'third', 'half', 'half', 'feature-r'];
function projectCard(r, p, i) {
  const shape = SHAPES[i % SHAPES.length];
  const kind = imgMeta(`${p.slug}/${p.card}`)[1];
  return `<article class="pc pc--${shape}${p.featured ? ' pc--sig' : ''}" data-shape="${shape}" data-cat="${p.category}" data-search="${esc((p.name + ' ' + p.area + ' ' + p.city + ' ' + catLabel(p)).toLowerCase())}">
    <a class="pc__link" href="${r}projects/${p.slug}.html" data-cursor="View">
      <div class="pc__media">
        ${pic(r, `${p.slug}/${p.card}`, { sizes: shape.startsWith('feature') ? '(min-width: 900px) 62vw, 100vw' : '(min-width: 900px) 45vw, 100vw', role: 'card' })}
        ${p.media.motion ? `<video class="pc__video" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1" data-hover data-src="${r}${p.media.motion}"></video>` : ''}
        <span class="mb__label" data-card-label data-still="${kind}"${p.media.motion ? ' data-motion="Photographic preview"' : ''}>${kind}</span>
        <div class="pc__tags">${p.featured ? '<span class="tag tag--sig">Signature</span>' : ''}<span class="tag">${catLabel(p)}</span>${p.status ? `<span class="tag tag--red">${p.status}</span>` : ''}</div>
      </div>
      <div class="pc__info">
        <span class="pc__n">${pad(i + 1)}</span>
        <div><h2 class="pc__t">${p.name}</h2><p class="pc__l">${locOf(p)}</p></div>
        <p class="pc__sum">${p.summary}</p>
        <dl class="pc__facts">${p.keyStats.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
        <span class="pc__go">View project ${ARR}</span>
      </div>
    </a>
  </article>`;
}
function projectsPage() {
  const r = '';
  curPage = 'projects.html';
  const reel = ['gohar-towers/exterior.jpg', 'kn-gohar-green-city/view-3.jpg', 'kn-gohar-green-city/photo-street.jpg', 'kn-gohar-green-city/photo-lawn.jpg', 'kn-gohar-green-city/photo-facade.jpg', 'kn-gohar-green-city/view-2.jpg', 'kn-gohar-green-city/view-1.jpg'];
  const body = `
<section class="lhead lhead--projects">
  <div class="wrap" data-intro>
    ${crumbs(r, [['', 'Projects']])}
    <div class="lhead__grid">
      <h1 class="d1 split-lines">${lines(['Every Gohar', '<em>development</em>'])}</h1>
      <div class="lhead__aside" data-fade>
        <p class="lead">Homes, shopping centres, offices and communities. Filter by type, search by name or area, and open any project.</p>
        <dl class="mini-stats"><div><dt>Developments</dt><dd>${projects.length}</dd></div><div><dt>Karachi</dt><dd>${projects.filter((p) => p.city === 'Karachi').length}</dd></div><div><dt>Hyderabad</dt><dd>${projects.filter((p) => p.city === 'Hyderabad').length}</dd></div></dl>
      </div>
    </div>
  </div>
</section>
<div class="filters">
  <div class="wrap filters__in">
    <div class="ftabs" role="group" aria-label="Filter by type">
      <button class="ftab is-on" type="button" data-cat="all" aria-pressed="true">All <sup>${projects.length}</sup></button>
      ${Object.entries(categories).map(([k, c]) => `<button class="ftab" type="button" data-cat="${k}" aria-pressed="false">${c.label} <sup>${catCount[k]}</sup></button>`).join('')}
    </div>
    <label class="search">${SEARCH}<span class="sr">Search projects</span><input id="search" type="search" placeholder="Search by name or area" autocomplete="off"></label>
  </div>
</div>
<section class="section section--tight pf-sec">
  <div class="wrap">
    <p class="pf-count" aria-live="polite"><span data-count-out>${projects.length}</span> developments<span data-loc-out></span> <button class="link-u" type="button" data-clear hidden>Clear filters</button></p>
    <div class="pf">${projects.map((p, i) => projectCard(r, p, i)).join('')}</div>
    <div class="empty" hidden><h2 class="h3">No developments match.</h2><p>Try another name or area, or <button class="link-u" type="button" data-clear>show all ${projects.length} projects</button>.</p></div>
  </div>
</section>
<section class="section reel-sec">
  <div class="wrap shead">
    <div>${eyebrow('', 'Completed &amp; lived in', 'eyebrow--light')}<h2 class="h1 split-lines">${lines(['Photographs from', 'the <em>ground</em>'])}</h2></div>
    <p data-fade>Most images on this site are architectural renders. These are photographs of completed Gohar developments: Gohar Towers in Gulshan-e-Iqbal and KN Gohar Green City near Malir. Drag to explore.</p>
  </div>
  <div class="reel" data-drag>${reel.map((f) => { const s = f.split('/')[0]; const p = bySlug(s); return `<a class="reel__item" href="projects/${s}.html" draggable="false"><div class="reel__media">${pic(r, f, { sizes: '(min-width: 900px) 34vw, 80vw', role: 'reel', attrs: 'draggable="false"' })}</div><span class="reel__cap"><b>${p.name}</b> ${p.area} · Photograph</span></a>`; }).join('')}</div>
</section>
${visitBand(r, { img: 'gohar-golf-vista/balconies.webp' })}`;
  return layout({ file: 'projects.html', title: 'Projects | Gohar Group of Companies', desc: 'All 10 Gohar developments across Karachi and Hyderabad: residential, commercial, mixed-use and gated communities.', body, theme: 'light' });
}

/* ======================================================= PROJECT DETAIL */
function projectPage(p, i) {
  const r = '../';
  curPage = `projects/${p.slug}.html`;
  const im = (f) => `${r}assets/img/${p.slug}/${f}`;
  const next = projects[(i + 1) % projects.length];
  const loc = locOf(p);
  const used = new Set([p.hero]);
  const pick = () => { const f = p.gallery.find((g) => !used.has(g)); if (f) used.add(f); return f; };
  const msg = `Hi, I’m interested in ${p.name}. Please share availability, prices and payment plans.`;
  const sections = [['overview', 'Overview'], p.media.video && ['film', 'Film'], p.layouts && ['layouts', 'Layouts'], p.plans && ['plans', 'Plans'], p.amenities && ['amenities', 'Amenities'], ['gallery', 'Gallery'], p.payment && ['payment', 'Payment plans'], ['location', 'Location'], ['enquire', 'Enquire']].filter(Boolean);
  const fact4 = [['Category', catLabel(p)], ['Location', loc], ...(p.status ? [['Status', p.status]] : []), ...p.keyStats].slice(0, 4);
  const titleLines = p.name.length > 22 ? p.name.split(' & ').map((s, k) => (k ? '&amp; ' : '') + s) : [p.name];
  const tags = `<div class="tags" data-fade><span class="tag">${catLabel(p)}</span>${p.featured ? '<span class="tag tag--sig">Signature</span>' : ''}${p.status ? `<span class="tag tag--red">${p.status}</span>` : ''}</div>`;
  const ctas = (light) => `<div class="btns" data-fade><a class="btn btn--red" href="${r}site-visit.html?project=${p.slug}">Schedule a Site Visit ${ARR}</a><a class="btn ${light ? 'btn--line' : 'btn--line-light'}" href="#enquire">Enquire</a></div>`;
  const factbar = (cls = '') => `<dl class="factbar ${cls}" data-fade>${fact4.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
  const heroMediaHtml = (o = {}) => projMedia(r, p, { eager: true, alt: imgMeta(`${p.slug}/${p.hero}`)[0], role: 'hero', ...o });

  let hero, theme = 'dark';
  if (p.look === 'cinema') {
    hero = `<section class="phero phero--cinema" data-hero>
  <div class="phero__media">${heroMediaHtml({ cls: 'mb--cover' })}</div>
  <div class="hero__shade"></div>
  <div class="wrap phero__in" data-intro>
    ${crumbs(r, [['projects.html', 'Projects'], ['', p.name]])}
    ${tags}
    <h1 class="phero__title split-lines">${lines(titleLines)}</h1>
    <div class="phero__row"><p class="lead" data-fade>${p.lead}</p>${ctas(false)}</div>
    ${factbar()}
  </div>
</section>`;
  } else if (p.look === 'split') {
    theme = 'light';
    hero = `<section class="phero phero--split" data-hero>
  <div class="wrap phero__grid" data-intro>
    <div class="phero__text">
      ${crumbs(r, [['projects.html', 'Projects'], ['', p.name]])}
      ${tags}
      <h1 class="phero__title split-lines">${lines(titleLines)}</h1>
      <p class="lead" data-fade>${p.lead}</p>
      ${ctas(true)}
      ${factbar('factbar--light')}
    </div>
    <div class="phero__frame reveal-img">${heroMediaHtml({ sizes: '(min-width: 900px) 50vw, 100vw' })}</div>
  </div>
</section>`;
  } else {
    hero = `<section class="phero phero--frame" data-hero>
  <div class="wrap phero__in" data-intro>
    ${crumbs(r, [['projects.html', 'Projects'], ['', p.name]])}
    ${tags}
    <div class="phero__row phero__row--top"><h1 class="phero__title split-lines">${lines(titleLines)}</h1><div><p class="lead" data-fade>${p.lead}</p>${ctas(false)}</div></div>
  </div>
  <div class="phero__expand" data-expand><div class="phero__expand-in">${heroMediaHtml({ cls: 'mb--cover' })}</div></div>
  <div class="wrap">${factbar()}</div>
</section>`;
  }

  const breakImg = p.gallery.length >= 3 ? pick() : null;
  const locImg = pick();

  const filmSec = p.media.video ? `
<section class="section film-sec" id="film">
  <div class="wrap">
    <div class="shead"><div>${eyebrow('', 'Film', 'eyebrow--light')}<h2 class="h2">${p.name} <em>on film</em></h2></div></div>
    <div class="film-frame">${media(r, { ...p.media, mode: 'player', alt: '' })}</div>
  </div>
</section>` : '';

  const galleryHtml = p.gallery.length >= 3
    ? `<div class="gal" data-drag>${p.gallery.map((f, k) => { const [w, h] = dims(`assets/img/${p.slug}/${f}`); const [alt, kind] = imgMeta(`${p.slug}/${f}`); return `<button class="gal__item${h > w ? ' gal__item--tall' : ''}" type="button" data-full="${im(f)}" data-set="gallery" data-alt="${esc(alt)}" data-kind="${kind}" data-cursor="Open" draggable="false"><span class="gal__media">${pic(r, `${p.slug}/${f}`, { sizes: '(min-width: 900px) 46vw, 85vw', role: 'gallery', attrs: 'draggable="false"' })}</span><span class="gal__cap"><b>${pad(k + 1)}</b>${kind}</span></button>`; }).join('')}</div>`
    : `<div class="wrap gal-solo">${p.gallery.map((f, k) => { const [alt, kind] = imgMeta(`${p.slug}/${f}`); return `<button class="gal-solo__item reveal-img" type="button" data-full="${im(f)}" data-set="gallery" data-alt="${esc(alt)}" data-kind="${kind}" data-cursor="Open">${pic(r, `${p.slug}/${f}`, { sizes: '(min-width: 900px) 70vw, 100vw', role: 'gallery' })}<span class="mb__label">${kind}</span></button>`; }).join('')}</div>`;

  const body = `
${hero}

<nav class="subnav" aria-label="On this page"><div class="wrap subnav__in">
  <span class="subnav__name">${p.name}</span>
  <div class="subnav__links">${sections.map(([id, l]) => `<a href="#${id}">${l}</a>`).join('')}</div>
  <a class="btn btn--sm btn--red" href="${r}site-visit.html?project=${p.slug}">Visit</a>
</div></nav>

<section class="section" id="overview">
  <div class="wrap">
    ${eyebrow('01', 'Project story')}
    <h2 class="d2 split-lines ov__h">${lines([p.headline])}</h2>
    <div class="ov">
      <div class="prose" data-fade>${p.story.map((s, k) => `<p${k === 0 ? ' class="prose__first"' : ''}>${s}</p>`).join('')}</div>
      <div class="ov__side" data-fade="0.12">
        <dl class="kstats">${p.keyStats.map(([k, v]) => `<div><dd>${v}</dd><dt>${k}</dt></div>`).join('')}</dl>
        <h3 class="h4">Specifications</h3>
        <dl class="specs">${p.facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
        <div class="btns"><a class="btn btn--dark" href="#enquire">Request current pricing ${ARR}</a>${p.brochure ? `<a class="btn btn--line" href="${p.brochure[0]}" target="_blank" rel="noopener">${p.brochure[1]} ${NE}</a>` : ''}</div>
      </div>
    </div>
  </div>
</section>

${breakImg ? `<figure class="break" data-parallax-wrap>${pic(r, `${p.slug}/${breakImg}`, { sizes: '100vw', role: 'break', attrs: 'data-parallax' })}<figcaption class="wrap">${esc(imgMeta(`${p.slug}/${breakImg}`)[0])} · ${imgMeta(`${p.slug}/${breakImg}`)[1]}</figcaption></figure>` : ''}
${filmSec}

${p.layouts ? `
<section class="section" id="layouts">
  <div class="wrap">
    <div class="shead"><div>${eyebrow('02', 'Layouts')}<h2 class="h1 split-lines">${lines(['Homes &amp; <em>types</em>'])}</h2></div><p data-fade>Contact our team for detailed layouts and current availability.</p></div>
    <ol class="layouts" data-stagger>${p.layouts.map(([t, d], k) => `<li><b>${pad(k + 1)}</b><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol>
  </div>
</section>` : ''}

${p.plans ? `
<section class="section section--paper" id="plans">
  <div class="wrap">
    <div class="shead"><div>${eyebrow('', 'Plans')}<h2 class="h1 split-lines">${lines(['Floor plans &amp; <em>masterplans</em>'])}</h2></div><p data-fade>From the official project material. Select a plan to view it full screen. Layouts may change; ask our team for the latest plans.</p></div>
    <div class="plans" data-stagger>${p.plans.map(([f, l]) => `<button type="button" data-full="${im(f)}" data-set="plans" data-alt="${esc(imgMeta(`${p.slug}/${f}`)[0] || l)}" data-kind="${imgMeta(`${p.slug}/${f}`)[1]}" data-cursor="Open"><span class="plans__media">${pic(r, `${p.slug}/${f}`, { sizes: '(min-width: 900px) 30vw, 90vw', role: 'plan', alt: imgMeta(`${p.slug}/${f}`)[0] || l })}</span><span class="plans__l">${l}</span></button>`).join('')}</div>
  </div>
</section>` : ''}

${p.amenities ? `
<section class="section section--tone" id="amenities">
  <div class="wrap">
    <div class="shead"><div>${eyebrow('', 'Amenities', 'eyebrow--light')}<h2 class="h1 split-lines">${lines(['Shared spaces', '&amp; <em>facilities</em>'])}</h2></div></div>
    <ul class="amen" data-stagger>${p.amenities.map((a, k) => `<li><b>${pad(k + 1)}</b>${a}</li>`).join('')}</ul>
  </div>
</section>` : ''}

<section class="section gal-sec" id="gallery">
  <div class="wrap shead"><div>${eyebrow('', 'Gallery')}<h2 class="h1 split-lines">${lines([`Inside <em>${p.name}</em>`])}</h2></div><p data-fade>${p.gallery.length} official image${p.gallery.length > 1 ? 's' : ''}${p.gallery.length >= 3 ? '. Drag to explore, select to open' : ''}. Renders are artist’s impressions and may differ from the completed building.</p></div>
  ${galleryHtml}
</section>

${p.payment ? `
<section class="section section--paper" id="payment">
  <div class="wrap">
    <div class="shead"><div>${eyebrow('', 'Payment plans')}<h2 class="h1 split-lines">${lines(['Published prices', '&amp; <em>instalments</em>'])}</h2></div><p data-fade>${p.payment.terms}</p></div>
    <div class="table-wrap" data-fade><table class="ptable"><thead><tr><th scope="col">Type</th><th scope="col">Size</th><th scope="col">Total</th><th scope="col">Schedule</th></tr></thead><tbody>
      ${p.payment.rows.map(([t, s, pr, sc]) => `<tr><th scope="row" data-l="Type">${t}</th><td data-l="Size">${s}</td><td class="price" data-l="Total">${pr}</td><td class="sched" data-l="Schedule">${sc}</td></tr>`).join('')}
    </tbody></table></div>
    <p class="note">As published on the official Gohar website (read on 22 October 2026). Prices and terms can change: please confirm current figures and availability with our sales team before booking.</p>
    <div class="btns"><a class="btn btn--dark" href="#enquire">Confirm current pricing ${ARR}</a><a class="btn btn--line" href="${waLink(msg)}" target="_blank" rel="noopener">Ask on WhatsApp</a></div>
  </div>
</section>` : ''}

<section class="section" id="location">
  <div class="wrap loc${locImg ? '' : ' loc--solo'}">
    <div>
      ${eyebrow('', 'Location')}
      <h2 class="h1 split-lines">${lines([loc])}</h2>
      <p class="lead" data-fade>${p.address}</p>
      <ul class="chips chips--static" data-stagger>${p.nearby.map((n) => `<li class="chip">${n}</li>`).join('')}</ul>
      <div class="btns" data-fade><a class="btn btn--dark" href="${mapsQ(p.address)}" target="_blank" rel="noopener">Get directions ${NE}</a></div>
    </div>
    ${locImg ? `<figure class="loc__fig reveal-img">${pic(r, `${p.slug}/${locImg}`, { sizes: '(min-width: 900px) 45vw, 100vw', role: 'location' })}<figcaption>${imgMeta(`${p.slug}/${locImg}`)[1]}</figcaption></figure>` : ''}
  </div>
</section>

<section class="section section--tone visit-tone">
  <div class="wrap visit-tone__in">
    <div>${eyebrow('', 'Schedule a site visit', 'eyebrow--light')}<h2 class="d2 split-lines">${lines([`See ${p.name}`, '<em>in person.</em>'])}</h2></div>
    <div>${steps('steps--light')}<div class="btns" data-fade><a class="btn btn--red" href="${r}site-visit.html?project=${p.slug}">Schedule a Site Visit ${ARR}</a><a class="btn btn--line-light" href="${waLink(msg)}" target="_blank" rel="noopener">WhatsApp our team</a></div></div>
  </div>
</section>

<section class="section" id="enquire">
  <div class="wrap form-wrap">
    <div>
      ${eyebrow('', 'Enquire')}
      <h2 class="h1 split-lines">${lines(['Enquire about', `<em>${p.name}</em>`])}</h2>
      <p class="lead" data-fade>Ask about availability, current pricing or payment plans. Our team will contact you during office hours.</p>
      <dl class="specs" data-fade>
        <div><dt>Telephone</dt><dd><a href="${C.phoneHref}">${C.phone}</a></dd></div>
        <div><dt>Email</dt><dd><a href="mailto:${C.email}">${C.email}</a></dd></div>
        <div><dt>Office hours</dt><dd>${C.hours}<br>${C.closed}</dd></div>
      </dl>
    </div>
    <div data-fade="0.12">${enquiryForm(p.slug)}</div>
  </div>
</section>

<section class="plan-strip">
  <div class="wrap plan-strip__in">
    <div class="plan-strip__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M8 18h2M12 18h2M16 15v3"/></svg></div>
    <div class="plan-strip__txt"><p class="eyebrow">Plan your payments</p><h2 class="plan-strip__t">What would ${p.name} cost <em>each month?</em></h2><p>Try the Gohar instalment plan or bank financing, set your down payment and tenure, and see a full month-by-month schedule.</p></div>
    <a class="btn btn--red" href="../calculator.html?project=${p.slug}">Open the calculator ${ARR}</a>
  </div>
</section>

<a class="next" href="${next.slug}.html" style="--tone:${next.tone}">
  <span class="next__media">${pic(r, `${next.slug}/${next.card}`, { sizes: '100vw', alt: '', role: 'next' })}</span>
  <span class="wrap next__in"><span class="eyebrow eyebrow--light">Next project</span><span class="next__t">${next.name}</span><span class="next__l">${locOf(next)} ${ARR}</span></span>
</a>
${lightbox()}`;
  return layout({ r, file: `projects/${p.slug}.html`, title: `${p.name} | ${loc} | Gohar Group of Companies`, desc: p.summary, body, theme, tone: p.tone, image: `${p.slug}/${p.hero}` });
}
const lightbox = () => `<div class="lb" role="dialog" aria-modal="true" aria-label="Image viewer" hidden><figure class="lb__fig"><img alt=""><figcaption class="lb__cap"></figcaption></figure><button class="lb__btn lb__close" type="button" aria-label="Close">✕</button><button class="lb__btn lb__prev" type="button" aria-label="Previous image">←</button><button class="lb__btn lb__next" type="button" aria-label="Next image">→</button><div class="lb__count"></div></div>`;

/* ======================================================= ABOUT */
function about() {
  const r = '';
  curPage = 'about.html';
  const resi = bySlug('gohar-residencia-shopping-mall'), corner = bySlug('gohar-green-corner-shopping-center');
  const statOf = (p, k) => (p.keyStats.find(([a]) => a === k) || [])[1] || '';
  const num = (s) => +String(s).replace(/[^\d]/g, '') || 0;
  const stats = [
    [projects.length, 'Developments', 'across our portfolio'],
    [2, 'Cities', 'Karachi & Hyderabad'],
    [num(statOf(resi, 'Apartments')), 'Apartments', `at ${resi.name.split(' &')[0]}`],
    [num(statOf(corner, 'Shops')), 'Shops', `at ${corner.name.split(' &')[0]}`],
  ];
  const tabs = [
    { k: 'Our purpose', t: C.purpose, img: 'kn-gohar-green-city/view-1.jpg' },
    { k: 'Our promise', t: C.promise, img: '141-broadway-heights/dusk.jpg' },
    { k: 'Our approach', t: 'Transparent communication from the first enquiry to handover, and a relationship with every family that continues long after the keys are handed over.', img: 'gohar-villas/gate.jpg' },
  ];
  const valImgs = ['gohar-golf-vista/balconies.webp', 'gohar-villas/park.jpg', '141-broadway-heights/living.jpg', 'kn-gohar-green-city/photo-club-house.jpg'];
  const trio = [
    { t: 'Homes', h: 'Apartments for families', d: 'Completed towers in Gulshan-e-Iqbal, golf-course views beside ACACIA, and spacious 3 and 4-room apartments in DHA Phase 1.', a: '141-broadway-heights/rooftop-pool.jpg', ps: ['gohar-towers', 'gohar-golf-vista', '141-broadway-heights'] },
    { t: 'Commerce', h: 'Places to do business', d: 'Shops and offices next to Rabi Centre on Tariq Road, 411 shops on Korangi Link Road, and retail podiums beneath our residential towers.', a: 'gohar-rabi-center/day-view.jpg', ps: ['gohar-rabi-center', 'gohar-green-corner-shopping-center', 'gohar-complex-shopping-mall'] },
    { t: 'Communities', h: 'Neighbourhoods, not just buildings', d: 'A gated, master-planned community near Malir, plot communities in three phases at Taiser Town, and Gohar Gateway’s homes, retail, banquet and dining in Hyderabad.', a: 'kn-gohar-green-city/photo-street.jpg', ps: ['kn-gohar-green-city', 'gohar-villas', 'gohar-gateway'] },
  ];
  const steps = [
    ['Explore', 'Browse the portfolio or tell us what you need: a family home, a shop, an office or a plot.'],
    ['Speak with our team', 'Ask about current pricing, payment plans and availability by phone, email or the enquiry form.'],
    ['Visit', 'Arrange a site visit and see the location, the plans and the progress for yourself.'],
    ['Stay connected', 'Transparent communication from booking to handover, and a relationship that continues after it.'],
  ];
  const body = `
<section class="ab-hero" data-hero>
  <div class="ab-hero__media">${media(r, { ...aboutMedia, still: aboutMedia.frames[0][0], alt: '', eager: true, cls: 'mb--cover', role: 'hero', label: false })}</div>
  <div class="ab-hero__shade"></div>
  <div class="wrap ab-hero__in" data-intro>
    ${crumbs(r, [['', 'About']])}
    <p class="hero__kicker" data-fade><i></i>About Gohar Group of Companies</p>
    <h1 class="ab-hero__t split-lines">${lines(['We build for', 'the <em>long term.</em>'])}</h1>
    <p class="ab-hero__lede" data-fade>${C.intro}</p>
  </div>
  <div class="wrap ab-stats" aria-label="Gohar at a glance">
    ${stats.map(([n, k, s]) => `<div class="ab-stat"><b data-count="${n}">${n.toLocaleString('en-US')}</b><span>${k}</span><small>${s}</small></div>`).join('')}
  </div>
</section>

<section class="ab-who">
  <div class="wrap ab-who__grid">
    <div class="ab-who__text">
      ${eyebrow('01', 'Who we are')}
      <p class="ab-big" data-words>A Karachi-based group for real estate development, construction and building, creating homes, workplaces and communities where the relationship with every family continues <em>long after handover.</em></p>
      <div class="btns" data-fade><a class="btn btn--dark" href="projects.html">Explore our projects ${ARR}</a><a class="btn btn--line" href="contact.html">Speak with our team</a></div>
    </div>
    <div class="ab-collage">
      <figure class="ab-collage__a reveal-img" data-parallax-wrap>${pic(r, 'gohar-gateway/courtyard.jpg', { sizes: '(min-width: 900px) 34vw, 80vw', role: 'about', attrs: 'data-parallax' })}</figure>
      <figure class="ab-collage__b reveal-img">${pic(r, '141-broadway-heights/terrace.jpg', { sizes: '(min-width: 900px) 22vw, 50vw', role: 'about' })}</figure>
      <p class="ab-collage__cap">Gohar Gateway, Hyderabad · 141 Broadway Heights, Karachi</p>
    </div>
  </div>
  <div class="wrap">
    <dl class="ab-facts">
      <div><dt>Head office</dt><dd>${C.officeShort}</dd></div>
      <div><dt>Cities</dt><dd>Karachi &amp; Hyderabad</dd></div>
      <div><dt>Portfolio</dt><dd>${projects.length} developments</dd></div>
      <div><dt>What we build</dt><dd>Residential · Commercial · Mixed use · Communities</dd></div>
      <div><dt>Office hours</dt><dd>${C.hours}</dd></div>
    </dl>
  </div>
</section>

<section class="ab-tabs" aria-labelledby="ab-tabs-h">
  <div class="wrap ab-tabs__grid" data-abtabs>
    <div class="ab-tabs__left">
      <p class="eyebrow eyebrow--light"><span class="num">(02)</span>What guides us</p>
      <h2 class="ab-tabs__h" id="ab-tabs-h">Purpose, promise <em>&amp; approach</em></h2>
      <div class="ab-tabs__list" role="tablist" aria-label="What guides us">
        ${tabs.map((t, i) => `<button class="ab-tab${i ? '' : ' is-on'}" type="button" role="tab" data-abtab="${i}"><span class="ab-tab__n">${pad(i + 1)}</span><span class="ab-tab__k">${t.k}</span><i class="ab-tab__bar"><b></b></i></button>`).join('')}
      </div>
    </div>
    <div class="ab-tabs__stage">
      ${tabs.map((t, i) => `<div class="ab-pane${i ? '' : ' is-on'}" data-abpane="${i}" role="tabpanel">
        <div class="ab-pane__img">${pic(r, t.img, { sizes: '(min-width: 900px) 50vw, 100vw', role: 'about-tab', alt: '' })}</div>
        <div class="ab-pane__txt"><span class="ab-pane__k">${t.k}</span><p>${t.t}</p></div>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="ab-vals" id="values" aria-labelledby="ab-vals-h">
  <div class="wrap ab-vals__grid">
    <div class="ab-vals__sticky">
      ${eyebrow('03', 'Our foundation')}
      <h2 class="ab-vals__h" id="ab-vals-h">The values behind <em>every</em> development</h2>
      <div class="ab-vals__count" aria-hidden="true"><b data-vcount>01</b><span>/ ${pad(values.length)}</span></div>
      <div class="ab-vals__track" aria-hidden="true"><i data-vbar></i></div>
    </div>
    <ol class="ab-vals__list">
      ${values.map(([t, d], i) => `<li class="ab-val${i ? '' : ' is-on'}" data-val="${i}">
        <figure class="ab-val__img">${pic(r, valImgs[i], { sizes: '(min-width: 900px) 46vw, 100vw', role: 'value', alt: '' })}</figure>
        <div class="ab-val__txt"><span class="ab-val__n">${pad(i + 1)}</span><h3 class="ab-val__t">${t}</h3><p>${d}</p></div>
      </li>`).join('')}
    </ol>
  </div>
</section>

<section class="ab-build" aria-labelledby="ab-build-h">
  <div class="wrap">
    <div class="ab-build__head">${eyebrow('04', 'What we build')}<h2 class="ab-build__h" id="ab-build-h">Homes, workplaces <em>and communities</em></h2></div>
    <div class="ab-build__grid" data-abbuild>
      <div class="ab-build__list">
        ${trio.map((t, i) => `<button class="ab-cat${i ? '' : ' is-on'}" type="button" data-abcat="${i}">
          <span class="ab-cat__top"><span class="ab-cat__n">${pad(i + 1)}</span><span class="ab-cat__t">${t.t}</span><span class="ab-cat__plus" aria-hidden="true">+</span></span>
          <span class="ab-cat__more"><span class="ab-cat__in"><b>${t.h}</b><span>${t.d}</span></span></span>
          <i class="ab-cat__bar"><b></b></i>
        </button>`).join('')}
      </div>
      <div class="ab-build__stage">
        ${trio.map((t, i) => `<div class="ab-shot${i ? '' : ' is-on'}" data-abshot="${i}">
          ${pic(r, t.a, { sizes: '(min-width: 900px) 55vw, 100vw', role: 'build', alt: '' })}
          <div class="ab-shot__links">${t.ps.map((s) => `<a href="projects/${s}.html">${bySlug(s).name}<small>${bySlug(s).area}</small></a>`).join('')}</div>
        </div>`).join('')}
      </div>
    </div>
  </div>
</section>

<section class="ab-steps" aria-labelledby="ab-steps-h">
  <div class="wrap">
    <div class="ab-steps__head">${eyebrow('05', 'Working with us')}<h2 class="ab-steps__h" id="ab-steps-h">From first enquiry to <em>long after handover</em></h2></div>
    <ol class="ab-steps__row" data-steps>
      <i class="ab-steps__line" aria-hidden="true"><b data-stepline></b></i>
      ${steps.map(([t, d], i) => `<li class="ab-step" data-step="${i}"><span class="ab-step__dot" aria-hidden="true"></span><span class="ab-step__n">Step ${pad(i + 1)}</span><h3 class="ab-step__t">${t}</h3><p>${d}</p></li>`).join('')}
    </ol>
  </div>
</section>

${visitBand(r, { title: ['Have a question about', 'a <em>Gohar project?</em>'], img: 'kn-gohar-green-city/view-3.jpg' })}`;
  return layout({ file: 'about.html', title: 'About | Gohar Group of Companies', desc: C.intro, body, image: 'gohar-towers/exterior.jpg' });
}

/* ======================================================= STORIES */
function storiesPage() {
  const r = '';
  curPage = 'stories.html';
  const body = `
<section class="lhead">
  <div class="wrap" data-intro>
    ${crumbs(r, [['', 'Gohar Stories']])}
    <div class="lhead__grid">
      <h1 class="d1 split-lines">${lines(['Gohar', '<em>Stories</em>'])}</h1>
      <p class="lead lhead__aside" data-fade>Announcements from the group, the stories behind our developments, and practical guidance for buying property with confidence.</p>
    </div>
  </div>
</section>
<section class="section section--tight" style="padding-top:0">
  <div class="wrap">
    <a class="story-hero" href="${storyHref(r, stories[0])}" data-cursor="Read">
      <span class="story-hero__media reveal-img">${pic(r, stories[0].img, { sizes: '(min-width: 900px) 60vw, 100vw', role: 'story' })}</span>
      <span class="story-hero__body"><span class="story-meta"><b>${stories[0].tag}</b><span>${stories[0].date}</span><span>${stories[0].read}</span></span><span class="story-hero__t">${stories[0].title}</span><span class="story-hero__p">${stories[0].text}</span><span class="link-u">Read story ${ARR}</span></span>
    </a>
  </div>
</section>
<section class="section section--paper">
  <div class="wrap">
    <div class="shead"><div>${eyebrow('', 'More stories')}<h2 class="h1 split-lines">${lines(['News &amp; <em>buying guides</em>'])}</h2></div><p data-fade>${stories.length} articles published by Gohar Group of Companies, newest first.</p></div>
    <ul class="sgrid" data-stagger>
      ${stories.slice(1).map((s) => `<li><a class="scard" href="${storyHref(r, s)}" data-cursor="Read"><span class="scard__media">${pic(r, s.img, { sizes: '(min-width: 900px) 25vw, 90vw', alt: '', role: 'story' })}</span><span class="story-meta"><b>${s.tag}</b><span>${s.date}</span><span>${s.read}</span></span><span class="scard__t">${s.title}</span><span class="scard__p">${s.text}</span></a></li>`).join('')}
    </ul>
  </div>
</section>
${visitBand(r, { title: ['From story', '<em>to site.</em>'], img: 'gohar-gateway/hotel-tower.jpg' })}`;
  return layout({ file: 'stories.html', title: 'Gohar Stories | News, project stories & buying guides', desc: 'Announcements from Gohar Group, the stories behind our developments, and practical guidance for buying property.', body, theme: 'light', image: 'stories/meezan-bank-mou.jpg' });
}

function articlePage(s, i) {
  const r = '../';
  curPage = `stories/${s.slug}.html`;
  const toc = s.body.filter((b) => b[0] === 'h').map((b) => b[1]);
  const slugify = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const html = s.body.map((b) => {
    if (b[0] === 'p') return `<p>${b[1]}</p>`;
    if (b[0] === 'h') return `<h2 id="${slugify(b[1])}">${b[1]}</h2>`;
    if (b[0] === 'ul') return `<ul>${b[1].map((x) => `<li>${x}</li>`).join('')}</ul>`;
    if (b[0] === 'img') return `<figure class="art__fig reveal-img">${pic(r, b[1], { sizes: '(min-width: 900px) 60vw, 100vw', role: 'article' })}<figcaption>${b[2]} Image: Gohar Group of Companies</figcaption></figure>`;
    return '';
  }).join('\n');
  const url = `https://gohar-rcsi.vercel.app/gohar-stories/${s.slug}`;
  const others = stories.filter((x) => x !== s);
  const bodyImgs = new Set([s.img, ...s.body.filter((b) => b[0] === 'img').map((b) => b[1])]);
  const body = `
<article class="art">
  <header class="art__head">
    <div class="wrap" data-intro>
      ${crumbs(r, [['stories.html', 'Gohar Stories'], ['', s.tag]])}
      <div class="story-meta" data-fade><b>${s.tag}</b><span>${s.date}</span><span>${s.read}</span><span>By Gohar Group of Companies</span></div>
      <h1 class="art__title split-lines">${lines([s.title])}</h1>
      <p class="lead" data-fade>${s.text}</p>
    </div>
  </header>
  <figure class="art__hero wrap reveal-img">${pic(r, s.img, { sizes: '(min-width: 1500px) 1400px, 100vw', eager: true, role: 'hero' })}<figcaption>${s.caption} Image: Gohar Group of Companies</figcaption></figure>
  <div class="wrap art__grid">
    <aside class="art__side">
      ${toc.length ? `<nav class="art__toc" aria-label="In this story"><p class="eyebrow">In this story</p><ol>${toc.map((t) => `<li><a href="#${slugify(t)}">${t}</a></li>`).join('')}</ol></nav>` : ''}
      <div class="art__share"><p class="eyebrow">Share this story</p>
        <a href="https://wa.me/?text=${encodeURIComponent(s.title + ' ' + url)}" target="_blank" rel="noopener">WhatsApp</a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" rel="noopener">Facebook</a>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}" target="_blank" rel="noopener">LinkedIn</a>
        <button class="link-u" type="button" data-copy="${url}">Copy link</button>
      </div>
    </aside>
    <div class="art__body">
      <p class="art__note">${s.note}</p>
      ${html}
      <p class="art__src">Originally published by Gohar Group of Companies on ${s.date} on gohargoc.com, the group’s previous website. Images are official Gohar Group material; renders are artist’s impressions.</p>
      <a class="link-u" href="${r}stories.html">← Back to Gohar Stories</a>
    </div>
  </div>
</article>
<section class="section section--paper">
  <div class="wrap">
    <div class="shead"><div>${eyebrow('', s.projects.length > 1 ? 'Projects in this story' : 'Project in this story')}<h2 class="h1 split-lines">${lines(['Explore the <em>project' + (s.projects.length > 1 ? 's' : '') + '</em>'])}</h2></div><a class="btn btn--line" href="${r}projects.html" data-fade>All projects ${ARR}</a></div>
    <ul class="sgrid" data-stagger>${s.projects.map((slug) => { const p = bySlug(slug); return `<li><a class="scard" href="${r}projects/${slug}.html" data-cursor="View"><span class="scard__media">${pic(r, `${slug}/${bodyImgs.has(`${slug}/${p.card}`) ? p.hero : p.card}`, { sizes: '(min-width: 900px) 30vw, 90vw', alt: '', role: 'related' })}</span><span class="story-meta"><b>${catLabel(p)}</b><span>${locOf(p)}</span></span><span class="scard__t">${p.name}</span></a><a class="link-u" href="${r}site-visit.html?project=${slug}">Schedule a visit</a></li>`; }).join('')}</ul>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="shead"><div>${eyebrow('', 'Keep reading')}<h2 class="h2">Related <em>stories</em></h2></div></div>
    <ul class="sgrid" data-stagger>${others.map((o) => `<li><a class="scard" href="${o.slug}.html" data-cursor="Read"><span class="scard__media">${pic(r, o.img, { sizes: '(min-width: 900px) 30vw, 90vw', alt: '', role: 'related' })}</span><span class="story-meta"><b>${o.tag}</b><span>${o.date}</span></span><span class="scard__t">${o.title}</span></a></li>`).join('')}</ul>
  </div>
</section>
${visitBand(r, { project: s.projects.length === 1 ? s.projects[0] : '', img: 'gohar-villas/gate-approach.webp' })}`;
  return layout({ r, file: `stories/${s.slug}.html`, title: `${s.title} | Gohar Stories`, desc: s.text, body, theme: 'light', image: s.img });
}

/* ======================================================= CAREERS */
function careers() {
  const r = '';
  curPage = 'careers.html';
  const body = `
<section class="phero phero--cinema phero--short" data-hero>
  <div class="phero__media">${media(r, { still: 'gohar-golf-vista/facade-detail.webp', alt: '', eager: true, cls: 'mb--cover mb--drift', role: 'hero' })}</div>
  <div class="hero__shade"></div>
  <div class="wrap phero__in" data-intro>
    ${crumbs(r, [['', 'Careers']])}
    <p class="eyebrow eyebrow--light" data-fade>Careers at Gohar</p>
    <h1 class="phero__title split-lines">${lines(['Build what Karachi', '<em>calls home.</em>'])}</h1>
    <div class="phero__row"><p class="lead" data-fade>Join a team developing apartments, shopping centres and communities across Karachi and Hyderabad, where relationships come first: with customers and with each other.</p>
    <div class="btns" data-fade><a class="btn btn--light" href="#apply">Send your CV ${ARR}</a><a class="btn btn--line-light" href="#openings">View openings</a></div></div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="shead"><div>${eyebrow('01', 'Working at Gohar')}<h2 class="h1 split-lines">${lines(['A team shaped', 'by our <em>values</em>'])}</h2></div><p data-fade>${C.intro} We build with clarity, serve with intent, and design every interaction around long-term trust.</p></div>
    <ol class="values values--compact" data-stagger>${values.map(([t, d], i) => `<li><span class="values__n">${pad(i + 1)}</span><h3 class="h3">${t}</h3><p>${d}</p></li>`).join('')}</ol>
  </div>
</section>
<section class="section section--paper">
  <div class="wrap">
    <div class="shead"><div>${eyebrow('02', 'The work')}<h2 class="h1 split-lines">${lines(['What our teams <em>deliver</em>'])}</h2></div><p data-fade>Every role at Gohar contributes to buildings people live, shop and work in.</p></div>
    <ul class="work" data-stagger>
      ${[['Homes', 'Apartment towers and family residences.', 'gohar-golf-vista/balconies.webp'], ['Commerce', 'Shopping centres, shops and offices.', 'gohar-green-corner-shopping-center/street-view.jpg'], ['Communities', 'Gated, master-planned neighbourhoods.', 'kn-gohar-green-city/photo-garden-walk.jpg']]
        .map(([t, d, img], k) => `<li><div class="work__media">${pic(r, img, { sizes: '(min-width: 900px) 30vw, 90vw', role: 'work' })}<span class="mb__label">${imgMeta(img)[1]}</span></div><b>${pad(k + 1)}</b><h3 class="h3">${t}</h3><p>${d}</p></li>`).join('')}
    </ul>
  </div>
</section>
<section class="section" id="openings">
  <div class="wrap split2">
    <div>${eyebrow('03', 'Current openings')}<h2 class="h1 split-lines">${lines(['Opportunities', 'at <em>Gohar</em>'])}</h2></div>
    <div class="notice" data-fade><p class="eyebrow">General application</p><h3 class="h2">No open positions right now</h3><p>There are no vacancies advertised at the moment. New roles are published here as soon as they are approved. In the meantime, send us your CV and we’ll keep it on file for future opportunities.</p><a class="btn btn--dark" href="#apply">Send your CV ${ARR}</a></div>
  </div>
</section>
<section class="section section--dark">
  <div class="wrap">
    <div class="shead"><div>${eyebrow('04', 'How it works', 'eyebrow--light')}<h2 class="h1 split-lines">${lines(['The application <em>process</em>'])}</h2></div></div>
    <ol class="process process--dark" data-stagger>
      <li><b>Step 01</b><h3>Send your details</h3><p>Complete the form, then attach your CV (PDF or Word, up to 4 MB) in the email or WhatsApp chat that opens.</p></li>
      <li><b>Step 02</b><h3>We keep them on file</h3><p>Your application is reviewed by our team when a suitable role opens.</p></li>
      <li><b>Step 03</b><h3>We get in touch</h3><p>If your experience matches an opening, we’ll contact you by phone or email to discuss next steps.</p></li>
    </ol>
  </div>
</section>
<section class="section" id="apply">
  <div class="wrap form-wrap">
    <div>
      ${eyebrow('05', 'Send your CV')}
      <h2 class="h1 split-lines">${lines(['Send us', 'your <em>details</em>'])}</h2>
      <p class="lead" data-fade>Register your interest for future roles. Fields marked * are required.</p>
      <p data-fade>This website can’t receive files. When you continue, your email app (or WhatsApp) opens with your details written out: attach your CV there before you press send.</p>
      <p class="muted" data-fade>Questions about careers? Email <a class="link-u" href="mailto:${C.email}">${C.email}</a> or call <a class="link-u" href="${C.phoneHref}">${C.phone}</a>.</p>
    </div>
    <form class="form" data-form="job application" data-prefer="mail" novalidate data-fade="0.12">
      ${field('c-name', 'Full name *', '<input id="c-name" name="name" autocomplete="name" required>', 'Please enter your name.')}
      ${field('c-email', 'Email *', '<input id="c-email" name="email" type="email" autocomplete="email" required>', 'Please enter a valid email address.')}
      ${field('c-phone', 'Phone *', '<input id="c-phone" name="phone" type="tel" autocomplete="tel" required>', 'Please enter a phone number (at least 7 digits).')}
      ${field('c-city', 'City (optional)', `<select id="c-city" name="city">${cityOptions}</select>`)}
      ${field('c-role', 'Role or area of interest (optional)', '<input id="c-role" name="role">')}
      ${field('c-link', 'LinkedIn or portfolio link (optional)', '<input id="c-link" name="link" type="url" inputmode="url">')}
      ${field('c-note', 'Short note (optional)', '<textarea id="c-note" name="note" maxlength="1000" rows="4"></textarea>', '', true)}
      <div class="field full check"><label><input type="checkbox" name="consent" required><span>I agree that Gohar Group of Companies may keep my details and CV to consider me for current and future roles. *</span></label><span class="err">Please confirm to continue.</span></div>
      <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="form__actions">
        <button class="btn btn--red" type="submit">${USE_ENDPOINT ? 'Send my details' : 'Email my details'} ${ARR}</button>
        ${USE_ENDPOINT ? '' : '<button class="link-u" type="button" data-wa>Or send via WhatsApp</button>'}
      </div>
      <div class="form__status" role="status" aria-live="polite" tabindex="-1"></div>
      <p class="form__note">${USE_ENDPOINT ? 'Your details go straight to the Gohar team. Please email your CV to ' + C.email + '.' : 'Nothing is stored on this website. Remember to attach your CV before sending.'}</p>
    </form>
  </div>
</section>`;
  return layout({ file: 'careers.html', title: 'Careers | Gohar Group of Companies', desc: 'Join a team developing apartments, shopping centres and communities across Karachi and Hyderabad.', body, image: 'gohar-golf-vista/facade-detail.webp' });
}

/* ======================================================= CONTACT */
function contact() {
  const r = '';
  curPage = 'contact.html';
  const body = `
<section class="chero">
  <div class="wrap chero__grid" data-intro>
    <div class="chero__text">
      ${crumbs(r, [['', 'Contact']])}
      <h1 class="d1 split-lines">${lines(['Let’s talk about', 'your <em>next move.</em>'])}</h1>
      <p class="lead" data-fade>Ask about a project, request current pricing or arrange a site visit. Our team is available ${C.hours}.</p>
      <ul class="cways" data-stagger>
        <li><a href="${C.phoneHref}"><small>Call us (UAN)</small><strong>${C.phone}</strong>${ARR}</a></li>
        <li><a href="mailto:${C.email}"><small>Email</small><strong>${C.email}</strong>${ARR}</a></li>
        <li><a href="${WA_DEFAULT}" target="_blank" rel="noopener"><small>WhatsApp</small><strong>Chat with our team</strong>${NE}</a></li>
        <li><a href="#enquiry"><small>Write to us</small><strong>Send an enquiry</strong>${ARR}</a></li>
      </ul>
    </div>
    <div class="chero__office" data-fade="0.15">
      <div class="office">
        <div class="office__map" data-map-box>
          <svg class="office__lines" viewBox="0 0 400 300" aria-hidden="true"><path d="M0 210 400 150M0 90 400 230M120 0 200 300M300 0 260 300M0 40 400 60"/><circle cx="214" cy="178" r="7"/></svg>
          <button class="btn btn--light btn--sm" type="button" data-map="https://maps.google.com/maps?q=Gohar%20Chamber%20Shahra-e-Faisal%20Karachi&amp;output=embed">Show map ${ARR}</button>
        </div>
        <div class="office__body">
          <p class="eyebrow eyebrow--light">Head office</p>
          <address>A/2, Gohar Chamber, CC Area, Shahra-e-Faisal<br>Near Duty Free Shop, Kathiawar Society Block 7/8<br>Karachi, Pakistan</address>
          <p class="office__hours">${C.hours}<br>${C.closed}</p>
          <div class="btns"><a class="btn btn--red btn--sm" href="${C.mapUrl}" target="_blank" rel="noopener">Get directions ${NE}</a></div>
          <p class="office__note">The interactive map is provided by Google and loads only when you choose to view it.</p>
        </div>
      </div>
    </div>
  </div>
</section>
<section class="section section--paper" id="enquiry">
  <div class="wrap form-wrap">
    <div>
      ${eyebrow('', 'Send an enquiry')}
      <h2 class="h1 split-lines">${lines(['Tell us how', 'we can <em>help</em>'])}</h2>
      <p class="lead" data-fade>Fields marked * are required. We only use your details to respond to your enquiry.</p>
      <figure class="contact__fig reveal-img">${pic(r, 'gohar-villas/community-centre.jpg', { sizes: '(min-width: 900px) 38vw, 100vw', role: 'contact' })}<figcaption>Gohar Villas, Taiser Town · Architectural render</figcaption></figure>
    </div>
    <div data-fade="0.12">${enquiryForm('', 'f')}</div>
  </div>
</section>
<section class="section">
  <div class="wrap split2">
    <div>${eyebrow('', 'Questions')}<h2 class="h1 split-lines">${lines(['Frequently', '<em>asked</em>'])}</h2></div>
    <div class="faq" data-stagger>${faqs.map(([q, a]) => `<details><summary>${q}<i aria-hidden="true"></i></summary><p>${a}</p></details>`).join('')}</div>
  </div>
</section>
${visitBand(r, { title: ['Would you like to', '<em>visit a project?</em>'], img: 'gohar-villas/gate.jpg' })}`;
  return layout({ file: 'contact.html', title: 'Contact | Gohar Group of Companies', desc: 'Call +92 21 111 000 061, email info@gohargoc.com or visit Gohar Chamber, Shahra-e-Faisal, Karachi.', body, theme: 'light' });
}

/* ======================================================= SITE VISIT */
function siteVisit() {
  const r = '';
  curPage = 'site-visit.html';
  const w1600 = (p, f) => { const b = f.replace(/\.\w+$/, ''); const w = `assets/img/${p.slug}/_w/${b}-1600.webp`; return fs.existsSync(w) ? w : `assets/img/${p.slug}/${f}`; };
  const w800 = (p, f) => { const b = f.replace(/\.\w+$/, ''); const w = `assets/img/${p.slug}/_w/${b}-800.webp`; return fs.existsSync(w) ? w : `assets/img/${p.slug}/${f}`; };
  // summary card previews (the script shows the one that matches the chosen project)
  const previews = projects.map((p) => `<div class="pick" data-pick="${p.slug}" hidden><div class="pick__img"><img src="${w800(p, p.card)}" alt="" loading="lazy"></div><div class="pick__body"><span class="tag">${catLabel(p)}</span><b>${p.name}</b><span>${p.address}</span><a class="link-u" href="projects/${p.slug}.html">View project ${ARR}</a></div></div>`).join('');
  const tiles = projects.map((p, k) => `<button type="button" class="vtile" data-visit-pick="${p.slug}" data-bg="${w1600(p, p.hero)}" aria-pressed="false">
      <span class="vtile__img"><img src="${w800(p, p.card)}" alt="" loading="lazy"></span>
      <span class="vtile__n">${pad(k + 1)}</span>
      <span class="vtile__check" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span>
      <span class="vtile__txt"><b>${p.name}</b><small>${locOf(p)}</small></span>
    </button>`).join('');
  const times = ['11:00 AM – 1:00 PM', '1:00 PM – 3:00 PM', '3:00 PM – 5:00 PM', '5:00 PM – 8:00 PM'];
  const body = `
<section class="sv-hero" data-hero>
  <div class="sv-hero__bg"><img src="${w1600(featured[0], featured[0].hero)}" alt="" data-sv-bg fetchpriority="high"><img alt="" data-sv-bg2></div>
  <div class="sv-hero__shade"></div>
  <div class="wrap sv-hero__in" data-intro>
    ${crumbs(r, [['', 'Schedule a Site Visit']])}
    <p class="hero__kicker" data-fade><i></i>Private site visits · Karachi &amp; Hyderabad</p>
    <h1 class="sv-hero__t split-lines">${lines(['See a Gohar development', '<em>in person.</em>'])}</h1>
    <p class="sv-hero__lede" data-fade>Pick a development, a day and a time window. Our team calls you to confirm, then meets you on site and walks you through it.</p>
    <ol class="sv-steps" data-fade>
      <li><span>01</span><b>Choose a development</b></li>
      <li><span>02</span><b>Pick a day &amp; time</b></li>
      <li><span>03</span><b>We call to confirm</b></li>
    </ol>
  </div>
  <a class="hero__cue" href="#plan" aria-label="Start planning your visit"><i></i></a>
</section>

<section class="sv" id="plan">
  <div class="wrap sv__grid">
    <form class="sv__form" data-form="site visit request" novalidate>
      <div class="sv__step">
        <div class="sv__head"><span class="sv__num">01</span><div><p class="eyebrow">Step one</p><h2 class="sv__h">Choose a development</h2></div></div>
        <div class="vtiles">${tiles}</div>
        ${field('v-project', 'Or choose from the list *', `<select id="v-project" name="project" required>${projectOptions('', 'Choose a development')}</select>`, 'Please choose a project.', true)}
      </div>

      <div class="sv__step">
        <div class="sv__head"><span class="sv__num">02</span><div><p class="eyebrow">Step two</p><h2 class="sv__h">Pick a day &amp; time</h2></div></div>
        <div class="field full">
          <label for="v-date">Preferred day * <span class="muted">(Monday to Saturday)</span></label>
          <div class="dchips" data-days aria-label="Next available days"></div>
          <input id="v-date" name="date" type="date" required>
          <span class="err" id="v-date-err">Please choose a day (Monday to Saturday, from today).</span>
        </div>
        <div class="field full">
          <label for="v-time">Time window *</label>
          <div class="tchips" role="group" aria-label="Time window">${times.map((t) => `<button type="button" class="tchip" data-time="${t}" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>${t}</button>`).join('')}</div>
          <select id="v-time" name="time" required class="vh-select"><option value="">Choose a time</option>${times.map((t) => `<option>${t}</option>`).join('')}</select>
          <span class="err" id="v-time-err">Please choose a time window.</span>
        </div>
      </div>

      <div class="sv__step">
        <div class="sv__head"><span class="sv__num">03</span><div><p class="eyebrow">Step three</p><h2 class="sv__h">Your details</h2></div></div>
        <div class="form form--plain">
          ${field('v-name', 'Full name *', '<input id="v-name" name="name" autocomplete="name" required placeholder="Your name">', 'Please enter your name.')}
          ${field('v-phone', 'Phone *', '<input id="v-phone" name="phone" type="tel" autocomplete="tel" required placeholder="03xx xxxxxxx">', 'Please enter a phone number (at least 7 digits).')}
          ${field('v-email', 'Email (optional)', '<input id="v-email" name="email" type="email" autocomplete="email" placeholder="you@example.com">', 'Please check the email address.')}
          ${field('v-people', 'Visitors', '<select id="v-people" name="people"><option>1</option><option>2</option><option>3</option><option>4+</option></select>')}
          ${field('v-note', 'Anything we should know? (optional)', '<textarea id="v-note" name="note" maxlength="1000" rows="3" placeholder="e.g. interested in 3-bedroom apartments"></textarea>', '', true)}
          <div class="field full check"><label><input type="checkbox" name="consent" required><span>I understand this is a request and the visit is confirmed only after the team calls me. *</span></label><span class="err">Please confirm to continue.</span></div>
          ${formActions('Send request via WhatsApp')}
        </div>
      </div>
    </form>

    <aside class="sv__side">
      <div class="sv-card">
        <p class="eyebrow">Your visit</p>
        <div class="pick-wrap">
          <div class="pick pick--none" data-pick=""><div class="pick__empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg><p>Choose a development to see it here.</p></div></div>
          ${previews}
        </div>
        <dl class="sv-card__sum">
          <div><dt>Day</dt><dd data-sum="date">Not chosen yet</dd></div>
          <div><dt>Time</dt><dd data-sum="time">Not chosen yet</dd></div>
          <div><dt>Visitors</dt><dd data-sum="people">1</dd></div>
        </dl>
        <div class="sv-card__help">
          <p><b>Prefer to talk?</b> Call <a href="${C.phoneHref}">${C.phone}</a> or <a href="${WA_DEFAULT}" target="_blank" rel="noopener">WhatsApp our team</a>.</p>
          <p class="muted">${C.hours} · ${C.closed}</p>
        </div>
      </div>
    </aside>
  </div>
</section>`;
  return layout({ file: 'site-visit.html', title: 'Schedule a Site Visit | Gohar Group of Companies', desc: 'Choose a Gohar development, a preferred day and a time window. Our team calls you to confirm your visit.', body, image: '141-broadway-heights/dusk.jpg' });
}

/* ======================================================= INSTALMENT CALCULATOR */
function calculator() {
  const r = '';
  curPage = 'calculator.html';
  const yearsA = [1, 2, 3, 4, 5];
  const yearsB = [1, 2, 3, 5, 10, 15, 20];
  const chips = (list, on) => list.map((y) => `<button type="button" class="cchip${y === on ? ' is-on' : ''}" data-tenure="${y}" aria-pressed="${y === on}"><b>${y}</b><span>${y === 1 ? 'Year' : 'Years'}</span></button>`).join('');
  const body = `
<section class="calc-hero" data-hero>
  <div class="calc-hero__bg">${pic(r, '141-broadway-heights/dusk.jpg', { sizes: '100vw', alt: '', eager: true, role: 'hero' })}</div>
  <div class="calc-hero__shade"></div>
  <div class="wrap calc-hero__in" data-intro>
    ${crumbs(r, [['', 'Instalment Calculator']])}
    <p class="hero__kicker" data-fade><i></i>Plan your payments</p>
    <h1 class="calc-hero__t split-lines">${lines(['Instalment', '<em>Calculator</em>'])}</h1>
    <p class="calc-hero__lede" data-fade>See what owning a Gohar home, shop or office could cost each month. Choose a plan, set your down payment and tenure, and get a complete month-by-month schedule in seconds.</p>
    <ul class="calc-hero__pts" data-fade><li>Gohar plan &amp; bank financing</li><li>Full payment schedule</li><li>Download or share your plan</li></ul>
  </div>
</section>

<section class="calc" id="calculator" data-calc>
  <div class="wrap calc__grid">
    <form class="calc__form" novalidate onsubmit="return false">
      <div class="calc__formhead"><h2 class="calc__formt">Build your plan</h2><button type="button" class="calc__reset" data-reset>Reset</button></div>

      <div class="cstep">
        <span class="clabel"><i class="cstep__n">01</i>Choose your plan</span>
        <div class="calc__plan" role="radiogroup" aria-label="Plan type">
          <button type="button" class="cplan is-on" data-plan="gohar" role="radio" aria-checked="true">
            <span class="cplan__ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/></svg></span>
            <span class="cplan__t">Gohar Instalment Plan</span><span class="cplan__d">Down payment + equal monthly instalments. No markup.</span>
          </button>
          <button type="button" class="cplan" data-plan="bank" role="radio" aria-checked="false">
            <span class="cplan__ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 10h18L12 4 3 10zM5 10v8M9 10v8M15 10v8M19 10v8M3 21h18"/></svg></span>
            <span class="cplan__t">Bank Home Financing</span><span class="cplan__d">Monthly instalments with your bank’s markup rate.</span>
          </button>
        </div>
      </div>

      <div class="cstep">
        <label class="clabel" for="c-project"><i class="cstep__n">02</i>Select development</label>
        <div class="cselect"><select id="c-project">${projectOptions('', 'Any Gohar development')}</select></div>
      </div>

      <div class="cstep">
        <label class="clabel" for="c-price"><i class="cstep__n">03</i>Property price</label>
        <div class="cmoney"><span>Rs.</span><input id="c-price" inputmode="numeric" autocomplete="off" placeholder="e.g. 15,000,000" value="15,000,000" aria-describedby="c-price-help"><em class="cmoney__w" data-price-words>1.50 Crore</em></div>
        <div class="cquick" aria-label="Quick prices">${[5, 10, 15, 25, 40, 60].map((m) => `<button type="button" data-quick="${m * 1e6}">${m >= 10 ? (m / 10) + ' Cr' : (m * 10) + ' Lac'}</button>`).join('')}</div>
        <p class="chelp" id="c-price-help">Enter the price quoted by our sales team. Prices vary by project, size and floor.</p>
      </div>

      <div class="cstep">
        <div class="cfield__row"><label class="clabel" for="c-down"><i class="cstep__n">04</i>Down payment</label><output class="cpill" for="c-down" data-out-down>30%</output></div>
        <input type="range" id="c-down" min="10" max="90" step="5" value="30" class="crange">
        <div class="cscale"><span>10%</span><span>30%</span><span>50%</span><span>70%</span><span>90%</span></div>
        <div class="cfield__amt"><span>Down payment amount</span><b data-out-downamt>Rs. 4,500,000</b></div>
      </div>

      <div class="cstep">
        <span class="clabel"><i class="cstep__n">05</i>Tenure</span>
        <div class="cchips" data-years-a>${chips(yearsA, 3)}</div>
        <div class="cchips" data-years-b hidden>${chips(yearsB, 10)}</div>
      </div>

      <div class="cstep" data-rate-field hidden>
        <div class="cfield__row"><label class="clabel" for="c-rate"><i class="cstep__n">06</i>Markup rate (% per year)</label><output class="cpill" for="c-rate" data-out-rate>18%</output></div>
        <input type="range" id="c-rate" min="5" max="30" step="0.05" value="18" class="crange">
        <div class="cscale"><span>5%</span><span>12.5%</span><span>20%</span><span>30%</span></div>
        <p class="chelp">Example rate only. Use the rate your bank offers (usually KIBOR plus the bank’s spread).</p>
      </div>
    </form>

    <aside class="calc__result" aria-live="polite">
      <div class="cres">
        <p class="cres__k" data-out-plan>Gohar Instalment Plan</p>
        <p class="cres__lbl">Your monthly instalment</p>
        <p class="cres__big"><span>Rs.</span><b data-out-emi>0</b></p>
        <p class="cres__sub"><span data-out-sub>for 36 months</span> · <span data-out-emiwords>2.92 Lac</span> per month</p>
        <div class="cdonut">
          <svg viewBox="0 0 120 120" aria-hidden="true"><circle class="cdonut__bg" cx="60" cy="60" r="48"/><circle class="cdonut__s s1" cx="60" cy="60" r="48" data-seg="down"/><circle class="cdonut__s s2" cx="60" cy="60" r="48" data-seg="fin"/><circle class="cdonut__s s3" cx="60" cy="60" r="48" data-seg="int"/></svg>
          <div class="cdonut__c"><small>Total payable</small><b data-out-totalwords>1.50 Cr</b></div>
          <ul class="ckey">
            <li><i class="k1"></i><span>Down payment</span><b data-key-down>–</b></li>
            <li><i class="k2"></i><span data-key-finlbl>Instalments (principal)</span><b data-key-fin>–</b></li>
            <li data-key-int><i class="k3"></i><span>Markup</span><b data-key-intv>–</b></li>
          </ul>
        </div>
        <dl class="csum">
          <div><dt>Property price</dt><dd data-out-price>–</dd></div>
          <div><dt>Down payment</dt><dd data-out-downsum>–</dd></div>
          <div><dt data-lbl-fin>Balance in instalments</dt><dd data-out-fin>–</dd></div>
          <div><dt>Tenure</dt><dd data-out-tenure>–</dd></div>
          <div data-row-int hidden><dt>Total markup</dt><dd data-out-int>–</dd></div>
          <div class="csum__total"><dt>Total payable</dt><dd data-out-total>–</dd></div>
        </dl>
        <div class="cres__btns">
          <a class="btn btn--light" href="site-visit.html" data-calc-visit>Schedule a Site Visit ${ARR}</a>
          <a class="btn btn--line-light" href="#" target="_blank" rel="noopener" data-calc-wa>Send this plan on WhatsApp</a>
        </div>
      </div>
      <p class="cres__note">Estimates for guidance only. Final plans are confirmed by Gohar’s sales team.</p>
    </aside>
  </div>

  <div class="wrap calc__more">
    <div class="cchart">
      <div class="cchart__head">
        <div><h2 class="cchart__t">Outstanding balance</h2><p class="chelp">How the remaining amount reduces with every instalment. Hover the chart for details.</p></div>
        <div class="cchart__stats"><div><small>Starts at</small><b data-ch-start>–</b></div><div><small>Paid off in</small><b data-ch-end>–</b></div></div>
      </div>
      <div class="cchart__box" data-chartbox>
        <svg class="cchart__svg" viewBox="0 0 800 260" preserveAspectRatio="none" aria-hidden="true" data-chart>
          <defs><linearGradient id="cgrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e52e36" stop-opacity=".26"/><stop offset="1" stop-color="#e52e36" stop-opacity="0"/></linearGradient></defs>
          <g class="cchart__grid"><path d="M0 70H800M0 135H800M0 200H800"/></g>
          <path class="cchart__area" d=""/>
          <path class="cchart__line" d=""/>
        </svg>
        <div class="cchart__cursor" data-ch-cursor hidden><i></i><span class="cchart__dot"></span><div class="cchart__tip" data-ch-tip></div></div>
      </div>
      <div class="cchart__x" data-chart-x></div>
    </div>

    <div class="ctable">
      <div class="ctable__head">
        <div><h2 class="cchart__t">Payment schedule</h2><p class="chelp" data-out-schedinfo>Month-by-month breakdown</p></div>
        <div class="ctable__btns">
          <div class="cseg" role="group" aria-label="Schedule view"><button type="button" class="is-on" data-view="month">Monthly</button><button type="button" data-view="year">Yearly</button></div>
          <button type="button" class="btn btn--line btn--sm" data-csv><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14"/></svg>Download CSV</button>
          <button type="button" class="btn btn--line btn--sm" data-print><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M7 9V4h10v5M7 17H5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2M7 14h10v6H7z"/></svg>Print</button>
        </div>
      </div>
      <dl class="ctable__meta">
        <div><dt>Property price (Rs.)</dt><dd data-m-price>–</dd></div>
        <div><dt>Down payment (Rs.)</dt><dd data-m-down>–</dd></div>
        <div><dt data-m-finlbl>Balance in instalments (Rs.)</dt><dd data-m-fin>–</dd></div>
        <div><dt>Tenure</dt><dd data-m-tenure>–</dd></div>
      </dl>
      <div class="cpager" data-pager>
        <button type="button" class="cpager__btn" data-page="-1" aria-label="Previous year">${ARR}</button>
        <div class="cpager__years" data-pager-years></div>
        <button type="button" class="cpager__btn cpager__btn--next" data-page="1" aria-label="Next year">${ARR}</button>
      </div>
      <div class="ctable__wrap">
        <table>
          <thead><tr><th scope="col">Payment number</th><th scope="col">Instalment</th><th scope="col">Principal</th><th scope="col" data-th-int>Markup</th><th scope="col">Balance</th></tr></thead>
          <tbody data-rows></tbody>
          <tfoot data-foot></tfoot>
        </table>
      </div>
    </div>

    <div class="cdisc">
      <div class="cdisc__ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.5"/></svg></div>
      <div>
        <h2 class="cdisc__t">Disclaimer</h2>
        <p>These are <b>tentative amounts for guidance only</b> and are not an offer. Actual figures will depend on:</p>
        <ul>
          <li>The final price, unit, floor and payment plan offered for each Gohar development. Plans differ by project and may include booking, quarterly, possession or balloon payments.</li>
          <li>Taxes, registration, transfer, maintenance and utility charges, which are not included.</li>
          <li>For bank financing: the bank’s approval, its markup rate (usually linked to KIBOR and revised as per the bank’s policy), processing fees, insurance and eligibility criteria such as the Debt Burden Ratio set by the State Bank of Pakistan.</li>
          <li>Instalments are rounded to the nearest rupee; the final instalment is adjusted so the balance closes at zero.</li>
        </ul>
        <p>For an exact payment plan, <a href="contact.html">speak with our sales team</a> or call <a href="${C.phoneHref}">${C.phone}</a>.</p>
      </div>
    </div>
  </div>
</section>`;
  return layout({ file: 'calculator.html', title: 'Instalment Calculator | Gohar Group of Companies', desc: 'Estimate your monthly instalments for a Gohar home, shop or office: choose a Gohar instalment plan or bank financing, set your down payment and tenure, and see a full payment schedule.', body, image: '141-broadway-heights/dusk.jpg' });
}

/* ---------------------------------------------------------- write */
// Windows can briefly lock a file that a local server is reading: retry a few times before giving up
const write = (f, html) => {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  for (let k = 0; ; k++) {
    try { fs.writeFileSync(f, html); return; } catch (err) { if (k >= 20) throw err; Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250); }
  }
};

/* ------------------------------------------------ Gohar Assistant knowledge (generated from data.mjs) */
const asstImg = (p, f) => { const b = f.replace(/\.\w+$/, ''); const w = `assets/img/${p.slug}/_w/${b}-800.webp`; return fs.existsSync(w) ? w : `assets/img/${p.slug}/${f}`; };
write('assets/data/assistant.json', JSON.stringify({
  company: { name: C.name, tagline: C.tagline, intro: C.intro, phone: C.phone, phoneHref: C.phoneHref, email: C.email, whatsapp: C.whatsapp, office: C.office, officeShort: C.officeShort, mapUrl: C.mapUrl, hours: C.hours, closed: C.closed, purpose: C.purpose, promise: C.promise },
  categories: Object.fromEntries(Object.entries(categories).map(([k, v]) => [k, v.label])),
  projects: projects.map((p) => ({ slug: p.slug, name: p.name, area: p.area, city: p.city, category: p.category, categoryLabel: catLabel(p), status: p.status || '', headline: p.headline || '', summary: p.summary, lead: p.lead || '', story: (p.story || [])[0] || '', facts: p.facts || [], keyStats: p.keyStats || [], amenities: p.amenities || [], address: p.address || '', nearby: p.nearby || [], img: asstImg(p, p.card), featured: !!p.featured, brochure: p.brochure ? p.brochure[0] : '' })),
  faqs: faqs.map(([q, a]) => ({ q, a })),
  stories: stories.map((t) => ({ slug: t.slug, title: t.title, tag: t.tag, date: t.date })),
}));
write('index.html', home());
write('about.html', about());
write('projects.html', projectsPage());
write('stories.html', storiesPage());
write('careers.html', careers());
write('contact.html', contact());
write('site-visit.html', siteVisit());
write('calculator.html', calculator());
projects.forEach((p, i) => write(`projects/${p.slug}.html`, projectPage(p, i)));
stories.forEach((s, i) => write(`stories/${s.slug}.html`, articlePage(s, i)));

// image-usage report: the same photo used twice on one page (outside the gallery itself)
let dupes = 0;
for (const [pg, list] of Object.entries(usage)) {
  const seen = {};
  for (const [p, role] of list) { if (role === 'gallery' || role === 'plan' || role === 'visit-preview') continue; (seen[p] ||= []).push(role); }
  for (const [p, roles] of Object.entries(seen)) if (roles.length > 1) { dupes++; console.log(`  repeat on ${pg}: ${p} (${roles.join(', ')})`); }
}
console.log(`Built ${8 + projects.length + stories.length} pages. Image repeats within a page: ${dupes}.`);
