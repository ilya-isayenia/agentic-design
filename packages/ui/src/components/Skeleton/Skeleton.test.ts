import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Skeleton from './Skeleton.vue';

describe('Skeleton', () => {
  it('renders the requested lines with a shorter last line', () => {
    const wrapper = mount(Skeleton, { props: { lines: 4 } });
    const lines = wrapper.findAll('[data-skeleton-line]');
    expect(lines).toHaveLength(4);
    expect(lines[3]!.classes()).toContain('w-2/3');
    expect(lines[0]!.classes()).toContain('w-full');
  });

  it('keeps a single line full width and clamps lines to at least one', () => {
    const wrapper = mount(Skeleton, { props: { lines: 0 } });
    const lines = wrapper.findAll('[data-skeleton-line]');
    expect(lines).toHaveLength(1);
    expect(lines[0]!.classes()).toContain('w-full');
  });

  it('hides the shapes and announces only when labelled', () => {
    const silent = mount(Skeleton, { props: { variant: 'circle' } });
    expect(silent.find('[role="status"]').exists()).toBe(false);
    expect(silent.find('[aria-hidden="true"]').exists()).toBe(true);

    const labelled = mount(Skeleton, { props: { variant: 'rect', label: 'plans' } });
    expect(labelled.get('[role="status"]').text()).toBe('Loading plans');
    expect(labelled.findAll('[role="status"]')).toHaveLength(1);
  });
});
