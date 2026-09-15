/** Corner radius scale, in px. `full` is for pills/avatars, not a real px value. */
export const radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export type RadiusKey = keyof typeof radius;
