// Placeholder image used when a product has no photo or it fails to load.
// Neutral box icon (no dependency on external services).
const PLACEHOLDER_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>" +
  "<rect width='400' height='400' fill='#e2e8f0'/>" +
  "<rect x='140' y='150' width='120' height='100' rx='8' fill='none' stroke='#94a3b8' stroke-width='8'/>" +
  "<path d='M140 175 L200 210 L260 175' fill='none' stroke='#94a3b8' stroke-width='8'/>" +
  "</svg>";

export const PLACEHOLDER_IMG = `data:image/svg+xml;utf8,${encodeURIComponent(PLACEHOLDER_SVG)}`;
