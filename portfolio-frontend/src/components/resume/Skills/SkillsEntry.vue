<template>
  <div class="py-3 px-5 flex">
    <p class="text-md text-ink dark:text-white">
      {{ name }}
    </p>
    <div
      class="ml-auto w-1/2 overflow-x-hidden rounded-full border border-teal/30 bg-paper dark:border-tealSoft/30 dark:bg-night"
    >
      <div
        class="h-full origin-left -translate-x-10 bg-gradient-to-r from-teal to-coral py-3 dark:from-tealSoft dark:to-coralSoft"
        :class="{ 'translate-x-0 ease-in duration-1000': loadAnimation }"
        :style="{ width: (level + 1) * 20 + '%' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type SkillCategory } from "@/models/models.interface";
import { onMounted, ref, watch } from "vue";

const loadAnimation = ref(false);
const props = defineProps<{
  isActive: boolean;
  name: string;
  category?: SkillCategory;
  url?: string;
  level: number;
}>();

watch(
  () => props.isActive,
  (val) => {
    if (val) {
      setTimeout(() => (loadAnimation.value = true), 300);
    } else {
      loadAnimation.value = false;
    }
  }
);
onMounted(() => {
  setTimeout(() => (loadAnimation.value = true), 500);
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>