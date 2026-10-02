<template>
  <div
    class="pointer-events-none sticky top-1/2 z-10 hidden h-0 w-full -translate-y-1/2 sm:block"
    ref="arrowContainer"
  >
    <button
      v-show="!begin"
      type="button"
      aria-label="Scroll resume carousel left"
      @click="scrollToSibling(false)"
      class="arrow-button left-2"
    >
      <chevron-left-icon
        class="w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      ></chevron-left-icon>
    </button>
    <button
      v-show="!end"
      type="button"
      aria-label="Scroll resume carousel right"
      @click="scrollToSibling(true)"
      class="arrow-button right-2"
    >
      <chevron-right-icon
        class="w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      ></chevron-right-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/outline";
import { useEventListener, useMutationObserver, useResizeObserver, useThrottleFn } from "@vueuse/core";
import { watch, ref, nextTick } from "vue";

const props = defineProps<{ scrollContainer: HTMLDivElement | null }>();
const emit = defineEmits(["end"]);
const begin = ref(true);
const end = ref(true);
const notifyEnd = useThrottleFn(() => emit("end"), 1000, true);

function scrollToSibling(next: boolean) {
  const container = props.scrollContainer;
  if (!container || !container.children.length) return;
  const children = Array.from(container.children) as HTMLElement[];
  const origin = children[0].offsetLeft;
  const positions = children.map(child => child.offsetLeft - origin);
  const current = positions.reduce((closest, position, index) =>
    Math.abs(position - container.scrollLeft) < Math.abs(positions[closest] - container.scrollLeft) ? index : closest, 0);
  const target = Math.max(0, Math.min(children.length - 1, current + (next ? 1 : -1)));
  container.scrollTo({ left: positions[target], behavior: "smooth" });
}

function calculateScrollPosition() {
  const container = props.scrollContainer;
  if (!container) return;
  const maximum = Math.max(0, container.scrollWidth - container.clientWidth);
  begin.value = container.scrollLeft <= 1;
  const atEnd = maximum - container.scrollLeft <= 1;
  if (atEnd && !end.value) notifyEnd();
  end.value = atEnd;
}

useEventListener(() => props.scrollContainer, "scroll", calculateScrollPosition, { passive: true });
useEventListener(() => props.scrollContainer, "keydown", (event: KeyboardEvent) => {
  if (event.target instanceof Element && event.target.closest('input, textarea, select')) return;
  if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
    event.preventDefault();
    scrollToSibling(event.key === "ArrowRight");
  }
});
useResizeObserver(() => props.scrollContainer, calculateScrollPosition);
useMutationObserver(() => props.scrollContainer, () => nextTick(calculateScrollPosition), { childList: true });
watch(() => props.scrollContainer, () => nextTick(calculateScrollPosition), { immediate: true });

</script>

<style scoped>
.arrow-button {
  @apply pointer-events-auto absolute h-11 w-11 cursor-pointer select-none rounded-full bg-surface text-teal shadow-lg ring-1 ring-ink/10 transition hover:-translate-y-0.5 hover:bg-tealSoft hover:text-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-teal dark:bg-nightElevated dark:text-tealSoft dark:ring-white/10 dark:hover:bg-teal/30 dark:focus-visible:ring-tealSoft;
}
</style>
