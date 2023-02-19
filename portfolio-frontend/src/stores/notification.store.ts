import { defineStore } from "pinia";
import apiService from "@/services/api.service";
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
      return new Promise((resolve, reject) => {
        const permissionResult = Notification.requestPermission(function (
          result
        ) {
          resolve(result);
        });

        if (permissionResult) {
          permissionResult.then(resolve, reject);
        }
      }).then((permissionResult) => {
        if (permissionResult !== "granted") {
          throw new Error("We weren't granted permission.");
        }
        this.subscribeUserToPush();
      });
    },
    async subscribeUserToPush() {
      return navigator.serviceWorker
        .getRegistration()
        .then((registration: ServiceWorkerRegistration | undefined) => {
          const subscribeOptions = {
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(
              import.meta.env.VITE_APP_KEY
            ),
          };
          return registration?.pushManager.subscribe(subscribeOptions);
        })
        .then((pushSubscription: PushSubscription | undefined) => {
          this.pushSubscription = pushSubscription;
          this.publishSubscription();
        });
    },
    async publishSubscription() {
      if (this.pushSubscription)
        apiService.postSubscription(this.pushSubscription.toJSON()).then(() => {
          this.isSubscribed = true;
          localStorage.setItem("notificationSubscribed", "true");
        });
    },
    urlBase64ToUint8Array(base64String: string): Uint8Array {
      var padding = "=".repeat((4 - (base64String.length % 4)) % 4);
      var base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      var rawData = window.atob(base64);
      var outputArray = new Uint8Array(rawData.length);

      for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    },
  },
});
