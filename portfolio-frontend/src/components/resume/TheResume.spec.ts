import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/composables/visibilityObserver", async () => {
  const { ref } = await import("vue");
  return { useVisibilityObserver: () => ({ isActive: ref(false) }) };
});

import TheResume from "./TheResume.vue";

function setViewportWidth(width: number) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query === "(max-width: 639px)" && width <= 639,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe("TheResume", () => {
  it("renders tabs only at mobile widths", () => {
    setViewportWidth(639);

    const wrapper = shallowMount(TheResume);

    expect(wrapper.find("ul").exists()).toBe(true);
  });

  it("hides tabs at desktop widths", () => {
    setViewportWidth(640);

    const wrapper = shallowMount(TheResume);

    expect(wrapper.find("ul").exists()).toBe(false);
  });
});
