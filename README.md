# Gohar Group of Companies — website

A premium, animated website for Gohar Group: full-screen project films, scroll animations, smooth scrolling and page transitions. Plain HTML/CSS/JS, so it can be hosted anywhere (Vercel, Netlify, any web host).

## See it on your computer

```bash
npm start
```

Then open http://localhost:5173 in your browser. (For AI answers in the chat, see "Gohar Assistant" below.)

## Change text or projects

1. Edit `tools/data.mjs` (company details, all 10 projects, stories, FAQs).
2. Rebuild the pages:

```bash
npm run build
```

## Demo footage (replace before launch)

The home hero, the "Gohar promise" video band and the footer background use **free stock clips from Pexels** (pexels.com/license, free for commercial use) in `assets/video/stock/`. They are **not Gohar buildings**. They're there to show the client the look, and the footer says so in small print. Before the site goes live, replace them with Gohar's own drone footage (same file names), or set `heroMedia.video` to `''` in `tools/data.mjs` to go back to the photographic preview.

## Films and "photographic previews"

No real video footage exists yet. The moving pieces in `assets/video/` are **photographic previews**: pan/zoom animations made from Gohar's own renders and photos (`tools/make-films.mjs`). The site labels them "Photographic preview", never "Film".

Each project has a `media` entry in `tools/data.mjs` (the home hero uses `heroMedia`, the About page `aboutMedia`):

```js
media: { video: '', videoPoster: '', motion: 'assets/video/<slug>.mp4', poster: 'assets/video/<slug>.jpg' }
```

To add real drone, walkthrough or site footage for a project:
1. Save it as e.g. `assets/video/film/gohar-gateway.mp4` (10–30 s, H.264, no sound needed, ideally under ~8 MB) plus a `.jpg` poster.
2. Set `video` and `videoPoster` for that project in `tools/data.mjs`.
3. Run `npm run build`. The page then shows it labelled "Film" with play/pause controls.

To re-make the photographic previews: `npm run films`. To make lighter WebP copies of new photos: `npm run images`.
To check every link, image and video exists: `npm run check`.

## Photos

All project photos and renders were cleaned up and sharpened with `npm run enhance` (removes compression blocks, gentle denoise, sharpening, slight contrast and colour lift). Floor plans and master plans are left untouched. The untouched originals are kept in `_originals/img/`. Do not upload that folder to the web host.

When you add new photos, put them in `assets/img/<project>/`, then run:

```bash
npm run enhance
npm run images
npm run build
```

Processing can only do so much with small or blurry source files. The biggest jump in quality will come from Gohar's original high-resolution renders and photos.

## Gohar Assistant (chat + AI)

The assistant (bottom-right on every page) has two parts:

- **Buttons and quick answers** (Show all projects, Book a site visit, etc.) are instant and come from the website's own content.
- **Typed questions** are answered by **AI** (Claude, by Anthropic), which is given all of Gohar's website content and strict rules: only Gohar and property topics, never invent prices, dates, availability or reviews, reply in English, Urdu or Roman Urdu, and hand over to the sales team when unsure. Answers stream in word by word.
- If the AI is not set up or is unavailable, typed questions are answered by the built-in assistant instead, so visitors never see an error.

### Turn on AI answers (one time)

1. Create an Anthropic API key at https://platform.claude.com (Settings > API keys). Usage is billed by Anthropic per message.
2. Copy `.env.example` to a new file called `.env` in this folder and paste the key after `ANTHROPIC_API_KEY=`.
3. Start the site:

```bash
npm start
```

The terminal shows **"Gohar Assistant: AI answers ON"**. Open http://localhost:5173.

**Keep the key private.** `.env` is ignored by git and blocked by the local server; never paste the key into website files.

### When the website goes live

Static hosting alone cannot run the AI. Host on a platform with serverless functions (for example Vercel, which runs `api/assistant.js` automatically) and add `ANTHROPIC_API_KEY` in the host's environment-variable settings. The assistant calls `api/assistant` on the same site (`assistantEndpoint` in `tools/data.mjs`).

### Files

- `api/assistant.js`: the AI function (model, rules, rate limit).
- `server/dev.mjs`: local server for the website plus the AI (`npm start`). `npm run start:static` serves the site without AI.
- `assets/js/assistant.js`: the chat window. `assets/data/assistant.json`: the knowledge file, rebuilt by `npm run build`.

## Folders

- `index.html`, `about.html`, `projects.html`, `stories.html`, `careers.html`, `contact.html`, `site-visit.html`, `projects/*.html` — built pages (don't edit by hand; edit `tools/` and rebuild)
- `assets/css/site.css` — design and layout
- `assets/js/site.js` — animations and interactions
- `assets/img/` — photos and renders from the current Gohar website
- `assets/video/` — project films
- `tools/` — content file and build scripts

## Forms

Enquiry, site-visit and careers forms open WhatsApp (+92 337 3723420) or the visitor's email app with the details filled in. The visitor still has to press Send, and the page says so. It never claims a request was received.

To send forms straight to your team instead, set `formEndpoint` in `tools/data.mjs` to an HTTPS address that accepts a JSON POST (for example a Formspree form or a small serverless function), then rebuild. The "has reached our team" message appears only when that server replies OK. If it fails, the form falls back to WhatsApp.

Site-visit links from project pages preselect the project (`site-visit.html?project=<slug>`).
