import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Select from './Select.vue';

const options = [
  { value: 'north', label: 'Testville North' },
  { value: 'centre', label: 'Testville Centre' },
];

describe('Select', () => {
  it('shows a disabled placeholder first and updates the model', async () => {
    const wrapper = mount(Select, {
      props: { label: 'Club', options, placeholder: 'Choose a club', modelValue: '', 'onUpdate:modelValue': (v: string) => wrapper.setProps({ modelValue: v }) },
    });
    const first = wrapper.findAll('option')[0];
    expect(first?.text()).toBe('Choose a club');
    expect(first?.attributes('disabled')).toBeDefined();
    await wrapper.find('select').setValue('centre');
    expect(wrapper.props('modelValue')).toBe('centre');
  });

  it('links the error and marks the control invalid', () => {
    const select = mount(Select, { props: { label: 'Club', options, id: 'club', error: 'Choose a club.' } }).find('select');
    expect(select.attributes('aria-invalid')).toBe('true');
    expect(select.attributes('aria-describedby')).toBe('club-error');
  });

  it('exposes focus()', () => {
    const wrapper = mount(Select, { props: { label: 'Club', options }, attachTo: document.body });
    (wrapper.vm as unknown as { focus: () => void }).focus();
    expect(document.activeElement).toBe(wrapper.find('select').element);
    wrapper.unmount();
  });
});
