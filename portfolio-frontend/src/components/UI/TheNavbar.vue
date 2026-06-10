<template>
  <nav class="sticky top-0 z-20 w-full opacity-0">
    <div class="w-full rounded-b-3xl bg-surface/90 shadow-sm ring-1 ring-ink/10 backdrop-blur-md dark:bg-nightSurface/90 dark:ring-white/10">
      <div class="relative flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
          <button type="button" class="ml-2 inline-flex items-center justify-center rounded-full p-2 text-muted transition hover:text-teal dark:text-gray-300 dark:hover:text-tealSoft" aria-controls="mobile-menu" :aria-expanded="isMenuOpen" @click="toggleMenu">
            <span class="sr-only">Open main menu</span>
            <bars-3-icon class="h-6 w-6" :class="{ hidden: isMenuOpen, block: !isMenuOpen }" />
            <x-mark-icon class="h-6 w-6" :class="{ hidden: !isMenuOpen, block: isMenuOpen }" />
          </button>
        </div>

        <div class="flex flex-1 items-center justify-end sm:items-stretch sm:justify-start">
          <div class="mx-3 my-2 flex flex-shrink-0 items-center" @click="scrollToElement(navStore.refs?.theHero.value)">
            <img id="heroLogo" class="h-10 w-10 cursor-pointer rounded-full opacity-100 ring-2 ring-coralSoft transition duration-300 ease-in-out hover:scale-105 dark:ring-teal/40" src="@/assets/hero-logo.webp" alt="Hero image logo" @load="$emit('imageLoaded')" />
          </div>

          <div class="my-auto hidden w-full justify-end sm:ml-6 sm:block">
            <div ref="desktopNav" class="relative isolate flex w-full items-center justify-end space-x-2 overflow-x-auto no-scrollbar">
              <div class="nav-active-indicator" :style="activeIndicatorStyle" />

              <button :ref="(el) => setNavItemRef('theHero', el)" class="nav-link nav-link-layer" :class="{ active_text: activeNavItem === 'theHero' }" aria-current="page" @click="scrollToElement(navStore.refs?.theHero)">About</button>

              <Transition name="resume-nav" @after-enter="updateIndicators" @after-leave="updateIndicators">
                <button v-if="!isResumeActive" key="resume" :ref="(el) => setNavItemRef('theResume', el)" class="nav-link nav-link-layer" :class="{ active_text: activeNavItem === 'theResume' }" @click="scrollToResumeSection">Resume</button>
                <div v-else key="resume-subnav" :ref="setResumeSubnavRef" class="resume-subnav">
                  <div class="resume-inner-indicator" :style="innerIndicatorStyle" />
                  <button :ref="(el) => setNavItemRef('experience', el)" class="nav-link-active-group nav-link-layer" :class="{ active_inner_text: activeInnerNavItem === 'experience' }" @click="scrollToElement(navStore.refs?.experience)">Experience</button>
                  <button :ref="(el) => setNavItemRef('education', el)" class="nav-link-active-group nav-link-layer" :class="{ active_inner_text: activeInnerNavItem === 'education' }" @click="scrollToElement(navStore.refs?.education)">Education</button>
                  <button v-if="navStore.refs?.projects" :ref="(el) => setNavItemRef('projects', el)" class="nav-link-active-group nav-link-layer" :class="{ active_inner_text: activeInnerNavItem === 'projects' }" @click="scrollToElement(navStore.refs?.projects)">Projects</button>
                  <button :ref="(el) => setNavItemRef('skills', el)" class="nav-link-active-group nav-link-layer" :class="{ active_inner_text: activeInnerNavItem === 'skills' }" @click="scrollToElement(navStore.refs?.skills)">Skills</button>
                </div>
              </Transition>

              <button :ref="(el) => setNavItemRef('theBlog', el)" class="nav-link nav-link-layer" :class="{ active_text: activeNavItem === 'theBlog' }" @click="scrollToElement(navStore.refs?.theBlog)">Blog</button>
              <button :ref="(el) => setNavItemRef('theContacts', el)" class="nav-link nav-link-layer" :class="{ active_text: activeNavItem === 'theContacts' }" @click="scrollToElement(navStore.refs?.theContacts)">Contacts</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="mobile-menu" class="absolute ml-3 mt-2 overflow-hidden rounded-2xl bg-surface shadow-xl ring-1 ring-ink/10 transition duration-300 ease-in-out dark:bg-nightSurface dark:ring-white/10 sm:hidden" :class="{ 'menu-closed': !isMenuOpen }">
      <div class="space-y-2 p-2">
        <button class="mobile-link" :class="{ active: navStore.visible === 'theHero' }" @click="scrollMobile(navStore.refs?.theHero)">About</button>
        <button class="mobile-link" :class="{ active: isResumeActive }" @click="scrollMobileToResumeSection">Resume</button>
        <button class="mobile-link" :class="{ active: navStore.visible === 'theBlog' }" @click="scrollMobile(navStore.refs?.theBlog)">Blog</button>
        <button class="mobile-link" :class="{ active: navStore.visible === 'theContacts' }" @click="scrollMobile(navStore.refs?.theContacts)">Contacts</button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useNavStore } from "@/stores/nav.store";
import { Bars3Icon, XMarkIcon } from "@heroicons/vue/24/outline";
import { MaybeRef, useEventListener } from "@vueuse/core";
import { computed, nextTick, reactive, ref, watch } from "vue";

