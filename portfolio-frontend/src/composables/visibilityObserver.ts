import { useNavStore } from "@/stores/nav.store";
import { useIntersectionObserver } from "@vueuse/core";
import { Ref, ref } from "vue";

export function useVisibilityObserver(
  resource: string,
  root: Ref<HTMLDivElement | null>
) {
  const navStore = useNavStore();

  const isActive = ref(false);
  const ratio = ref(0);

  useIntersectionObserver(root, ([{ isIntersecting, intersectionRatio }]) => {
    isActive.value = isIntersecting;
    ratio.value = intersectionRatio;
  });

  navStore.refs[resource] = root;
  navStore.isActive[resource] = isActive;
  navStore.ratio[resource] = ratio;
  return { isActive, ratio };
}
