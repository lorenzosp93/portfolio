<template>
  <section
    ref="root"
    class="relative flex min-h-screen w-full items-center overflow-x-clip px-5 py-20 text-ink dark:text-white sm:px-8"
  >
    <div
      class="hero-layout relative -top-8 mx-auto grid w-full max-w-7xl items-center gap-10 sm:top-0 sm:grid-cols-[minmax(17rem,0.8fr)_minmax(0,1.2fr)] sm:gap-12 lg:gap-20"
    >
    <div class="relative min-w-0 py-5">
      <div class="relative mx-auto h-56 w-56 md:h-72 md:w-72">
        <div
          class="absolute z-10 left-1/2 top-1/2 h-44 w-56 -translate-x-1/2 -translate-y-1/2 rotate-[-9deg] rounded-[42%_58%_48%_52%/58%_39%_61%_42%] bg-tealSoft/80 shadow-xl ring-1 ring-teal/20 dark:bg-teal/25 dark:ring-tealSoft/20 md:h-56 md:w-72"
        />
        <div
          class="absolute z-10 left-1/2 top-1/2 h-48 w-48 -translate-x-[42%] -translate-y-[56%] rotate-12 rounded-[55%_45%_63%_37%/45%_62%_38%_55%] bg-coralSoft/90 shadow-lg ring-1 ring-coral/20 dark:bg-coral/25 dark:ring-coralSoft/20 md:h-60 md:w-60"
        />
        <div
          class="absolute z-10 left-1/2 top-1/2 h-28 w-28 translate-x-6 translate-y-5 rounded-full bg-amberSoft/90 blur-[1px] ring-1 ring-amber/20 dark:bg-amber/25 dark:ring-amberSoft/20 md:h-36 md:w-36"
        />
        <div
          id="heroPictureAnchor"
          class="absolute z-10 left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface/90 shadow-2xl ring-1 ring-ink/10 dark:bg-nightSurface/90 dark:ring-white/10 md:h-56 md:w-56"
        />
        <img
          id="heroPicture"
          class="will-change-transform absolute z-30 left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full object-cover shadow-2xl ring-4 ring-surface dark:ring-nightSurface md:h-56 md:w-56 z-30"
          :src="heroPicture"
          :srcset="heroSrcset"
          sizes="(min-width: 768px) 224px, 160px"
          alt="High res picture"
          decoding="async"
          fetchpriority="high"
          @load="$emit('heroLoaded')"
        />
      </div>
      <h1 class="z-20 m-5 mt-8 text-center text-2xl md:text-3xl lg:text-4xl font-bold md:mt-10">
        Hi, I'm <span class="text-coral dark:text-coralSoft">Lorenzo</span>
      </h1>
      <div class="flex mt-5">
        <!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
        <a
          class="ml-auto fill-muted transition hover:fill-coral dark:fill-gray-300 dark:hover:fill-coralSoft"
          href="https://twitter.com/Lorenzosp"
          aria-label="Twitter profile"
        >
          <svg
            class="h-6"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <path
              d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"
            />
          </svg>
        </a>
        <a
          href="https://www.linkedin.com/in/lorenzosp/"
          class="mx-5 fill-muted transition hover:fill-teal dark:fill-gray-300 dark:hover:fill-tealSoft"
          aria-label="Linkedin profile"
        >
          <svg
            class="h-6"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
          >
            <path
              d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"
            />
          </svg>
        </a>
        <a
          href="https://github.com/lorenzosp93"
          class="mr-auto fill-muted transition hover:fill-coral dark:fill-gray-300 dark:hover:fill-coralSoft"
          aria-label="Github space"
        >
          <svg
            class="h-6"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 496 512"
          >
            <path
              d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
            />
          </svg>
        </a>
      </div>
    </div>
    <div class="relative z-20 min-w-0 max-w-2xl justify-self-center sm:justify-self-start">
      <p
        class="mb-4 text-center text-xs font-bold uppercase tracking-[0.24em] text-teal dark:text-tealSoft sm:text-left"
      >
        Product · Software · Energy
      </p>
      <div
        class="hero-copy prose prose-slate max-w-none font-sans text-center leading-relaxed dark:prose-invert prose-p:my-4 prose-strong:text-coral dark:prose-strong:text-coralSoft sm:text-left lg:prose-lg"
      >
        <!-- VITE_HERO_COPY is trusted build-time configuration, rendered as Markdown. -->
        <p v-for="paragraph in heroParagraphs" :key="paragraph" v-html="paragraph"></p>
      </div>
    </div>
    </div>
    <button
      class="hero-scroll-indicator"
      type="button"
      aria-label="Scroll to explore the portfolio"
      @click="scrollToResume"
    >
      <span>Scroll to explore</span>
      <span class="hero-scroll-line" aria-hidden="true" />
    </button>
  </section>
</template>

<script setup lang="ts">
import { useVisibilityObserver } from "@/composables/visibilityObserver";
import { marked } from "marked";
import { Ref, computed, ref } from "vue";
import { useSiteStore } from "@/stores/site.store";
import fallbackHero from "@/assets/hero.webp";
import fallbackHeroMobile from "@/assets/hero-mobile.webp";

/**
 * Use kebab-case event in the template: @hero-loaded.
 */
defineEmits(["heroLoaded"]);

const root: Ref<HTMLDivElement | null> = ref(null);
useVisibilityObserver("theHero", root);
const siteStore = useSiteStore();
const heroPicture = computed(() => siteStore.heroPicture || fallbackHero);
const heroSrcset = computed(() =>
  siteStore.heroPicture ? undefined : `${fallbackHeroMobile} 320w, ${fallbackHero} 886w`
);
const defaultHeroCopy = `I'm a **product leader** with a background in **software** and **energy engineering**. I turn complex problems into focused products, bringing technical depth and pragmatic execution to teams at every stage.`;
const heroParagraphs = computed(() =>
  (import.meta.env.VITE_HERO_COPY?.trim() || defaultHeroCopy)
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((paragraph) => marked.parseInline(paragraph) as string)
);

function scrollToResume() {
  document.getElementById("the-resume")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
    inline: "nearest",
  });
}

</script>

<style scoped>
.hero-scroll-indicator {
  @apply absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 bg-transparent px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted transition hover:text-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-teal dark:text-gray-400 dark:hover:text-tealSoft;
}

.hero-scroll-line {
  @apply block h-8 w-px origin-top bg-current;
  animation: hero-scroll-line-pulse 1.8s ease-in-out infinite;
}

@media (max-width: 420px) {
  .hero-layout {
    row-gap: 0.75rem;
  }

  .hero-copy {
    font-size: 0.875rem;
    line-height: 1.55;
  }

  .hero-copy :deep(p) {
    margin-bottom: 0.75rem;
    margin-top: 0.75rem;
  }
}

@keyframes hero-scroll-line-pulse {
  0%,
  100% {
    opacity: 0.35;
    transform: scaleY(0.45);
  }
  50% {
    opacity: 1;
    transform: scaleY(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-scroll-line {
    animation: none;
  }
}
</style>
