<template>
  <section ref="resumeSection" class="section-tint relative w-full py-20 md:py-28">
    <Teleport to="body">
      <Transition
        enter-active-class="motion-safe:transition duration-300 ease-out"
        enter-from-class="translate-y-4 opacity-0"
        leave-active-class="motion-safe:transition duration-200 ease-in"
        leave-to-class="translate-y-4 opacity-0"
      >
        <a
          v-if="isResumeInView"
          :href="cvUrl"
          data-testid="cv-fab"
          class="cv-fab fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full bg-teal px-5 py-3 text-sm font-semibold text-white shadow-lg ring-1 ring-teal/20 transition hover:-translate-y-0.5 hover:bg-teal/90 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-tealSoft dark:bg-tealSoft dark:text-night"
        >
          <document-arrow-down-icon class="h-5 w-5" aria-hidden="true" />
          <span>My CV</span>
        </a>
      </Transition>
    </Teleport>
    <div class="mx-auto flex w-full max-w-7xl flex-wrap px-5">
    <div class="flex flex-wrap w-full mx-auto mb-8 md:mb-12">
      <h2 class="section-heading">
        Experience leading products and teams.
      </h2>
      <p class="section-lede">
        My experience and education.
      </p>
    </div>

    <ul
      v-if="isMobile"
      role="tablist"
      aria-label="Résumé sections"
      ref="mobileTabs"
      data-testid="resume-mobile-tabs"
      class="relative mb-4 flex w-full flex-wrap border-b border-ink/10 text-ink dark:border-white/10 dark:text-white capitalize sm:hidden"
    >
      <li aria-hidden="true" role="presentation" class="mobile-tab-bar" :style="mobileTabBarStyle" />
      <li
        v-for="comp in resumeList"
        :key="comp.id"

        :class="[
          'relative z-10 min-w-0 flex-1 px-3 inline-flex items-center justify-center text-sm transition text-muted dark:text-gray-300',
          { active: activeSlideId === comp.id },
        ]"

      >
        <button
          :id="`${comp.id}-tab`"
          :ref="(el) => setMobileTabRef(comp.id, el)"
          type="button" role="tab"
          :aria-selected="activeSlideId === comp.id"
          :aria-controls="comp.id"
          :tabindex="activeSlideId === comp.id ? 0 : -1"
          class="min-h-11 capitalize"
          @click="scrollToSlide(comp.id)"
          @keydown="handleTabKey($event, comp.id)"
        >{{ comp.id }}</button>
      </li>
    </ul>

    <!-- On mobile the slides span the viewport; each slide restores the inset. -->
    <div class="relative min-w-0 -mx-5 w-[calc(100%+2.5rem)] sm:mx-0 sm:w-full">
      <ArrowScroller
        v-if="!isMobile"
        data-testid="resume-desktop-controls"
        class="hidden sm:block"
        :scroll-container="resumeContainer"
      />
      <div
        ref="resumeViewport"
        class="overflow-hidden transition-[height] duration-300 ease-out min-h-[1vh] min-h-[1svh]"
        :style="resumeViewportStyle"
      >
        <div
          id="resume-container"
          ref="resumeContainer"
          class="relative flex items-start gap-6 overflow-x-scroll overflow-y-hidden no-scrollbar snap-x snap-mandatory scroll-smooth w-full"
          @scroll.passive="scheduleActiveSlideUpdate"
        >
          <div
            v-for="comp in resumeList"
            :key="comp.id"
            :ref="(el) => setSlideRef(comp.id, el)"
            :id="comp.id"
            :role="isMobile ? 'tabpanel' : undefined"
            :aria-labelledby="isMobile ? `${comp.id}-tab` : undefined"
            :inert="activeSlideId !== comp.id ? '' : undefined"
            class="flex-none w-full snap-center px-5 sm:px-0"
          >
            <component :is="comp.component" v-bind="comp.props" />
          </div>
        </div>
      </div>
    </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Ref, ref, computed, watch, nextTick, onMounted, onBeforeUnmount, reactive } from "vue";
