// Original flat-style illustration: a stack of folded laundry with a flower on top.
// Hand-authored SVG (not derived from any photo) so it carries no external licensing.
export default function HeroIllustration({ className = "" }) {
  const garments = [
    { color: "#A68A6E", width: 300 }, // trousers
    { color: "#4B4B52", width: 288 }, // dark tee
    { color: "#5B8BB5", width: 304 }, // denim
    { color: "#6FBF9B", width: 292 }, // green knit
    { color: "#8FD0C9", width: 300 }, // teal knit
    { color: "#E9C3D6", width: 288 }, // pink
    { color: "#E8927C", width: 296 }, // coral
    { color: "#F0C875", width: 284 }, // mustard
  ];

  const stackHeight = 36;
  const startY = 360 - garments.length * stackHeight;

  return (
    <svg
      viewBox="0 0 400 380"
      className={className}
      role="img"
      aria-label="Illustration of freshly folded, cleaned clothes with a flower on top"
    >
      <ellipse cx="200" cy="358" rx="150" ry="16" fill="#000000" opacity="0.08" />

      {garments.map((g, i) => {
        const y = startY + i * stackHeight;
        const x = (400 - g.width) / 2 + (i % 2 === 0 ? -4 : 4);
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={g.width}
              height={stackHeight + 6}
              rx="10"
              fill={g.color}
            />
            <rect
              x={x}
              y={y + (stackHeight + 6) / 2 - 1.5}
              width={g.width}
              height="3"
              rx="1.5"
              fill="#000000"
              opacity="0.08"
            />
          </g>
        );
      })}

      {/* Flower on top */}
      <g transform="translate(150, 70)">
        <path
          d="M0 90 C 10 60, 25 40, 55 15"
          stroke="#6FA25A"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        <g transform="translate(55, 15)">
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse
              key={angle}
              cx="0"
              cy="-16"
              rx="11"
              ry="17"
              fill="#FAFAF5"
              stroke="#E6E6DA"
              strokeWidth="1"
              transform={`rotate(${angle})`}
            />
          ))}
          <circle cx="0" cy="0" r="7" fill="#D9E67A" />
        </g>
        <g transform="translate(78, 34)">
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse
              key={angle}
              cx="0"
              cy="-10"
              rx="7"
              ry="11"
              fill="#FFFFFF"
              stroke="#E6E6DA"
              strokeWidth="1"
              transform={`rotate(${angle})`}
            />
          ))}
          <circle cx="0" cy="0" r="4.5" fill="#D9E67A" />
        </g>
      </g>
    </svg>
  );
}
