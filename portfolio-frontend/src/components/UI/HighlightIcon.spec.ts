import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import HighlightIcon from './HighlightIcon.vue';
import { RocketLaunchIcon, UserGroupIcon, Square3Stack3DIcon } from '@heroicons/vue/24/outline';
describe('HighlightIcon', () => {
  it('renders icons beyond the original three and preserves existing names', () => {
    const wrapper=mount(HighlightIcon, { props: { name: 'RocketLaunchIcon' } });
    expect(wrapper.findComponent(RocketLaunchIcon).exists()).toBe(true);
    wrapper.unmount();
    const legacy=mount(HighlightIcon, { props: { name: 'users' } });
    expect(legacy.findComponent(UserGroupIcon).exists()).toBe(true);
    legacy.unmount();
    const unknown=mount(HighlightIcon, { props: { name: 'UnknownIcon' } });
    expect(unknown.findComponent(Square3Stack3DIcon).exists()).toBe(true);
    unknown.unmount();
  });
});
