import { defineStore } from "pinia";
import type { HighlightCard } from "@/models/models.interface";
import { ref } from "vue";
import backendService from "@/services/api.service";

export const useSiteStore = defineStore("site", () => {
  const heroPicture = ref<string | null>(null);
  const aboutText = ref("");
  const showSkills = ref(true);
  const highlightsHeading = ref("");
  const highlightsNavLabel = ref("");
  const highlightsEyebrow = ref("");
  const highlightCards = ref<HighlightCard[]>([]);
  let settingsPromise: Promise<void> | null = null;

  function loadSettings() {
    if (!settingsPromise) {
      settingsPromise = backendService
        .loadSiteSettings()
        .then(({ data }) => {
          heroPicture.value = data.hero_picture;
          aboutText.value = data.about_text ?? "";
          showSkills.value = data.show_skills ?? true;
          highlightsHeading.value = data.highlights_heading ?? data.leadership_heading ?? "";
          highlightsNavLabel.value = data.highlights_nav_label ?? "Highlights";
          highlightsEyebrow.value = data.highlights_eyebrow ?? "";
          highlightCards.value = data.highlight_cards ?? data.leadership_cards ?? [];
        })
        .catch(() => {
          // The bundled image remains the resilient fallback.
        });
    }

    return settingsPromise;
  }

  return { heroPicture, aboutText, showSkills, highlightsHeading, highlightsNavLabel, highlightsEyebrow, highlightCards, loadSettings };
});
