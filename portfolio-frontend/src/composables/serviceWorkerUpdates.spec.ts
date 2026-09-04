import { mount } from "@vue/test-utils";
import { defineComponent } from "vue";
import { afterEach, expect, test, vi } from "vitest";
import { useServiceWorkerUpdates } from "./serviceWorkerUpdates";

afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

function setup(controller: object | null = {}) {
  const update = vi.fn().mockResolvedValue(undefined);
  const workers = Object.assign(new EventTarget(), {
    controller,
    register: vi.fn().mockResolvedValue({ update }),
  });
  const reload = vi.fn();
  let state: ReturnType<typeof useServiceWorkerUpdates> | undefined;
  const wrapper = mount(defineComponent({ setup() {
    state = useServiceWorkerUpdates(workers as unknown as ServiceWorkerContainer, reload);
    return () => null;
  } }));
  if (!state) throw new Error("Component setup did not run");
  return { workers, update, reload, wrapper, state };
}

test("checks on registration, return and reconnection, throttles and cleans up", async () => {
  vi.useFakeTimers();
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
  const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
  const { update, workers, wrapper } = setup();
  await vi.advanceTimersByTimeAsync(0);
  expect(workers.register).toHaveBeenCalledWith('/sw.js', { updateViaCache: 'none' });
  expect(update).toHaveBeenCalledTimes(1);
  window.dispatchEvent(new Event("online"));
  expect(update).toHaveBeenCalledTimes(1);
  visibility.mockReturnValue("hidden");
  await vi.advanceTimersByTimeAsync(300_000);
  expect(update).toHaveBeenCalledTimes(1);
  visibility.mockReturnValue("visible");
  document.dispatchEvent(new Event("visibilitychange"));
  await vi.advanceTimersByTimeAsync(30_000);
  expect(update).toHaveBeenCalledTimes(2);
  update.mockRejectedValueOnce(new Error("offline"));
  window.dispatchEvent(new Event("online"));
  await vi.advanceTimersByTimeAsync(30_000);
  window.dispatchEvent(new Event("online"));
  await vi.advanceTimersByTimeAsync(0);
  expect(update).toHaveBeenCalledTimes(4);
  wrapper.unmount();
  await vi.advanceTimersByTimeAsync(300_000);
  window.dispatchEvent(new Event("online"));
  expect(update).toHaveBeenCalledTimes(4);
});

test("initial control is silent; upgrades require consent to reload", () => {
  const { workers, state, reload, wrapper } = setup(null);
  workers.controller = {};
  workers.dispatchEvent(new Event("controllerchange"));
  expect(state.updateAvailable.value).toBe(false);
  workers.controller = {};
  workers.dispatchEvent(new Event("controllerchange"));
  expect(state.updateAvailable.value).toBe(true);
  expect(reload).not.toHaveBeenCalled();
  state.refresh();
  state.refresh();
  expect(reload).toHaveBeenCalledTimes(1);
  wrapper.unmount();
});
