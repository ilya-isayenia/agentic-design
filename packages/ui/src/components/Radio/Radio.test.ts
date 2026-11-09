import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import { mount } from '@vue/test-utils';
import Radio from './Radio.vue';
import RadioGroup from '../RadioGroup/RadioGroup.vue';

describe('Radio', () => {
  it('refuses to render outside a RadioGroup', () => {
    expect(() => mount(Radio, { props: { value: 'x', label: 'X' } })).toThrow('inside a RadioGroup');
  });

  it('uses the slot over the label prop and nests the input in the label', () => {
    const wrapper = mount(RadioGroup, {
      props: { legend: 'Pick' },
      slots: { default: () => h(Radio, { value: 'x', label: 'Prop' }, () => 'Slot text') },
    });
    const label = wrapper.find('label');
    expect(label.text()).toBe('Slot text');
    expect(label.find('input[type="radio"]').exists()).toBe(true);
  });

  it('takes disabled from the group', () => {
    const wrapper = mount(RadioGroup, {
      props: { legend: 'Pick', disabled: true },
      slots: { default: () => h(Radio, { value: 'x', label: 'X' }) },
    });
    expect(wrapper.find('input').attributes('disabled')).toBeDefined();
  });
});
