<template>
  <div class="relative m-auto max-w-[99%] md:max-w-xl lg:max-w-4xl xl:max-w-6xl">
    <div
      class="portfolio-card py-1"
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