<template>
  <div class="w-full bg-paper text-ink snap-y snap-proximity dark:bg-night" ref="root">
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
import { Ref, provide, ref, onUnmounted } from "vue";
import { useEventListener } from "@vueuse/core";
import { gsap } from "gsap";
import { registerSW } from "virtual:pwa-register";

registerSW({ immediate: true });

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
  cleanupAnimation();
  clearTimeout(resizeTimer);
});

const viewport = ref({ width: window.innerWidth, height: window.innerHeight });
let resizeTimer: ReturnType<typeof setTimeout>;
const safariChromeResizeThreshold = 120;

useEventListener("resize", resizeEventHandler);

function resizeEventHandler(event: UIEvent) {
  const nextViewport = {
    width: (event.target as Window).innerWidth,
    height: (event.target as Window).innerHeight,
  };
  const widthChanged = viewport.value.width !== nextViewport.width;
  const heightDelta = Math.abs(viewport.value.height - nextViewport.height);
  const significantHeightChange = heightDelta > safariChromeResizeThreshold;

  viewport.value = nextViewport;

  if (widthChanged || significantHeightChange) {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(recalculateAnimation, 150);
  }
}

function setupAnimation() {
  recalculateAnimation();
}

function recalculateAnimation() {
  cleanupAnimation();
  resetHeroPictureTransform();

  requestAnimationFrame(() => {
    const coordinates = calculateCoordinatesAnimation("heroPicture", "heroLogo");
    if (coordinates?.scaleX && coordinates?.scaleY) {
      addHeroAnimation(coordinates);
    }
  });
}

const timeline: Ref<GSAPTimeline | null> = ref(null);
let animationSignature = "";

function cleanupAnimation() {
  timeline.value?.scrollTrigger?.kill();
  timeline.value?.kill();
  timeline.value = null;
}

function resetHeroPictureTransform() {
  gsap.set("#heroPicture", {
    xPercent: -50,
    yPercent: -50,
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    transformOrigin: "50% 50%",
    willChange: "transform, opacity",
    force3D: true,
  });
}

type DOMCoordinates = {
  deltaX: number;
  deltaY: number;
  scaleX: number;
  scaleY: number;
};
function addHeroAnimation(coordinates: DOMCoordinates) {
  const nextSignature = JSON.stringify(coordinates);
  if (timeline.value && animationSignature === nextSignature) {
    timeline.value.scrollTrigger?.refresh();
    return;
  }

  cleanupAnimation();
  animationSignature = nextSignature;
  resetHeroPictureTransform();
  gsap.set("#the-navbar", { opacity: 0 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#the-hero",
      scrub: true,
      start: "top top",
      end: "bottom top",
      invalidateOnRefresh: true,
    },
  });
  tl.to("#heroPicture", {
    x: coordinates.deltaX,
    y: coordinates.deltaY,
    scaleX: coordinates.scaleX,
    scaleY: coordinates.scaleY,
    ease: "none",
    duration: 0.7,
    force3D: true,
  })
    .to("#the-navbar", { opacity: 1, ease: "none", duration: 0.3 }, 0.7)
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

  if (!originBox || !destinationBox || !triggerBox) {
    return { deltaX: 0, deltaY: 0, scaleX: 1, scaleY: 1 };
  }

  const scrollY = window.scrollY;
  const triggerTop = triggerBox.top + scrollY;
  const triggerEnd = triggerTop + triggerBox.height;
  const destinationScrollY = Math.min(scrollY, triggerEnd);

  const originCenterY = originBox.y + originBox.height / 2 + scrollY;
  const destinationCenterY =
    destinationBox.y + destinationBox.height / 2 + destinationScrollY;

  return {
    deltaX:
      destinationBox.x +
      destinationBox.width / 2 -
      originBox.x -
      originBox.width / 2,
    deltaY: destinationCenterY - originCenterY,
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
</style>
