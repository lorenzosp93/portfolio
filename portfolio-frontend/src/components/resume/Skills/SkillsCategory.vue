<template>
  <div
    class="justify-start rounded-2xl bg-surface shadow-sm ring-1 ring-ink/10 dark:bg-nightSurface dark:text-gray-300 dark:ring-white/10 z-1 w-full"
  >
    <h3
      class="items-center mx-3 pt-3 align-text-bottom text-lg font-semibold text-ink dark:text-white"
    >
      {{ name }}
    </h3>
    <p class="text-sm text-muted dark:text-gray-300 mx-3 pb-3">
      {{ description }}
    </p>
    <ul class="pb-1">
      <skills-entry
        v-for="skill in skills"
        :key="skill.name"
        v-bind="skill"
        :isActive="isActive"
      >
      </skills-entry>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { type Skill } from "@/models/models.interface";
import SkillsEntry from "./SkillsEntry.vue";

defineProps<{
  name: string;
  description: string;
  skills: Skill[];
  isActive: boolean;
}>();
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>