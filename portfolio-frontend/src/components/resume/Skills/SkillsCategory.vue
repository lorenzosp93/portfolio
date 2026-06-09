<template>
  <div
    class="justify-start rounded-2xl bg-sand shadow-sm ring-1 ring-ink/10 dark:bg-nightElevated dark:text-gray-300 dark:ring-white/10 z-1 w-full"
  >
    <div class="rounded-t-2xl border-b border-ink/10 bg-surface/60 px-3 pt-3 pb-2 dark:border-white/10 dark:bg-nightSurface/60">
      <h3
        class="items-center align-text-bottom text-lg font-semibold text-ink dark:text-white"
      >
        {{ name }}
      </h3>
      <p class="text-sm text-muted dark:text-gray-300">
        {{ description }}
      </p>
    </div>
    <ul class="pb-1 pt-1">
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