import ResumeSkills from "./Skills/ResumeSkills.vue";
import ResumeTimeline from "./Timeline/ResumeTimeline.vue";
import ArrowScroller from "../composables/ArrowScroller.vue";
import { DocumentArrowDownIcon } from "@heroicons/vue/24/outline";

import { useSiteStore } from "@/stores/site.store";
const site = useSiteStore();

const cvUrl = `${import.meta.env.VITE_APP_BACKEND_URL ?? ""}/api/resume/cv/`;
// Float the CV shortcut only while the résumé section is on screen.
const resumeSection = ref<HTMLElement | null>(null);
const isResumeInView = ref(false);
useIntersectionObserver(
  resumeSection,
  ([entry]) => {
    isResumeInView.value = entry?.isIntersecting ?? false;
  },
  { threshold: 0.15 }
);
import { useEventListener, useIntersectionObserver, useMediaQuery } from "@vueuse/core";
const resumeContainer = ref<HTMLElement | null>(null);
const resumeViewport = ref<HTMLElement | null>(null);
const mobileTabs = ref<HTMLElement | null>(null);
const slideRefs = reactive<Record<string, HTMLElement | null>>({});
const mobileTabRefs = reactive<Record<string, HTMLElement | null>>({});
const activeSlideId = ref("experience");
const activePanelHeight = ref(0);
const mobileTabBar = reactive({ left: 0, width: 0, visible: false });
const scrollSettleDelayMs = 220;
let resizeObserver: ResizeObserver | null = null;
let scrollFrame: number | null = null;
let scrollSettleTimer: ReturnType<typeof window.setTimeout> | null = null;

const resumeList = computed(() => [
  {
    component: ResumeTimeline,
    props: { ix: "first", kind: "experience" },
    id: "experience",
  },
  {
    component: ResumeTimeline,
    props: { ix: site.showSkills ? "center" : "last", kind: "education" },
    id: "education",
  },
  {
    component: ResumeSkills,
    props: { ix: "last" },
    id: "skills",
  },
].filter(item => item.id !== "skills" || site.showSkills));

watch(resumeList, async (items) => {
  if (!items.some(item => item.id === activeSlideId.value)) {
    await nextTick();
    scrollToSlide(items[0].id);
  }
  updateActivePanelHeight();
  nextTick(updateMobileTabBar);
});

// Keep this boundary aligned with TheNavbar: its desktop navigation starts at `sm`.
const isMobile = useMediaQuery("(max-width: 639px)");

const resumeViewportStyle = computed(() => {
  if (!activePanelHeight.value) return {};
  const targetHeight = Math.max(activePanelHeight.value, getViewportHeight());
  return { height: `${targetHeight}px` };
});

const mobileTabBarStyle = computed(() => ({
  width: `${mobileTabBar.width}px`,
  transform: `translate3d(${mobileTabBar.left}px, 0, 0)`,
  opacity: mobileTabBar.visible ? 1 : 0,
}));

function getViewportHeight() {
  return window.visualViewport?.height ?? window.innerHeight;
}

function setSlideRef(id: string, el: Element | null) {
  const previousEl = slideRefs[id];
  if (previousEl && resizeObserver) resizeObserver.unobserve(previousEl);
  const slideEl = el instanceof HTMLElement ? el : null;
  slideRefs[id] = slideEl;
  if (slideEl && resizeObserver) resizeObserver.observe(slideEl);
}

function setMobileTabRef(id: string, el: Element | null) {
  mobileTabRefs[id] = el instanceof HTMLElement ? el : null;
  nextTick(updateMobileTabBar);
}

