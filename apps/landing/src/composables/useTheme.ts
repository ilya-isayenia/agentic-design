import { onScopeDispose, readonly, ref, type Ref } from 'vue';
import { BRANDS, MODES, type Brand, type Mode } from '@agentic/ui';

const LIGHT_QUERY = '(prefers-color-scheme: light)';

/**
 * Brand and mode for a query string and the system preference. A valid `?mode=` wins over the preference;
 * an invalid `?brand=` or `?mode=` is ignored on its own.
 */
export function resolveTheme(search: string, prefersLight: boolean): { brand: Brand; mode: Mode; modeFromQuery: boolean } {
  const params = new URLSearchParams(search);
  const brand = BRANDS.find((b) => b === params.get('brand')) ?? 'pulse';
  const queryMode = MODES.find((m) => m === params.get('mode'));
  return { brand, mode: queryMode ?? (prefersLight ? 'light' : 'dark'), modeFromQuery: queryMode !== undefined };
}

/**
 * Applies the landing page's theme to `<html>` and follows a live change of the system preference while no
 * `?mode=` is set. Nothing is stored. Call it in `setup`; the listener is removed when the scope ends.
 * Call once, in App; sections receive `mode` as a prop.
 */
export function useTheme(): { brand: Readonly<Ref<Brand>>; mode: Readonly<Ref<Mode>> } {
  const media = typeof window.matchMedia === 'function' ? window.matchMedia(LIGHT_QUERY) : undefined;
  const start = resolveTheme(window.location.search, media?.matches ?? false);
  const brand = ref<Brand>(start.brand);
  const mode = ref<Mode>(start.mode);

  const apply = () => {
    document.documentElement.dataset.brand = brand.value;
    document.documentElement.dataset.mode = mode.value;
  };
  apply();

  if (media && !start.modeFromQuery) {
    const onChange = (event: MediaQueryListEvent) => {
      mode.value = event.matches ? 'light' : 'dark';
      apply();
    };
    media.addEventListener('change', onChange);
    onScopeDispose(() => media.removeEventListener('change', onChange));
  }

  return { brand: readonly(brand), mode: readonly(mode) };
}
