<template>
  <div
    class="m-auto rounded-lg md:max-w-xl lg:max-w-4xl xl:max-w-6xl overflow-y-scroll shadow-md bg-white dark:bg-gray-900 py-1 mx-auto no-scrollbar border-2 dark:border-gray-900 border-white max-w-[99%]"
    style="max-height: 90vh; max-height: 90svh"
  >
    <div class="mx-auto">
      <div
        class="absolute top-1/2 -translate-y-1/2 -right-2.5 md:hidden"
        :class="{ hidden: ix == 'last' }"
      >
        <div
          class="w-10 p-0.5 rounded-lg cursor-grab active:cursor-grabbing bg-gray-300 rotate-90"
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
