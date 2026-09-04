<template>
  <aside
    v-if="updateAvailable"
    class="fixed bottom-4 left-4 right-4 z-[10000] mx-auto flex max-w-lg items-center justify-between gap-4 rounded-xl border border-teal/30 bg-surface p-4 text-sm text-ink shadow-lg dark:bg-nightSurface dark:text-white"
    role="status"
    aria-live="polite"
  >
    <p>A new version is ready. Refresh when you’re ready; unsent text will be lost.</p>
    <button
      type="button"
      class="shrink-0 rounded-lg bg-teal px-4 py-2 font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:opacity-60"
      :disabled="updating"
      @click="refresh"
    >{{ updating ? 'Refreshing…' : 'Refresh' }}</button>
  </aside>
</template>

<script setup lang="ts">
import { useServiceWorkerUpdates } from "@/composables/serviceWorkerUpdates";

const { updateAvailable, updating, refresh } = useServiceWorkerUpdates(
  import.meta.env.PROD ? navigator.serviceWorker : undefined,
);
</script>
