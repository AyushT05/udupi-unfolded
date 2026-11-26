// Which placeholder ramp / photo treatment a category uses. Kept out of Scene.jsx so server pages can import it.
export const kindOf = (c) => ({ temple: "temple", beach: "beach", island: "island", heritage: "heritage", nature: "heritage", food: "food" }[c] || "beach");
