import { describe, expect, it } from 'vitest';
import { defineComponent, ref } from 'vue';
import { mount } from '@vue/test-utils';
import RadioGroup from './RadioGroup.vue';
import Radio from '../Radio/Radio.vue';

const Harness = defineComponent({
  components: { RadioGroup, Radio },
  props: { error: String, required: Boolean },
  setup: () => ({ value: ref<string>('a') }),
  template: `
    <RadioGroup v-model="value" legend="Pick" :error="error" :required="required">
      <Radio value="a" label="A" /><Radio value="b" label="B" /><Radio value="c" label="C" disabled />
    </RadioGroup>`,
});

describe('RadioGroup', () => {
  it('gives every radio one shared name and checks the model value', () => {
    const inputs = mount(Harness).findAll('input');
    const name = inputs[0]?.attributes('name');
    expect(name).toBeTruthy();
    expect(inputs[1]?.attributes('name')).toBe(name);
    expect((inputs[0]?.element as HTMLInputElement).checked).toBe(true);
  });

  it('updates the model when a radio changes', async () => {
    const wrapper = mount(Harness);
    await wrapper.findAll('input')[1]?.setValue(true);
    expect((wrapper.vm as unknown as { value: string }).value).toBe('b');
  });

  it('links the error to the fieldset and to each radio', () => {
    const wrapper = mount(Harness, { props: { error: 'Choose one.', required: true } });
    const errorId = wrapper.find('fieldset').attributes('aria-describedby');
    expect(wrapper.find(`#${errorId}`).text()).toBe('Error: Choose one.');
    for (const input of wrapper.findAll('input')) {
      expect(input.attributes('aria-invalid')).toBe('true');
      expect(input.attributes('aria-describedby')).toBe(errorId);
      expect(input.attributes('required')).toBeDefined();
    }
  });

  it('keeps per-radio disabled', () => {
    const inputs = mount(Harness).findAll('input');
    expect(inputs[0]?.attributes('disabled')).toBeUndefined();
    expect(inputs[2]?.attributes('disabled')).toBeDefined();
  });
});
