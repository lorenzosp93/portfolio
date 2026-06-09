<template>
  <div class="w-full overflow-x-hidden bg-paper text-ink snap-y snap-proximity dark:bg-night" ref="root">
    <the-hero class="snap-center" id="the-hero" @hero-loaded="setupAnimation" />
    <the-navbar
      class="snap-center"
      id="the-navbar"
      @image-loaded="setupAnimation"
    />
    <the-resume class="snap-center" id="the-resume" />
    <the-blog class="snap-center" id="the-blog" />
    <the-contacts class="snap-center" id="the-contacts" />

    <footer class="mx-auto max-w-6xl px-5 pb-6 text-sm text-muted dark:text-gray-300">
      <p>© Lorenzo Spinelli, 2023</p>
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

const truncationAmount = () => {
  let w = window.innerWidth;
  return w > 1024 ? 350 : w > 640 ? 200 : 75;
};
const entriesLimit = () => {
  let w = window.innerWidth;
  return w > 1024 ? 6 : w > 640 ? 5 : 3;
};

provide("truncationAmount", truncationAmount);
provide("entriesLimit", entriesLimit);

onUnmounted(() => {
  cleanupAnimation();
});

const innerWidth = ref(window.innerWidth);

useEventListener("resize", resizeEventHandler);

function resizeEventHandler(event: UIEvent) {
  if (innerWidth.value != (event.target as Window).innerWidth) {
    timeline.value?.restart();
    // window.scrollTo({ top: 0 });
    setupAnimation();
    innerWidth.value = (event.target as Window).innerWidth;
  }
}

function setupAnimation() {
  const coordinates = calculateCoordinatesAnimation("heroPicture", "heroLogo");
  if (coordinates?.scaleX && coordinates?.scaleY) {
    addHeroAnimation(coordinates);
  }
}

const timeline: Ref<GSAPTimeline | null> = ref(null);

function cleanupAnimation() {
  timeline.value?.kill();
}

type DOMCoordinates = {
  deltaX: number;
  deltaY: number;
  scaleX: number;
  scaleY: number;
};
function addHeroAnimation(coordinates: DOMCoordinates) {
  cleanupAnimation();
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#the-hero",
      scrub: true,
      start: "top top",
      end: "bottom top",
    },
  });
  tl.to("#heroPicture", {
    x: coordinates.deltaX,
    y: coordinates.deltaY,
    scaleX: coordinates.scaleX,
    scaleY: coordinates.scaleY,
    ease: "power2",
    duration: 0.7,
  })
    .to("#the-navbar", { opacity: 1, ease: "power1.in", duration: 0.3 }, 0.7)
    .set("#heroPicture", { opacity: 0 }, 1);
  timeline.value = tl;
}

function calculateCoordinatesAnimation(
  originTag: string,
  destinationTag: string
): DOMCoordinates {
  const originBox = document.getElementById(originTag)?.getBoundingClientRect();
  const destinationBox = document
    .getElementById(destinationTag)
    ?.getBoundingClientRect();
  if (!originBox || !destinationBox) {
    return { deltaX: 0, deltaY: 0, scaleX: 1, scaleY: 1 };
  }
  return {
    deltaX:
      destinationBox.x +
      destinationBox.width / 2 -
      originBox.x -
      originBox.width / 2,
    deltaY:
      destinationBox.y +
      destinationBox.height / 2 -
      originBox.y -
      originBox.height / 2,
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