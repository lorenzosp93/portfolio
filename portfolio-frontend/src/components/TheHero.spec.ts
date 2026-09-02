import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

vi.mock("@/composables/visibilityObserver", async () => {
  const { ref } = await import("vue");
  return { useVisibilityObserver: () => ({ ratio: ref(1) }) };
});

import TheHero from "./TheHero.vue";
import { useSiteStore } from "@/stores/site.store";

describe("TheHero", () => {
  setActivePinia(createPinia());

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("renders trusted Markdown hero copy as separate paragraphs", () => {
    vi.stubEnv(
      "VITE_HERO_COPY",
      "Building **thoughtful software**.\n\nWorking with _curious people_."
    );

    const wrapper = mount(TheHero);
    const paragraphs = wrapper.findAll('[class*="prose"] p');

    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0].html()).toContain("<strong>thoughtful software</strong>");
    expect(paragraphs[1].html()).toContain("<em>curious people</em>");
  });

  it("uses a configured hero picture when site settings provide one", () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const siteStore = useSiteStore();
    siteStore.heroPicture = "https://media.example.test/hero.webp";

    const wrapper = mount(TheHero, { global: { plugins: [pinia] } });

    expect(wrapper.get("#heroPicture").attributes("src")).toBe(
      "https://media.example.test/hero.webp"
    );
    expect(wrapper.get("#heroPicture").attributes("srcset")).toBeUndefined();
  });
});
