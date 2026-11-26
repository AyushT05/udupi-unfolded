# Design direction (v9)
World: a monsoon coast read like a field journal. One photograph at a time, set against Gloock (display) and Allo (text); colour taken from the places: sea ink #061a20, laterite #8b3a1e, lamp gold #f2a93b, bone #ece4d2.
Rules: photographs are rectangles (2px); pills only for buttons and the nav; no eyebrows or section numbers; no glass except the nav pill; no gradients as decoration; missing photos show a seeded contour field (components/Scene.jsx), never clip-art.
Motion: hero title rises once; Discover words brighten on scroll; the Places stage crossfades and auto-advances; Festival frames open like a curtain once, then drift. Everything else answers hover only. Zooms are transform-only and pause off screen.
Tokens live in app/premium.css (loaded after globals.css and wins over it).
