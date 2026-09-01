import { defineStore } from "pinia";
import backendService from "@/services/api.service";
import type { AxiosError } from "axios";
import { useStorage, type RemovableRef } from "@vueuse/core";

export const useNotificationStore = defineStore({
  id: "notification",
  state: () => ({
    pushSubscription: undefined as PushSubscription | undefined,
    isSubscribed: useStorage(
      "notificationSubscribed",
      false
    ) as RemovableRef<boolean>,
    loading: false as boolean,
    error: undefined as AxiosError | undefined,
  }),
  actions: {
    async askPermission() {
      const permissionResult = await Notification.requestPermission();
      if (permissionResult !== "granted") {
        throw new Error("We weren't granted permission.");
      }
      return this.subscribeUserToPush();
    },
    async subscribeUserToPush() {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        throw new Error("No service worker registration is available.");
      }

      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          import.meta.env.VITE_APP_KEY
        ),
      };
      this.pushSubscription = await registration.pushManager.subscribe(
        subscribeOptions
      );
      return this.publishSubscription();
    },
    async publishSubscription() {
      if (!this.pushSubscription) return;

      await backendService.postSubscription(this.pushSubscription.toJSON());
      this.isSubscribed = true;
      localStorage.setItem("notificationSubscribed", "true");
    },
    urlBase64ToUint8Array(base64String: string): Uint8Array {
      const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    },
  },
});
