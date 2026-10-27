# Gohar Group of Companies — website

A premium, animated website for Gohar Group: full-screen project films, scroll animations, smooth scrolling and page transitions. Plain HTML/CSS/JS, so it can be hosted anywhere (Vercel, Netlify, any web host).

## See it on your computer

```bash
npm start
```

Then open http://localhost:5173 in your browser.
You can also double-click `index.html`, but the local server gives the most accurate preview.

## Change text or projects

1. Edit `tools/data.mjs` (company details, all 10 projects, stories, FAQs).
2. Rebuild the pages:

```bash
npm run build
```

## Replace the films

The films in `assets/video/` are made from Gohar's own renders and photos (`tools/make-films.mjs`).
When you have real drone or site footage, save it as `assets/video/<project-slug>.mp4` (for example `gohar-gateway.mp4`), keep it short (10–20 s), silent and under ~5 MB. Also update the matching `.jpg` poster image.

To re-make the films from images: `npm run films`

## Folders

- `index.html`, `about.html`, `projects.html`, `stories.html`, `careers.html`, `contact.html`, `site-visit.html`, `projects/*.html` — built pages (don't edit by hand; edit `tools/` and rebuild)
- `assets/css/site.css` — design and layout
- `assets/js/site.js` — animations and interactions
- `assets/img/` — photos and renders from the current Gohar website
- `assets/video/` — project films
- `tools/` — content file and build scripts

## Forms

Enquiry, site-visit and careers forms open WhatsApp (+92 337 3723420) or the visitor's email app with the details filled in. No server needed. If you later want form submissions saved to a database or sent by email automatically, that needs a small backend.
