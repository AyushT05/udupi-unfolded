# UI fixes — November 2026

- Experience cards: separated the caption layer from the photo layer so the image fills each card while the existing parallax motion remains intact.
- FlavorFusion promo: reduced its footprint and removed the white logo container. The existing PNG contains an alpha channel, so it now sits directly on the promo background.
- Stay section: replaced all five stay photographs with the images supplied in `Stays.zip`.
- Anegudde Rathotsava: cropped the corrupted top and bottom bands from the supplied festival photograph.
- Gallery: replaced the lower-resolution / watermarked frames (`g01`, `g02`, `g05`, `g08`, `g09`, `g10`, `g11`, `g12`) with cleaner photographs already in the project and updated their captions.
- Gallery lightbox: moved it above the fixed navigation and added more top breathing room.
- Beyond town: balanced the final two cards in the five-card desktop layout and renamed the section/filter from “Hidden gems” to “Beyond town”.
- Place detail pages: aligned all story photographs to the same left edge.

No routes, data IDs, APIs, or application features were intentionally changed.


## Stay section visibility fix

- Fixed the root cause of the missing stay photographs: `.apanel` used `justify-items: start`, allowing the image grid item to shrink to zero width because its contents are absolutely positioned.
- Rebuilt the selected-area panel as a responsive two-column composition: a prominent 4:3 photograph alongside the area's description and stay-search link.
- The photograph and copy stack cleanly on narrow screens.
- Added explicit width/height constraints to the image frame and its photo wrapper.
- Added accessible tab/panel relationships and a descriptive alt text for each selected area's image.
- Confirmed all five `public/img/stay-1.jpg` through `stay-5.jpg` assets are included.


## Gallery image and lightbox corrections

- Replaced the three weak gallery frames (`g10`, `g11`, `g12`) with cleaner, higher-resolution photographs already present in the project:
  - `g10`: 1800×1125 estuary boat photograph (`kem-2` source).
  - `g11`: 1800×1125 Kodi Bengre estuary aerial (`kodi-3` source), without the previous overlaid branding.
  - `g12`: 1800×1125 traditional coastal house (`hasta-3` source).
- Updated the corresponding gallery alt text, categories and captions.
- The gallery lightbox now stops the site-wide Lenis smooth-scroll instance and locks document scrolling while open. Scroll is restored when the lightbox closes; Escape and arrow-key navigation remain available.
- Raised the lightbox stacking level and constrained its image to the viewport.
- Disabled scroll-parallax only for the Anegudde Rathotsava frame and removed its overscan inset. The source photograph itself is clean; the edge streaking was caused by the animated image-frame treatment, not by the source pixels.


## Final gallery and Anegudde correction

- The gallery now uses three new, versioned image URLs rather than reusing the old `g10.jpg`, `g11.jpg`, and `g12.jpg` paths. This prevents browsers from continuing to show stale cached copies after asset replacement.
- New gallery photographs:
  - `gallery-estuary-boat-v2.jpg` — 1800 × 1125, a boat on the Swarna estuary.
  - `gallery-kodi-bengre-v2.jpg` — 1800 × 1125, an aerial estuary and fishing-boat view.
  - `gallery-coastal-house-v2.jpg` — 1800 × 1125, a traditional coastal house at dusk.
- The old `g10`, `g11`, and `g12` image records remain available for article fallback references; they are no longer the gallery cards.
- Anegudde now uses the distinct URL `fest-anegudde-v2.jpg`, so the browser cannot reuse the previous cached file.
- The Anegudde image is displayed at its native 16:10 aspect ratio. It is not cropped, stretched, or given a parallax transform. This removes the top/bottom streaking seen in the supplied screenshot.
