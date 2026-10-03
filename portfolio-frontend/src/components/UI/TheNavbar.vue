<template>
  <nav ref="navbar" class="pointer-events-none sticky top-0 z-20 w-full" @keydown.esc="isMenuOpen = false">
    <transition name="navbar-veil">
      <div
        v-if="isMenuOpen && revealed"
        class="pointer-events-auto fixed inset-0 bg-ink/20 dark:bg-black/45 sm:hidden"
        aria-hidden="true"
        @click="isMenuOpen = false"
      />
    </transition>
    <div class="relative flex justify-end px-3 py-1 sm:px-6 lg:px-8">
      <div
        :inert="revealed ? undefined : ''"
        :aria-hidden="!revealed"
        :class="{ 'navbar-revealed': revealed, 'tinted-card--warm': isWarmSection, 'is-open': isMenuOpen }"
        :style="{ opacity: fadeProgress }"
        class="navbar-surface navbar-pill tinted-card"
      >
        <div class="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            aria-label="Back to introduction"
            class="flex flex-shrink-0 items-center rounded-full"
            @click="scrollMobile(navStore.refs?.theHero)"
          >
            <img
              id="heroLogo"
              :style="{ visibility: revealed ? 'visible' : 'hidden' }"
              class="h-10 w-10 cursor-pointer rounded-full opacity-100 ring-2 ring-coralSoft transition duration-300 ease-in-out hover:scale-105 dark:ring-teal/40"
              :src="heroLogo"
              alt="Hero image logo"
              decoding="async"
            />
          </button>

          <button
            type="button"
            class="flex min-w-0 flex-1 items-center gap-2 text-left sm:hidden"
            aria-label="Open main menu"
            aria-controls="mobile-menu"
            :aria-expanded="isMenuOpen"
            @click="toggleMenu"
          >
            <span class="min-w-0 flex-1 truncate text-sm font-semibold text-ink dark:text-white" aria-hidden="true">
              <span class="block text-xs font-medium text-muted dark:text-gray-400">Section</span>
              {{ currentSectionLabel }}
            </span>
            <span class="navbar-toggle-icon">
              <bars-3-icon v-if="!isMenuOpen" class="h-5 w-5" />
              <x-mark-icon v-else class="h-5 w-5" />
            </span>
          </button>

          <div class="hidden sm:block">
            <div
              ref="desktopNav"
              class="relative isolate flex items-center space-x-1 overflow-x-auto no-scrollbar"
            >
              <div
                class="nav-active-indicator"
                :style="activeIndicatorStyle"
              />

              <button
                v-if="siteStore.highlightCards.length"
                :ref="(el) => setNavItemRef('theLeadership', el)"
                class="nav-link"
                :class="{ active_top_text: activeNavItem === 'theLeadership' }" :aria-current="activeNavItem === 'theLeadership' ? 'location' : undefined"
                @click="scrollToElement(navStore.refs?.theLeadership)"
              >{{ siteStore.highlightsNavLabel }}</button>
              <button
                :ref="(el) => setNavItemRef('theResume', el)"
                class="nav-link"
                :class="{ active_top_text: activeNavItem === 'theResume' }" :aria-current="activeNavItem === 'theResume' ? 'location' : undefined"
                @click="scrollToResumeSection"
              >Resume</button>
              <button
                :ref="(el) => setNavItemRef('theBlog', el)"
                class="nav-link"
                :class="{ active_top_text: activeNavItem === 'theBlog' }" :aria-current="activeNavItem === 'theBlog' ? 'location' : undefined"
                @click="scrollToElement(navStore.refs?.theBlog)"
              >
                Blog
              </button>
              <button
                :ref="(el) => setNavItemRef('theContacts', el)"
                class="nav-link"
                :class="{ active_top_text: activeNavItem === 'theContacts' }" :aria-current="activeNavItem === 'theContacts' ? 'location' : undefined"
                @click="scrollToElement(navStore.refs?.theContacts)"
              >
                Contacts
              </button>
            </div>
          </div>
        </div>

        <div
          id="mobile-menu"
          :inert="!isMenuOpen || !revealed ? '' : undefined"
          :aria-hidden="!isMenuOpen || !revealed"
          class="navbar-menu sm:hidden"
        >
          <div class="overflow-hidden">
            <div class="space-y-1 px-1 pb-1 pt-2">
              <button v-if="siteStore.highlightCards.length" class="mobile-link" :class="{ active: activeNavItem === 'theLeadership' }" :aria-current="activeNavItem === 'theLeadership' ? 'location' : undefined" @click="scrollMobile(navStore.refs?.theLeadership)">{{ siteStore.highlightsNavLabel }}</button>
              <button class="mobile-link" :class="{ active: activeNavItem === 'theResume' }" :aria-current="activeNavItem === 'theResume' ? 'location' : undefined" @click="scrollMobileToResumeSection">
                Resume
              </button>
              <button class="mobile-link" :class="{ active: activeNavItem === 'theBlog' }" :aria-current="activeNavItem === 'theBlog' ? 'location' : undefined" @click="scrollMobile(navStore.refs?.theBlog)">
                Blog
              </button>
              <button class="mobile-link" :class="{ active: activeNavItem === 'theContacts' }" :aria-current="activeNavItem === 'theContacts' ? 'location' : undefined" @click="scrollMobile(navStore.refs?.theContacts)">
                Contacts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { highlightsScrollTop } from '@/composables/highlightsLayout';
