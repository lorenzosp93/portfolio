import { defineStore } from "pinia";
import { ref } from "vue";
import backendService from "@/services/api.service";

export const useSiteStore = defineStore("site", () => {
  const heroPicture = ref<string | null>(null);
  let settingsPromise: Promise<void> | null = null;

  function loadSettings() {
    if (!settingsPromise) {
      settingsPromise = backendService
        .loadSiteSettings()
        .then(({ data }) => {
          heroPicture.value = data.hero_picture;
        })
        .catch(() => {
          // The bundled image remains the resilient fallback.
        });
    }

    return settingsPromise;
  }

  return { heroPicture, loadSettings };
});
