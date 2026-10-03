import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { useNavStore } from './nav.store';

function section(top: number, height: number) {
  const element = document.createElement('div');
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({ top, bottom: top + height, height } as DOMRect);
  return ref(element);
}

describe('active navigation section', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('tracks the reading position in both directions through a long résumé', () => {
    const nav = useNavStore();
    nav.refs.theLeadership = section(-100, 300);
    nav.refs.theResume = section(200, 12000);
    nav.refs.theBlog = section(12200, 800);
    nav.updateVisible(150, 844, false);
    expect(nav.visible).toBe('theLeadership');
    nav.updateVisible(300, 844, false);
    expect(nav.visible).toBe('theResume');
    nav.refs.theResume = section(-11900, 12000);
    nav.refs.theBlog = section(100, 800);
    nav.updateVisible(300, 844, false);
    expect(nav.visible).toBe('theBlog');
    nav.refs.theResume = section(-11800, 12000);
    nav.refs.theBlog = section(200, 800);
    nav.updateVisible(150, 844, false);
    expect(nav.visible).toBe('theResume');
  });

  it('keeps nested skills under Resume and ignores absent or hidden sections', () => {
    const nav = useNavStore();
    nav.refs.theLeadership = ref(null);
    nav.refs.theResume = section(-1000, 3000);
    nav.refs.skills = section(100, 500);
    nav.refs.theBlog = section(0, 0);
    nav.updateVisible(300, 844, false);
    expect(nav.visible).toBe('theResume');
  });

  it('selects a short Contacts section at the bottom of the page', () => {
    const nav = useNavStore();
    nav.refs.theBlog = section(-100, 700);
    nav.refs.theContacts = section(600, 150);
    nav.updateVisible(300, 844, false);
    expect(nav.visible).toBe('theBlog');
    nav.updateVisible(300, 844, true);
    expect(nav.visible).toBe('theContacts');
  });
});
