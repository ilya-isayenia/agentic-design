import { describe, expect, it } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import DiscountCode from './DiscountCode.vue';
import TextField from '../TextField/TextField.vue';
import Button from '../Button/Button.vue';

const HINT = 'One code at a time. We take it off your first 4 weeks.';

function mountCode(props: Record<string, unknown> = {}) {
  const wrapper = mount(DiscountCode, {
    props: { hint: HINT, modelValue: '', 'onUpdate:modelValue': (v: string) => wrapper.setProps({ modelValue: v }), ...props },
    attachTo: document.body,
  });
  return wrapper;
}

describe('DiscountCode', () => {
  it('renders its input and Apply through TextField and its action slot', () => {
    const wrapper = mountCode();
    const field = wrapper.getComponent(TextField);
    expect(wrapper.findAll('input')).toHaveLength(1);
    expect(field.element.contains(wrapper.get('input').element)).toBe(true);
    const apply = wrapper.getComponent(Button);
    expect(field.element.contains(apply.element)).toBe(true);
    expect(apply.text()).toBe('Apply');
    expect(apply.attributes('type')).toBe('submit');
    expect(field.props('label')).toBe('Discount code (optional)');
    wrapper.unmount();
  });

  it('emits the code trimmed and upper-cased', async () => {
    const wrapper = mountCode({ modelValue: ' test-10 ' });
    await wrapper.get('form').trigger('submit');
    expect(wrapper.emitted('apply')).toEqual([['TEST-10']]);
    wrapper.unmount();
  });

  it('shows the empty message and emits nothing for an empty or blank field', async () => {
    const wrapper = mountCode({ modelValue: '   ' });
    await wrapper.get('form').trigger('submit');
    await flushPromises();
    expect(wrapper.emitted('apply')).toBeUndefined();
    const input = wrapper.get('input');
    expect(input.attributes('aria-invalid')).toBe('true');
    expect(wrapper.text()).toContain('Enter a code to apply it.');
    expect(wrapper.get('[role="status"]').text()).toBe('Enter a code to apply it.');
    wrapper.unmount();
  });

  it('clears the empty message when the user types, without reading an old announcement again', async () => {
    const wrapper = mountCode({ announcement: 'TEST-10 applied. Your first payment is now €20.' });
    await wrapper.get('form').trigger('submit');
    await flushPromises();
    await wrapper.get('input').setValue('T');
    expect(wrapper.get('input').attributes('aria-invalid')).toBeUndefined();
    expect(wrapper.get('[role="status"]').text()).toBe('Enter a code to apply it.');
    wrapper.unmount();
  });

  it('emits nothing while applying', async () => {
    const wrapper = mountCode({ modelValue: 'TEST-10', status: 'applying' });
    await wrapper.get('form').trigger('submit');
    expect(wrapper.emitted('apply')).toBeUndefined();
    expect(wrapper.get('button').attributes('aria-busy')).toBe('true');
    wrapper.unmount();
  });

  it('passes the app error to the field and keeps the text', () => {
    const wrapper = mountCode({ modelValue: 'NOPE', error: "We don't recognise this code. Check the spelling and try again." });
    const input = wrapper.get('input');
    expect((input.element as HTMLInputElement).value).toBe('NOPE');
    expect(input.attributes('aria-invalid')).toBe('true');
    const describedBy = input.attributes('aria-describedby')?.split(' ') ?? [];
    expect(describedBy).toHaveLength(2);
    expect(wrapper.get(`#${describedBy[1]}`).text()).toContain("We don't recognise this code.");
    wrapper.unmount();
  });

  it('mounts the status region from the first render and fills it from announcement', async () => {
    const wrapper = mountCode();
    const region = wrapper.get('[role="status"]');
    expect(region.text()).toBe('');
    await wrapper.setProps({ announcement: 'Code removed. Your first payment is now €22.' });
    expect(wrapper.get('[role="status"]').element).toBe(region.element);
    expect(region.text()).toBe('Code removed. Your first payment is now €22.');
    wrapper.unmount();
  });

  it('exposes focus() for the app to call after Remove', () => {
    const wrapper = mountCode();
    (wrapper.vm as unknown as { focus: () => void }).focus();
    expect(document.activeElement).toBe(wrapper.get('input').element);
    wrapper.unmount();
  });
});
