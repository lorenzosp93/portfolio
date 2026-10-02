import { defineStore } from "pinia";
import type { HighlightCard } from "@/models/models.interface";
import { ref } from "vue";
import backendService from "@/services/api.service";

export const useSiteStore = defineStore("site", () => {
  const heroPicture = ref<string | null>(null);
  const aboutText = ref("");
  const showSkills = ref(true);
  const leadershipHeading = ref("");
  const leadershipCards = ref<HighlightCard[]>([]);
  let settingsPromise: Promise<void> | null = null;

  function loadSettings() {
    if (!settingsPromise) {
      settingsPromise = backendService
        .loadSiteSettings()
        .then(({ data }) => {
          heroPicture.value = data.hero_picture;
          aboutText.value = data.about_text ?? "";
          showSkills.value = data.show_skills ?? true;
          leadershipHeading.value = data.leadership_heading ?? "";
          leadershipCards.value = data.leadership_cards ?? [];
        })
        .catch(() => {
          // The bundled image remains the resilient fallback.
        });
    }

    return settingsPromise;
  }

  return { heroPicture, aboutText, showSkills, leadershipHeading, leadershipCards, loadSettings };
});
