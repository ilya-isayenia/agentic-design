import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ErrorState from './ErrorState.vue';

describe('ErrorState', () => {
  it('announces by default and can stay silent', () => {
    const loud = mount(ErrorState, { props: { title: 'Plans did not load' } });
    expect(loud.get('[role="alert"]').text()).toContain('Plans did not load');
    const quiet = mount(ErrorState, { props: { title: 'Plans did not load', announce: false } });
    expect(quiet.find('[role="alert"]').exists()).toBe(false);
  });

  it('renders the heading level and default retry label', () => {
    const wrapper = mount(ErrorState, { props: { title: 'Plans did not load', headingLevel: 3 } });
    expect(wrapper.find('h3').text()).toBe('Plans did not load');
    expect(wrapper.get('button').text()).toBe('Try again');
  });

  it('emits retry, but not while retrying', async () => {
    const wrapper = mount(ErrorState, { props: { title: 'Plans did not load' } });
    await wrapper.get('button').trigger('click');
    expect(wrapper.emitted('retry')).toHaveLength(1);

    await wrapper.setProps({ retrying: true });
    expect(wrapper.get('button').attributes('aria-busy')).toBe('true');
    await wrapper.get('button').trigger('click');
    expect(wrapper.emitted('retry')).toHaveLength(1);
  });
});
