import { describe, expect, it } from 'vitest';
import { defineComponent, ref } from 'vue';
import { mount } from '@vue/test-utils';
import PlanCard from './PlanCard.vue';
import RadioGroup from '../RadioGroup/RadioGroup.vue';

const Harness = defineComponent({
  components: { RadioGroup, PlanCard },
  props: { disabled: Boolean, error: String },
  setup: () => ({ value: ref<string>() }),
  template: `
    <RadioGroup v-model="value" legend="Access level" :error="error">
      <PlanCard value="club" title="One club" description="Close to home." :perks="['Classes']"
        :price="{ amount: 1200, was: 2400, period: '4 weeks' }" ribbon="Half price" :disabled="disabled" />
      <PlanCard value="student" title="Student" />
    </RadioGroup>`,
});

describe('PlanCard', () => {
  it('names the radio by the title and describes it in reading priority', () => {
    const wrapper = mount(Harness);
    const input = wrapper.find('input');
    expect(wrapper.find(`label[for="${input.attributes('id')}"]`).text()).toBe('One club');
    const ids = input.attributes('aria-describedby')?.split(' ') ?? [];
    expect(ids.map((id) => id.split('-').pop())).toEqual(['ribbon', 'price', 'description', 'perks']);
    expect(wrapper.find(`#${ids[0]}`).text()).toBe('Half price');
  });

  it('leaves out description ids it has nothing for', () => {
    const input = mount(Harness).findAll('input')[1];
    expect(input?.attributes('aria-describedby')).toBeUndefined();
  });

  it('selects through the group and shows the check badge', async () => {
    const wrapper = mount(Harness);
    expect(wrapper.findAll('svg').length).toBe(1); // only the perk check
    await wrapper.find('input').setValue(true);
    expect((wrapper.vm as unknown as { value: string }).value).toBe('club');
    expect(wrapper.findAll('svg').length).toBe(2);
  });

  it('shows the ribbon text once for screen readers and hides the moving copies', () => {
    const wrapper = mount(Harness);
    expect(wrapper.find('.sr-only[id$="-ribbon"]').text()).toBe('Half price');
    expect(wrapper.find('.animate-ticker').attributes('aria-hidden')).toBe('true');
  });

  it('adds the group error to the description', () => {
    const input = mount(Harness, { props: { error: 'Choose a plan.' } }).findAll('input')[1];
    expect(input?.attributes('aria-describedby')).toMatch(/-error$/);
    expect(input?.attributes('aria-invalid')).toBe('true');
  });

  it('disables the input', () => {
    expect(mount(Harness, { props: { disabled: true } }).find('input').attributes('disabled')).toBeDefined();
  });
});
