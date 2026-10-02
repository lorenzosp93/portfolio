import { defineStore } from "pinia";
import type { LeadershipCard } from "@/models/models.interface";
import { ref } from "vue";
import backendService from "@/services/api.service";

export const useSiteStore = defineStore("site", () => {
  const heroPicture = ref<string | null>(null);
  const aboutText = ref("");
  const leadershipHeading = ref("");
  const leadershipCards = ref<LeadershipCard[]>([]);
  let settingsPromise: Promise<void> | null = null;

  function loadSettings() {
    if (!settingsPromise) {
      settingsPromise = backendService
        .loadSiteSettings()
        .then(({ data }) => {
          heroPicture.value = data.hero_picture;
          aboutText.value = data.about_text ?? "";
          leadershipHeading.value = data.leadership_heading ?? "";
          leadershipCards.value = data.leadership_cards ?? [];
        })
        .catch(() => {
          // The bundled image remains the resilient fallback.
        });
    }

    return settingsPromise;
  }

  return { heroPicture, aboutText, leadershipHeading, leadershipCards, loadSettings };
});
