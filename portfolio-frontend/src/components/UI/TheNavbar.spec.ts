import { shallowMount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSiteStore } from '@/stores/site.store';

vi.mock('@/stores/nav.store', () => ({
  useNavStore: () => ({ refs: {}, visible: 'experience', isActive: { experience: true } }),
}));
import TheNavbar from './TheNavbar.vue';

describe('résumé navbar', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('uses the Skills visibility setting while the résumé submenu is expanded', async () => {
    const site = useSiteStore();
    site.showSkills = false;
    site.highlightsNavLabel = 'Selected work';
    site.highlightCards = [{ id: 1, title: 'Example', body: 'Copy', icon: 'layers', position: 0 }];
    const wrapper = shallowMount(TheNavbar);
    const labels = () => wrapper.findAll('.resume-subnav button').map(button => button.text());
    expect(labels()).toEqual(['Experience', 'Education']);
    expect(wrapper.text()).toContain('Selected work');
    site.highlightsNavLabel = 'Impact';
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('Impact');
    expect(wrapper.text()).not.toContain('Selected work');
    site.showSkills = true;
    await wrapper.vm.$nextTick();
    expect(labels()).toEqual(['Experience', 'Education', 'Skills']);
    site.showSkills = false;
    await wrapper.vm.$nextTick();
    expect(labels()).toEqual(['Experience', 'Education']);
    wrapper.unmount();
  });
});
