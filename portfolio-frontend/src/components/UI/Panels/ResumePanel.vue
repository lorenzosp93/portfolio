<template>
  <div
    class="m-auto max-w-[99%] overflow-y-scroll rounded-2xl border border-ink/10 bg-surface py-1 shadow-sm ring-1 ring-ink/5 no-scrollbar dark:border-white/10 dark:bg-nightSurface dark:ring-white/10 md:max-w-xl lg:max-w-4xl xl:max-w-6xl"
    style="max-height: 90vh; max-height: 90svh"
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