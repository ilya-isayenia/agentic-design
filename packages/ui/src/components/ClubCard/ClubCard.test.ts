import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ClubCard from './ClubCard.vue';
import Chip from '../Chip/Chip.vue';

const props = {
  name: 'Fenwick Hollow',
  address: '12 Example Lane, Brindlemoor',
  perks: ['Sauna', 'Pool'],
  price: { amount: 2900 },
};

describe('ClubCard', () => {
  it('emits info and join from its two buttons', async () => {
    const wrapper = mount(ClubCard, { props });
    const [info, join] = wrapper.findAll('button');
    await info!.trigger('click');
    await join!.trigger('click');
    expect(wrapper.emitted('info')).toHaveLength(1);
    expect(wrapper.emitted('join')).toHaveLength(1);
  });

  it('gives each button a name that includes the club', () => {
    const wrapper = mount(ClubCard, { props });
    const names = wrapper.findAll('button').map((b) => b.text().replace(/\s+/g, ' '));
    expect(names).toEqual(['More info about Fenwick Hollow', 'Join now at Fenwick Hollow']);
  });

  it('labels the article with its heading at the chosen level', () => {
    const wrapper = mount(ClubCard, { props: { ...props, headingLevel: 2 } });
    const heading = wrapper.get('h2');
    expect(wrapper.get('article').attributes('aria-labelledby')).toBe(heading.attributes('id'));
    expect(heading.text()).toBe('Fenwick Hollow');
  });

  it('renders perks as chips and omits the list when there are none', () => {
    expect(mount(ClubCard, { props }).findAllComponents(Chip)).toHaveLength(2);
    expect(mount(ClubCard, { props: { ...props, perks: [] } }).find('ul').exists()).toBe(false);
  });

  it('hides the visual ribbon and its ticker copies from screen readers', () => {
    const wrapper = mount(ClubCard, { props: { ...props, ribbon: 'Half price', ribbonMoving: true } });
    const strip = wrapper.get('.animate-ticker');
    expect(strip.element.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(wrapper.findAll('.sr-only').some((n) => n.text() === 'Half price')).toBe(true);
  });
});
