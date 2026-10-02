import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

const backend = vi.hoisted(() => ({ loadSiteSettings: vi.fn() }));
vi.mock("@/services/api.service", () => ({ default: backend }));

import { useSiteStore } from "./site.store";

describe("site store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    backend.loadSiteSettings.mockReset();
  });

  it("loads the configurable hero picture once", async () => {
    backend.loadSiteSettings.mockResolvedValue({
      data: { show_skills: false, about_text: "About", hero_picture: "https://media.example/hero.webp", highlights_heading: "My impact", highlights_nav_label: "Selected work", highlights_eyebrow: "How I work", highlight_cards: [{ id: 1, title: "Teams", body: "Coaching", icon: "users", position: 0 }] },
    });
    const store = useSiteStore();

    await Promise.all([store.loadSettings(), store.loadSettings()]);

    expect(store.aboutText).toBe("About");
    expect(store.showSkills).toBe(false);
    expect(store.highlightsHeading).toBe("My impact");
    expect(store.highlightsNavLabel).toBe("Selected work");
    expect(store.highlightsEyebrow).toBe("How I work");
    expect(store.highlightCards[0].title).toBe("Teams");
    expect(store.heroPicture).toBe("https://media.example/hero.webp");
    expect(backend.loadSiteSettings).toHaveBeenCalledOnce();
  });

  it("retains the bundled-image fallback when settings cannot be loaded", async () => {
    backend.loadSiteSettings.mockRejectedValue(new Error("offline"));
    const store = useSiteStore();

    await expect(store.loadSettings()).resolves.toBeUndefined();
    expect(store.heroPicture).toBeNull();
  });
});
