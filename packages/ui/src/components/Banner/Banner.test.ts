import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Banner from './Banner.vue';
import { describeCountdown, formatCountdown, getCountdown } from './countdown';

const END = new Date('2026-06-01T12:00:00Z');
const before = (ms: number) => new Date(END.getTime() - ms);
const S = 1000;
const M = 60 * S;
const H = 60 * M;
const D = 24 * H;

describe('countdown', () => {
  it('splits the remaining time into units', () => {
    const c = getCountdown(END, before(2 * D + 7 * H + 52 * M + 36 * S));
    expect(c).toMatchObject({ days: 2, hours: 7, minutes: 52, seconds: 36, ended: false, lastHour: false });
    expect(formatCountdown(c)).toBe('02d 07h 52m 36s');
    expect(describeCountdown(c)).toBe('Offer ends in 2 days 7 hours');
  });

  it('accepts an ISO string and drops partial seconds', () => {
    const c = getCountdown(END.toISOString(), before(5 * S + 999));
    expect(c.seconds).toBe(5);
    expect(formatCountdown(c)).toBe('00m 05s');
  });

  it('drops leading zero days, then hours', () => {
    expect(formatCountdown(getCountdown(END, before(3 * H + 4 * M)))).toBe('03h 04m 00s');
    expect(formatCountdown(getCountdown(END, before(1 * D + 30 * S)))).toBe('01d 00h 00m 30s');
  });

  it('marks the last hour', () => {
    const c = getCountdown(END, before(45 * M));
    expect(c.lastHour).toBe(true);
    expect(describeCountdown(c)).toBe('Offer ends in 45 minutes');
    expect(getCountdown(END, before(H)).lastHour).toBe(false);
  });

  it('uses singular units and rounds the spoken text to minutes', () => {
    expect(describeCountdown(getCountdown(END, before(D + H)))).toBe('Offer ends in 1 day 1 hour');
    expect(describeCountdown(getCountdown(END, before(D + 59 * M)))).toBe('Offer ends in 1 day');
    expect(describeCountdown(getCountdown(END, before(2 * H + M)))).toBe('Offer ends in 2 hours 1 minute');
    expect(describeCountdown(getCountdown(END, before(30 * S)))).toBe('Offer ends in less than a minute');
  });

  it('ends at and after the end time', () => {
    expect(getCountdown(END, END).ended).toBe(true);
    const after = getCountdown(END, new Date(END.getTime() + D));
    expect(after).toMatchObject({ ended: true, lastHour: false, remainingMs: 0 });
    expect(describeCountdown(after)).toBe('This offer has ended');
    // Under one second left shows as 00s, so it counts as ended.
    expect(getCountdown(END, before(500)).ended).toBe(true);
  });
});

describe('Banner', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a fixed countdown with minute-level text for screen readers', () => {
    const wrapper = mount(Banner, { props: { message: 'Join this week', endsAt: END, now: before(2 * D + 7 * H + 52 * M + 36 * S) } });
    expect(wrapper.find('[data-countdown]').text()).toBe('02d 07h 52m 36s');
    expect(wrapper.find('[data-countdown]').attributes('aria-hidden')).toBe('true');
    expect(wrapper.find('time').attributes('datetime')).toBe(END.toISOString());
    expect(wrapper.find('.sr-only').text()).toBe('Offer ends in 2 days 7 hours');
  });

  it('ticks every second without a fixed now and stops on unmount', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(before(10 * S));
    const wrapper = mount(Banner, { props: { message: 'Join this week', endsAt: END } });
    expect(wrapper.find('[data-countdown]').text()).toBe('00m 10s');
    await vi.advanceTimersByTimeAsync(3 * S);
    expect(wrapper.find('[data-countdown]').text()).toBe('00m 07s');
    expect(vi.getTimerCount()).toBe(1);
    wrapper.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('switches to the ended text and stops ticking', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(before(2 * S));
    const wrapper = mount(Banner, { props: { message: 'Join this week', endsAt: END, actionLabel: 'See plans', href: '#plans' } });
    await vi.advanceTimersByTimeAsync(3 * S);
    expect(wrapper.text()).toContain('This offer has ended');
    expect(wrapper.find('time').exists()).toBe(false);
    expect(wrapper.find('a').exists()).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('emits dismiss from the close button and hides it when not dismissible', async () => {
    const wrapper = mount(Banner, { props: { message: 'Join this week', endsAt: END, now: before(H) } });
    await wrapper.get('button[aria-label="Dismiss offer"]').trigger('click');
    expect(wrapper.emitted('dismiss')).toHaveLength(1);
    await wrapper.setProps({ dismissible: false });
    expect(wrapper.find('button').exists()).toBe(false);
  });
});
