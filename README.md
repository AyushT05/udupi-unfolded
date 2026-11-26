# Udupi (Next.js) v2

```
npm install
cp .env.example .env.local     # add GROQ_API_KEY to enable the live guide
npm run photos                 # real photos from Wikimedia Commons (needs internet), then review them
npm run dev                    # http://localhost:3000
```

Stack: Next.js App Router, framer-motion, GSAP (gallery strip), Lenis, Leaflet with dark map tiles, the Allo variable font via next/font/local, sharp for photo optimisation.

## Design system
Two surfaces (deep ink, warm sand) alternating down the page, one saffron accent, Allo with the ROND axis at 100 for display type. No per-category colours anywhere. When a photo is missing, an illustrated scene (lib/photos + components/Scene.jsx) is shown instead of a flat box.

## Photos
All photos are yours. `lib/photos.mjs` lists every slot (id, what to shoot, required or optional). Put originals in `photos-raw/` named after the slot id (`malpe.jpg`, `food-dosa.png`, ...) and run `npm run photos`: it resizes to 2400px, compresses to `public/img/<id>.jpg` and prints what is still missing. Optional slots (`mom-*`, `stay-*`, `gem-*`) fall back to the place photo; a missing required photo shows an illustrated scene, and the gallery only shows photos that exist.

## Live guide (Groq)
`/api/chat` streams from Groq's OpenAI-compatible endpoint. Defaults: model `openai/gpt-oss-20b`, `reasoning_effort: low`. Env: `GROQ_API_KEY` (server only), `GROQ_MODEL`, optional `GROQ_BASE_URL`. Without a key the UI says "Offline demo" and answers from built-in rules. The in-memory rate limit is per server instance; use a shared store before going public.

## Notes
Stories are stored in localStorage only. Weather uses the free Open-Meteo API (no key; its free tier is for non-commercial use, so use a paid plan if the site is commercial). Hospitals, restaurants and parking are not plotted because they cannot be verified from this repo.

## v7 changes
Gallery strip (GSAP), liquid-glass header, hero loads without a placeholder, guide answers any Udupi question (distances are computed from coordinates in `lib/data.js`), longer place text, five new hidden gems (optional photo slots `kunj`, `barkur`, `udyavara`, `padubidri`, `karkala`).

## v8 changes
- Nav: liquid-glass pill with a sliding glass lens that follows the section you are in and wobbles (spring plus velocity squash and stretch) when you click or scroll between sections. Logo, links, Plan button and Menu button jiggle on hover and tap.
- Places to wander: full-bleed stage (crossfading photo, big place name, vertical thumbnail carousel, details bottom-left, Read more bottom-right). "Hide gallery" toggles the carousel. Arrow keys and swipe work.
- Hidden gems: cards whose image melts into a blurred dark lower half, with a Read more pill.
- Festivals: constant slow zoom inside every photo frame (keyframes `fz` in `app/globals.css`).
- Detail pages: `/places/[id]` for all 17 places. Content lives in `lib/details.js`.
- Food: ten niche coastal dishes in `lib/data.js` (`FOOD`), with the old four kept as `CLASSICS`. New photo slots are in `lib/photos.mjs`.
- Higher-resolution backgrounds: put originals in `photos-raw/` named after the place id and run `npm run photos`; the stage uses the same `public/img/<id>.jpg` files.
- `package-lock.json` is missing `gsap`; run `npm install` once to refresh it.

