import { ref, watchEffect } from 'vue';
import { BRANDS, MODES, type Brand, type Mode } from '@agentic/ui';

const KEY = 'theme';

function initial(): { brand: Brand; mode: Mode } {
  const params = new URLSearchParams(location.search);
  const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}') as { brand?: string; mode?: string };
  const brand = (params.get('brand') ?? saved.brand) as Brand;
  const mode = (params.get('mode') ?? saved.mode) as Mode;
  return {
    brand: BRANDS.includes(brand) ? brand : 'pulse',
    mode: MODES.includes(mode) ? mode : brand === 'lumen' ? 'light' : 'dark',
  };
}

const start = initial();
const brand = ref<Brand>(start.brand);
const mode = ref<Mode>(start.mode);

watchEffect(() => {
  document.documentElement.dataset.brand = brand.value;
  document.documentElement.dataset.mode = mode.value;
  localStorage.setItem(KEY, JSON.stringify({ brand: brand.value, mode: mode.value }));
});

/** Brand and mode of the whole app; `?brand=volt&mode=light` in the URL overrides the saved choice. */
export function useTheme() {
  return { brand, mode };
}
