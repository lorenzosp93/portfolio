<template>
  <div v-if="checkTechnology" class="flex">
    <div id="notification-trigger" class="p-2">
      <button
        aria-label="Notifications button"
        class="p-1 rounded-md"
        @click="notificationStore.askPermission"
      >
        <BellAlertIcon
          class="h-6 w-6 md:h-7 md:w-7 stroke-gray-600 dark:stroke-white"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// https://web.dev/push-notifications-subscribing-a-user/
import { useNotificationStore } from "@/stores/notification.store";
import { BellAlertIcon } from "@heroicons/vue/24/outline";
import { computed } from "vue";

const notificationStore = useNotificationStore();

const checkTechnology = computed(() => {
  return "serviceWorker" in navigator && "PushManager" in window;
});
</script>

<style></style>
