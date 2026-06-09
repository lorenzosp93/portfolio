<template>
  <div class="relative m-auto max-w-[99%] md:max-w-xl lg:max-w-4xl xl:max-w-6xl">
    <div
      ref="scrollContainer"
      class="max-h-[90vh] max-h-[90svh] overflow-y-scroll rounded-2xl border border-ink/10 bg-surface py-1 shadow-sm ring-1 ring-ink/5 no-scrollbar dark:border-white/10 dark:bg-nightSurface dark:ring-white/10"
      @scroll="handleScroll"
    >
      <div class="mx-auto">
        <div
          class="absolute top-1/2 -right-2.5 -translate-y-1/2 md:hidden"
          :class="{ hidden: ix == 'last' }"
        >
          <div
            class="w-10 rotate-90 cursor-grab rounded-lg bg-tealSoft p-0.5 active:cursor-grabbing dark:bg-teal/40"
          />
        </div>
        <slot name="content"> </slot>
        <loading-card v-if="isLoading" />
        <retry-button
          v-else-if="!dataLoaded"
          @load-entries="$emit('loadEntries')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoadingCard from "../Card/LoadingCard.vue";
import RetryButton from "../Buttons/RetryButton.vue";
import { nextTick, onMounted, ref, watch } from "vue";
import { useEventListener } from "@vueuse/core";

const props = defineProps<{
  ix: string;
  dataLoaded: boolean;
  isLoading: boolean;
}>();

defineEmits(["loadEntries"]);

const scrollContainer = ref<HTMLElement | null>(null);
const hasNudged = ref(false);
const isNudging = ref(false);

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function hasOverflow(el: HTMLElement) {
  return el.scrollHeight > el.clientHeight + 2;
}

function handleScroll() {
  if (!isNudging.value) {
    hasNudged.value = true;
  }
}

function maybeNudgeScroll() {
  const el = scrollContainer.value;
  if (!el || hasNudged.value || prefersReducedMotion() || !hasOverflow(el)) {
    return;
  }

  hasNudged.value = true;
  isNudging.value = true;
  const startTop = el.scrollTop;
  const nudgeTop = Math.min(startTop + 18, el.scrollHeight - el.clientHeight);

  el.scrollTo({ top: nudgeTop, behavior: "smooth" });
  window.setTimeout(() => {
    el.scrollTo({ top: startTop, behavior: "smooth" });
  }, 220);
  window.setTimeout(() => {
    isNudging.value = false;
  }, 700);
}

function maybeNudgeAfterRender() {
  nextTick(maybeNudgeScroll);
}

onMounted(maybeNudgeAfterRender);
useEventListener("resize", maybeNudgeAfterRender);

watch(
  () => [props.dataLoaded, props.isLoading],
  ([dataLoaded, isLoading]) => {
    if (isLoading) {
      hasNudged.value = false;
      return;
    }
    if (dataLoaded) {
      maybeNudgeAfterRender();
    }
  }
);
</script>

<style scoped></style>