import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, isReadonly } from 'vue';
import { resolveTheme, useTheme } from './useTheme';

describe('resolveTheme', () => {
  it('gives pulse dark with no query and no light preference', () => {
    expect(resolveTheme('', false)).toEqual({ brand: 'pulse', mode: 'dark', modeFromQuery: false });
  });

  it('gives pulse light with no query when the system prefers light', () => {
    expect(resolveTheme('', true)).toEqual({ brand: 'pulse', mode: 'light', modeFromQuery: false });
  });

  it('lets a valid ?mode= win over the preference', () => {
    expect(resolveTheme('?mode=dark', true)).toEqual({ brand: 'pulse', mode: 'dark', modeFromQuery: true });
  });

  it('takes a valid brand and mode from the query', () => {
    expect(resolveTheme('?brand=volt&mode=light', false)).toEqual({ brand: 'volt', mode: 'light', modeFromQuery: true });
  });

  it('ignores an unknown brand and an unknown mode one by one', () => {
    expect(resolveTheme('?brand=nope&mode=nope', false)).toEqual({ brand: 'pulse', mode: 'dark', modeFromQuery: false });
    expect(resolveTheme('?brand=nope&mode=nope', true)).toEqual({ brand: 'pulse', mode: 'light', modeFromQuery: false });
    expect(resolveTheme('?brand=nope&mode=light', false)).toEqual({ brand: 'pulse', mode: 'light', modeFromQuery: true });
    expect(resolveTheme('?brand=lumen&mode=nope', false)).toEqual({ brand: 'lumen', mode: 'dark', modeFromQuery: false });
  });
});

type Listener = (event: MediaQueryListEvent) => void;

/** A stubbed `matchMedia` whose `(prefers-color-scheme: light)` list can fire `change`. */
function stubMatchMedia(prefersLight: boolean) {
  const listeners = new Set<Listener>();
  const list = {
    matches: prefersLight,
    addEventListener: vi.fn((_type: string, listener: Listener) => listeners.add(listener)),
    removeEventListener: vi.fn((_type: string, listener: Listener) => listeners.delete(listener)),
  };
  vi.stubGlobal('matchMedia', vi.fn(() => list));
  const fire = (matches: boolean) => listeners.forEach((l) => l({ matches } as MediaQueryListEvent));
  return { list, listeners, fire };
}

function mountHost() {
  let theme: ReturnType<typeof useTheme> | undefined;
  const Host = defineComponent({
    setup() {
      theme = useTheme();
      return () => h('div');
    },
  });
  const wrapper = mount(Host);
  if (!theme) throw new Error('useTheme did not run');
  return { wrapper, theme };
}

const html = document.documentElement;

describe('useTheme', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    delete html.dataset.brand;
    delete html.dataset.mode;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.history.replaceState(null, '', '/');
  });

  it('sets data-brand and data-mode on <html>', () => {
    stubMatchMedia(true);
    window.history.replaceState(null, '', '/?brand=volt');
    const { wrapper } = mountHost();
    expect(html.dataset.brand).toBe('volt');
    expect(html.dataset.mode).toBe('light');
    wrapper.unmount();
  });

  it('follows a change of the system preference when there is no valid ?mode=', () => {
    const media = stubMatchMedia(false);
    window.history.replaceState(null, '', '/?mode=nope');
    const { wrapper, theme } = mountHost();
    expect(html.dataset.mode).toBe('dark');

    media.fire(true);
    expect(theme.mode.value).toBe('light');
    expect(html.dataset.mode).toBe('light');

    media.fire(false);
    expect(theme.mode.value).toBe('dark');
    expect(html.dataset.mode).toBe('dark');
    wrapper.unmount();
  });

  it('ignores a change of the system preference when ?mode= is set', () => {
    const media = stubMatchMedia(false);
    window.history.replaceState(null, '', '/?mode=dark');
    const { wrapper, theme } = mountHost();
    expect(media.list.addEventListener).not.toHaveBeenCalled();

    media.fire(true);
    expect(theme.mode.value).toBe('dark');
    expect(html.dataset.mode).toBe('dark');
    wrapper.unmount();
  });

  it('removes its listener when the host unmounts', () => {
    const media = stubMatchMedia(false);
    const { wrapper } = mountHost();
    expect(media.list.addEventListener).toHaveBeenCalledTimes(1);
    const listener = media.list.addEventListener.mock.calls[0]?.[1];

    wrapper.unmount();
    expect(media.list.removeEventListener).toHaveBeenCalledWith('change', listener);
    expect(media.listeners.size).toBe(0);
  });

  it('returns readonly brand and mode', () => {
    stubMatchMedia(false);
    const { wrapper, theme } = mountHost();
    expect(isReadonly(theme.brand)).toBe(true);
    expect(isReadonly(theme.mode)).toBe(true);
    expect(theme.brand.value).toBe('pulse');
    expect(theme.mode.value).toBe('dark');
    wrapper.unmount();
  });

  it('never reads or writes storage', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem');
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const media = stubMatchMedia(false);
    const { wrapper } = mountHost();
    media.fire(true);
    wrapper.unmount();
    expect(getItem).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
  });

  it('falls back to dark when window.matchMedia is undefined', () => {
    vi.stubGlobal('matchMedia', undefined);
    const { wrapper, theme } = mountHost();
    expect(theme.mode.value).toBe('dark');
    expect(html.dataset.brand).toBe('pulse');
    expect(html.dataset.mode).toBe('dark');
    wrapper.unmount();
  });
});
