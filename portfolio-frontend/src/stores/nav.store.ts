import { defineStore } from "pinia";
import { ComputedRef, Ref, computed } from "vue";

const NAV_CONTAINER_SECTIONS = ["theResume"];

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
        .filter(({ name }) => !NAV_CONTAINER_SECTIONS.includes(name))
        .sort((a, b) => (a.ratio > b.ratio ? -1 : 1))
        .find((x) => x)?.name ?? ""
    );
  });

  return { refs, visible, isActive, ratio };
});
