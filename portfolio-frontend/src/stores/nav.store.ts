import { defineStore } from "pinia";
import { ComputedRef, Ref, computed } from "vue";

const RESUME_CHILD_SECTIONS = ["experience", "education", "projects", "skills"];

function sectionPriority(section: string) {
  if (RESUME_CHILD_SECTIONS.includes(section)) return 2;
  if (section === "theResume") return 1;
  return 0;
}

export const useNavStore = defineStore("nav", () => {
  const refs: Record<string, Ref<HTMLDivElement | null>> = {};

  const ratio: Record<string, Ref<number>> = {};
  const isActive: Record<string, Ref<boolean>> = {};

  const visible: ComputedRef<string> = computed(() => {
    return (
      Object.entries(ratio)
        .reduce<{ name: string; ratio: number }[]>((arr, curr) => {
          const [key, val] = curr;
          return [...arr, { name: key, ratio: val.value }];
        }, [])
        .sort((a, b) => {
          if (a.ratio !== b.ratio) return b.ratio - a.ratio;
          return sectionPriority(b.name) - sectionPriority(a.name);
        })
        .find((x) => x)?.name ?? ""
    );
  });

  return { refs, visible, isActive, ratio };
});
