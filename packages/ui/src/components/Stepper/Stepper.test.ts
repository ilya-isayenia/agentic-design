import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Stepper from './Stepper.vue';

function setup(props: { modelValue: number; min?: number; max?: number; format?: (n: number) => string }) {
  const wrapper = mount(Stepper, {
    props: { label: 'Workouts per week', ...props, 'onUpdate:modelValue': (v: number) => wrapper.setProps({ modelValue: v }) },
  });
  const [decrease, increase] = wrapper.findAll('button');
  if (!decrease || !increase) throw new Error('buttons missing');
  return { wrapper, decrease, increase, output: () => wrapper.find('output').text() };
}

describe('Stepper', () => {
  it('steps up and down by one', async () => {
    const { wrapper, decrease, increase } = setup({ modelValue: 3, min: 1, max: 7 });
    await increase.trigger('click');
    expect(wrapper.props('modelValue')).toBe(4);
    await decrease.trigger('click');
    await decrease.trigger('click');
    expect(wrapper.props('modelValue')).toBe(2);
  });

  it('does not go below min or above max', async () => {
    const low = setup({ modelValue: 1, min: 1, max: 7 });
    await low.decrease.trigger('click');
    expect(low.wrapper.props('modelValue')).toBe(1);
    expect(low.wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(low.decrease.attributes('aria-disabled')).toBe('true');

    const high = setup({ modelValue: 7, min: 1, max: 7 });
    await high.increase.trigger('click');
    expect(high.wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(high.increase.attributes('aria-disabled')).toBe('true');
  });

  it('shows an out-of-range model clamped and steps from the clamped value', async () => {
    const { wrapper, increase, output } = setup({ modelValue: 12, min: 1, max: 7 });
    expect(output()).toBe('7');
    expect(increase.attributes('aria-disabled')).toBe('true');
    await wrapper.findAll('button')[0]?.trigger('click');
    expect(wrapper.props('modelValue')).toBe(6);
  });

  it('defaults to min 0 and no max', async () => {
    const { wrapper, decrease, increase } = setup({ modelValue: 0 });
    expect(decrease.attributes('aria-disabled')).toBe('true');
    expect(increase.attributes('aria-disabled')).toBeUndefined();
    await increase.trigger('click');
    expect(wrapper.props('modelValue')).toBe(1);
  });

  it('changes with ArrowUp and ArrowDown on the group', async () => {
    const { wrapper } = setup({ modelValue: 3, min: 1, max: 7 });
    const group = wrapper.find('[role="group"]');
    await group.trigger('keydown', { key: 'ArrowUp' });
    expect(wrapper.props('modelValue')).toBe(4);
    await group.trigger('keydown', { key: 'ArrowDown' });
    await group.trigger('keydown', { key: 'ArrowDown' });
    expect(wrapper.props('modelValue')).toBe(2);
  });

  it('formats the shown value', () => {
    const { output } = setup({ modelValue: 3, format: (n) => `${n} workouts per week` });
    expect(output()).toBe('3 workouts per week');
  });
});
