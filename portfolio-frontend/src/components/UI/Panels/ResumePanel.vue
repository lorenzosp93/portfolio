<template>
  <div class="relative m-auto max-w-[99%] md:max-w-xl lg:max-w-4xl xl:max-w-6xl">
    <div
      class="rounded-2xl border border-ink/10 bg-surface py-1 shadow-sm ring-1 ring-ink/5 dark:border-white/10 dark:bg-nightSurface dark:ring-white/10"
    >
      <div class="mx-auto">
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

defineProps<{
  ix: string;
  dataLoaded: boolean;
  isLoading: boolean;
}>();

defineEmits(["loadEntries"]);
</script>

<style scoped></style>