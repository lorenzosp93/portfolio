import { shallowMount, flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useSiteStore } from '@/stores/site.store';
const backend = vi.hoisted(() => ({ loadResumeTimeline: vi.fn() }));
vi.mock('@/services/api.service', () => ({ default: backend }));
vi.mock('@/composables/visibilityObserver', async () => {
  const { ref } = await import('vue');
  return { useVisibilityObserver: () => ({ isActive: ref(true) }) };
});
import TheResume from './TheResume.vue';
const data = { copy: { heading: 'A journey', intro: 'An introduction', closing_heading: 'Onward', closing_body: '' }, entries: [] };
describe('TheResume', () => {
  beforeEach(() => { setActivePinia(createPinia()); backend.loadResumeTimeline.mockReset(); });
  it('loads fresh CMS copy, preserves CV access, and respects skills visibility', async () => {
    backend.loadResumeTimeline.mockResolvedValue({ data });
    useSiteStore().showSkills = false;
    const wrapper = shallowMount(TheResume, { global: { stubs: { teleport: true } } });
    await flushPromises();
    expect(wrapper.find('h2').text()).toBe('A journey');
    expect(wrapper.findAll('a')).toHaveLength(1);
    expect(wrapper.find('[data-testid="cv-fab"]').attributes('href')).toMatch(/\/api\/resume\/cv\/$/);
    expect(wrapper.find('.journey-header a').exists()).toBe(false);
    expect(wrapper.find('#skills').exists()).toBe(false);
    useSiteStore().showSkills = true;
    await wrapper.vm.$nextTick();
    expect(wrapper.find('#skills').exists()).toBe(true);
    expect(wrapper.find('[role="tablist"]').exists()).toBe(false);
    expect(wrapper.text()).toContain('The journey is being written');
    wrapper.unmount();
  });
  it('reports a failed load and retries the complete feed', async () => {
    backend.loadResumeTimeline.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ data });
    useSiteStore().showSkills = false;
    const wrapper = shallowMount(TheResume, { global: { stubs: { teleport: true } } });
    await flushPromises();
    expect(wrapper.find('[role="alert"]').text()).toContain('couldn’t be loaded');
    await wrapper.find('[role="alert"] button').trigger('click');
    await flushPromises();
    expect(backend.loadResumeTimeline).toHaveBeenCalledTimes(2);
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    wrapper.unmount();
  });
});
