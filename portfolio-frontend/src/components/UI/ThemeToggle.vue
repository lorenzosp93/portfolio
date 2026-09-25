<template>
  <button
    type="button"
    class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-muted ring-1 ring-ink/10 transition hover:text-teal hover:ring-teal/30 dark:text-gray-300 dark:ring-white/10 dark:hover:text-tealSoft"
    :aria-label="`Colour theme: ${label}. Click to change.`"
    @click="cycle"
  >
    <component :is="icon" class="h-4 w-4" aria-hidden="true" />
    <span>{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ComputerDesktopIcon, MoonIcon, SunIcon } from "@heroicons/vue/24/outline";
import { useTheme } from "@/composables/theme";

const { preference, cycle } = useTheme();

const label = computed(
  () => ({ system: "Auto", light: "Light", dark: "Dark" })[preference.value]
);
const icon = computed(
  () => ({ system: ComputerDesktopIcon, light: SunIcon, dark: MoonIcon })[preference.value]
);
</script>
