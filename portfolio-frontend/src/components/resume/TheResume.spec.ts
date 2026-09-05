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

  it("keeps the shorter panel in view when switching at the bottom of resume", async () => {
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

    expect(scrollBy).toHaveBeenCalledWith({ top: -200, behavior: "smooth" });
    wrapper.unmount();
    window.ResizeObserver = originalResizeObserver;
  });
});
