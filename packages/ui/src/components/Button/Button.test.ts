import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Button from './Button.vue';

describe('Button', () => {
  it('emits click when enabled', async () => {
    const wrapper = mount(Button, { slots: { default: 'Go' } });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('ignores clicks and stays focusable while loading', async () => {
    const wrapper = mount(Button, { props: { loading: true }, slots: { default: 'Go' } });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
    expect(wrapper.attributes('disabled')).toBeUndefined();
    expect(wrapper.attributes('aria-busy')).toBe('true');
  });
});
