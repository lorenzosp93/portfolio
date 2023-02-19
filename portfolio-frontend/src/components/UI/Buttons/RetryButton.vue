<template>
  <div class="p-10 m-auto">
    <div
      @click="$emit('loadEntries')"
      class="rounded-2xl text-white dark:text-gray-300 font-bold py-3 px-5 bg-gray-400 dark:bg-gray-600 shadow-md cursor-pointer hover:scale-105 transition duration-300 ease-in max-w-xs text-center m-auto"
    >
      Retry
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "RetryButton",
  props: [],
  emits: ["loadEntries"],
});
</script>

<style></style>
