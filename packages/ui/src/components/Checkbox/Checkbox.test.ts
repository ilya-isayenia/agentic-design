import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Checkbox from './Checkbox.vue';

describe('Checkbox', () => {
  it('toggles the model', async () => {
    const wrapper = mount(Checkbox, {
      props: { modelValue: false, 'onUpdate:modelValue': (v: boolean) => wrapper.setProps({ modelValue: v }) },
      slots: { default: 'Send me news' },
    });
    await wrapper.find('input').setValue(true);
    expect(wrapper.props('modelValue')).toBe(true);
  });

  it('labels the input with the slot and links the error', () => {
    const wrapper = mount(Checkbox, { props: { id: 'terms', error: 'Accept the terms.' }, slots: { default: 'I accept' } });
    const input = wrapper.find('input');
    expect(wrapper.find('label').attributes('for')).toBe('terms');
    expect(input.attributes('aria-invalid')).toBe('true');
    expect(input.attributes('aria-describedby')).toBe('terms-error');
  });

  it('exposes focus()', () => {
    const wrapper = mount(Checkbox, { slots: { default: 'I accept' }, attachTo: document.body });
    (wrapper.vm as unknown as { focus: () => void }).focus();
    expect(document.activeElement).toBe(wrapper.find('input').element);
    wrapper.unmount();
  });
});
