<template>
  <div class="p-10 m-auto">
    <button
      type="button"
      @click="$emit('loadEntries')"
      class="block rounded-2xl text-white dark:text-gray-300 font-bold py-3 px-5 bg-gray-600 dark:bg-gray-600 shadow-md cursor-pointer hover:scale-105 transition duration-300 ease-in max-w-xs text-center m-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal"
    >
      Retry
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits(["loadEntries"]);
</script>

<style></style>
