// Single source of truth for every photo slot. Files live in public/img/<id>.jpg.
// Put your originals in photos-raw/ named <id>.jpg (any common format) and run `npm run photos`:
// it resizes to 2400px, compresses, writes public/img/<id>.jpg and lists what is still missing.
// req: false = optional; the site falls back to the `fb` photo (or an illustrated scene) when absent.
const P = (id, cat, alt, hint, extra = {}) => ({ id, cat, alt, hint, req: true, ...extra });
export const PH = [
  // Hero: four full-screen slides, landscape 16:9, calm lower-left (the title sits there). Each falls back to a place photo.
  P("hero-1", "Hero", "Hero: Malpe", "Malpe at golden hour. 2400x1350", { req: false, fb: "malpe" }),
  P("hero-2", "Hero", "Hero: St Mary’s Islands", "Basalt columns. 2400x1350", { req: false, fb: "stm" }),
  P("hero-3", "Hero", "Hero: Krishna Matha", "Temple frontage. 2400x1350", { req: false, fb: "matha" }),
  P("hero-4", "Hero", "Hero: Hasta Shilpa", "Heritage village. 2400x1350", { req: false, fb: "hasta" }),
  // Discover: three portrait photographs, 3:4
  P("discover-1", "Discover", "Discover: Temple", "Portrait 3:4, 1500x2000", { req: false, fb: "matha" }),
  P("discover-2", "Discover", "Discover: Sea", "Portrait 3:4, 1500x2000", { req: false, fb: "malpe" }),
  P("discover-3", "Discover", "Discover: Stone", "Portrait 3:4, 1500x2000", { req: false, fb: "stm" }),
  // Places: also used for the hero, Discover, Stay and Map. Landscape, subject near the centre.
  P("matha", "Temples", "Sri Krishna Matha", "Temple frontage or Car Street. Landscape; also used in the hero"),
  P("malpe", "Beaches", "Malpe Beach", "Malpe at golden hour. Landscape; also used in the hero"),
  P("stm", "Islands", "St Mary’s Islands", "The basalt columns. Landscape; also used in the hero"),
  P("anant", "Temples", "Anantheshwara Temple", "Temple exterior or detail"),
  P("hasta", "Heritage", "Hasta Shilpa Heritage Village", "Heritage houses and carved woodwork"),
  P("kaup", "Beaches", "Kaup Beach and Lighthouse", "Lighthouse on the rocks"),
  P("mar", "Beaches", "Maravanthe", "Sea on one side, river on the other. Landscape; also used in the hero"),
  P("endp", "Nature", "Manipal End Point", "Lake and viewpoint"),
  P("kodi", "Beaches", "Kodi Beach", "Long, calm stretch of sand"),
  P("kem", "Nature", "Kemmannu", "Estuary, hanging bridge or fishing boats"),
  P("mattu", "Beaches", "Mattu Beach", "Quiet shore"),
  P("delta", "Beaches", "Delta Beach", "Where river meets sea"),
  // Food (niche dishes). Portrait-friendly; the fish dishes fall back to food-fish.
  P("food-pathrode", "Food", "Pathrode", "Sliced, pan-fried pathrode on a plate", { req: false }),
  P("food-moode", "Food", "Moode / kotte kadubu", "Idli steamed in jackfruit leaf, opened", { req: false }),
  P("food-gatti", "Food", "Halasina hannu gatti", "Jackfruit gatti in its leaf", { req: false }),
  P("food-sajjige", "Food", "Sajjige and bajil", "The two served together", { req: false }),
  P("food-hayagreeva", "Food", "Hayagreeva", "A bowl of hayagreeva", { req: false }),
  P("food-midi", "Food", "Appe midi pickle", "Whole baby mangoes in a jar", { req: false }),
  P("food-punarpuli", "Food", "Punarpuli", "Kokum sherbet in a glass", { req: false }),
  P("food-korirotti", "Food", "Kori rotti", "Crisp rotti with chicken gassi", { req: false }),
  P("food-bangude", "Food", "Bangude pulimunchi", "Mackerel in red gravy", { req: false, fb: "food-fish" }),
  P("food-kane", "Food", "Kane rava fry", "Rava-crusted fried ladyfish", { req: false, fb: "food-fish" }),
  // The classics strip under the dishes
  P("food-dosa", "Food", "Masala dosa", "Masala dosa on a plate, shot from above or at 45 degrees"),
  P("food-neer", "Food", "Neer dosa", "Neer dosa with chutney or curry"),
  P("food-gulla", "Food", "Mattu gulla", "Brinjal curry or sambar made with it"),
  P("food-meal", "Food", "Temple meal", "A banana-leaf meal, ideally at the Matha"),
  P("food-fish", "Food", "Fresh fish", "Fish thali or fried catch at Malpe"),
  // Festivals (timeline)
  P("fest-sankranti", "Festivals", "Makara Sankranti chariots", "The three chariots on Car Street"),
  P("fest-paryaya", "Festivals", "Paryaya", "Paryaya procession"),
  P("fest-yakshagana", "Festivals", "Yakshagana", "Performers in costume, on stage"),
  P("fest-janmashtami", "Festivals", "Krishna Janmashtami", "Vittal Pindi, Govardhana costumes or the golden chariot"),
  P("fest-hulivesha", "Festivals", "Hulivesha tiger dance", "Tiger-painted dancers"),
  P("fest-navaratri", "Festivals", "Navaratri", "Navaratri decoration or procession"),
  P("fest-deepotsava", "Festivals", "Laksha Deepotsava", "Car Street or the lake lit with lamps"),
  // Gallery (distinct from the above; the shots you are proudest of)
  P("g01", "Beaches", "Sunset over the Arabian Sea", "Golden-hour light over the Arabian Sea and Malpe shoreline", { gallery: 1 }),
  P("g02", "Beaches", "Waves over the rocks", "Surf breaking over the dark coastal rocks", { gallery: 1 }),
  P("g03", "Islands", "St Mary’s Islands", "A different angle from the hero", { gallery: 1 }),
  P("g04", "Temples", "Temple detail", "Gopura, lamps or carvings", { gallery: 1 }),
  P("g05", "Temples", "Car Street", "Car Street and the traditional buildings around the Krishna Matha", { gallery: 1 }),
  P("g06", "Food", "A meal on banana leaf", "Banana-leaf meal", { gallery: 1 }),
  P("g07", "Food", "Street food", "Street food or a kitchen at work", { gallery: 1 }),
  P("g08", "Culture", "A Yakshagana performer", "A Yakshagana performer in full costume and headgear", { gallery: 1 }),
  P("g09", "Culture", "Huli Vesha dancers", "Tiger-painted Huli Vesha performers in a coastal celebration", { gallery: 1 }),
  P("g10", "River life", "A boat on the Swarna estuary", "A brightly painted boat on the calm estuary water"),
  P("g11", "Coast & estuary", "The waterways at Kodi Bengre", "An aerial view of the estuary, fishing boats and the green coastal edge"),
  P("g12", "Heritage", "A traditional coastal house", "A timber-and-tile coastal house set among palms at dusk"),
  P("gallery-estuary-boat-v2", "River life", "A boat on the Swarna estuary", "A high-resolution view of a boat on the green Swarna estuary", { gallery: 1 }),
  P("gallery-kodi-bengre-v2", "Coast & estuary", "The waterways at Kodi Bengre", "An aerial view of the estuary, fishing boats and the green coastal edge", { gallery: 1 }),
  P("gallery-coastal-house-v2", "Heritage", "A traditional coastal house", "A restored timber-and-tile coastal house at dusk", { gallery: 1 }),
  // Festivals added in v11 (optional: the fallback photo shows until you add your own)
  ...[["fest-uchila", "g09", "Uchila Dasara", "Navadurga installation or the immersion procession at Uchila / Kapu"], ["fest-kodi", "fest-paryaya", "Kodi Habba", "The big chariot or the fair at Koteshwara (Kundapura)"], ["fest-anegudde-v2", "g04", "Anegudde Vinayaka Rathotsava", "The chariot or the hill temple at Anegudde (Kumbhashi)"], ["fest-kollur", "fest-navaratri", "Kollur Mookambika Navaratri", "The Mookambika Temple at Navaratri or the Vijayadashami procession"]].map(([id, fb, alt, hint]) => P(id, "Festivals", alt, hint, { req: false, fb })),
  // Traditions section (art forms). Yakshagana and Huli Vesha reuse the festival photos; the rest show an illustrated scene until you add a photo.
  P("art-kambala", "Traditions", "Kambala", "Buffaloes and runner in the slush of a Kambala track", { req: false }),
  P("art-bhoota", "Traditions", "Bhoota Kola", "A Bhoota Kola performer in costume, photographed with permission", { req: false }),
  P("art-nagamandala", "Traditions", "Nagamandala", "The Nagamandala mandala or performers, photographed with permission", { req: false }),
  P("art-gombeyata", "Traditions", "Gombeyata", "Gombeyata string puppets in Yakshagana costume", { req: false }),
  // Photographs set into the middle of each place story (v11). Landscape 3:2 works best. Each is optional; the fallback is chosen in lib/details.js.
  ...[["matha", "Sri Krishna Matha", ["Car Street", "The Madhva Sarovara tank", "A prasada meal"]], ["malpe", "Malpe", ["Boats at the harbour", "Waves and rocks at the end of the beach"]], ["stm", "St Mary’s Islands", ["Basalt columns in low sun", "The rocky shore"]], ["anant", "Anantheshwara Temple", ["The Matha from the street", "Tiled roofs and carved wood"]], ["hasta", "Hasta Shilpa Heritage Village", ["A traditional house with a carved veranda", "A courtyard or lane"]], ["kaup", "Kaup", ["Waves on the rocks below the lighthouse", "The beach at golden hour"]], ["mar", "Maravanthe", ["The beach beside the highway", "Sea and river from the road"]], ["endp", "Manipal End Point", ["The lake at sunset", "The viewpoint walk"]], ["kodi", "Kodi Beach", ["Boats and waves", "Boats on the shore"]], ["kem", "Kemmannu", ["Boats at the river mouth", "The hanging bridge"]], ["mattu", "Mattu", ["A quiet stretch of shore", "Fields and palms on the drive"]], ["delta", "Delta Beach", ["The sand spit", "Backwater boats"]], ["kunj", "Kunjarugiri and Pajaka", ["The steps up the hill", "The view from the summit"]], ["barkur", "Barkur", ["A Jain basadi", "Stones of the old fort"]], ["udyavara", "Udyavara and Pithrody", ["The river-and-sea road", "Pithrody beach"]], ["padubidri", "Padubidri Beach", ["A wide, clean stretch of sand", "Dusk on the beach"]], ["karkala", "Karkala", ["The Bahubali statue", "The Chaturmukha Basadi"]]].flatMap(([id, name, hints]) => [...hints, ...(id === "matha" ? [] : [])].map((h, i) => P(`${id}-${i + 2}`, "Place stories", `${name}: ${h}`, `Landscape (3:2): ${h}`, { req: false }))),
  // Optional upgrades: different shots from the place photos so the page does not repeat itself
  ...[["mom-1", "malpe", "Sunrise at Malpe harbour"], ["mom-2", "matha", "Temple kitchen meal"], ["mom-3", "stm", "Ferry to the islands"], ["mom-4", "mar", "The Maravanthe drive"], ["mom-5", "hasta", "A day in Manipal"], ["mom-6", "kodi", "The quiet north"]].map(([id, fb, alt]) => P(id, "Experiences", alt, "Portrait-friendly (3:4) shot of: " + alt, { req: false, fb })),
  ...[["stay-1", "matha", "Udupi town"], ["stay-2", "malpe", "Malpe"], ["stay-3", "hasta", "Manipal"], ["stay-4", "kaup", "Kaup and Mattu"], ["stay-5", "mar", "Maravanthe and Kundapura"]].map(([id, fb, alt]) => P(id, "Stay", alt, "Landscape (16:10) shot of the area: " + alt, { req: false, fb })),
  ...[["gem-kodi", "kodi", "Kodi Beach"], ["gem-kem", "kem", "Kemmannu"], ["gem-mattu", "mattu", "Mattu Beach"], ["gem-delta", "delta", "Delta Beach"]].map(([id, fb, alt]) => P(id, "Hidden gems", alt, "Portrait (3:4) version of " + alt, { req: false, fb })),
  // Hidden gems added in v7: optional; the illustrated scene shows until you add a photo.
  ...[["kunj", "Kunjarugiri and Pajaka", "Hill temple steps or the view from the top"], ["barkur", "Barkur", "A basadi, old temple or the fort stones"], ["udyavara", "Udyavara and Pithrody", "The river-and-sea road or Pithrody beach"], ["padubidri", "Padubidri Beach", "Long beach shot, Blue Flag signage if allowed"], ["karkala", "Karkala", "Bahubali statue or Chaturmukha Basadi"]].map(([id, alt, hint]) => P(id, "Hidden gems", alt, "Portrait-friendly (3:4): " + hint, { req: false })),
];
