// A self-contained inline SVG, so the fallback always renders even with
// no network access. Colors now match the design system's surface/border
// tokens rather than the old light-theme grays.
export const RESOURCE_PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240">
      <rect width="400" height="240" fill="#18181b"/>
      <g fill="#3f3f46">
        <rect x="150" y="90" width="100" height="90" />
        <polygon points="140,90 200,50 260,90" />
        <rect x="180" y="130" width="20" height="30" fill="#18181b" />
      </g>
      <text x="200" y="210" font-family="Inter, sans-serif" font-size="14" fill="#71717a" text-anchor="middle">
        No image available
      </text>
    </svg>
  `);