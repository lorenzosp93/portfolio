<template>
  <div class="page-scroll-container w-full bg-paper text-ink snap-y snap-proximity dark:bg-night" ref="root">
    <the-hero class="snap-center scroll-mt-20" id="the-hero" @hero-loaded="setupAnimation" />
    <the-navbar
      class="snap-center"
      id="the-navbar"
      @image-loaded="setupAnimation"
    />
    <the-resume class="snap-center scroll-mt-20" id="the-resume" />
    <the-blog class="snap-center scroll-mt-20" id="the-blog" />
    <the-contacts class="snap-center scroll-mt-20" id="the-contacts" />

    <footer class="mx-auto w-full px-5 pb-6 text-sm text-muted dark:text-gray-300">
      <p>© Lorenzo Spinelli, 2026</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import TheHero from "./components/TheHero.vue";
import TheNavbar from "./components/UI/TheNavbar.vue";
import TheResume from "./components/resume/TheResume.vue";
import TheBlog from "./components/blog/TheBlog.vue";
import TheContacts from "./components/TheContacts.vue";
import { Ref, provide, ref, shallowRef, onMounted, onUnmounted } from "vue";
import { gsap } from "gsap";
import { registerSW } from "virtual:pwa-register";
import { useSiteStore } from "@/stores/site.store";

registerSW({ immediate: true });

const siteStore = useSiteStore();
onMounted(() => {
  siteStore.loadSettings();
  setupAnimation();
});

const root: Ref<HTMLDivElement | null> = ref(null);

const truncationAmount = () => {
  let w = window.innerWidth;
  return w > 1024 ? 500 : w > 640 ? 350 : 150;
};
const entriesLimit = () => {
  let w = window.innerWidth;
  return w > 1024 ? 6 : w > 640 ? 5 : 3;
};

provide("truncationAmount", truncationAmount);
provide("entriesLimit", entriesLimit);

onUnmounted(() => {
  cancelAnimationFrame(animationFrame);
  cleanupAnimation();
});

function setupAnimation() {
  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(() => {
    if (timeline.value) {
      // Image changes do not require destroying the active animation.
      timeline.value.scrollTrigger?.refresh();
    } else {
      addHeroAnimation();
    }
  });
}

const timeline = shallowRef<GSAPTimeline | null>(null);
let animationFrame = 0;

function cleanupAnimation() {
  timeline.value?.scrollTrigger?.kill();
  timeline.value?.kill();
  timeline.value = null;
}

type DOMCoordinates = {
  deltaX: number;
  deltaY: number;
  scaleX: number;
  scaleY: number;
};

function addHeroAnimation() {
  let coordinates = calculateCoordinatesAnimation("heroPictureAnchor", "heroLogo");
  const isMobile = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#the-hero",
      scrub: true,
      start: "top top",
      end: "bottom top",
      invalidateOnRefresh: true,
      // ScrollTrigger owns resize handling (including ignoreMobileResize).
      // Read an unanimated anchor, never reset the visible image to measure it.
      onRefreshInit: () => {
        coordinates = calculateCoordinatesAnimation("heroPictureAnchor", "heroLogo");
      },
      onRefresh: (trigger) => {
        // Complete refresh in the current frame, even when scrollY did not
        // change. Do not leave an invalidated fromTo at its starting values
        // until the next scroll event (e.g. repeated image-load refreshes).
        trigger.update();
        const progress = gsap.utils.clamp(0, 1,
          (trigger.scroll() - trigger.start) / (trigger.end - trigger.start));
        trigger.animation?.totalProgress(progress, true);
      },
    },
  });

  tl.fromTo("#heroPicture", {
    xPercent: -50,
    yPercent: -50,
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    transformOrigin: "50% 50%",
    force3D: !isMobile,
  }, {
    x: () => coordinates.deltaX,
    y: () => coordinates.deltaY,
    scaleX: () => isMobile ? Math.min(coordinates.scaleX, coordinates.scaleY) : coordinates.scaleX,
    scaleY: () => isMobile ? Math.min(coordinates.scaleX, coordinates.scaleY) : coordinates.scaleY,
    ease: "none",
    duration: 0.7,
    force3D: !isMobile,
  })
    .fromTo("#the-navbar", { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.3 }, 0.7)
    .set("#heroPicture", { opacity: 0 }, 1);

  timeline.value = tl;
  tl.scrollTrigger?.refresh();
}

function calculateCoordinatesAnimation(
  originTag: string,
  destinationTag: string
): DOMCoordinates {
  const originElement = document.getElementById(originTag);
  const destinationElement = document.getElementById(destinationTag);
  const triggerElement = document.getElementById("the-hero");

  const originBox = originElement?.getBoundingClientRect();
  const destinationBox = destinationElement?.getBoundingClientRect();
  const triggerBox = triggerElement?.getBoundingClientRect();
  const stickyContainer = destinationElement?.closest<HTMLElement>("nav");
  const stickyContainerBox = stickyContainer?.getBoundingClientRect();

  if (
    !originBox ||
    !destinationBox ||
    !triggerBox ||
    !stickyContainer ||
    !stickyContainerBox
  ) {
    return { deltaX: 0, deltaY: 0, scaleX: 1, scaleY: 1 };
  }

  const scrollY = window.scrollY;
  const triggerTop = triggerBox.top + scrollY;
  const triggerEnd = triggerTop + triggerBox.height;
  const originCenterY = originBox.top + originBox.height / 2 + scrollY;
  const stickyTop = Number.parseFloat(getComputedStyle(stickyContainer).top) || 0;
  const destinationOffsetY = destinationBox.top - stickyContainerBox.top;
  const destinationEndCenterY =
    triggerEnd + stickyTop + destinationOffsetY + destinationBox.height / 2;

  return {
    deltaX:
      destinationBox.x +
      destinationBox.width / 2 -
      originBox.x -
      originBox.width / 2,
    deltaY: destinationEndCenterY - originCenterY,
    scaleX: destinationBox.width / originBox.width,
    scaleY: destinationBox.height / originBox.height,
  };
}
</script>

<style>
#app {
  font-family: Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

@media (hover: none) and (pointer: coarse) {
  .page-scroll-container {
    scroll-snap-type: none;
  }

  .page-scroll-container > * {
    scroll-snap-align: none;
  }
}
</style>
