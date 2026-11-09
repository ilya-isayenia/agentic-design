import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Price from './Price.vue';

describe('Price', () => {
  it('reads the promo price before the old one', () => {
    const wrapper = mount(Price, { props: { amount: 4950, was: 9900, period: '4 weeks', lead: 'From' } });
    expect(wrapper.find('.sr-only').text()).toBe('From €49.50, was €99 per 4 weeks');
    expect(wrapper.find('del').text()).toBe('€99');
  });

  it('hides the old price when it is not higher', () => {
    const wrapper = mount(Price, { props: { amount: 4000, was: 4000 } });
    expect(wrapper.find('del').exists()).toBe(false);
  });
});
