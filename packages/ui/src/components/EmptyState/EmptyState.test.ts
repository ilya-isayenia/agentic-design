import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import EmptyState from './EmptyState.vue';

describe('EmptyState', () => {
  it('renders the title at the requested heading level', () => {
    expect(mount(EmptyState, { props: { title: 'No classes yet' } }).find('h2').text()).toBe('No classes yet');
    expect(mount(EmptyState, { props: { title: 'No classes yet', headingLevel: 3 } }).find('h3').exists()).toBe(true);
  });

  it('renders the icon, description and action only when given', () => {
    const bare = mount(EmptyState, { props: { title: 'No classes yet' } });
    expect(bare.find('svg').exists()).toBe(false);
    expect(bare.find('p').exists()).toBe(false);

    const full = mount(EmptyState, {
      props: { title: 'No classes yet', description: 'Book one from the timetable.', icon: 'calendar' },
      slots: { action: '<button type="button">Open timetable</button>' },
    });
    expect(full.find('svg').attributes('aria-hidden')).toBe('true');
    expect(full.find('p').text()).toBe('Book one from the timetable.');
    expect(full.find('button').text()).toBe('Open timetable');
  });
});
