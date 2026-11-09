import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import StepIndicator from './StepIndicator.vue';

const steps = ['Membership', 'Access', 'Duration', 'Your details', 'Verify'];

describe('StepIndicator', () => {
  it('emits go only for completed steps', async () => {
    const wrapper = mount(StepIndicator, { props: { steps, current: 2 } });
    const buttons = wrapper.findAll('button');
    expect(buttons.map((b) => b.attributes('aria-label'))).toEqual(['Membership, completed', 'Access, completed']);

    await buttons[1]!.trigger('click');
    expect(wrapper.emitted('go')).toEqual([[1]]);

    // Current and upcoming steps are not buttons, so clicking them emits nothing.
    await wrapper.find('[aria-current="step"]').trigger('click');
    await wrapper.findAll('li')[4]!.trigger('click');
    expect(wrapper.emitted('go')).toHaveLength(1);
  });

  it('marks the current step and honours an explicit completed list', () => {
    const wrapper = mount(StepIndicator, { props: { steps, current: 1, completed: [0, 1, 3] } });
    expect(wrapper.find('[aria-current="step"]').text()).toContain('Access');
    // The current step is never a button even when listed as completed.
    expect(wrapper.findAll('button').map((b) => b.attributes('aria-label'))).toEqual(['Membership, completed', 'Your details, completed']);
  });

  it('names the landmark', () => {
    const wrapper = mount(StepIndicator, { props: { steps, current: 0 } });
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Signup progress');
    expect(wrapper.findAll('li')).toHaveLength(5);
  });
});
