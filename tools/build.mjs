// Builds every HTML page from tools/data.mjs.  Run: npm run build
import fs from 'node:fs';
import path from 'node:path';
import { company as C, values, categories, projects, stories, faqs } from './data.mjs';

const OUT = '.';
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad = (n) => String(n).padStart(2, '0');
const lines = (arr) => arr.map((l) => `<span class="line"><span>${l}</span></span>`).join('');
const ARR = `<svg class="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
const NE = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>`;
const WA_ICON = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg>`;
const SEARCH = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`;

const catCount = Object.fromEntries(Object.keys(categories).map((k) => [k, projects.filter((p) => p.category === k).length]));
const areas = [...new Set(projects.filter((p) => p.city === 'Karachi').map((p) => p.area))];
const catLabel = (p) => p.categoryLabel || categories[p.category].label;
const waLink = (msg) => `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(msg)}`;
const WA_DEFAULT = waLink('Hi, I’m interested in Gohar Group’s projects. Please share the available options, prices, and payment plans.');
const mapsQ = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

const NAV = [['index.html', 'Home'], ['about.html', 'About'], ['projects.html', 'Projects'], ['stories.html', 'Gohar Stories'], ['careers.html', 'Careers'], ['contact.html', 'Contact']];

function layout({ r = '', file, title, desc, body, light = false, image = 'gohar-gateway/exterior.webp' }) {
  const img = (p) => `${r}assets/img/${p}`;
  const nav = NAV.map(([h, l]) => `<a href="${r}${h}"${h === file ? ' aria-current="page"' : ''}>${l}</a>`).join('');
  const menuLinks = NAV.map(([h, l], i) => `<a href="${r}${h}"><small>${pad(i + 1)}</small><span>${l}</span></a>`).join('');
  return `<!doctype html>
<html lang="en" class="js" data-wa="${C.whatsapp}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#12110d">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${img(image)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${r}assets/img/brand/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${r}assets/css/site.css">
</head>
<body class="${light ? 'page-light' : ''}">
<a class="skip" href="#main">Skip to main content</a>
<div class="loader" aria-hidden="true"><div class="loader__inner"><img class="loader__logo" src="${img('brand/gohar-logo-light-trim.png')}" alt=""><div class="loader__bar"><i></i></div><div class="loader__count">000</div></div></div>
<div class="curtain" aria-hidden="true"><img src="${img('brand/gohar-logo-light-trim.png')}" alt=""></div>

<header class="header">
  <div class="wrap header__in">
    <a class="logo" href="${r}index.html" aria-label="Gohar Group of Companies, home">
      <img class="lg-light" src="${img('brand/gohar-logo-light-trim.png')}" alt="Gohar Group of Companies" width="150" height="48">
      <img class="lg-dark" src="${img('brand/gohar-logo-dark-trim.png')}" alt="" width="150" height="48">
    </a>
    <nav class="nav" aria-label="Main">${nav}</nav>
    <div class="header__cta">
      <a class="btn" href="${r}site-visit.html">Request a site visit ${ARR}</a>
      <button class="menu-btn" aria-label="Open menu" aria-expanded="false"><i><span></span><span></span></i></button>
    </div>
  </div>
</header>
<div class="menu" aria-label="Menu">
  <nav class="menu__links">${menuLinks}</nav>
  <div class="menu__media"><video data-src="${r}assets/video/about.mp4" poster="${r}assets/video/about.jpg" muted loop playsinline preload="none"></video></div>
  <div class="menu__foot"><a href="${C.phoneHref}">${C.phone}</a><a href="mailto:${C.email}">${C.email}</a><span>${C.officeShort}</span></div>
</div>

<main id="main">
${body}
</main>

<footer class="footer">
  <div class="wrap">
    <div class="footer__top">
      <div>
        <p class="footer__big">Every relationship starts with a <em>conversation.</em></p>
        <a class="btn btn--light" href="${r}contact.html">Send an enquiry ${ARR}</a>
      </div>
      <div><h4>Explore</h4><ul>${NAV.map(([h, l]) => `<li><a href="${r}${h}">${l}</a></li>`).join('')}<li><a href="${r}site-visit.html">Site visit</a></li></ul></div>
      <div><h4>Developments</h4><ul>${projects.slice(0, 6).map((p) => `<li><a href="${r}projects/${p.slug}.html">${p.name}</a></li>`).join('')}<li><a href="${r}projects.html">All projects →</a></li></ul></div>
      <div><h4>Head office</h4><ul>
        <li><a href="${C.mapUrl}" target="_blank" rel="noopener">${C.office}</a></li>
        <li><a href="${C.phoneHref}">${C.phone}</a></li>
        <li><a href="mailto:${C.email}">${C.email}</a></li>
        <li class="muted">${C.hours}<br>${C.closed}</li>
      </ul></div>
    </div>
    <div class="footer__word" data-fade><img src="${img('brand/gohar-logo-light-trim.png')}" alt="" loading="lazy"></div>
    <div class="footer__bot">
      <span>© <span data-year>2026</span> ${C.name}. Where relationships come first.</span>
      <button class="to-top" data-top>Back to top ↑</button>
    </div>
  </div>
</footer>
<a class="wa" href="${WA_DEFAULT}" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">${WA_ICON}</a>

<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://unpkg.com/lenis@1.1.13/dist/lenis.min.js"></script>
<script src="${r}assets/js/site.js"></script>
</body>
</html>
`;
}

/* ---------- shared blocks ---------- */
const vid = (r, name, { cls = '', attrs = '' } = {}) =>
  `<video class="${cls}" data-src="${r}assets/video/${name}.mp4" poster="${r}assets/video/${name}.jpg" muted loop playsinline preload="none" ${attrs}></video>`;

const valuesBlock = (dark = false) => `
<section class="section ${dark ? 'dark' : ''}">
  <div class="wrap">
    <div class="shead">
      <div><span class="eyebrow"><span class="num">(04)</span> Our foundation</span><h2 class="h2 split-lines">${lines(['Values behind', '<em>every</em> development'])}</h2></div>
      <p data-fade>We build with clarity, serve with intent, and design every interaction around long-term trust.</p>
    </div>
    <div class="values" data-stagger>
      ${values.map(([t, d], i) => `<div class="value"><span class="value__n">${pad(i + 1)}</span><h3 class="h3">${t}</h3><p>${d}</p></div>`).join('')}
    </div>
  </div>
</section>`;

const steps3 = (cls = '') => `<div class="steps ${cls}" data-stagger>
  <div class="step"><b>01</b><span>Choose a project, a preferred day and a time window</span></div>
  <div class="step"><b>02</b><span>Our team calls to confirm availability</span></div>
  <div class="step"><b>03</b><span>Meet us on site at the agreed time</span></div>
</div>`;

const ctaBlock = (r, film = 'hero', title = ['Walk the site.', '<em>Meet the people</em>', 'behind it.']) => `
<section class="cta">
  <div class="cta__bg" data-parallax>${vid(r, film)}</div>
  <div class="hero__shade"></div>
  <div class="wrap cta__in">
    <span class="eyebrow" style="color:var(--on-dark)"><span class="num">(06)</span> Request a site visit</span>
    <h2 class="display split-lines" style="margin-top:28px">${lines(title)}</h2>
    ${steps3()}
    <div class="hero__btns" data-fade><a class="btn btn--light" href="${r}site-visit.html">Request a site visit ${ARR}</a><a class="btn btn--ghost on-dark" href="${WA_DEFAULT}" target="_blank" rel="noopener">WhatsApp our team</a></div>
  </div>
</section>`;

