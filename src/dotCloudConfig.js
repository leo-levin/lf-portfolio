// Dot Cloud Navigation Configuration

// Visual constants
export const DOT_CLOUD_CONFIG = {
  // Anchor dot position (top-left corner)
  // Should align with the "Leo Frankel" white dot at left:20px, top:80px with translateY(-100%)
  anchorDot: {
    x: 26, // 20px left + 6px to center of 12px dot
    y: 74, // 80px - 6px (half dot height) = center of dot
  },

  // Center point for rotation (positioned for good expanded cloud layout)
  rotationCenter: {
    x: 160, // Halfway between left edge and labels
    y: 360, // Halfway down the screen vertically
  },

  // Visual styling
  dotRadius: 6, // 12px diameter = 6px radius
  dotColor: '#FFFFFF',
  textColor: '#000000',
  textOffsetX: 10, // Distance between dot and text label
  fontSize: 20, // Pixels - exact same as rest of site
  fontFamily: "Monaco, Menlo, 'Courier New', Courier, monospace",

  // Animation settings
  rotationSpeed: 0.00012, // Radians per millisecond (slower rotation)
  expandDuration: 1.2, // Seconds for expand animation
  collapseDuration: 0.8, // Seconds for collapse animation
  staggerDelay: 0.05, // Delay between each node animating
};

// Category labels and their positions (relative to rotation center)
// Form a triangle: Theory (top), Visuals (left), Engineering (bottom)
// Positioned further out from the project nodes
export const CATEGORIES = [
  {
    id: 'theory',
    label: 'Theory',
    x: 40,  // Top of triangle - more spread out
    y: -300,
  },
  {
    id: 'visuals',
    label: 'Visuals',
    x: -260,  // Left side - more spread out
    y: 110,
  },
  {
    id: 'engineering',
    label: 'Engineering',
    x: 200,  // Bottom right - more spread out
    y: 220,
  },
];

// Project nodes with Cartesian coordinates (relative to rotation center)
// These will be converted to polar coordinates at runtime
// Triangle bounds updated for more spread out cloud
// All nodes must stay inside this triangle
export const PROJECT_NODES = [
  {
    id: 'modular-forms',
    label: 'MODULAR FORMS',
    category: 'theory',
    x: 50,
    y: -170,
    targetSection: 'modular-forms',
  },
  {
    id: 'weft-lang',
    label: 'WEFT LANG',
    category: 'theory',
    x: -40,
    y: -140,
    targetSection: 'weft-lang',
  },
  {
    id: 'weft-runtime',
    label: 'WEFT RUNTIME',
    category: 'theory',
    x: 80,
    y: -80,
    targetSection: 'weft-runtime',
  },
  {
    id: 'apple-music-club-radio',
    label: 'APPLE MUSIC CLUB RADIO',
    category: 'visuals',
    x: -140,
    y: 10,
    targetSection: 'apple-music',
  },
  {
    id: 'apple-music-studios',
    label: 'APPLE MUSIC STUDIOS',
    category: 'visuals',
    x: -160,
    y: 80,
    targetSection: 'apple-music-studios',
  },
  {
    id: 'touchdesigner',
    label: 'TOUCHDESIGNER',
    category: 'visuals',
    x: -80,
    y: 100,
    targetSection: 'touchdesigner',
  },
  {
    id: 'photoshop-tools',
    label: 'PHOTOSHOP TOOLS',
    category: 'engineering',
    x: 90,
    y: 130,
    targetSection: 'photoshop-tools',
  },
  {
    id: 'televisa',
    label: 'TELEVISA',
    category: 'engineering',
    x: 130,
    y: 160,
    targetSection: 'televisa',
  },
];

// Convert Cartesian to polar coordinates
export function cartesianToPolar(x, y) {
  const r = Math.sqrt(x * x + y * y);
  const theta = Math.atan2(y, x);
  return { r, theta };
}

// Convert polar to Cartesian coordinates
export function polarToCartesian(r, theta) {
  const x = r * Math.cos(theta);
  const y = r * Math.sin(theta);
  return { x, y };
}
