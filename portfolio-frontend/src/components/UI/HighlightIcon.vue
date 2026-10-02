<template>
  <component :is="icon" aria-hidden="true" />
</template>
<script setup lang="ts">
import { computed } from 'vue';
import * as outlineIcons from '@heroicons/vue/24/outline';
const props = defineProps<{ name: string }>();
const aliases: Record<string, string> = { layers: 'Square3Stack3DIcon', globe: 'GlobeAltIcon', users: 'UserGroupIcon' };
const icon = computed(() => outlineIcons[(aliases[props.name] || props.name) as keyof typeof outlineIcons] || outlineIcons.Square3Stack3DIcon);
</script>