const contactBand = (r) => `
<section class="section--tight">
  <div class="wrap">
    <div class="shead"><div><span class="eyebrow">Speak with us</span><h2 class="h2 split-lines">${lines(['Every relationship starts', 'with a <em>conversation.</em>'])}</h2></div></div>
    <div class="contact-grid" data-stagger>
      <a class="cbox" href="${C.phoneHref}"><small>Call us</small><strong>${C.phone}</strong><span>UAN</span></a>
      <a class="cbox" href="mailto:${C.email}"><small>Email</small><strong>${C.email}</strong><span>We reply during office hours</span></a>
      <a class="cbox" href="${C.mapUrl}" target="_blank" rel="noopener"><small>Head office</small><strong>${C.officeShort}</strong><span>Get directions</span></a>
      <div class="cbox"><small>Office hours</small><strong>Mon – Sat</strong><span>11:00 AM – 8:00 PM · ${C.closed}</span></div>
    </div>
  </div>
</section>`;

const projectOptions = (sel = '') => `<option value="">No specific project</option>` + projects.map((p) => `<option value="${p.slug}"${p.slug === sel ? ' selected' : ''}>${p.name}</option>`).join('');
const CITIES = ['Karachi', 'Hyderabad', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Overseas', 'Other'];
const cityOptions = `<option value="">Select a city</option>` + CITIES.map((c) => `<option>${c}</option>`).join('');

const enquiryForm = (sel = '', kind = 'enquiry') => `
<form class="form" data-form="${kind}" novalidate>
  <div class="field"><label for="f-type">Enquiry type *</label><select id="f-type" name="type" required>
    <option>Project or sales enquiry</option><option>Schedule a site visit</option><option>General enquiry</option><option>Careers</option><option>Other</option></select><span class="err">Please choose a type.</span></div>
  <div class="field"><label for="f-project">Project of interest</label><select id="f-project" name="project">${projectOptions(sel)}</select></div>
  <div class="field"><label for="f-name">Full name *</label><input id="f-name" name="name" autocomplete="name" required><span class="err">Please enter your name.</span></div>
  <div class="field"><label for="f-email">Email *</label><input id="f-email" name="email" type="email" autocomplete="email" required><span class="err">Please enter a valid email.</span></div>
  <div class="field"><label for="f-phone">Phone *</label><input id="f-phone" name="phone" type="tel" autocomplete="tel" required><span class="err">Please enter a valid phone number.</span></div>
  <div class="field"><label for="f-city">City (optional)</label><select id="f-city" name="city">${cityOptions}</select></div>
  <div class="field full"><label for="f-msg">Message *</label><textarea id="f-msg" name="message" maxlength="2000" required></textarea><span class="err">Please write a short message.</span></div>
  <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
  <label class="check field"><input type="checkbox" name="consent" required><span>I agree that Gohar Group of Companies may store and use these details to respond to my enquiry. *</span></label>
  <div class="form__actions"><button class="btn" type="submit">Send via WhatsApp ${ARR}</button><button class="link-u" type="button" data-mail>Or send by email</button></div>
  <div class="form__ok" role="status">Thank you. Your message is ready in WhatsApp (or your email app) — press send there and our team will reply during office hours.</div>
</form>`;

/* ======================= HOME ======================= */
function home() {
  const r = '';
  const featured = projects.filter((p) => p.featured);
  const body = `
<section class="hero" data-intro>
  <div class="hero__media"><video id="heroFilm" src="assets/video/hero.mp4" poster="assets/video/hero.jpg" autoplay muted loop playsinline preload="auto"></video></div>
  <div class="hero__shade"></div>
  <div class="hero__content">
    <div class="wrap">
      <div class="hero__grid">
        <div>
          <span class="eyebrow" data-fade>Karachi &amp; Hyderabad</span>
          <h1 class="display hero__title split-lines">${lines(['Where', 'relationships', '<em>come first.</em>'])}</h1>
        </div>
        <div class="hero__aside">
          <p data-fade>Residential towers, shopping centres, mixed-use landmarks and gated communities, built around the families and businesses who live and work in them.</p>
          <div class="hero__btns" data-fade><a class="btn btn--light" href="site-visit.html">Request a site visit ${ARR}</a><a class="btn btn--ghost on-dark" href="projects.html">Explore projects</a></div>
        </div>
      </div>
      <div class="hero__meta" data-fade>
        <span class="scroll-cue"><i></i> Scroll to explore</span>
        <span class="hide-sm">10 developments · 2 cities</span>
        <button class="sound-btn" data-film-toggle="#heroFilm"><b><i></i><i></i><i></i></b><span>Pause film</span></button>
      </div>
    </div>
  </div>
</section>

<div class="marquee" aria-hidden="true"><div class="marquee__track" data-speed="45">
  ${['Residential', 'Karachi', 'Commercial', 'Hyderabad', 'Mixed-use', '10 developments', 'Communities'].map((t) => `<span class="marquee__item">${t}<i></i></span>`).join('')}
</div></div>

<section class="section">
  <div class="wrap">
    <div class="intro__grid">
      <div><span class="eyebrow"><span class="num">(01)</span> About Gohar Group</span></div>
      <div>
        <p class="statement">Homes, workplaces and communities, built on trust. Gohar Group of Companies is a Karachi-based group known for real estate development, construction and building — apartments, shopping centres, commercial buildings and gated communities across Karachi and Hyderabad.</p>
        <div class="intro__foot"><a class="btn" href="about.html">Discover our story ${ARR}</a></div>
      </div>
    </div>
    <div class="stats" data-stagger>
      <div class="stat"><div class="stat__n" data-count="10">10</div><div class="stat__l"><b>Developments</b>in the Gohar portfolio</div></div>
      <div class="stat"><div class="stat__n" data-count="2">2</div><div class="stat__l"><b>Cities</b>Karachi and Hyderabad</div></div>
      <div class="stat"><div class="stat__n" data-count="1033">1,033</div><div class="stat__l"><b>Apartments</b>at Gohar Residencia</div></div>
      <div class="stat"><div class="stat__n" data-count="411">411</div><div class="stat__l"><b>Shops</b>at Gohar Green Corner</div></div>
    </div>
  </div>
</section>

<section class="film" data-cursor="Watch">
  <div class="film__frame">${vid(r, 'about')}<div class="film__shade"></div></div>
  <div class="film__caption"><h2 class="display">${lines(['Built on', '<em>trust.</em>'])}</h2></div>
</section>

<section class="section">
  <div class="wrap">
    <div class="shead">
      <div><span class="eyebrow">What we build</span><h2 class="h2 split-lines">${lines(['Homes, workplaces', 'and <em>communities</em>'])}</h2></div>
      <p data-fade>Four kinds of places, one standard. Hover a category to preview, tap to see every development in it.</p>
    </div>
    <div class="cats" data-float-list>
      ${Object.entries(categories).map(([k, c], i) => {
        const p = projects.find((x) => x.category === k);
        return `<a class="cat" href="projects.html?category=${k}" data-img="assets/img/${p.slug}/${p.card}" data-fade>
          <span class="cat__n">${pad(i + 1)} <span class="count">· ${pad(catCount[k])}</span></span>
          <span class="cat__t">${c.label}</span>
          <p class="cat__d">${c.text}</p>
          <span class="cat__a">${NE}</span></a>`;
      }).join('')}
    </div>
  </div>
</section>

<section class="section dark" style="padding-bottom:0">
  <div class="wrap">
    <div class="shead">
      <div><span class="eyebrow"><span class="num">(02)</span> Signature developments</span><h2 class="h2 split-lines">${lines(['Architecture with', 'a <em>sense of place</em>'])}</h2></div>
      <p data-fade>4 landmark projects, from a golf-course residence in Karachi to a mixed-use address in Hyderabad.</p>
    </div>
  </div>
</section>
<section class="hscroll dark" style="padding-bottom:clamp(80px,10vw,140px)">
  <div class="hscroll__track">
    ${featured.map((p, i) => `
    <article class="hcard">
      <a href="projects/${p.slug}.html" data-cursor="View">
        <div class="hcard__media">${vid(r, p.slug)}<div class="hcard__over"></div>
          <span class="hcard__idx">${pad(i + 1)} — ${pad(featured.length)}</span>
          <div class="hcard__tags"><span class="tag">${catLabel(p)}</span>${p.status ? `<span class="tag tag--red">${p.status}</span>` : ''}</div>
          <div class="hcard__info"><div><h3 class="h2">${p.name}</h3><div class="hcard__loc">${p.area}${p.city !== p.area ? ', ' + p.city : ''}</div></div></div>
        </div>
      </a>
      <div class="hcard__body"><p>${p.summary}</p><div class="hero__btns"><a class="link-u" href="projects/${p.slug}.html">Discover the project</a></div></div>
    </article>`).join('')}
    <div class="hscroll__end"><h3 class="h2">Explore every <em>development</em></h3><a class="btn btn--light" href="projects.html">View all 10 ${ARR}</a></div>
  </div>
  <div class="progress"><i></i></div>
</section>

<section class="quote">
  <div class="quote__bg" data-parallax><img src="assets/img/kn-gohar-green-city/photo-lawn.jpg" alt="" loading="lazy"></div>
  <div class="quote__in">
    <span class="eyebrow no-line" style="color:var(--on-dark)">Our purpose</span>
    <span class="quote__mark" aria-hidden="true">“</span>
    <blockquote class="split-lines">${lines(['To build safe, legally sound', 'communities where trust is', 'foundational and relationships', '<em>always come first.</em>'])}</blockquote>
    <p class="eyebrow no-line" data-fade style="color:var(--on-dark-2)">Where relationships come first.</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="shead">
      <div><span class="eyebrow"><span class="num">(03)</span> The portfolio</span><h2 class="h2 split-lines">${lines(['Explore every', '<em>development</em>'])}</h2></div>
      <a class="btn btn--ghost" href="projects.html" data-fade>Search &amp; filter ${ARR}</a>
    </div>
    <div class="plist" data-float-list>
      ${projects.map((p, i) => `<a class="prow" href="projects/${p.slug}.html" data-img="assets/img/${p.slug}/${p.card}">
        <span class="prow__n">${pad(i + 1)}</span><span class="prow__t">${p.name}</span><span class="prow__l">${p.area}${p.city !== p.area ? ', ' + p.city : ''}</span><span class="prow__c">${catLabel(p)}</span><span class="prow__a">${NE}</span></a>`).join('')}
    </div>
  </div>
</section>

<div class="marquee" aria-hidden="true" style="margin-bottom:clamp(60px,8vw,120px)"><div class="marquee__track" data-speed="60" data-dir="right">
  ${projects.map((p) => `<span class="marquee__item">${p.area}<i></i></span>`).join('')}
</div></div>

<section class="section--tight">
  <div class="wrap">
    <div class="shead"><div><span class="eyebrow">Where we build</span><h2 class="h2 split-lines">${lines(['Two cities,', '<em>one standard</em>'])}</h2></div><p data-fade>Each area links to its developments.</p></div>
    <div class="cities">
      <div class="city" data-fade>
        <div class="city__bg">${vid(r, 'gohar-residencia-shopping-mall')}</div>
        <span class="eyebrow no-line" style="color:var(--on-dark)">09 developments</span>
        <div><div class="city__name">Karachi</div><div class="chips">${areas.map((a) => `<a class="chip" href="projects.html?location=${encodeURIComponent(a)}">${a}</a>`).join('')}</div></div>
      </div>
      <div class="city" data-fade="0.15">
        <div class="city__bg">${vid(r, 'gohar-gateway')}</div>
        <span class="eyebrow no-line" style="color:var(--on-dark)">01 development</span>
        <div><div class="city__name">Hyderabad</div><div class="chips"><a class="chip" href="projects/gohar-gateway.html">Gohar Gateway</a></div></div>
      </div>
    </div>
  </div>
</section>

${valuesBlock()}

<section class="section--tight dark">
  <div class="wrap" style="max-width:1200px">
    <span class="eyebrow">Our mission</span>
    <p class="statement" style="margin-top:30px">${C.mission}</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="shead"><div><span class="eyebrow"><span class="num">(05)</span> Gohar Stories</span><h2 class="h2 split-lines">${lines(['News, project stories', '&amp; <em>buying guides</em>'])}</h2></div><a class="btn btn--ghost" href="stories.html" data-fade>All stories ${ARR}</a></div>
    ${storiesBlock('')}
  </div>
</section>

${ctaBlock(r)}
${contactBand(r)}
${storyModal()}`;
  return layout({ file: 'index.html', title: 'Gohar Group of Companies | Real Estate Developer in Karachi & Hyderabad', desc: 'Residential towers, shopping centres, mixed-use landmarks and gated communities in Karachi and Hyderabad. Where relationships come first.', body });
}

function storiesBlock(r) {
  const data = (s) => esc(JSON.stringify({ ...s, img: `${r}assets/img/${s.img}` }));
  const [f, ...rest] = stories;
  return `<div class="stories">
    <button class="story-feat" data-story="${data(f)}" data-cursor="Read">
      <div class="media reveal-img"><img src="${r}assets/img/${f.img}" alt="${esc(f.title)}" loading="lazy"></div>
      <h3>${f.title}</h3><div class="story-meta"><b>${f.tag}</b><span>${f.date}</span><span>${f.read}</span></div><p>${f.text}</p>
    </button>
    <div class="story-list" data-stagger>
      ${rest.map((s) => `<button class="story-item" data-story="${data(s)}"><div class="media"><img src="${r}assets/img/${s.img}" alt="" loading="lazy"></div><div><div class="story-meta"><b>${s.tag}</b><span>${s.date}</span></div><h3>${s.title}</h3></div></button>`).join('')}
    </div>
  </div>`;
}
const storyModal = () => `<div class="modal" role="dialog" aria-modal="true" aria-label="Story"><div class="modal__box"><button class="lb__btn lb__close" aria-label="Close">✕</button><div class="media"><img class="modal__img" alt=""></div><div class="modal__body"><div class="story-meta modal__meta"></div><h3 class="modal__title"></h3><p class="modal__text"></p><a class="btn btn--sm" href="contact.html">Ask our team ${ARR}</a></div></div></div>`;

/* ======================= PROJECTS ======================= */
function projectsPage() {
  const r = '';
  const body = `
<section class="phero" data-intro>
  <div class="phero__media">${vid(r, 'hero', { attrs: 'autoplay' }).replace('data-src', 'src').replace('preload="none"', 'preload="auto"')}</div>
  <div class="hero__shade"></div>
  <div class="wrap phero__content">
    <div class="crumbs" data-fade><a href="index.html">Home</a><span>/</span><span>Projects</span></div>
    <div class="phero__row">
      <h1 class="display split-lines">${lines(['Every Gohar', '<em>development</em>'])}</h1>
      <p class="lead" data-fade>Homes, shopping centres, offices and communities. Filter by type, search by area, and open any project.</p>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="filters" data-fade>
      <div class="filter-tabs" role="toolbar" aria-label="Filter projects">
        <button class="ftab is-on" data-cat="all">All <sup>${projects.length}</sup></button>
        ${Object.entries(categories).map(([k, c]) => `<button class="ftab" data-cat="${k}">${c.label} <sup>${catCount[k]}</sup></button>`).join('')}
      </div>
      <label class="search">${SEARCH}<input id="search" type="search" placeholder="Search by name or area" aria-label="Search projects"></label>
    </div>
    <div class="pgrid">
      ${projects.map((p, i) => `
      <a class="pcard" href="projects/${p.slug}.html" data-cat="${p.category}" data-search="${esc((p.name + ' ' + p.area + ' ' + p.city + ' ' + catLabel(p)).toLowerCase())}" data-cursor="View" data-fade>
        <div class="pcard__media">
          <img src="assets/img/${p.slug}/${p.card}" alt="${esc(p.name)}" loading="lazy">
          <video data-hover data-src="assets/video/${p.slug}.mp4" muted loop playsinline preload="none"></video>
          <div class="pcard__tags"><span class="tag">${catLabel(p)}</span>${p.status ? `<span class="tag tag--red">${p.status}</span>` : ''}</div>
          <span class="pcard__play"><i>▶</i> Film</span>
        </div>
        <div class="pcard__info"><div><h3>${p.name}</h3><p>${p.area}${p.city !== p.area ? ', ' + p.city : ''}</p></div><span class="pcard__n">${pad(i + 1)}</span></div>
      </a>`).join('')}
    </div>
    <p class="empty">No projects match your search. Try another name or area.</p>
  </div>
</section>
${ctaBlock(r, 'gohar-golf-vista')}`;
  return layout({ file: 'projects.html', title: 'Projects | Gohar Group of Companies', desc: 'All 10 Gohar developments across Karachi and Hyderabad: residential, commercial, mixed-use and gated communities.', body });
}

/* ======================= PROJECT DETAIL ======================= */
function projectPage(p, i) {
  const r = '../';
  const im = (f) => `${r}assets/img/${p.slug}/${f}`;
  const next = projects[(i + 1) % projects.length];
  const loc = `${p.area}${p.city !== p.area ? ', ' + p.city : ''}`;
  const sections = [['overview', 'Overview'], p.layouts && ['layouts', 'Layouts'], p.plans && ['plans', 'Plans'], p.amenities && ['amenities', 'Amenities'], ['gallery', 'Gallery'], p.payment && ['payment', 'Payment plans'], ['location', 'Location'], ['enquire', 'Enquire']].filter(Boolean);
  const fact4 = [['Category', catLabel(p)], ['Location', loc], ...(p.status ? [['Status', p.status]] : []), ...p.keyStats.slice(0, p.status ? 1 : 2)];
  const msg = `Hi, I’m interested in ${p.name}. Please share availability, prices and payment plans.`;
  const body = `
<section class="phero" data-intro style="min-height:100svh">
  <div class="phero__media"><video src="${r}assets/video/${p.slug}.mp4" poster="${r}assets/video/${p.slug}.jpg" autoplay muted loop playsinline preload="auto"></video></div>
  <div class="hero__shade"></div>
  <div class="wrap phero__content">
    <div class="crumbs" data-fade><a href="${r}index.html">Home</a><span>/</span><a href="${r}projects.html">Projects</a><span>/</span><span>${p.name}</span></div>
    <div class="tags" data-fade><span class="tag">${catLabel(p)}</span>${p.status ? `<span class="tag tag--red">${p.status}</span>` : ''}</div>
    <div class="phero__row">
      <h1 class="display split-lines" style="font-size:clamp(48px,8vw,148px)">${lines(p.name.length > 22 ? p.name.split(' & ').map((s, k) => (k ? '&amp; ' : '') + s) : [p.name])}</h1>
      <div class="hero__aside">
        <p class="lead" data-fade>${p.lead}</p>
        <div class="hero__btns" data-fade><a class="btn btn--light" href="${r}site-visit.html?project=${p.slug}">Request a site visit ${ARR}</a><a class="btn btn--ghost on-dark" href="#enquire">Enquire</a></div>
      </div>
    </div>
    <div class="factbar" data-fade>${fact4.slice(0, 4).map(([k, v]) => `<div><small>${k}</small><strong>${v}</strong></div>`).join('')}</div>
  </div>
</section>

<div class="subnav"><div class="wrap subnav__in">
  ${sections.map(([id, l]) => `<a href="#${id}">${l}</a>`).join('')}
  <a class="btn btn--sm" href="${waLink(msg)}" target="_blank" rel="noopener">WhatsApp</a>
</div></div>

<section class="section" id="overview">
  <div class="wrap">
    <span class="eyebrow">Project story</span>
    <h2 class="h1 split-lines" style="margin:28px 0 clamp(50px,6vw,90px);max-width:16ch">${lines([p.headline])}</h2>
    <div class="split">
      <div class="prose" data-fade>${p.story.map((s) => `<p>${s}</p>`).join('')}
        <div class="kstats">${p.keyStats.map(([k, v]) => `<div class="kstat"><strong>${v}</strong><span>${k}</span></div>`).join('')}</div>
      </div>
      <div data-fade="0.15">
        <h3 class="h4" style="margin-bottom:20px">Project specifications</h3>
        <dl class="specs">${p.facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
        <div class="hero__btns" style="margin-top:32px">
          <a class="btn" href="#enquire">Request current pricing ${ARR}</a>
          ${p.brochure ? `<a class="btn btn--ghost" href="${p.brochure[0]}" target="_blank" rel="noopener">${p.brochure[1]}</a>` : ''}
        </div>
      </div>
    </div>
  </div>
</section>

<section class="parallax media" data-parallax style="height:90svh;border-radius:0"><img src="${im(p.gallery[1] || p.hero)}" alt="${esc(p.name)}" loading="lazy"></section>

${p.layouts ? `
<section class="section" id="layouts">
  <div class="wrap">
    <div class="shead"><div><span class="eyebrow">Layouts</span><h2 class="h2 split-lines">${lines(['Homes &amp; <em>types</em>'])}</h2></div><p data-fade>Contact our team for detailed layouts and current availability.</p></div>
    <div class="layouts" data-stagger>${p.layouts.map(([t, d], k) => `<div class="lcard"><b>${pad(k + 1)}</b><h3>${t}</h3><p>${d}</p></div>`).join('')}</div>
  </div>
</section>` : ''}

${p.plans ? `
<section class="section paper" id="plans">
  <div class="wrap">
    <div class="shead"><div><span class="eyebrow">Plans</span><h2 class="h2 split-lines">${lines(['Floor plans &amp; <em>masterplans</em>'])}</h2></div><p data-fade>From the official project material. Select a plan to view it full screen. Layouts may change; ask our team for the latest plans.</p></div>
    <div class="plans" data-stagger>${p.plans.map(([f, l]) => `<button data-full="${im(f)}" data-set="plans" data-alt="${esc(l)}" data-cursor="Open"><div class="media"><img src="${im(f)}" alt="${esc(l)}" loading="lazy"></div><span>${l}</span></button>`).join('')}</div>
  </div>
</section>` : ''}

${p.amenities ? `
<section class="section dark" id="amenities">
  <div class="wrap">
    <div class="shead"><div><span class="eyebrow">Amenities</span><h2 class="h2 split-lines">${lines(['Shared spaces', '&amp; <em>facilities</em>'])}</h2></div></div>
    <div class="amen" data-stagger>${p.amenities.map((a) => `<div><i></i>${a}</div>`).join('')}</div>
  </div>
</section>` : ''}

<section class="section" id="gallery" style="overflow:hidden">
  <div class="wrap"><div class="shead"><div><span class="eyebrow">Gallery</span><h2 class="h2 split-lines">${lines([`Inside <em>${p.name}</em>`])}</h2></div><p data-fade>${p.gallery.length} image${p.gallery.length > 1 ? 's' : ''}. Drag to explore, tap to open. Renders are artist’s impressions and may differ from the completed building.</p></div></div>
  <div class="gallery" data-fade>${p.gallery.map((f, k) => `<button data-full="${im(f)}" data-set="gallery" data-alt="${esc(p.name)} image ${k + 1}" data-cursor="Open"><div class="media"><img src="${im(f)}" alt="${esc(p.name)} image ${k + 1}" loading="lazy" draggable="false"></div></button>`).join('')}</div>
</section>

${p.payment ? `
<section class="section paper" id="payment">
  <div class="wrap">
    <div class="shead"><div><span class="eyebrow">Payment plans</span><h2 class="h2 split-lines">${lines(['Published prices', '&amp; <em>instalments</em>'])}</h2></div><p data-fade>${p.payment.terms}</p></div>
    <div class="table-wrap" data-fade><table class="ptable"><thead><tr><th>Type</th><th>Size</th><th>Total</th><th>Schedule</th></tr></thead><tbody>
      ${p.payment.rows.map(([t, s, pr, sc]) => `<tr><td>${t}</td><td>${s}</td><td class="price">${pr}</td><td class="sched">${sc}</td></tr>`).join('')}
    </tbody></table></div>
    <p class="note">As published on the official Gohar website (read on 22 October 2026). Prices and terms can change: please confirm current figures and availability with our sales team before booking.</p>
    <div class="hero__btns" style="margin-top:30px"><a class="btn" href="#enquire">Confirm current pricing ${ARR}</a><a class="btn btn--ghost" href="${waLink(msg)}" target="_blank" rel="noopener">Ask on WhatsApp</a></div>
  </div>
</section>` : ''}

<section class="section" id="location">
  <div class="wrap loc">
    <div>
      <span class="eyebrow">Location</span>
      <h2 class="h2 split-lines" style="margin:26px 0">${lines([loc])}</h2>
      <p class="lead" data-fade>${p.address}</p>
      <div class="chips light-chips" data-stagger>${p.nearby.map((n) => `<span class="chip">${n}</span>`).join('')}</div>
      <div class="hero__btns" style="margin-top:34px" data-fade><a class="btn" href="${mapsQ(p.address)}" target="_blank" rel="noopener">Get directions ${ARR}</a></div>
    </div>
    <div class="media reveal-img zoom"><img src="${im(p.gallery[2] || p.hero)}" alt="${esc(p.name)}" loading="lazy"></div>
  </div>
</section>

<section class="section dark" id="visit">
  <div class="wrap">
    <span class="eyebrow">Request a site visit</span>
    <h2 class="h1 split-lines" style="margin-top:26px">${lines([`See ${p.name}`, '<em>in person</em>'])}</h2>
    ${steps3()}
    <div class="hero__btns" data-fade><a class="btn btn--light" href="${r}site-visit.html?project=${p.slug}">Request a site visit ${ARR}</a><a class="btn btn--ghost on-dark" href="${waLink(msg)}" target="_blank" rel="noopener">WhatsApp our team</a></div>
  </div>
</section>

<section class="section" id="enquire">
  <div class="wrap form-wrap">
    <div>
      <span class="eyebrow">Enquire</span>
      <h2 class="h2 split-lines" style="margin:26px 0">${lines(['Enquire about', `<em>${p.name}</em>`])}</h2>
      <p class="lead" data-fade>Ask about availability, current pricing or payment plans. Our team will contact you during office hours.</p>
      <dl class="specs" style="margin-top:40px" data-fade>
        <div><dt>Telephone</dt><dd><a href="${C.phoneHref}">${C.phone}</a></dd></div>
        <div><dt>Email</dt><dd><a href="mailto:${C.email}">${C.email}</a></dd></div>
        <div><dt>Office hours</dt><dd>${C.hours}<br>${C.closed}</dd></div>
        <div><dt>Head office</dt><dd>${C.office}</dd></div>
      </dl>
    </div>
    <div data-fade="0.15">${enquiryForm(p.slug)}</div>
  </div>
</section>

<a class="next" href="${next.slug}.html" data-cursor="Next">
  ${vid(r, next.slug)}
  <div class="next__in wrap"><span class="eyebrow no-line" style="color:var(--on-dark-2)">Next project</span><h2 class="display">${next.name}</h2><span class="hcard__loc">${next.area}${next.city !== next.area ? ', ' + next.city : ''}</span></div>
</a>

<div class="lb" role="dialog" aria-modal="true" aria-label="Image viewer"><img alt=""><button class="lb__btn lb__close" aria-label="Close">✕</button><button class="lb__btn lb__prev" aria-label="Previous image">←</button><button class="lb__btn lb__next" aria-label="Next image">→</button><div class="lb__count"></div></div>`;
  return layout({ r, file: `projects/${p.slug}.html`, title: `${p.name} | ${loc} | Gohar Group of Companies`, desc: p.summary, body, image: `${p.slug}/${p.hero}` });
}

/* ======================= ABOUT ======================= */
function about() {
  const r = '';
  const trio = [
    { t: 'Homes', h: 'Apartments for families', d: 'Completed towers in Gulshan-e-Iqbal, golf-course views beside ACACIA, and spacious 3 and 4-room apartments in DHA Phase 1.', img: 'gohar-towers/towers-sky.jpg', ps: ['gohar-towers', 'gohar-golf-vista', '141-broadway-heights'] },
    { t: 'Commerce', h: 'Places to do business', d: 'Shops and offices next to Rabi Centre on Tariq Road, 411 shops on Korangi Link Road, and retail podiums beneath our residential towers.', img: 'gohar-green-corner-shopping-center/brochure-exterior.jpg', ps: ['gohar-rabi-center', 'gohar-green-corner-shopping-center', 'gohar-complex-shopping-mall'] },
    { t: 'Communities', h: 'Neighbourhoods, not just buildings', d: 'A gated, master-planned community near Malir, plot communities in three phases at Taiser Town, and Gohar Gateway’s homes, retail, banquet and dining in Hyderabad.', img: 'kn-gohar-green-city/photo-garden-walk.jpg', ps: ['kn-gohar-green-city', 'gohar-villas', 'gohar-gateway'] },
  ];
  const body = `
<section class="phero" data-intro>
  <div class="phero__media"><video src="assets/video/about.mp4" poster="assets/video/about.jpg" autoplay muted loop playsinline preload="auto"></video></div>
  <div class="hero__shade"></div>
  <div class="wrap phero__content">
    <div class="crumbs" data-fade><a href="index.html">Home</a><span>/</span><span>About</span></div>
    <div class="phero__row">
      <h1 class="display split-lines">${lines(['Where relationships', '<em>come first.</em>'])}</h1>
      <p class="lead" data-fade>${C.intro}</p>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="intro__grid">
      <div><span class="eyebrow"><span class="num">(01)</span> Who we are</span></div>
      <p class="statement">We build for the long term: safe, legally sound communities where trust is the foundation and the relationship with every family continues long after the keys are handed over.</p>
    </div>
    <div class="stats" data-stagger>
      <div class="stat"><div class="stat__n" data-count="10">10</div><div class="stat__l"><b>Developments</b></div></div>
      <div class="stat"><div class="stat__n" data-count="2">2</div><div class="stat__l"><b>Cities</b></div></div>
      <div class="stat"><div class="stat__n" data-count="4">4</div><div class="stat__l"><b>Property types</b></div></div>
      <div class="stat"><div class="stat__n" data-count="10">10</div><div class="stat__l"><b>Neighbourhoods</b></div></div>
    </div>
  </div>
</section>

<section class="section--tight paper">
  <div class="wrap glance">
    <div class="media reveal-img zoom" style="aspect-ratio:4/5"><img src="assets/img/gohar-residencia-shopping-mall/render-008.webp" alt="Gohar Residencia & Shopping Mall render" loading="lazy"></div>
    <div>
      <span class="eyebrow">At a glance</span>
      <h2 class="h2 split-lines" style="margin:26px 0 40px">${lines(['Gohar Group', 'of <em>Companies</em>'])}</h2>
      <dl class="specs" data-fade>
        <div><dt>Head office</dt><dd>${C.office}</dd></div>
        <div><dt>Cities</dt><dd>Karachi &amp; Hyderabad</dd></div>
        <div><dt>Portfolio</dt><dd>10 developments</dd></div>
        <div><dt>What we build</dt><dd>Mixed Use · Residential · Commercial · Communities</dd></div>
        <div><dt>Office hours</dt><dd>${C.hours} · ${C.closed}</dd></div>
      </dl>
      <div class="hero__btns" style="margin-top:34px" data-fade><a class="btn" href="${C.phoneHref}">Call ${C.phone}</a><a class="btn btn--ghost" href="mailto:${C.email}">Email us</a></div>
    </div>
  </div>
</section>

<section class="film" data-cursor="Watch">
  <div class="film__frame">${vid(r, 'gohar-residencia-shopping-mall')}<div class="film__shade"></div></div>
  <div class="film__caption"><h2 class="display">${lines(['Built for the', '<em>long term.</em>'])}</h2></div>
</section>

<section class="section">
  <div class="wrap">
    <div class="shead"><div><span class="eyebrow"><span class="num">(02)</span> What we build</span><h2 class="h2 split-lines">${lines(['Homes, workplaces', 'and <em>communities</em>'])}</h2></div></div>
    <div class="trio">
      ${trio.map((t, k) => `<div class="trio__item">
        <div class="media reveal-img trio__media zoom"><img src="assets/img/${t.img}" alt="" loading="lazy"></div>
        <div><span class="eyebrow"><span class="num">${pad(k + 1)}</span> ${t.t}</span><h3 class="h2 split-lines" style="margin:24px 0">${lines([t.h])}</h3><p class="lead" data-fade>${t.d}</p>
        <div class="chips" data-stagger>${t.ps.map((s) => { const p = projects.find((x) => x.slug === s); return `<a class="chip" href="projects/${s}.html">${p.name} · ${p.area}</a>`; }).join('')}</div></div>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="section dark">
  <div class="wrap">
    <div class="shead"><div><span class="eyebrow"><span class="num">(03)</span> Purpose &amp; mission</span><h2 class="h2 split-lines">${lines(['What we <em>stand for</em>'])}</h2></div></div>
    <div class="pms" data-stagger>
      <div class="pm"><b>01 · Our purpose</b><p>${C.purpose}</p></div>
      <div class="pm"><b>02 · Our mission</b><p>${C.mission}</p></div>
      <div class="pm"><b>03 · Our promise</b><p>${C.promise}</p></div>
    </div>
  </div>
</section>

${valuesBlock()}

<section class="section--tight">
  <div class="wrap">
    <div class="shead"><div><span class="eyebrow"><span class="num">(05)</span> Where we build</span><h2 class="h2 split-lines">${lines(['Across Karachi', 'and <em>Hyderabad</em>'])}</h2></div><p data-fade>Each neighbourhood links to the developments there.</p></div>
    <div class="cities">
      <div class="city" data-fade><div class="city__bg">${vid(r, 'gohar-golf-vista')}</div><span class="eyebrow no-line" style="color:var(--on-dark)">09 developments</span><div><div class="city__name">Karachi</div><div class="chips">${areas.map((a) => `<a class="chip" href="projects.html?location=${encodeURIComponent(a)}">${a}</a>`).join('')}</div></div></div>
      <div class="city" data-fade="0.15"><div class="city__bg">${vid(r, 'gohar-gateway')}</div><span class="eyebrow no-line" style="color:var(--on-dark)">01 development</span><div><div class="city__name">Hyderabad</div><div class="chips"><a class="chip" href="projects/gohar-gateway.html">Gohar Gateway</a></div></div></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="shead"><div><span class="eyebrow"><span class="num">(06)</span> Working with us</span><h2 class="h2 split-lines">${lines(['From first enquiry to', '<em>long after handover</em>'])}</h2></div></div>
    <div class="process" data-stagger>
      <div><b>Step 01</b><h3>Explore</h3><p>Browse the portfolio or tell us what you need: a family home, a shop, an office or a plot.</p></div>
      <div><b>Step 02</b><h3>Speak with our team</h3><p>Ask about current pricing, payment plans and availability by phone, email or the enquiry form.</p></div>
      <div><b>Step 03</b><h3>Visit</h3><p>Arrange a site visit and see the location, the plans and the progress for yourself.</p></div>
      <div><b>Step 04</b><h3>Stay connected</h3><p>Transparent communication from booking to handover, and a relationship that continues after it.</p></div>
    </div>
  </div>
</section>

<section class="section--tight">
  <div class="wrap">
    <div class="shead"><div><span class="eyebrow"><span class="num">(07)</span> Our work</span><h2 class="h2 split-lines">${lines(['A selection from', 'the <em>portfolio</em>'])}</h2></div><a class="btn btn--ghost" href="projects.html" data-fade>All projects ${ARR}</a></div>
    <div class="mosaic">
      ${[['gohar-gateway/aerial-courtyard.webp', 'gohar-gateway'], ['gohar-golf-vista/facade-detail.webp', 'gohar-golf-vista'], ['141-broadway-heights/terrace.jpg', '141-broadway-heights'], ['gohar-villas/park.jpg', 'gohar-villas']]
        .map(([img, s]) => `<a class="media reveal-img zoom" href="projects/${s}.html" data-cursor="View"><img src="assets/img/${img}" alt="" loading="lazy"></a>`).join('')}
    </div>
  </div>
</section>

${ctaBlock(r, 'kn-gohar-green-city')}
${contactBand(r)}`;
  return layout({ file: 'about.html', title: 'About | Gohar Group of Companies', desc: C.intro, body, image: 'gohar-towers/towers-sky.jpg' });
}

/* ======================= STORIES ======================= */
function storiesPage() {
  const body = `
<section class="lhead">
  <div class="wrap" data-intro>
    <div class="crumbs" data-fade><a href="index.html">Home</a><span>/</span><span>Gohar Stories</span></div>
    <span class="eyebrow" data-fade>The Gohar journal</span>
    <h1 class="display split-lines" style="margin-top:24px">${lines(['Gohar', '<em>Stories</em>'])}</h1>
    <p class="lead" data-fade style="margin-top:30px">Announcements from the group, the stories behind our developments, and practical guidance for buying property with confidence.</p>
  </div>
</section>
<section class="section--tight" style="padding-top:0"><div class="wrap">${storiesBlock('')}</div></section>
<section class="section">
  <div class="wrap">
    <div class="shead"><div><span class="eyebrow">Explore all articles</span><h2 class="h2 split-lines">${lines(['Every story, <em>in one place</em>'])}</h2></div><p data-fade>${stories.length} articles published by Gohar Group of Companies, newest first.</p></div>
    <div class="pgrid">
      ${stories.map((s) => `<button class="pcard" style="text-align:left" data-story="${esc(JSON.stringify({ ...s, img: 'assets/img/' + s.img }))}" data-cursor="Read" data-fade>
        <div class="pcard__media"><img src="assets/img/${s.img}" alt="" loading="lazy"><div class="pcard__tags"><span class="tag">${s.tag}</span></div></div>
        <div class="pcard__info"><div><p class="story-meta" style="margin:0 0 10px"><span>${s.date}</span><span>${s.read}</span></p><h3>${s.title}</h3></div></div>
      </button>`).join('')}
    </div>
  </div>
</section>
${ctaBlock('', 'gohar-gateway', ['From story', '<em>to site.</em>'])}
${storyModal()}`;
  return layout({ file: 'stories.html', title: 'Gohar Stories | News, project stories & buying guides', desc: 'Announcements from Gohar Group, the stories behind our developments, and practical guidance for buying property.', body, light: true, image: 'stories/meezan-bank-mou.jpg' });
}

/* ======================= CAREERS ======================= */
function careers() {
  const body = `
<section class="phero" data-intro>
  <div class="phero__media"><video src="assets/video/gohar-residencia-shopping-mall.mp4" poster="assets/video/gohar-residencia-shopping-mall.jpg" autoplay muted loop playsinline preload="auto"></video></div>
  <div class="hero__shade"></div>
  <div class="wrap phero__content">
    <div class="crumbs" data-fade><a href="index.html">Home</a><span>/</span><span>Careers</span></div>
    <div class="phero__row">
      <h1 class="display split-lines">${lines(['Build what Karachi', '<em>calls home.</em>'])}</h1>
      <div class="hero__aside"><p class="lead" data-fade>Join a team developing apartments, shopping centres and communities across Karachi and Hyderabad, where relationships come first: with customers and with each other.</p>
      <div class="hero__btns" data-fade><a class="btn btn--light" href="#apply">Send your CV ${ARR}</a><a class="btn btn--ghost on-dark" href="#openings">View openings</a></div></div>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap intro__grid">
    <div><span class="eyebrow"><span class="num">(01)</span> Working at Gohar</span></div>
    <p class="statement">A team shaped by our values. We build with clarity, serve with intent, and design every interaction around long-term trust.</p>
  </div>
</section>
${valuesBlock(true)}
<section class="section">
  <div class="wrap">
    <div class="shead"><div><span class="eyebrow"><span class="num">(02)</span> The work</span><h2 class="h2 split-lines">${lines(['What our teams <em>deliver</em>'])}</h2></div><p data-fade>Every role at Gohar contributes to buildings people live, shop and work in.</p></div>
    <div class="pgrid" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">
      ${[['Homes', 'Apartment towers and family residences.', 'gohar-residencia-shopping-mall/render-001.webp'], ['Commerce', 'Shopping centres, shops and offices.', 'gohar-green-corner-shopping-center/street-view.jpg'], ['Communities', 'Gated, master-planned neighbourhoods.', 'kn-gohar-green-city/photo-garden-walk.jpg']]
        .map(([t, d, img], k) => `<div class="pcard" style="margin-top:0" data-fade="${k * 0.1}"><div class="pcard__media reveal-img"><img src="assets/img/${img}" alt="" loading="lazy"></div><div class="pcard__info"><div><h3>${t}</h3><p>${d}</p></div><span class="pcard__n">${pad(k + 1)}</span></div></div>`).join('')}
    </div>
  </div>
</section>
<section class="section paper" id="openings">
  <div class="wrap split">
    <div><span class="eyebrow"><span class="num">(03)</span> Current openings</span><h2 class="h2 split-lines" style="margin-top:26px">${lines(['Opportunities', 'at <em>Gohar</em>'])}</h2></div>
    <div class="notice" data-fade><span class="eyebrow no-line">General application</span><h3>No open positions right now</h3><p>There are no vacancies advertised at the moment. New roles are published here as soon as they are approved. In the meantime, send us your CV and we’ll keep it on file for future opportunities.</p><a class="btn" href="#apply">Send your CV ${ARR}</a></div>
  </div>
</section>
<section class="section" id="apply">
  <div class="wrap form-wrap">
    <div>
      <span class="eyebrow"><span class="num">(04)</span> Send your CV</span>
      <h2 class="h2 split-lines" style="margin:26px 0">${lines(['Send us', 'your <em>details</em>'])}</h2>
      <p class="lead" data-fade>Register your interest for future roles. Fill in the form, then attach your CV (PDF or Word, up to 4 MB) in the email that opens.</p>
      <div class="steps light-steps" style="grid-template-columns:1fr;max-width:420px" data-stagger>
        <div class="step"><b>01</b><span>Send your details and CV</span></div>
        <div class="step"><b>02</b><span>We keep them on file and review when a suitable role opens</span></div>
        <div class="step"><b>03</b><span>If your experience matches, we contact you by phone or email</span></div>
      </div>
    </div>
    <form class="form" data-form="job application" novalidate data-fade="0.15">
      <div class="field"><label for="c-name">Full name *</label><input id="c-name" name="name" autocomplete="name" required><span class="err">Please enter your name.</span></div>
      <div class="field"><label for="c-email">Email *</label><input id="c-email" name="email" type="email" autocomplete="email" required><span class="err">Please enter a valid email.</span></div>
      <div class="field"><label for="c-phone">Phone *</label><input id="c-phone" name="phone" type="tel" autocomplete="tel" required><span class="err">Please enter a valid phone number.</span></div>
      <div class="field"><label for="c-city">City (optional)</label><select id="c-city" name="city">${cityOptions}</select></div>
      <div class="field"><label for="c-role">Role or area of interest</label><input id="c-role" name="role"></div>
      <div class="field"><label for="c-link">LinkedIn or portfolio link</label><input id="c-link" name="link" type="url"></div>
      <div class="field full"><label for="c-note">Short note (optional)</label><textarea id="c-note" name="note" maxlength="1000"></textarea></div>
      <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <label class="check field"><input type="checkbox" name="consent" required><span>I agree that Gohar Group of Companies may keep my details and CV to consider me for current and future roles. *</span></label>
      <div class="form__actions"><button class="btn" type="button" data-mail>Email my details ${ARR}</button><button class="link-u" type="submit">Or send via WhatsApp</button></div>
      <div class="form__ok" role="status">Thank you. Please attach your CV in the email (or WhatsApp chat) before you press send.</div>
    </form>
  </div>
</section>`;
  return layout({ file: 'careers.html', title: 'Careers | Gohar Group of Companies', desc: 'Join a team developing apartments, shopping centres and communities across Karachi and Hyderabad.', body });
}

/* ======================= CONTACT ======================= */
function contact() {
  const body = `
<section class="lhead">
  <div class="wrap" data-intro>
    <div class="crumbs" data-fade><a href="index.html">Home</a><span>/</span><span>Contact</span></div>
    <span class="eyebrow" data-fade>Contact</span>
    <h1 class="display split-lines" style="margin-top:24px">${lines(['Let’s talk about', 'your <em>next move.</em>'])}</h1>
    <p class="lead" data-fade style="margin-top:30px">Ask about a project, request current pricing or arrange a site visit. Our team is available ${C.hours}.</p>
  </div>
</section>
<section class="section--tight" style="padding-top:0">
  <div class="wrap">
    <div class="contact-grid" data-stagger>
      <a class="cbox" href="${C.phoneHref}"><small>Call us (UAN)</small><strong>${C.phone}</strong><span>${C.hours}</span></a>
      <a class="cbox" href="mailto:${C.email}"><small>Email</small><strong>${C.email}</strong><span>We reply during office hours</span></a>
      <a class="cbox" href="${WA_DEFAULT}" target="_blank" rel="noopener"><small>WhatsApp</small><strong>Chat with our team</strong><span>Opens WhatsApp</span></a>
      <a class="cbox" href="${C.mapUrl}" target="_blank" rel="noopener"><small>Head office</small><strong>${C.officeShort}</strong><span>Get directions</span></a>
    </div>
  </div>
</section>
<section class="section paper">
  <div class="wrap form-wrap">
    <div>
      <span class="eyebrow">Send an enquiry</span>
      <h2 class="h2 split-lines" style="margin:26px 0">${lines(['Tell us how', 'we can <em>help</em>'])}</h2>
      <p class="lead" data-fade>Fields marked * are required. We only use your details to respond to your enquiry.</p>
      <div class="media" style="aspect-ratio:4/3;margin-top:40px" data-fade>
        <button class="btn" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2" data-map="https://maps.google.com/maps?q=Gohar%20Chamber%20Shahra-e-Faisal%20Karachi&output=embed">Show map ${ARR}</button>
        <img src="assets/img/gohar-golf-vista/exterior.webp" alt="" loading="lazy" style="opacity:.35">
      </div>
      <p class="note">The interactive map is provided by Google and loads only when you choose to view it. ${C.office}.</p>
    </div>
    <div data-fade="0.15">${enquiryForm()}</div>
  </div>
</section>
<section class="section">
  <div class="wrap split">
    <div><span class="eyebrow">Questions</span><h2 class="h2 split-lines" style="margin-top:26px">${lines(['Frequently', '<em>asked</em>'])}</h2></div>
    <div class="faq" data-stagger>${faqs.map(([q, a]) => `<details><summary>${q}<i></i></summary><p>${a}</p></details>`).join('')}</div>
  </div>
</section>
${ctaBlock('', 'gohar-villas')}`;
  return layout({ file: 'contact.html', title: 'Contact | Gohar Group of Companies', desc: 'Call +92 21 111 000 061, email info@gohargoc.com or visit Gohar Chamber, Shahra-e-Faisal, Karachi.', body, light: true });
}

/* ======================= SITE VISIT ======================= */
function siteVisit() {
  const body = `
<section class="phero" data-intro>
  <div class="phero__media"><video src="assets/video/141-broadway-heights.mp4" poster="assets/video/141-broadway-heights.jpg" autoplay muted loop playsinline preload="auto"></video></div>
  <div class="hero__shade"></div>
  <div class="wrap phero__content">
    <div class="crumbs" data-fade><a href="index.html">Home</a><span>/</span><span>Request a site visit</span></div>
    <div class="phero__row">
      <h1 class="display split-lines">${lines(['See a Gohar', 'development', '<em>in person.</em>'])}</h1>
      <p class="lead" data-fade>Tell us which project you’d like to see and when suits you. This is a request: our team will call you to confirm a time before your visit.</p>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap form-wrap">
    <div>
      <span class="eyebrow">How it works</span>
      ${steps3('light-steps').replace('class="steps', 'style="grid-template-columns:1fr;margin-top:30px" class="steps')}
      <dl class="specs" data-fade>
        <div><dt>Visiting hours</dt><dd>${C.hours}<br>${C.closed}</dd></div>
        <div><dt>Prefer to talk?</dt><dd><a class="link-u" href="${C.phoneHref}">${C.phone}</a><br><span class="muted small">Call our office to arrange a visit directly.</span></dd></div>
      </dl>
      <p class="note">Time windows are preferences within office hours. We don’t show live availability, so every visit is confirmed by phone.</p>
    </div>
    <form class="form" data-form="site visit request" novalidate data-fade="0.15">
      <div class="field full"><label for="v-project">Project *</label><select id="v-project" name="project" required><option value="">Choose a development</option>${projects.map((p) => `<option value="${p.slug}">${p.name} — ${p.area}</option>`).join('')}</select><span class="err">Please choose a project.</span></div>
      <div class="field"><label for="v-date">Preferred day *</label><input id="v-date" name="date" type="date" required><span class="err">Please choose a day.</span></div>
      <div class="field"><label for="v-time">Time window *</label><select id="v-time" name="time" required><option value="">Choose a time</option><option>11:00 AM – 1:00 PM</option><option>1:00 PM – 3:00 PM</option><option>3:00 PM – 5:00 PM</option><option>5:00 PM – 8:00 PM</option></select><span class="err">Please choose a time window.</span></div>
      <div class="field"><label for="v-name">Full name *</label><input id="v-name" name="name" autocomplete="name" required><span class="err">Please enter your name.</span></div>
      <div class="field"><label for="v-phone">Phone *</label><input id="v-phone" name="phone" type="tel" autocomplete="tel" required><span class="err">Please enter a valid phone number.</span></div>
      <div class="field"><label for="v-email">Email (optional)</label><input id="v-email" name="email" type="email" autocomplete="email"></div>
      <div class="field"><label for="v-people">Visitors</label><select id="v-people" name="people"><option>1</option><option>2</option><option>3</option><option>4+</option></select></div>
      <div class="field full"><label for="v-note">Anything we should know? (optional)</label><textarea id="v-note" name="note" maxlength="1000"></textarea></div>
      <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <label class="check field"><input type="checkbox" name="consent" required><span>I understand this is a request and the visit is confirmed only after the team calls me. *</span></label>
      <div class="form__actions"><button class="btn" type="submit">Send request via WhatsApp ${ARR}</button><button class="link-u" type="button" data-mail>Or send by email</button></div>
      <div class="form__ok" role="status">Thank you. Press send in WhatsApp (or your email app) and our team will call you to confirm your visit.</div>
    </form>
  </div>
</section>
<section class="section--tight paper">
  <div class="wrap">
    <div class="shead"><div><span class="eyebrow">Or start with a development</span><h2 class="h2 split-lines">${lines(['Popular <em>visits</em>'])}</h2></div></div>
    <div class="plist">${['141-broadway-heights', 'gohar-golf-vista', 'kn-gohar-green-city', 'gohar-villas', 'gohar-green-corner-shopping-center', 'gohar-residencia-shopping-mall'].map((s, k) => { const p = projects.find((x) => x.slug === s); return `<a class="prow" href="site-visit.html?project=${s}"><span class="prow__n">${pad(k + 1)}</span><span class="prow__t">${p.name}</span><span class="prow__l">${p.area}</span><span class="prow__c">Request a visit</span><span class="prow__a">${NE}</span></a>`; }).join('')}</div>
  </div>
</section>`;
  return layout({ file: 'site-visit.html', title: 'Request a site visit | Gohar Group of Companies', desc: 'Choose a Gohar development, a preferred day and a time window. Our team calls you to confirm your visit.', body, image: '141-broadway-heights/dusk.jpg' });
}

/* ---------- write ---------- */
const write = (f, html) => { fs.mkdirSync(path.dirname(path.join(OUT, f)), { recursive: true }); fs.writeFileSync(path.join(OUT, f), html); };
write('index.html', home());
write('about.html', about());
write('projects.html', projectsPage());
write('stories.html', storiesPage());
write('careers.html', careers());
write('contact.html', contact());
write('site-visit.html', siteVisit());
projects.forEach((p, i) => write(`projects/${p.slug}.html`, projectPage(p, i)));
console.log(`Built ${7 + projects.length} pages.`);
