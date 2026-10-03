import { shallowMount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { useSiteStore } from '@/stores/site.store';

import { useNavStore } from '@/stores/nav.store';
import TheNavbar from './TheNavbar.vue';

describe('section navbar', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('keeps one résumé navigation item and uses CMS highlight labels', async () => {
    const site = useSiteStore();
    site.showSkills = false;
    site.highlightsNavLabel = 'Selected work';
    site.highlightCards = [{ id: 1, title: 'Example', body: 'Copy', icon: 'layers', position: 0 }];
    const wrapper = shallowMount(TheNavbar);
    const labels = () => wrapper.findAll('.nav-link').map(button => button.text());
    expect(labels()).toContain('Resume');
    expect(wrapper.find('.resume-subnav').exists()).toBe(false);
    expect(wrapper.text()).toContain('Selected work');
    site.highlightsNavLabel = 'Impact';
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('Impact');
    expect(wrapper.text()).not.toContain('Selected work');
    site.showSkills = true;
    await wrapper.vm.$nextTick();
    expect(labels()).toContain('Resume');
    site.showSkills = false;
    await wrapper.vm.$nextTick();
    expect(labels()).toContain('Resume');
    expect(wrapper.find('.resume-subnav').exists()).toBe(false);
    wrapper.unmount();
  });
  it('shows one mobile About item and shares the active section across layouts', async () => {
    const site = useSiteStore();
    site.highlightsNavLabel = 'About';
    site.highlightCards = [{ id: 1, title: 'Example', body: 'Copy', icon: 'layers', position: 0 }];
    const wrapper = shallowMount(TheNavbar);
    const nav = useNavStore();
    expect(wrapper.findAll('.mobile-link').map(button => button.text())).toEqual(['About', 'Resume', 'Blog', 'Contacts']);
    for (const [section, label] of [['theLeadership', 'About'], ['theResume', 'Resume'], ['theBlog', 'Blog'], ['theContacts', 'Contacts']]) {
      nav.visible = section;
      await wrapper.vm.$nextTick();
      expect(wrapper.findAll('.mobile-link.active').map(button => button.text())).toEqual([label]);
      expect(wrapper.findAll('.nav-link.active_top_text').map(button => button.text())).toEqual([label]);
      expect(wrapper.findAll('[aria-current="location"]')).toHaveLength(2);
    }
    await wrapper.find('[aria-controls="mobile-menu"]').trigger('click');
    expect(wrapper.find('[aria-controls="mobile-menu"]').attributes('aria-expanded')).toBe('true');
    await wrapper.find('[aria-label="Back to introduction"]').trigger('click');
    expect(wrapper.find('[aria-controls="mobile-menu"]').attributes('aria-expanded')).toBe('false');
    wrapper.unmount();
  });

});
