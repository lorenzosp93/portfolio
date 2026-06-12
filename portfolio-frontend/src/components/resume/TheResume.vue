<template>
  <div
    ref="root"
    class="relative min-h-screen w-full mx-auto my-[10vh]"
  >
    <div class="flex flex-wrap w-full mx-auto mb-10 px-5">
      <h2
        class="text-center text-xl md:text-2xl w-full font-bold mx-auto text-ink dark:text-white"
      >
        Here are a few things I've done.
      </h2>
      <p class="text-center w-full text-muted dark:text-gray-300">
        Because I definitely needed a website to host my CV.
      </p>
    </div>

    <ul
      v-if="isMobile"
      class="mx-3 my-3 flex flex-wrap border-b border-ink/10 text-ink dark:border-white/10 dark:text-white capitalize"
    >
      <li
        v-for="comp in resumeList"
        :key="comp.id"
        :class="[
          'px-3 py-2 inline-flex items-center justify-center cursor-pointer mx-auto first:ml-0 last:mr-0 text-sm transition text-muted dark:text-gray-300',
          { active: activeSlideId === comp.id },
        ]"
        @click="scrollToSlide(comp.id)"
      >
        {{ comp.id }}
      </li>
    </ul>

    <div class="relative w-full">
      <ArrowScroller v-if="!isMobile" :scroll-container="resumeContainer" />
      <div
        class="overflow-hidden transition-[height] duration-300 ease-out min-h-[100vh] min-h-[100svh]"
        :style="resumeViewportStyle"
      >
        <div
          class="relative flex gap-6 overflow-x-scroll overflow-y-hidden no-scrollbar snap-x snap-mandatory scroll-smooth w-full"
          :class="{ 'carousel-nudge': shouldNudge }"
          id="resume-container"
          ref="resumeContainer"
          @scroll.passive="scheduleActiveSlideUpdate"
          @animationend="shouldNudge = false"
        >
          <div
            v-for="comp in resumeList"
            :key="comp.id"
            :ref="(el) => setSlideRef(comp.id, el)"
            :id="comp.id"
            class="flex-none w-full snap-center"
          >
            <component :is="comp.component" v-bind="comp.props" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref, computed, watch, nextTick, onMounted, onBeforeUnmount, reactive } from "vue";
import ResumeProjects from "./Projects/ResumeProjects.vue";
import ResumeSkills from "./Skills/ResumeSkills.vue";
import ResumeTimeline from "./Timeline/ResumeTimeline.vue";
import ArrowScroller from "../composables/ArrowScroller.vue";
import { breakpointsTailwind, useBreakpoints, useEventListener } from "@vueuse/core";
import { useVisibilityObserver } from "@/composables/visibilityObserver";

const root: Ref<HTMLDivElement | null> = ref(null);
const { isActive } = useVisibilityObserver("theResume", root);
const hasNudged = ref(false);
const shouldNudge = ref(false);
const resumeContainer = ref<HTMLElement | null>(null);
const slideRefs = reactive<Record<string, HTMLElement | null>>({});
const activeSlideId = ref("experience");
const activePanelHeight = ref(0);
let resizeObserver: ResizeObserver | null = null;
let scrollFrame: number | null = null;

watch(isActive, (val) => {
  if (val && !hasNudged.value) {
    hasNudged.value = true;
    shouldNudge.value = true;
  }
});

const resumeList = [
  {
    component: ResumeTimeline,
    props: {
      ix: "first",
      kind: "experience",
    },
    id: "experience",
  },
  {
    component: ResumeTimeline,
    props: {
      ix: "center",
      kind: "education",
    },
    id: "education",
  },
//  {
//    component: ResumeProjects,
//    props: {
//      ix: "center",
//    },
//    id: "projects",
//  },
  {
    component: ResumeSkills,
    props: {
      ix: "last",
    },
    id: "skills",
  },
];

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");

const resumeViewportStyle = computed(() => {
  if (!activePanelHeight.value) return {};
  return { height: `${Math.max(activePanelHeight.value, getViewportHeight())}px` };
});

function getViewportHeight() {
  return window.visualViewport?.height ?? window.innerHeight;
}

function setSlideRef(id: string, el: Element | null) {
  const previousEl = slideRefs[id];
  if (previousEl && resizeObserver) {
    resizeObserver.unobserve(previousEl);
  }

  const slideEl = el instanceof HTMLElement ? el : null;
  slideRefs[id] = slideEl;

  if (slideEl && resizeObserver) {
    resizeObserver.observe(slideEl);
  }
}

function updateActivePanelHeight() {
  nextTick(() => {
    const activeSlide = slideRefs[activeSlideId.value];
    if (!activeSlide) return;
    activePanelHeight.value = activeSlide.scrollHeight;
  });
}

function updateActiveSlideFromScroll() {
  const container = resumeContainer.value;
  if (!container) return;

  const containerBox = container.getBoundingClientRect();
  const containerCenter = containerBox.left + containerBox.width / 2;
  let closestId = activeSlideId.value;
  let closestDistance = Number.POSITIVE_INFINITY;

  resumeList.forEach(({ id }) => {
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

function scrollToSlide(id: string) {
  const slide = slideRefs[id];
  if (!slide) return;

  activeSlideId.value = id;
  updateActivePanelHeight();
  slide.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
}

watch(activeSlideId, updateActivePanelHeight, { immediate: true });

onMounted(() => {
  resizeObserver = new ResizeObserver(updateActivePanelHeight);
  Object.values(slideRefs).forEach((slide) => {
    if (slide) resizeObserver?.observe(slide);
  });
  nextTick(() => {
    updateActiveSlideFromScroll();
    updateActivePanelHeight();
  });
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  if (scrollFrame) {
    window.cancelAnimationFrame(scrollFrame);
  }
});

useEventListener(window, "resize", () => {
  updateActiveSlideFromScroll();
  updateActivePanelHeight();
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.active {
  @apply border-b-2 border-coral font-bold text-coral dark:border-coralSoft dark:text-coralSoft;
}

.carousel-nudge {
  animation: carousel-nudge 1s ease-in-out 0.45s 1;
}

@keyframes carousel-nudge {
  0%,
  100% {
    transform: translateX(0);
  }
  35% {
    transform: translateX(-0.7rem);
  }
  65% {
    transform: translateX(0.2rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .carousel-nudge {
    animation: none;
  }
}
</style>