<template>
  <div class="relative m-auto max-w-[99%] md:max-w-xl lg:max-w-4xl xl:max-w-6xl">
    <div
      class="max-h-[90vh] max-h-[90svh] overflow-y-scroll rounded-2xl border border-ink/10 bg-surface py-1 shadow-sm ring-1 ring-ink/5 no-scrollbar dark:border-white/10 dark:bg-nightSurface dark:ring-white/10"
    >
      <div class="mx-auto pb-12">
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
    <div class="resume-panel__scroll-affordance" aria-hidden="true">
      <div class="resume-panel__scroll-pill" />
    </div>
  </div>
</template>

<script setup lang="ts">
import LoadingCard from "../Card/LoadingCard.vue";
import RetryButton from "../Buttons/RetryButton.vue";

defineProps<{
  ix: string;
  dataLoaded: boolean;
  isLoading: boolean;
}>();

defineEmits(["loadEntries"]);
</script>

<style scoped>
.resume-panel__scroll-affordance {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 4rem;
  pointer-events: none;
  border-radius: 0 0 1rem 1rem;
  background: linear-gradient(to bottom, rgb(255 255 255 / 0), rgb(255 255 255 / 0.9) 68%, rgb(255 255 255));
}
:global(.dark) .resume-panel__scroll-affordance {
  background: linear-gradient(to bottom, rgb(17 24 39 / 0), rgb(17 24 39 / 0.9) 68%, rgb(17 24 39));
}
.resume-panel__scroll-pill {
  position: absolute;
  left: 50%;
  bottom: 0.75rem;
  width: 2.25rem;
  height: 0.25rem;
  transform: translateX(-50%);
  border-radius: 9999px;
  background: rgb(15 118 110 / 0.45);
}
:global(.dark) .resume-panel__scroll-pill {
  background: rgb(153 246 228 / 0.45);
}
</style>