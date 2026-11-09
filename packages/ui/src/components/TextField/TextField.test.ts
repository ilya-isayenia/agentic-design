import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import TextField from './TextField.vue';

describe('TextField', () => {
  it('updates the model on input', async () => {
    const wrapper = mount(TextField, {
      props: { label: 'First name', modelValue: '', 'onUpdate:modelValue': (v: string) => wrapper.setProps({ modelValue: v }) },
    });
    await wrapper.find('input').setValue('Testy');
    expect(wrapper.props('modelValue')).toBe('Testy');
  });

  it('links hint and error and marks the field invalid', () => {
    const wrapper = mount(TextField, { props: { label: 'IBAN', id: 'iban', hint: 'Two letters first.', error: 'Too short.' } });
    const input = wrapper.find('input');
    expect(input.attributes('id')).toBe('iban');
    expect(input.attributes('aria-describedby')).toBe('iban-hint iban-error');
    expect(input.attributes('aria-invalid')).toBe('true');
    expect(wrapper.find('#iban-error').text()).toBe('Error: Too short.');
    expect(wrapper.find('label').attributes('for')).toBe('iban');
  });

  it('has no description or invalid state by default', () => {
    const input = mount(TextField, { props: { label: 'City' } }).find('input');
    expect(input.attributes('aria-describedby')).toBeUndefined();
    expect(input.attributes('aria-invalid')).toBeUndefined();
  });

  it('marks required visually only with a hidden asterisk', () => {
    const wrapper = mount(TextField, { props: { label: 'City', required: true } });
    expect(wrapper.find('input').attributes('required')).toBeDefined();
    expect(wrapper.find('label [aria-hidden="true"]').text()).toBe('*');
  });

  it('exposes focus() for an error summary', () => {
    const wrapper = mount(TextField, { props: { label: 'City' }, attachTo: document.body });
    (wrapper.vm as unknown as { focus: () => void }).focus();
    expect(document.activeElement).toBe(wrapper.find('input').element);
    wrapper.unmount();
  });
});
