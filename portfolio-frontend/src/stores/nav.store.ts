import { defineStore } from "pinia";
import { Ref, ref, shallowReactive } from "vue";

const NAV_SECTIONS = ["theHero", "theLeadership", "theResume", "theBlog", "theContacts"];

export const useNavStore = defineStore("nav", () => {
  const refs = shallowReactive<Record<string, Ref<HTMLDivElement | null>>>({});

  const ratio: Record<string, Ref<number>> = {};
  const isActive: Record<string, Ref<boolean>> = {};

  const visible = ref("");

  function updateVisible(readingLine: number, viewportHeight: number, atPageEnd: boolean) {
    // Compare section positions, not intersection percentages: the timeline can
    // be many viewports tall. Nested résumé panels belong to the same nav item.
    const sections = NAV_SECTIONS.flatMap(name => {
      const bounds = refs[name]?.value?.getBoundingClientRect();
      return bounds && bounds.height > 0 ? [{ name, bounds }] : [];
    });
    const reached = sections.filter(({ bounds }) => bounds.top <= readingLine);
    let active = reached[reached.length - 1];
    // A short final section may never reach the reading line before scrolling ends.
    const last = sections[sections.length - 1];
    if (atPageEnd && last && last.bounds.top < viewportHeight && last.bounds.bottom > 0) active = last;
    visible.value = active?.name ?? "";
  }

  return { refs, visible, isActive, ratio, updateVisible };
});
