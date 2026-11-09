export const BRANDS = ['pulse', 'volt', 'lumen'] as const;
export const MODES = ['dark', 'light'] as const;
export type Brand = (typeof BRANDS)[number];
export type Mode = (typeof MODES)[number];
export const THEMES = BRANDS.flatMap((brand) => MODES.map((mode) => ({ brand, mode })));
