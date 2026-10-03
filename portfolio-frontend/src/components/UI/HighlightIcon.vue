<template>
  <component :is="icon" aria-hidden="true" />
</template>
<script setup lang="ts">
import { computed, defineAsyncComponent, type Component } from 'vue';
import { Square3Stack3DIcon } from '@heroicons/vue/24/outline';
const loaders = import.meta.glob<{ default: Component }>('/node_modules/@heroicons/vue/24/outline/esm/*Icon.js');
const icons = new Map<string, Component>();
const props = defineProps<{ name: string }>();
const aliases: Record<string, string> = { layers: 'Square3Stack3DIcon', globe: 'GlobeAltIcon', users: 'UserGroupIcon' };
const icon = computed(() => {
  const name = aliases[props.name] || props.name;
  const loader = loaders[`/node_modules/@heroicons/vue/24/outline/esm/${name}.js`];
  if (!loader) return Square3Stack3DIcon;
  if (!icons.has(name)) icons.set(name, defineAsyncComponent(loader));
  return icons.get(name)!;
});
</script>
