import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import DiscountApplied from './DiscountApplied.vue';

describe('DiscountApplied', () => {
  it('names the code in the note and in Remove', () => {
    const wrapper = mount(DiscountApplied, { props: { code: 'TEST-FLEX20', summary: '20% off your first 4 weeks on Flex' } });
    expect(wrapper.get('p').text()).toBe('TEST-FLEX20 applied 20% off your first 4 weeks on Flex');
    const remove = wrapper.get('button');
    expect(remove.text()).toBe('Remove');
    expect(remove.attributes('aria-label')).toBe('Remove code TEST-FLEX20');
  });

  it('hides the icon, so the words carry the meaning', () => {
    const wrapper = mount(DiscountApplied, { props: { code: 'TEST-10', summary: '10% off your first 4 weeks' } });
    expect(wrapper.get('svg').attributes('aria-hidden')).toBe('true');
  });

  it('emits remove and has no live region of its own', async () => {
    const wrapper = mount(DiscountApplied, { props: { code: 'TEST-10', summary: '10% off your first 4 weeks' } });
    await wrapper.get('button').trigger('click');
    expect(wrapper.emitted('remove')).toHaveLength(1);
    expect(wrapper.find('[role="status"]').exists()).toBe(false);
    expect(wrapper.find('[aria-live]').exists()).toBe(false);
  });
});
