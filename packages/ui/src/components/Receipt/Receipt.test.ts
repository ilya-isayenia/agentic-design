import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import { mount } from '@vue/test-utils';
import Receipt from './Receipt.vue';
import ReceiptLine from '../ReceiptLine/ReceiptLine.vue';

const club = { name: 'Fenwick Hollow', address: '12 Example Lane, Brindlemoor' };
const EMPTY_TEXT = 'Choose a club and a plan to see your price here.';

describe('Receipt', () => {
  it('names the aside with its heading', () => {
    const wrapper = mount(Receipt);
    const id = wrapper.get('aside').attributes('aria-labelledby');
    expect(wrapper.get(`#${id}`).text()).toBe('Your membership receipt');
  });

  it('is empty without a club and lines, even when the slot renders nothing', () => {
    expect(mount(Receipt).text()).toContain(EMPTY_TEXT);
    // A v-for over an empty list still passes the slot; it must count as no lines.
    const wrapper = mount(Receipt, { slots: { default: () => [].map(() => h(ReceiptLine)) } });
    expect(wrapper.text()).toContain(EMPTY_TEXT);
  });

  it('shows the club and asks for a plan when there are no lines', () => {
    const wrapper = mount(Receipt, { props: { club } });
    expect(wrapper.text()).not.toContain(EMPTY_TEXT);
    expect(wrapper.text()).toContain('Fenwick Hollow');
    expect(wrapper.text()).toContain('Choose a plan to see your price.');
  });

  it('renders lines and the total when filled', () => {
    const wrapper = mount(Receipt, {
      props: { club },
      slots: {
        default: () => [h(ReceiptLine, { label: 'Membership fee', amount: 2400 }), h(ReceiptLine, { label: 'Starter package', amount: 1900 })],
        total: () => h(ReceiptLine, { label: 'Total', amount: 4300, emphasis: 'total' }),
      },
    });
    expect(wrapper.findAllComponents(ReceiptLine)).toHaveLength(3);
    expect(wrapper.text()).not.toContain('Choose a plan');
    expect(wrapper.text()).toContain('€43');
  });

  it('lets the empty prop override the derived state', () => {
    const wrapper = mount(Receipt, { props: { club, empty: true } });
    expect(wrapper.text()).toContain(EMPTY_TEXT);
    expect(wrapper.text()).not.toContain('Fenwick Hollow');
  });

  it('has no live region', () => {
    const wrapper = mount(Receipt, { props: { club } });
    expect(wrapper.find('[aria-live]').exists()).toBe(false);
    expect(wrapper.find('[role="status"]').exists()).toBe(false);
  });
});
