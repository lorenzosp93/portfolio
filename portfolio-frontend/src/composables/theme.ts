import { ref, watch } from "vue";

export type ThemePreference = "system" | "light" | "dark";

const STORAGE_KEY = "theme-preference";
const THEME_COLORS = { light: "#FFF8EF", dark: "#0B1120" } as const;

function readPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // Storage can be unavailable (private mode, blocked site data).
  }
  return "system";
}

const preference = ref<ThemePreference>("system");
const systemDark = ref(false);
let initialised = false;

function apply() {
  const dark = preference.value === "dark" || (preference.value === "system" && systemDark.value);
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.classList.toggle("light", !dark);
  root.style.colorScheme = dark ? "dark" : "light";
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", dark ? THEME_COLORS.dark : THEME_COLORS.light);
}

/** Apply the saved or system theme; call once before mounting the app. */
export function initTheme() {
  if (initialised) return;
  initialised = true;
  preference.value = readPreference();
  const media = window.matchMedia?.("(prefers-color-scheme: dark)");
  systemDark.value = media?.matches ?? false;
  media?.addEventListener?.("change", (event) => {
    systemDark.value = event.matches;
  });
  watch([preference, systemDark], apply, { immediate: true });
}

export function useTheme() {
  function cycle() {
    const order: ThemePreference[] = ["system", "light", "dark"];
    preference.value = order[(order.indexOf(preference.value) + 1) % order.length];
    try {
      if (preference.value === "system") window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, preference.value);
    } catch {
      // Non-persistent preference is fine.
    }
  }
  return { preference, cycle };
}
