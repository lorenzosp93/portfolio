<template>
  <div class="relative m-auto max-w-[99%] md:max-w-xl lg:max-w-4xl xl:max-w-6xl">
    <div
      ref="scrollContainer"
      class="max-h-[90vh] max-h-[90svh] overflow-y-scroll rounded-2xl border border-ink/10 bg-surface py-1 shadow-sm ring-1 ring-ink/5 no-scrollbar dark:border-white/10 dark:bg-nightSurface dark:ring-white/10"
      @scroll="updateScrollAffordance"
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
    <div
      v-if="showScrollAffordance"
      class="resume-panel__scroll-affordance"
      aria-hidden="true"
    />
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
const showScrollAffordance = ref(false);

function updateScrollAffordance() {
  const el = scrollContainer.value;
  if (!el) {
    showScrollAffordance.value = false;
    return;
  }

  const hasOverflow = el.scrollHeight > el.clientHeight + 2;
  const canScrollFurther = el.scrollTop + el.clientHeight < el.scrollHeight - 8;
  showScrollAffordance.value = hasOverflow && canScrollFurther;
}

function updateScrollAffordanceAfterRender() {
  nextTick(updateScrollAffordance);
}

onMounted(updateScrollAffordanceAfterRender);
useEventListener("resize", updateScrollAffordanceAfterRender);

watch(
  () => [props.dataLoaded, props.isLoading],
  updateScrollAffordanceAfterRender
);
</script>

<style scoped>
.resume-panel__scroll-affordance {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 6rem;
  pointer-events: none;
  border-radius: 0 0 1rem 1rem;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  mask-image: linear-gradient(to bottom, transparent, rgb(0 0 0 / 0.18) 20%, rgb(0 0 0 / 0.7) 58%, black 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent, rgb(0 0 0 / 0.18) 20%, rgb(0 0 0 / 0.7) 58%, black 100%);
}
</style>