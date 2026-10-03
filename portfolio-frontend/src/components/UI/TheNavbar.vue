<template>
  <nav ref="navbar" class="sticky top-0 z-20 w-full">
    <div :inert="revealed ? undefined : ''" :aria-hidden="!revealed" :class="{ 'navbar-revealed': revealed }" :style="{ opacity: fadeProgress }" class="navbar-surface w-full rounded-b-3xl bg-surface/95 shadow-sm ring-1 ring-ink/10 dark:bg-nightSurface/95 dark:ring-white/10">
      <div class="relative flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
          <button
            type="button"
            class="ml-2 inline-flex items-center justify-center rounded-full p-2 text-muted transition hover:text-teal dark:text-gray-300 dark:hover:text-tealSoft"
            aria-controls="mobile-menu"
            :aria-expanded="isMenuOpen"
            @click="toggleMenu"
          >
            <span class="sr-only">Open main menu</span>
            <bars-3-icon class="h-6 w-6" :class="{ hidden: isMenuOpen, block: !isMenuOpen }" />
            <x-mark-icon class="h-6 w-6" :class="{ hidden: !isMenuOpen, block: isMenuOpen }" />
          </button>
        </div>

        <div class="flex flex-1 items-center justify-end sm:items-stretch sm:justify-start">
          <button
            type="button"
            aria-label="Back to introduction"
            class="mx-3 my-2 flex flex-shrink-0 items-center z-50"
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

          <div class="my-auto hidden w-full justify-end sm:ml-6 sm:block">
            <div
              ref="desktopNav"
              class="relative isolate flex w-full items-center justify-end space-x-2 overflow-x-auto no-scrollbar"
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
      </div>
    </div>

    <div
      id="mobile-menu"
      :inert="!isMenuOpen || !revealed ? '' : undefined"
      :aria-hidden="!isMenuOpen || !revealed"
      class="absolute ml-3 mt-2 overflow-hidden rounded-2xl bg-surface shadow-xl ring-1 ring-ink/10 transition duration-300 ease-in-out dark:bg-nightSurface dark:ring-white/10 sm:hidden"
      :class="{ 'menu-closed': !isMenuOpen }"
    >
      <div class="space-y-2 p-2">
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

.nav-active-indicator {
  @apply pointer-events-none absolute left-0 top-1/2 z-10 h-9 rounded-full bg-teal shadow-sm transition-all duration-300 ease-out dark:bg-tealSoft;
}

.nav-link {
  @apply relative z-20 cursor-pointer rounded-full px-3 py-2 text-sm font-medium text-ink transition-colors duration-300 hover:text-teal focus:outline-none focus-visible:outline-none dark:text-gray-300 dark:hover:text-tealSoft;
  -webkit-tap-highlight-color: transparent;
}

.active_top_text {
  @apply text-white hover:text-white dark:text-night dark:hover:text-night;
}

.mobile-link {
  @apply block w-full rounded-xl px-4 py-2 text-left text-sm font-medium text-ink transition hover:text-teal focus:outline-none focus-visible:outline-none dark:text-gray-300 dark:hover:text-tealSoft;
  -webkit-tap-highlight-color: transparent;
}

.active {
  @apply bg-teal text-white shadow-sm hover:text-white dark:bg-tealSoft dark:text-night dark:hover:text-night;
}

.menu-closed {
  @apply pointer-events-none scale-95 -translate-y-2 opacity-0;
}
</style>
