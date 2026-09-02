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
      data: { about_text: "About", hero_picture: "https://media.example/hero.webp" },
    });
    const store = useSiteStore();

    await Promise.all([store.loadSettings(), store.loadSettings()]);

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
