import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import IconButton from './IconButton.vue';

describe('IconButton', () => {
  it('uses the label as its accessible name and hides the icon', () => {
    const wrapper = mount(IconButton, { props: { icon: 'close', label: 'Dismiss offer' } });
    expect(wrapper.attributes('aria-label')).toBe('Dismiss offer');
    expect(wrapper.find('svg').attributes('aria-hidden')).toBe('true');
  });

  it('emits click', async () => {
    const wrapper = mount(IconButton, { props: { icon: 'close', label: 'Close' } });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('sets aria-pressed only when pressed is given', () => {
    const plain = mount(IconButton, { props: { icon: 'check', label: 'Favourite' } });
    expect(plain.attributes('aria-pressed')).toBeUndefined();
    const off = mount(IconButton, { props: { icon: 'check', label: 'Favourite', pressed: false } });
    expect(off.attributes('aria-pressed')).toBe('false');
    const on = mount(IconButton, { props: { icon: 'check', label: 'Favourite', pressed: true } });
    expect(on.attributes('aria-pressed')).toBe('true');
  });
});