import { useNavStore } from "@/stores/nav.store";
import { Bars3Icon, XMarkIcon } from "@heroicons/vue/24/outline";
import { MaybeRef, useEventListener } from "@vueuse/core";
import { computed, nextTick, reactive, ref, watch, onMounted, onUnmounted, unref } from "vue";
import { useSiteStore } from "@/stores/site.store";
import fallbackHeroLogo from "@/assets/hero-logo.webp";

const navbar = ref<HTMLElement | null>(null);
const fadeProgress = ref(0);
const revealed = computed(() => fadeProgress.value > 0);
let navbarFrame = 0;
let layoutObserver: ResizeObserver | null = null;
function updateNavbar() {
  navbarFrame = 0;
  const headerBottom = Math.max(0, navbar.value?.getBoundingClientRect().bottom ?? 0);
  const readingLine = Math.min(headerBottom, window.innerHeight * .5) + window.innerHeight * .25;
  navStore.updateVisible(readingLine, window.innerHeight,
    window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2);
  updateActiveIndicator();
  const portrait = document.getElementById("heroPicture");
  const hero = document.getElementById("the-hero");
  if (!portrait || !hero || !navbar.value) return;
  // Both endpoints use document content, not the changing mobile viewport height.
  // The hero's bottom is the navbar's natural top even after the navbar sticks.
  const portraitBottom = portrait.getBoundingClientRect().bottom;
  const stickyTop = parseFloat(getComputedStyle(navbar.value).top) || 0;
  const remainingToStick = hero.getBoundingClientRect().bottom - stickyTop;
  const distance = remainingToStick - portraitBottom;
  const progress = distance > 0
    ? Math.max(0, Math.min(1, -portraitBottom / distance))
    : remainingToStick <= 0 ? 1 : 0;
  // Stay hidden for most of the approach, then reveal near the sticky position.
  fadeProgress.value = Math.pow(Math.max(0, (progress - .6) / .4), 3);
}
function scheduleNavbar() {
  if (!navbarFrame) navbarFrame = requestAnimationFrame(updateNavbar);
}
useEventListener(window, "scroll", scheduleNavbar, { passive: true });
useEventListener(window, "resize", scheduleNavbar);
useEventListener(window.visualViewport, "resize", scheduleNavbar);
onMounted(() => {
  updateNavbar();
  layoutObserver = new ResizeObserver(scheduleNavbar);
  watch(() => [document.body, navbar.value, desktopNav.value, ...Object.values(navItemRefs), ...Object.values(navStore.refs).map(unref)], elements => {
    layoutObserver?.disconnect();
    elements.forEach(element => { if (element) layoutObserver?.observe(element); });
    scheduleNavbar();
  }, { immediate: true, flush: "post" });
});
onUnmounted(() => {
  cancelAnimationFrame(navbarFrame);
  layoutObserver?.disconnect();
});

const navStore = useNavStore();
const siteStore = useSiteStore();
const heroLogo = computed(() => siteStore.heroPicture || fallbackHeroLogo);
const isMenuOpen = ref(false);
const desktopNav = ref<HTMLElement | null>(null);
const navItemRefs = reactive<Record<string, HTMLElement | null>>({});
const activeIndicator = reactive({ left: 0, width: 0, visible: false });
const activeNavItem = computed(() => navStore.visible);
// The pill's tint follows the section, matching the timeline and blog cards.
const isWarmSection = computed(() => ["theBlog", "theContacts"].includes(activeNavItem.value));
const currentSectionLabel = computed(() => ({
  theLeadership: siteStore.highlightsNavLabel,
  theResume: "Resume",
  theBlog: "Blog",
  theContacts: "Contacts",
} as Record<string, string>)[activeNavItem.value] ?? "Menu");

