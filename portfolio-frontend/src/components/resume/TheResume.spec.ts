import { shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/composables/visibilityObserver", async () => {
  const { ref } = await import("vue");
  return { useVisibilityObserver: () => ({ isActive: ref(false) }) };
});

import TheResume from "./TheResume.vue";
import { createPinia, setActivePinia } from "pinia";
import { useSiteStore } from "@/stores/site.store";

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
  beforeEach(() => setActivePinia(createPinia()));

  it("hides the skills panel and tab when disabled and restores them when enabled", async () => {
    setViewportWidth(390);
    const site = useSiteStore();
    site.showSkills = false;
    const wrapper = shallowMount(TheResume);
    expect(wrapper.find('#skills').exists()).toBe(false);
    expect(wrapper.find('#skills-tab').exists()).toBe(false);
    expect(wrapper.find('#education-tab').exists()).toBe(true);
    site.showSkills = true;
    await wrapper.vm.$nextTick();
    expect(wrapper.find('#skills').exists()).toBe(true);
    expect(wrapper.find('#skills-tab').exists()).toBe(true);
    wrapper.unmount();
  });
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

  it("updates a shrinking panel without compensating the page scroll", async () => {
    const observers: Array<{
      callback: ResizeObserverCallback;
      observe: ReturnType<typeof vi.fn>;
    }> = [];
    class ResizeObserverStub {
      callback: ResizeObserverCallback;
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();

      constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
        observers.push(this);
      }
    }
    const originalResizeObserver = window.ResizeObserver;
    window.ResizeObserver = ResizeObserverStub;
    vi.spyOn(window, "innerHeight", "get").mockReturnValue(400);
    const scrollBy = vi.spyOn(window, "scrollBy").mockImplementation(() => undefined);
    vi.spyOn(window, "scrollY", "get").mockReturnValue(1000);

    const wrapper = shallowMount(TheResume);
    await wrapper.vm.$nextTick();
    const viewport = wrapper.find(".overflow-hidden").element;
    vi.spyOn(viewport, "getBoundingClientRect").mockReturnValue({
      bottom: 400,
      height: 800,
    } as DOMRect);
    const panelObserver = observers.find(({ observe }) =>
      observe.mock.calls.some(([element]) => element.id === "experience")
    );
    const experience = wrapper.find("#experience").element;

    Object.defineProperty(experience, "scrollHeight", { configurable: true, value: 800 });
    panelObserver?.callback([], panelObserver as unknown as ResizeObserver);
    await wrapper.vm.$nextTick();

    Object.defineProperty(experience, "scrollHeight", { configurable: true, value: 600 });
    panelObserver?.callback([], panelObserver as unknown as ResizeObserver);
    await wrapper.vm.$nextTick();

    await wrapper.vm.$nextTick();
    expect(scrollBy).not.toHaveBeenCalled();
    expect(wrapper.find(".overflow-hidden").attributes("style")).toContain("height: 600px");
    wrapper.unmount();
    window.ResizeObserver = originalResizeObserver;
  });
});
