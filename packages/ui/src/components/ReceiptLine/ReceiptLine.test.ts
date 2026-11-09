import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ReceiptLine from './ReceiptLine.vue';

describe('ReceiptLine', () => {
  it('speaks the promo price before the old one', () => {
    const wrapper = mount(ReceiptLine, { props: { label: 'Membership fee', amount: 1250, was: 2500 } });
    expect(wrapper.find('.sr-only').text()).toBe('€12.50, was €25');
    expect(wrapper.find('del').text()).toBe('€25');
  });

  it('has no disclosure without details', () => {
    const wrapper = mount(ReceiptLine, { props: { label: 'Starter package', amount: 1900, note: 'First payment' } });
    expect(wrapper.find('button').exists()).toBe(false);
    expect(wrapper.text()).toContain('First payment');
  });

  it('toggles the details and wires aria-controls', async () => {
    const wrapper = mount(ReceiptLine, {
      props: { label: 'Access level', amount: 600 },
      slots: { default: 'Area access' },
      attachTo: document.body, // isVisible() needs the element in the document
    });
    const button = wrapper.get('button');
    const details = wrapper.get(`#${button.attributes('aria-controls')}`);
    expect(button.attributes('aria-expanded')).toBe('false');
    expect(details.isVisible()).toBe(false);

    await button.trigger('click');
    expect(button.attributes('aria-expanded')).toBe('true');
    expect(details.isVisible()).toBe(true);
    wrapper.unmount();
  });
});
