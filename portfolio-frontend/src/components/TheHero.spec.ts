import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/composables/visibilityObserver", async () => {
  const { ref } = await import("vue");
  return { useVisibilityObserver: () => ({ ratio: ref(1) }) };
});

import TheHero from "./TheHero.vue";

describe("TheHero", () => {
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
});