const navStore = useNavStore();
const isMenuOpen = ref(false);
const desktopNav = ref<HTMLElement | null>(null);
const resumeSubnav = ref<HTMLElement | null>(null);
const navItemRefs = reactive<Record<string, HTMLElement | null>>({});
const activeIndicator = reactive({ left: 0, width: 0, visible: false });
const innerIndicator = reactive({ left: 0, width: 0, visible: false });
const resumeSectionName = "theResume";
const resumeGroupName = "resumeGroup";
const resumeSubnavItems = ["experience", "education", "projects", "skills"];

const isResumeActive = computed(() => navStore.isActive?.experience || navStore.isActive?.education || navStore.isActive?.projects || navStore.isActive?.skills);
const activeNavItem = computed(() => {
  if (isResumeActive.value) return resumeGroupName;
  if (navStore.visible === "theResume") return resumeSectionName;
  return navStore.visible || "theHero";
});
const activeInnerNavItem = computed(() => resumeSubnavItems.includes(navStore.visible) ? navStore.visible : "experience");
const activeIndicatorStyle = computed(() => ({
  width: `${activeIndicator.width}px`,
  transform: `translate3d(${activeIndicator.left}px, -50%, 0)`,
  opacity: activeIndicator.visible && !isResumeActive.value ? 1 : 0,
}));
const innerIndicatorStyle = computed(() => ({
  width: `${innerIndicator.width}px`,
  transform: `translate3d(${innerIndicator.left}px, 0, 0)`,
  opacity: innerIndicator.visible ? 1 : 0,
}));

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

function setNavItemRef(name: string, el: Element | null) {
  navItemRefs[name] = el instanceof HTMLElement ? el : null;
  nextTick(updateIndicators);
}

function setResumeSubnavRef(el: Element | null) {
  const subnav = el instanceof HTMLElement ? el : null;
  resumeSubnav.value = subnav;
  navItemRefs[resumeGroupName] = subnav;
  nextTick(updateIndicators);
}

function updateIndicators() {
  updateActiveIndicator();
  updateInnerIndicator();
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
  activeIndicator.visible = true;
}

function updateInnerIndicator() {
  const activeEl = navItemRefs[activeInnerNavItem.value];
  const subnavEl = resumeSubnav.value;
  if (!isResumeActive.value || !activeEl || !subnavEl) {
    innerIndicator.visible = false;
    return;
  }
  const subnavBox = subnavEl.getBoundingClientRect();
  const activeBox = activeEl.getBoundingClientRect();
  innerIndicator.left = activeBox.left - subnavBox.left + subnavEl.scrollLeft;
  innerIndicator.width = activeBox.width;
  innerIndicator.visible = true;
}

watch([activeNavItem, activeInnerNavItem, isResumeActive], () => nextTick(updateIndicators), { immediate: true });
useEventListener(window, "resize", updateIndicators);

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
  scrollHorizontallyIntoView(elem);
  elem.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
}
function scrollHorizontallyIntoView(elem: HTMLElement) {
  const scrollParent = getHorizontalScrollParent(elem);
  if (!scrollParent) return;
  const parentBox = scrollParent.getBoundingClientRect();
  const elemBox = elem.getBoundingClientRect();
  const targetLeft = scrollParent.scrollLeft + elemBox.left - parentBox.left - parentBox.width / 2 + elemBox.width / 2;
  scrollParent.scrollTo({ left: targetLeft, behavior: "smooth" });
}
function getHorizontalScrollParent(elem: HTMLElement): HTMLElement | null {
  let parent = elem.parentElement;
  while (parent) {
    if (parent.scrollWidth > parent.clientWidth + 2) return parent;
    parent = parent.parentElement;
  }
  return null;
}
</script>

<style scoped>
.nav-active-indicator {
  @apply pointer-events-none absolute top-1/2 z-10 h-9 rounded-full bg-teal shadow-sm transition-all duration-300 ease-out dark:bg-tealSoft;
}

.resume-inner-indicator {
  @apply pointer-events-none absolute inset-y-0 left-0 z-10 rounded-full bg-surface shadow-sm transition-all duration-300 ease-out dark:bg-nightSurface;
}

.nav-link-layer {
  @apply relative z-20;
}

.nav-link {
  @apply cursor-pointer rounded-full px-3 py-2 text-sm font-medium text-ink transition-colors duration-300 hover:text-teal dark:text-gray-300 dark:hover:text-tealSoft;
}

.nav-link-active-group {
  @apply cursor-pointer rounded-full px-3 py-2 text-sm font-medium text-white transition-colors duration-300 hover:text-white dark:text-night dark:hover:text-night;
}

.resume-subnav {
  @apply relative z-20 flex origin-center items-center overflow-hidden rounded-full bg-teal p-0.5 text-sm font-medium shadow-sm dark:bg-tealSoft;
}

.resume-nav-enter-active,
.resume-nav-leave-active {
  transition: opacity 180ms ease, transform 240ms ease, max-width 280ms ease;
  overflow: hidden;
  transform-origin: center;
}
.resume-nav-enter-from,
.resume-nav-leave-to {
  max-width: 5rem;
  opacity: 0;
  transform: scaleX(0.94);
}
.resume-nav-enter-to,
.resume-nav-leave-from {
  max-width: 22rem;
  opacity: 1;
  transform: scaleX(1);
}

.mobile-link {
  @apply block w-full rounded-xl px-4 py-2 text-left text-sm font-medium text-ink transition hover:text-teal dark:text-gray-300 dark:hover:text-tealSoft;
}

.active {
  @apply bg-teal text-white shadow-sm dark:bg-tealSoft dark:text-night;
}

.active_text {
  @apply text-white dark:text-night;
}

.active_inner_text {
  @apply text-teal dark:text-tealSoft;
}

.menu-closed {
  @apply pointer-events-none scale-95 -translate-y-2 opacity-0;
}
</style>