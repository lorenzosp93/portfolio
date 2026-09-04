import { onMounted, onUnmounted, ref } from "vue";

const CHECK_INTERVAL = 5 * 60 * 1000;
const CHECK_THROTTLE = 30 * 1000;

export function useServiceWorkerUpdates(
  workers: ServiceWorkerContainer | undefined,
  reload = () => window.location.reload(),
) {
  const updateAvailable = ref(false);
  const updating = ref(false);
  let registration: ServiceWorkerRegistration | undefined;
  let controller = workers?.controller;
  let lastCheck = -Infinity;
  let checking = false;
  let disposed = false;
  let interval: ReturnType<typeof setInterval> | undefined;

  function controllerChanged() {
    // Initial installation claims the page too; only subsequent controllers
    // represent an upgrade. Each open tab decides when to reload its own UI.
    if (controller && workers?.controller !== controller) updateAvailable.value = true;
    controller = workers?.controller;
  }

  async function checkForUpdate() {
    if (!registration || registration.installing || checking ||
      !navigator.onLine || document.visibilityState === "hidden" ||
      Date.now() - lastCheck < CHECK_THROTTLE) return;
    checking = true;
    lastCheck = Date.now();
    try {
      await registration.update();
    } catch {
      // Temporary connectivity failures should not break the application.
    } finally {
      checking = false;
    }
  }

  function refresh() {
    if (updating.value) return;
    updating.value = true;
    reload();
  }

  onMounted(() => {
    if (!workers) return;
    workers.addEventListener("controllerchange", controllerChanged);
    // Neither the worker nor imported push handlers may use a stale HTTP cache.
    void workers.register(`${import.meta.env.BASE_URL}sw.js`, { updateViaCache: "none" })
      .then((worker) => {
        if (disposed) return;
        registration = worker;
        void checkForUpdate();
      })
      .catch((error) => console.warn("Service worker registration failed", error));
    interval = setInterval(checkForUpdate, CHECK_INTERVAL);
    window.addEventListener("online", checkForUpdate);
    document.addEventListener("visibilitychange", checkForUpdate);
  });

  onUnmounted(() => {
    disposed = true;
    clearInterval(interval);
    workers?.removeEventListener("controllerchange", controllerChanged);
    window.removeEventListener("online", checkForUpdate);
    document.removeEventListener("visibilitychange", checkForUpdate);
  });

  return { updateAvailable, updating, refresh };
}
