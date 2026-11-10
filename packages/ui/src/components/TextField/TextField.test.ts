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

  describe('action slot', () => {
    const withAction = (props: Record<string, unknown> = {}) =>
      mount(TextField, {
        props: { label: 'Gift card number', id: 'card', hint: 'On the back.', ...props },
        slots: { action: '<button type="button">Check</button>' },
      });

    it('renders the action after the input, outside the input wrapper', () => {
      const wrapper = withAction();
      const input = wrapper.get('input').element;
      const button = wrapper.get('button').element;
      expect(input.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(input.parentElement?.contains(button)).toBe(false);
      // Same row, which wraps when narrow.
      expect(input.parentElement?.parentElement).toBe(button.parentElement?.parentElement);
      expect(button.parentElement?.parentElement?.classList).toContain('flex-wrap');
    });

    it('keeps the label, description and invalid state of the input', () => {
      const wrapper = withAction({ error: 'Enter all 8 characters.' });
      const input = wrapper.get('input');
      expect(wrapper.get('label').attributes('for')).toBe('card');
      expect(input.attributes('aria-describedby')).toBe('card-hint card-error');
      expect(input.attributes('aria-invalid')).toBe('true');
    });

    it('shows the error under the whole row', () => {
      const wrapper = withAction({ error: 'Enter all 8 characters.' });
      const row = wrapper.get('button').element.parentElement?.parentElement;
      const error = wrapper.get('#card-error').element;
      expect(row?.contains(error)).toBe(false);
      expect(row && row.compareDocumentPosition(error) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('has no action row without the slot', () => {
      const wrapper = mount(TextField, { props: { label: 'City' } });
      expect(wrapper.find('.flex-wrap').exists()).toBe(false);
    });
  });
});
