<template>
  <nav class="sticky top-0 z-20 w-full opacity-0">
    <div class="w-full rounded-b-3xl bg-surface/90 shadow-sm ring-1 ring-ink/10 backdrop-blur-md dark:bg-nightSurface/90 dark:ring-white/10">
      <div class="relative flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
          <button
            type="button"
            class="ml-2 inline-flex items-center justify-center rounded-full p-2 text-muted transition hover:bg-tealSoft hover:text-teal dark:text-gray-300 dark:hover:bg-teal/20 dark:hover:text-tealSoft"
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
          <div
            class="mx-3 my-2 flex flex-shrink-0 items-center"
            @click="scrollToElement(navStore.refs?.theHero.value)"
          >
            <img
              id="heroLogo"
              class="h-10 w-10 cursor-pointer rounded-full opacity-100 ring-2 ring-coralSoft transition duration-300 ease-in-out hover:scale-105 dark:ring-teal/40"
              src="@/assets/hero-logo.webp"
              alt="Hero image logo"
              @load="$emit('imageLoaded')"
            />
          </div>

          <div class="my-auto hidden w-full justify-end sm:ml-6 sm:block">
            <div class="flex items-center space-x-2 overflow-x-auto no-scrollbar">
              <button
                class="nav-link ml-auto"
                :class="{ active: navStore.visible === 'theHero' }"
                aria-current="page"
                @click="scrollToElement(navStore.refs?.theHero)"
              >
                About
              </button>

              <div class="rounded-full p-0.5 text-sm font-medium" :class="{ active: isResumeActive }">
                <button
                  v-if="!isResumeActive"
                  class="nav-link"
                  @click="scrollToElement(navStore.refs?.experience)"
                >
                  Resume
                </button>
                <template v-else>
                  <button
                    class="nav-link-active-group"
                    :class="{ active_inner: navStore.visible === 'experience' }"
                    @click="scrollToElement(navStore.refs?.experience)"
                  >
                    Experience
                  </button>
                  <button
                    class="nav-link-active-group"
                    :class="{ active_inner: navStore.visible === 'education' }"
                    @click="scrollToElement(navStore.refs?.education)"
                  >
                    Education
                  </button>
                  <button
                    v-if="navStore.refs?.projects"
                    class="nav-link-active-group"
                    :class="{ active_inner: navStore.visible === 'projects' }"
                    @click="scrollToElement(navStore.refs?.projects)"
                  >
                    Projects
                  </button>
                  <button
                    class="nav-link-active-group"
                    :class="{ active_inner: navStore.visible === 'skills' }"
                    @click="scrollToElement(navStore.refs?.skills)"
                  >
                    Skills
                  </button>
                </template>
              </div>

              <button
                class="nav-link"
                :class="{ active: navStore.visible === 'theBlog' }"
                @click="scrollToElement(navStore.refs?.theBlog)"
              >
                Blog
              </button>
              <button
                class="nav-link"
                :class="{ active: navStore.visible === 'theContacts' }"
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
      class="absolute ml-3 mt-2 overflow-hidden rounded-2xl bg-surface shadow-xl ring-1 ring-ink/10 transition duration-300 ease-in-out dark:bg-nightSurface dark:ring-white/10 sm:hidden"
      :class="{ 'menu-closed': !isMenuOpen }"
    >
      <div class="space-y-2 p-2">
        <button class="mobile-link" :class="{ active: navStore.visible === 'theHero' }" @click="scrollMobile(navStore.refs?.theHero)">
          About
        </button>
        <button class="mobile-link" :class="{ active: isResumeActive }" @click="scrollMobile(navStore.refs?.experience)">
          Resume
        </button>
        <button class="mobile-link" :class="{ active: navStore.visible === 'theBlog' }" @click="scrollMobile(navStore.refs?.theBlog)">
          Blog
        </button>
        <button class="mobile-link" :class="{ active: navStore.visible === 'theContacts' }" @click="scrollMobile(navStore.refs?.theContacts)">
          Contacts
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useNavStore } from "@/stores/nav.store";
import { Bars3Icon, XMarkIcon } from "@heroicons/vue/24/outline";
import { MaybeRef } from "@vueuse/core";
import { computed, ref } from "vue";
const navStore = useNavStore();

const isMenuOpen = ref(false);
const isResumeActive = computed(() => {
  return (
    navStore.isActive?.experience ||
    navStore.isActive?.education ||
    navStore.isActive?.projects ||
    navStore.isActive?.skills
  );
});

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

function scrollMobile(elem: MaybeRef<HTMLDivElement | null>) {
  scrollToElement(elem);
  isMenuOpen.value = false;
}

function scrollToElement(elem: MaybeRef<HTMLDivElement | null>) {
  if (!elem) {
    return;
  }
  if ("value" in elem) {
    elem = elem.value;
  }
  if (!elem) {
    return;
  }

  scrollHorizontallyIntoView(elem);

  elem.scrollIntoView({
    behavior: "smooth",
    block: "start",
    inline: "nearest",
  });
}

function scrollHorizontallyIntoView(elem: HTMLElement) {
  const scrollParent = getHorizontalScrollParent(elem);
  if (!scrollParent) {
    return;
  }

  const parentBox = scrollParent.getBoundingClientRect();
  const elemBox = elem.getBoundingClientRect();
  const targetLeft =
    scrollParent.scrollLeft +
    elemBox.left -
    parentBox.left -
    parentBox.width / 2 +
    elemBox.width / 2;

  scrollParent.scrollTo({
    left: targetLeft,
    behavior: "smooth",
  });
}

function getHorizontalScrollParent(elem: HTMLElement): HTMLElement | null {
  let parent = elem.parentElement;
  while (parent) {
    if (parent.scrollWidth > parent.clientWidth + 2) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}
</script>

<style scoped>
.nav-link {
  @apply cursor-pointer rounded-full px-3 py-2 text-sm font-medium text-ink transition hover:bg-tealSoft hover:text-teal dark:text-gray-300 dark:hover:bg-teal/20 dark:hover:text-tealSoft;
}

.nav-link-active-group {
  @apply cursor-pointer rounded-full px-3 py-2 text-sm font-medium text-white transition dark:text-night;
}

.mobile-link {
  @apply block w-full rounded-xl px-4 py-2 text-left text-sm font-medium text-ink transition hover:bg-tealSoft hover:text-teal dark:text-gray-300 dark:hover:bg-teal/20 dark:hover:text-tealSoft;
}

.active {
  @apply bg-teal text-white shadow-sm dark:bg-tealSoft dark:text-night;
}

.active_inner {
  @apply bg-surface text-teal shadow-sm dark:bg-nightSurface dark:text-tealSoft;
}

.menu-closed {
  @apply pointer-events-none scale-95 -translate-y-2 opacity-0;
}
</style>