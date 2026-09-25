<template>
  <main class="page-scroll-container w-full bg-paper text-ink snap-y snap-proximity dark:bg-night">
    <the-hero class="snap-center scroll-mt-20" id="the-hero" />
    <the-navbar
      class="snap-center"
      id="the-navbar"
    />
    <the-resume class="snap-center scroll-mt-20" id="the-resume" />
    <the-blog class="snap-center scroll-mt-20" id="the-blog" />
    <the-contacts class="snap-center scroll-mt-20" id="the-contacts" />
    <service-worker-update />
  </main>

  <footer class="mx-auto flex w-full flex-wrap items-center justify-between gap-3 bg-paper px-5 pb-6 text-sm text-muted dark:bg-night dark:text-gray-300">
    <p>© Lorenzo Spinelli, {{ currentYear }}</p>
    <div class="flex items-center gap-3">
      <a
        class="underline-offset-4 hover:text-teal hover:underline dark:hover:text-tealSoft"
        :href="feedUrl"
        type="application/atom+xml"
      >RSS</a>
      <theme-toggle />
    </div>
  </footer>
</template>

<script setup lang="ts">
import TheHero from "./components/TheHero.vue";
import TheNavbar from "./components/UI/TheNavbar.vue";
import TheResume from "./components/resume/TheResume.vue";
import TheBlog from "./components/blog/TheBlog.vue";
import TheContacts from "./components/TheContacts.vue";
import { provide, onMounted } from "vue";
import ServiceWorkerUpdate from "./components/UI/ServiceWorkerUpdate.vue";
import ThemeToggle from "./components/UI/ThemeToggle.vue";
import { useSiteStore } from "@/stores/site.store";

const siteStore = useSiteStore();
const currentYear = new Date().getFullYear();
const feedUrl = `${import.meta.env.VITE_APP_BACKEND_URL ?? ""}/api/blog/feed/`;
onMounted(() => {
  siteStore.loadSettings();
});

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