## v10 changes (built on v8.2: fonts and look unchanged)
- Hero: slides stay mounted; the incoming photo fades in over a fully opaque outgoing photo, so there is no dark dip, no double fade, and no zoom restart. The hero is pinned and the Discover sheet slides up over it while the photo pushes in and dims.
- Scroll effects: headings rise word by word out of masks; Discover photos open like curtains; kinetic place-name and dish-name tickers move with the page and lean with scroll velocity; the Places stage scales in; Hidden gems tilt toward the pointer with a moving highlight and drift at different speeds; Experiences is a pinned horizontal gallery driven by vertical scroll; Festival frames open like curtains and drift inside their frames, text staggers in, timeline bars grow.
- Interaction: curtain wipe between pages (links with `data-curtain`), reading-progress line, cursor ring that grows over pressable things and shows "Read" on gem cards, magnetic buttons (`data-magnet`), "Surprise me" in Places, and a footer wordmark whose letters sharpen (the font's ROND axis), lift and warm to gold near the pointer.
- All motion is transform/opacity only, pauses off screen, and is disabled by prefers-reduced-motion (the gallery falls back to a normal swipe row).

## v11 changes
- Food: the section title is now "Flavours of the coast" and the classics strip is "The Udupi classics".
- Place pages: every story is longer and written in sections (`lib/details.js`). Photographs are set into the middle of the text with the same curtain reveal, drift and slow zoom as the festival frames (`components/Figure.jsx`). Each place has slots `<id>-2` and `<id>-3` (Sri Krishna Matha also `matha-4`): add your own photo with that name in `photos-raw/`, run `npm run photos`, and it replaces the fallback. Places with no photo at all show the illustrated scene until you add one.
- Festivals: now only real festivals, in the order you gave (`FEST` in `lib/data.js`): Janmashtami & Vittal Pindi, Paryaya, Laksha Deepotsava, Makara Sankranti & Saptotsava, Uchila Dasara, Kodi Habba, Anegudde Vinayaka Rathotsava, Kollur Mookambika Navaratri. Each has dates, place, a fuller description, what to look for and a practical note. The year timeline uses the short names (`s`).
- New Traditions section (`ARTS` in `lib/data.js`, component `Traditions` in `components/When.jsx`): Yakshagana, Huli Vesha, Kambala, Bhoota Kola, Nagamandala, Gombeyata. Photo slots `art-kambala`, `art-bhoota`, `art-nagamandala`, `art-gombeyata` (Yakshagana and Huli Vesha reuse the festival photos). Festival photo slots `fest-uchila`, `fest-kodi`, `fest-anegudde`, `fest-kollur` fall back to existing photos until you add your own.
- Cursor: the "Read" circle is now a liquid-glass lens (blur, refraction in Chromium, bright rim and highlight). The system cursor is hidden whenever the custom cursor is running (mouse and trackpad only; touch is unchanged).
- Sound: `lib/sfx.js` holds the sound hooks. Nothing plays until you add file paths to the `SFX` object (files go in `public/sfx/`). Events already wired: cursor over links, the glass lens opening and closing, mouse down and up, the page curtain, the header lens, and figure reveals.
- Fix: `Photo` now tries its fallback image when the first one is missing before the page has hydrated.

## v12 changes
- All supplied photographs are in `public/img` (resized to 2400px max, JPEG). New slots: `hero-1..4` and `discover-1..3` (each falls back to a place photo if missing). The Experiences gallery uses six matched photographs (`mom-1..6`).
- Hero: no kicker line, place list or timer bar; photographs just cross-fade.
- Places stage: hovering slows the slideshow to 1.8x instead of pausing it (`SLOW` in `components/Places.jsx`).
- The "Read" cursor lens is removed; the cursor is the ring and dot only. Sound hooks remain in `lib/sfx.js`.
- Food: the big photograph follows your scroll position (the dish in the middle band is active); click, tap or Tab also works.
- Traditions: the location line under each tradition is removed.
- Optional portrait card photos `gem-kunj`, `gem-barkur`, `gem-udyavara`, `gem-padubidri`, `gem-karkala` fall back to the place photos.

## Deploying and the guide (v15)
- **Guide (live AI).** Set `GROQ_API_KEY` and/or `GEMINI_API_KEY` in your host's environment (see `.env.example`). The route `app/api/chat/route.js` tries Groq first, then Gemini, and lets the model call tools in `lib/guide-tools.js` for distances, place facts, itineraries, seasons, festivals and food. With no key (or if both providers fail) the browser falls back to the built-in engine in `lib/local.js`, so the guide always works. The per-IP rate limit is in memory; use a shared store (e.g. Upstash) for heavy traffic.
- **Site URL.** Set `NEXT_PUBLIC_SITE_URL` (for example `https://your-domain.com`) so the sitemap, canonical links and social cards use your domain. On Vercel the production domain is detected automatically.
- **Sounds.** Events and files are mapped in `lib/sfx.js`. Hover is silent; click, page transition, photo reveal, guide send/reply and the footer wordmark have sounds. Photo and footer sounds play once per visit.
- **Production files.** `robots`, `sitemap`, `manifest`, `not-found`, `error`, social-share image, favicon set, security and cache headers (`next.config.mjs`).
- **FlavorFusion promo** is at the end of the Food section (`components/Food.jsx`, logo in `public/img/flavorfusion-logo.png`).


## Editorial refresh
- Reworked the destination introduction, place cards, all 17 place summaries, food writing, experience captions, accommodation guidance, trip planner, map, seasonal guide, visitor information, navigation labels, metadata and error states.
- Added `EDITORIAL-SOURCES.md` with the public references used for historical, cultural and visitor-information checks.
