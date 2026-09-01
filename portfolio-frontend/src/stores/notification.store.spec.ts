import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const backend = vi.hoisted(() => ({ postSubscription: vi.fn() }));
vi.mock("@/services/api.service", () => ({ default: backend }));

import { useNotificationStore } from "./notification.store";

const requestPermission = vi.fn();

describe("notification store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    backend.postSubscription.mockReset();
    requestPermission.mockReset();
    Object.defineProperty(globalThis, "Notification", {
      configurable: true,
      value: { requestPermission },
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not subscribe when notification permission is denied", async () => {
    requestPermission.mockResolvedValue("denied");
    const store = useNotificationStore();
    const subscribe = vi.spyOn(store, "subscribeUserToPush");

    await expect(store.askPermission()).rejects.toThrow(
      "We weren't granted permission."
    );
    expect(subscribe).not.toHaveBeenCalled();
  });

  it("subscribes, publishes, and persists after permission is granted", async () => {
    vi.stubEnv("VITE_APP_KEY", "AQID");
    requestPermission.mockResolvedValue("granted");
    const subscription = {
      toJSON: vi.fn(() => ({ endpoint: "https://push.example/subscription" })),
    };
    const subscribe = vi.fn().mockResolvedValue(subscription);
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: { getRegistration: vi.fn().mockResolvedValue({ pushManager: { subscribe } }) },
    });
    backend.postSubscription.mockResolvedValue({});
    const store = useNotificationStore();

    await store.askPermission();

    expect(subscribe).toHaveBeenCalledWith({
      userVisibleOnly: true,
      applicationServerKey: new Uint8Array([1, 2, 3]),
    });
    expect(backend.postSubscription).toHaveBeenCalledWith({
      endpoint: "https://push.example/subscription",
    });
    expect(store.isSubscribed).toBe(true);
    expect(localStorage.getItem("notificationSubscribed")).toBe("true");
  });

  it("reports a missing service-worker registration", async () => {
    requestPermission.mockResolvedValue("granted");
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: { getRegistration: vi.fn().mockResolvedValue(undefined) },
    });
    const store = useNotificationStore();

    await expect(store.askPermission()).rejects.toThrow(
      "No service worker registration is available."
    );
    expect(backend.postSubscription).not.toHaveBeenCalled();
  });
});