const activeIndicatorStyle = computed(() => ({
  width: `${activeIndicator.width}px`,
  transform: `translate3d(${activeIndicator.left}px, -50%, 0)`,
  opacity: activeIndicator.visible ? 1 : 0,
}));

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

function setNavItemRef(name: string, el: Element | null) {
  navItemRefs[name] = el instanceof HTMLElement ? el : null;
  nextTick(updateActiveIndicator);
}

function updateActiveIndicator() {
  const activeEl = navItemRefs[activeNavItem.value];
  const navEl = desktopNav.value;
  if (!activeEl || !navEl) {
    activeIndicator.visible = false;
    return;
  }

  const navBox = navEl.getBoundingClientRect();
  const activeBox = activeEl.getBoundingClientRect();
  activeIndicator.left = activeBox.left - navBox.left + navEl.scrollLeft;
  activeIndicator.width = activeBox.width;
  activeIndicator.visible = navBox.width > 0 && activeBox.width > 0;
}

watch([activeNavItem, () => siteStore.highlightsNavLabel], () => nextTick(updateActiveIndicator), {
  immediate: true,
});

useEventListener(window, "resize", () => {
  if (window.matchMedia("(min-width: 640px)").matches) isMenuOpen.value = false;
});

function scrollMobile(elem: MaybeRef<HTMLDivElement | null>) {
  scrollToElement(elem);
  isMenuOpen.value = false;
}

function scrollMobileToResumeSection() {
  scrollToResumeSection();
  isMenuOpen.value = false;
}

function scrollToResumeSection() {
  scrollToElement(document.getElementById("the-resume") as HTMLDivElement | null);
}

function scrollToElement(elem: MaybeRef<HTMLDivElement | null>) {
  if (!elem) return;
  if ("value" in elem) elem = elem.value;
  if (!elem) return;

  if (elem.id === 'the-leadership') {
    const top = highlightsScrollTop();
    if (top !== null) {
      window.scrollTo({ top, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      return;
    }
  }

  elem.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start", inline: "nearest" });
}

</script>

<style scoped>
.navbar-surface {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}
.navbar-revealed {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

.navbar-surface {
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}

/* A floating capsule; on phones it shows the current section and grows into the menu. */
.navbar-pill {
  @apply rounded-3xl p-[3px];
  width: 12.5rem;
  max-width: 100%;
  transition: width .32s cubic-bezier(.22, .61, .36, 1);
}
.navbar-pill.is-open { width: 100%; }
@media (min-width: 640px) {
  .navbar-pill, .navbar-pill.is-open { width: auto; }
}

.navbar-toggle-icon {
  @apply grid h-10 w-10 flex-none place-items-center rounded-full text-ink ring-1 ring-ink/5 dark:text-white dark:ring-white/10;
}

.navbar-menu {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows .32s cubic-bezier(.22, .61, .36, 1);
}
.is-open .navbar-menu { grid-template-rows: 1fr; }

.navbar-veil-enter-active, .navbar-veil-leave-active { transition: opacity .25s; }
.navbar-veil-enter-from, .navbar-veil-leave-to { opacity: 0; }

.nav-active-indicator {
  @apply pointer-events-none absolute left-0 top-1/2 z-10 h-9 rounded-full transition-all duration-300 ease-out;
  background: var(--card-tint);
}

.nav-link {
  @apply relative z-20 cursor-pointer rounded-full px-3 py-2 text-sm font-medium text-ink transition-colors duration-300 hover:text-teal focus:outline-none focus-visible:outline-none dark:text-gray-300 dark:hover:text-tealSoft;
  -webkit-tap-highlight-color: transparent;
}

.active_top_text {
  @apply font-semibold text-teal hover:text-teal dark:text-tealSoft dark:hover:text-tealSoft;
}

.mobile-link {
  @apply block w-full rounded-2xl px-4 py-3 text-left text-base font-medium text-ink transition hover:text-teal focus:outline-none focus-visible:outline-none dark:text-gray-300 dark:hover:text-tealSoft;
  -webkit-tap-highlight-color: transparent;
}

.active {
  @apply font-semibold text-teal hover:text-teal dark:text-tealSoft dark:hover:text-tealSoft;
  background: var(--card-tint);
}

.tinted-card--warm .active_top_text,
.tinted-card--warm .active {
  @apply text-coralInk hover:text-coralInk dark:text-coralSoft dark:hover:text-coralSoft;
}

@media (prefers-reduced-motion: reduce) {
  .navbar-pill, .navbar-menu { transition: none; }
}
</style>