function updateMobileTabBar() {
  const tabsEl = mobileTabs.value;
  const activeEl = mobileTabRefs[activeSlideId.value];
  if (!tabsEl || !activeEl) {
    mobileTabBar.visible = false;
    return;
  }

  const tabsBox = tabsEl.getBoundingClientRect();
  const activeBox = activeEl.getBoundingClientRect();
  mobileTabBar.left = activeBox.left - tabsBox.left + tabsEl.scrollLeft;
  mobileTabBar.width = activeBox.width;
  mobileTabBar.visible = true;
}

function updateActivePanelHeight() {
  nextTick(() => {
    const activeSlide = slideRefs[activeSlideId.value];
    if (!activeSlide) return;
    const nextPanelHeight = activeSlide.scrollHeight;
    if (nextPanelHeight === activePanelHeight.value) return;
    const viewportHeight = getViewportHeight();
    const previousTargetHeight = Math.max(activePanelHeight.value, viewportHeight);
    const nextTargetHeight = Math.max(nextPanelHeight, viewportHeight);
    const shrinkAmount = previousTargetHeight - nextTargetHeight;

    if (
      shrinkAmount > 0 &&
      resumeViewport.value &&
      resumeViewport.value.getBoundingClientRect().bottom <= viewportHeight + 1
    ) {
      window.scrollBy({
        top: -Math.min(shrinkAmount, window.scrollY),
        behavior: "smooth",
      });
    }
    activePanelHeight.value = nextPanelHeight;
  });
}

function updateActiveSlideFromScroll() {
  const container = resumeContainer.value;
  if (!container) return;

  const containerBox = container.getBoundingClientRect();
  const containerCenter = containerBox.left + containerBox.width / 2;
  let closestId = activeSlideId.value;
  let closestDistance = Number.POSITIVE_INFINITY;

  resumeList.value.forEach(({ id }) => {
    const slide = slideRefs[id];
    if (!slide) return;

    const slideBox = slide.getBoundingClientRect();
    const slideCenter = slideBox.left + slideBox.width / 2;
    const distance = Math.abs(slideCenter - containerCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestId = id;
    }
  });

  if (closestId !== activeSlideId.value) {
    activeSlideId.value = closestId;
  }
}

function scheduleActiveSlideUpdate() {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(() => {
    updateActiveSlideFromScroll();
    scrollFrame = null;
  });
}

function handleTabKey(event: KeyboardEvent, id: string) {
  const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
  if (!keys.includes(event.key)) return;
  event.preventDefault();
  const index = resumeList.value.findIndex(item => item.id === id);
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? resumeList.value.length - 1
    : (index + (event.key === 'ArrowRight' ? 1 : -1) + resumeList.value.length) % resumeList.value.length;
  const target = resumeList.value[next].id;
  scrollToSlide(target);
  mobileTabRefs[target]?.focus();
}

function scrollToSlide(id: string) {
  const slide = slideRefs[id];
  if (!slide) return;
  activeSlideId.value = id;
  updateActivePanelHeight();
  updateMobileTabBar();
  slide.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
}

watch(activeSlideId, () => {
  updateActivePanelHeight();
  nextTick(updateMobileTabBar);
}, { immediate: true });

onMounted(() => {
  resizeObserver = new ResizeObserver(updateActivePanelHeight);
  Object.values(slideRefs).forEach((slide) => {
    if (slide) resizeObserver?.observe(slide);
  });
  nextTick(() => {
    updateActiveSlideFromScroll();
    updateActivePanelHeight();
    updateMobileTabBar();
  });

});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
});

useEventListener(window, "resize", () => {
  updateActiveSlideFromScroll();
  updateActivePanelHeight();
  updateMobileTabBar();
});
</script>

<style scoped>
.active {
  @apply font-bold text-coral dark:text-coralSoft;
}

.mobile-tab-bar {
  @apply pointer-events-none absolute bottom-0 left-0 z-0 h-0.5 rounded-full bg-coral transition-all duration-300 ease-out dark:bg-coralSoft;
}

.cv-fab {
  bottom: max(1.25rem, env(safe-area-inset-bottom));
}
</style>
