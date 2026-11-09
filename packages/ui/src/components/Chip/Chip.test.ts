import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Chip from './Chip.vue';

describe('Chip', () => {
  it('renders a static tag by default', () => {
    const wrapper = mount(Chip, { props: { label: 'Sauna' } });
    expect(wrapper.element.tagName).toBe('SPAN');
    expect(wrapper.text()).toBe('Sauna');
  });

  it('emits the next pressed value as a toggle button', async () => {
    const wrapper = mount(Chip, { props: { as: 'button', label: 'Has pool', pressed: false } });
    expect(wrapper.attributes('aria-pressed')).toBe('false');
    await wrapper.trigger('click');
    expect(wrapper.emitted('toggle')).toEqual([[true]]);

    await wrapper.setProps({ pressed: true });
    expect(wrapper.attributes('aria-pressed')).toBe('true');
    await wrapper.trigger('click');
    expect(wrapper.emitted('toggle')?.[1]).toEqual([false]);
  });

  it('lets the slot replace the label', () => {
    const wrapper = mount(Chip, { props: { label: 'x' }, slots: { default: 'Towels included' } });
    expect(wrapper.text()).toBe('Towels included');
  });
});
