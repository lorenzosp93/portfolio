import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

const draggableMocks = vi.hoisted(() => {
  let options: { onDragEnd?: () => void } | undefined;
  const instance = {
    isPressed: true,
    y: 0,
    applyBounds: vi.fn(),
    kill: vi.fn(),
    endDrag: vi.fn(() => options?.onDragEnd?.call(instance)),
  };

  return {
    create: vi.fn((_element: Element, nextOptions) => {
      options = nextOptions;
      return [instance];
    }),
    instance,
    getOptions: () => options,
  };
});

vi.mock("gsap", () => {
  const timeline = {
    from: vi.fn().mockReturnThis(),
    to: vi.fn().mockReturnThis(),
    eventCallback: vi.fn().mockReturnThis(),
    restart: vi.fn(),
    reverse: vi.fn(),
    kill: vi.fn(),
  };
  return {
    default: {
      registerPlugin: vi.fn(),
      globalTimeline: { timeScale: vi.fn() },
      timeline: vi.fn(() => timeline),
      set: vi.fn(),
      to: vi.fn((_element, options) => {
        options?.onComplete?.();
      }),
      killTweensOf: vi.fn(),
      utils: { clamp: (_min: number, _max: number, value: number) => value },
    },
  };
});

vi.mock("gsap/Draggable", () => ({
  Draggable: { create: draggableMocks.create },
}));

vi.mock("gsap/InertiaPlugin", () => ({
  InertiaPlugin: { track: vi.fn(() => [{ get: vi.fn(() => 0) }]), untrack: vi.fn() },
}));

import DetailCard from "./DetailCard.vue";

describe("DetailCard", () => {
  it("contains background gestures without changing document geometry", async () => {
    document.body.style.position = "relative";
    const wrapper = mount(DetailCard, { props: { isOpen: false } });
    await wrapper.setProps({ isOpen: true });
    expect(document.body.style.position).toBe("relative");
    expect(document.documentElement.style.overflow).toBe("");
    expect(document.querySelector(".bottom-sheet")?.textContent).not.toContain("Extra title content");
    const backgroundWheel = new WheelEvent("wheel", { deltaY: 50, bubbles: true, cancelable: true });
    document.body.dispatchEvent(backgroundWheel);
    expect(backgroundWheel.defaultPrevented).toBe(true);
    const area = document.querySelector<HTMLElement>(".bottom-sheet__content")!;
    area.style.overflowY = "scroll";
    Object.defineProperties(area, {
      clientHeight: { configurable: true, value: 300 },
      scrollHeight: { configurable: true, value: 900 },
      scrollTop: { configurable: true, writable: true, value: 300 },
    });
    const within = new WheelEvent("wheel", { deltaY: 50, bubbles: true, cancelable: true });
    area.dispatchEvent(within);
    expect(within.defaultPrevented).toBe(false);
    area.scrollTop = 600;
    const boundary = new WheelEvent("wheel", { deltaY: 50, bubbles: true, cancelable: true });
    area.dispatchEvent(boundary);
    expect(boundary.defaultPrevented).toBe(true);
    const touch = new Event("touchmove", { bubbles: true, cancelable: true });
    Object.defineProperty(touch, "touches", { value: [{ clientX: 0, clientY: -30 }] });
    area.dispatchEvent(touch);
    expect(touch.defaultPrevented).toBe(true);
    await wrapper.setProps({ isOpen: false });
    const after = new WheelEvent("wheel", { deltaY: 50, bubbles: true, cancelable: true });
    document.body.dispatchEvent(after);
    expect(after.defaultPrevented).toBe(false);
    wrapper.unmount();
    document.body.style.removeProperty("position");
  });
  it("releases gesture containment when an open dialog is unmounted", async () => {
    const wrapper = mount(DetailCard, { props: { isOpen: false } });
    await wrapper.setProps({ isOpen: true });
    wrapper.unmount();
    expect(document.body.style.overscrollBehavior).toBe("");
    const after = new WheelEvent("wheel", { deltaY: 50, bubbles: true, cancelable: true });
    document.body.dispatchEvent(after);
    expect(after.defaultPrevented).toBe(false);
  });

  it("releases an active drag when the pointer leaves the browser window", async () => {
    const wrapper = mount(DetailCard, { props: { isOpen: false } });
    await wrapper.setProps({ isOpen: true });

    draggableMocks.getOptions()?.onDragStart?.call(draggableMocks.instance);
    await wrapper.vm.$nextTick();
    expect(document.querySelector(".bottom-sheet")?.classList.contains("moving")).toBe(true);

    window.dispatchEvent(new MouseEvent("mouseout", { relatedTarget: null }));
    await wrapper.vm.$nextTick();

    expect(draggableMocks.instance.endDrag).toHaveBeenCalledOnce();
    expect(document.querySelector(".bottom-sheet")?.classList.contains("moving")).toBe(false);
    wrapper.unmount();
  });

  it("keeps its measured resting height after an upward-drag bounce", async () => {
    const heightSpy = vi
      .spyOn(HTMLElement.prototype, "clientHeight", "get")
      .mockReturnValue(600);
    const wrapper = mount(DetailCard, { props: { isOpen: false } });
    await wrapper.setProps({ isOpen: true });

    draggableMocks.instance.y = -60;
    draggableMocks.getOptions()?.onDrag?.call(draggableMocks.instance);
    draggableMocks.getOptions()?.onDragEnd?.call(draggableMocks.instance);
    await wrapper.vm.$nextTick();

    expect(document.querySelector<HTMLElement>(".bottom-sheet__card")?.style.height).toBe(
      "600px"
    );
    heightSpy.mockRestore();
    wrapper.unmount();
  });

  it("only shows edge affordances where more content can be scrolled", async () => {
    const wrapper = mount(DetailCard, { props: { isOpen: false } });
    await wrapper.setProps({ isOpen: true });
    const content = document.querySelector<HTMLElement>(".bottom-sheet.opened .bottom-sheet__content");
    const contentWrap = document.querySelector<HTMLElement>(
      ".bottom-sheet.opened .bottom-sheet__content-wrap"
    );
    if (!content || !contentWrap) throw new Error("Opened bottom sheet not rendered");
    Object.defineProperties(content, {
      clientHeight: { configurable: true, value: 300 },
      scrollHeight: { configurable: true, value: 900 },
      scrollTop: { configurable: true, writable: true, value: 0 },
    });

    content.dispatchEvent(new Event("scroll"));
    await wrapper.vm.$nextTick();
    expect(contentWrap.classList.contains("can-scroll-up")).toBe(false);
    expect(contentWrap.classList.contains("can-scroll-down")).toBe(true);

    content.scrollTop = 600;
    content.dispatchEvent(new Event("scroll"));
    await wrapper.vm.$nextTick();
    expect(contentWrap.classList.contains("can-scroll-up")).toBe(true);
    expect(contentWrap.classList.contains("can-scroll-down")).toBe(false);
    wrapper.unmount();
  });
});
