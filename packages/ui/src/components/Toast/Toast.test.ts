import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import Toast from './Toast.vue';

// Real <Transition> so `close` is emitted after the leave transition, as in the browser.
const mountToast = (props: Record<string, unknown>) =>
  mount(Toast, { props: { message: 'Plan saved', ...props }, global: { stubs: { transition: false } }, attachTo: document.body });

async function settle() {
  await vi.runAllTimersAsync();
  await flushPromises();
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('uses role status for info and success and alert for danger', () => {
    expect(mountToast({ tone: 'info' }).find('[role="status"]').exists()).toBe(true);
    expect(mountToast({ tone: 'success' }).find('[role="status"]').exists()).toBe(true);
    expect(mountToast({ tone: 'danger' }).find('[role="alert"]').exists()).toBe(true);
  });

  it('names the tone with its icon, not colour alone', () => {
    expect(mountToast({ tone: 'danger' }).find('svg[role="img"]').attributes('aria-label')).toBe('Error');
    expect(mountToast({ tone: 'success' }).find('svg[role="img"]').attributes('aria-label')).toBe('Success');
  });

  it('closes itself after the duration', async () => {
    const wrapper = mountToast({ duration: 3000 });
    await vi.advanceTimersByTimeAsync(2999);
    expect(wrapper.emitted('close')).toBeUndefined();
    await vi.advanceTimersByTimeAsync(1);
    await settle();
    expect(wrapper.emitted('close')).toHaveLength(1);
    expect(wrapper.find('[role="status"]').exists()).toBe(false);
  });

  it('stays when duration is 0', async () => {
    const wrapper = mountToast({ duration: 0 });
    await vi.advanceTimersByTimeAsync(60_000);
    expect(wrapper.emitted('close')).toBeUndefined();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('pauses while hovered and resumes with the time left', async () => {
    const wrapper = mountToast({ duration: 3000 });
    const toast = wrapper.get('[role="status"]');
    await vi.advanceTimersByTimeAsync(1000);
    await toast.trigger('mouseenter');
    await vi.advanceTimersByTimeAsync(10_000);
    expect(wrapper.emitted('close')).toBeUndefined();
    await toast.trigger('mouseleave');
    await vi.advanceTimersByTimeAsync(1999);
    expect(wrapper.emitted('close')).toBeUndefined();
    await vi.advanceTimersByTimeAsync(1);
    await settle();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('pauses while focus is inside', async () => {
    const wrapper = mountToast({ duration: 3000 });
    const button = wrapper.get('button');
    (button.element as HTMLButtonElement).focus();
    await vi.advanceTimersByTimeAsync(10_000);
    expect(wrapper.emitted('close')).toBeUndefined();
    (button.element as HTMLButtonElement).blur();
    await vi.advanceTimersByTimeAsync(3000);
    await settle();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('closes from the close button', async () => {
    const wrapper = mountToast({ duration: 0 });
    await wrapper.get('button[aria-label="Close notification"]').trigger('click');
    await settle();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });
});
