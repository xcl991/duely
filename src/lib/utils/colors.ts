/**
 * Opa Seashell Cascade Color Scheme
 * A harmonious palette of soft, natural colors
 */
export const OPA_SEASHELL_CASCADE = {
  // Primary colors
  mauve: '#C592A8',      // Soft pink/mauve - elegant and sophisticated
  peach: '#F4CC9C',      // Warm peach/cream - friendly and inviting
  teal: '#3EBCB3',       // Vibrant teal - fresh and modern
  gray: '#DBDBDB',       // Light gray - neutral and clean
} as const;

/**
 * Get a color from the palette by index (cycles through colors)
 */
export function getSeashellColor(index: number): string {
  const colors = [
    OPA_SEASHELL_CASCADE.mauve,
    OPA_SEASHELL_CASCADE.peach,
    OPA_SEASHELL_CASCADE.teal,
    OPA_SEASHELL_CASCADE.gray,
  ];
  return colors[index % colors.length];
}

/**
 * Get a random color from the Seashell Cascade palette
 */
export function getRandomSeashellColor(): string {
  const colors = Object.values(OPA_SEASHELL_CASCADE);
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Status colors using Seashell Cascade palette
 */
export const STATUS_COLORS = {
  active: OPA_SEASHELL_CASCADE.teal,      // Teal for active/success
  trial: OPA_SEASHELL_CASCADE.mauve,       // Mauve for trial
  paused: OPA_SEASHELL_CASCADE.gray,       // Gray for paused
  canceled: OPA_SEASHELL_CASCADE.peach,    // Peach for canceled (softer than red)
} as const;

/**
 * Budget status colors
 */
export const BUDGET_COLORS = {
  onTrack: OPA_SEASHELL_CASCADE.teal,      // Teal for on track
  nearLimit: OPA_SEASHELL_CASCADE.peach,   // Peach for near limit
  overBudget: OPA_SEASHELL_CASCADE.mauve,  // Mauve for over budget
  noData: OPA_SEASHELL_CASCADE.gray,       // Gray for no data
} as const;

/**
 * Convert hex to RGB for transparency effects
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Create color with opacity
 */
export function colorWithOpacity(hex: string, opacity: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

/**
 * Get contrasting text color (light or dark) for background
 */
export function getContrastTextColor(hexColor: string): string {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return '#000000';

  // Calculate luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
