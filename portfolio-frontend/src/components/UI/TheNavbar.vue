<template>
  <nav class="sticky top-0 z-20 opacity-0 w-screen">
    <div class="mx-auto sm:bg-white sm:dark:bg-gray-600">
      <div class="relative flex items-center justify-between max-w-6xl mx-auto">
        <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
          <!-- Mobile menu button-->
          <button
            type="button"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-700 hover:dark:text-white hover:bg-white hover:dark:bg-gray-700 hover:shadow-md ml-3"
            aria-controls="mobile-menu"
            aria-expanded="false"
            @click="toggleMenu"
          >
            <span class="sr-only">Open main menu</span>
            <!--
                  Icon when menu is closed.

                  Heroicon name: outline/menu

                  Menu open: "hidden", Menu closed: "block"
                -->
            <bars-3-icon
              class="h-6 w-6"
              :class="{
                hidden: isMenuOpen,
                block: !isMenuOpen,
              }"
            ></bars-3-icon>
            <!--
                  Icon when menu is open.

                  Heroicon name: outline/x

                  Menu open: "block", Menu closed: "hidden"
                -->
            <x-mark-icon
              class="h-6 w-6"
              :class="{
                hidden: !isMenuOpen,
                block: isMenuOpen,
              }"
            ></x-mark-icon>
          </button>
        </div>
        <div
          class="flex-1 flex items-center justify-end sm:items-stretch sm:justify-start"
        >
          <div
            class="flex-shrink-0 flex items-center mx-3 my-3"
            @click="scrollToElement(navStore.refs?.theHero.value)"
          >
            <img
              id="heroLogo"
              class="h-10 w-10 rounded-full opacity-100 cursor-pointer hover:scale-105 transition duration-300 ease-in-out ring-1 ring-white"
              src="@/assets/hero-logo.webp"
              alt="Hero image logo"
              @load="$emit('imageLoaded')"
            />
          </div>
          <div class="hidden sm:block my-auto sm:ml-6 justify-end w-full">
            <div class="flex space-x-3 overflow-x-auto no-scrollbar">
              <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
              <button
                class="text-black dark:text-gray-300 px-3 py-2 ml-auto rounded-md text-sm font-medium cursor-pointer"
                :class="{
                  active: navStore.visible === 'theHero',
                }"
                aria-current="page"
                @click="scrollToElement(navStore.refs?.theHero)"
              >
                About
              </button>
              <button
                class="px-0.5 py-0.5 rounded-lg text-sm font-medium cursor-pointer"
                :class="{
                  active: isResumeActive,
                }"
              >
                <p
                  class="text-black dark:text-gray-300"
                  v-show="!isResumeActive"
                  @click="scrollToElement(navStore.refs?.experience)"
                >
                  Resume
                </p>
                <button
                  v-show="isResumeActive"
                  class="text-white dark:text-gray-900 px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
                  :class="{
                    active_inner: navStore.visible === 'experience',
                  }"
                  @click="scrollToElement(navStore.refs?.experience)"
                >
                  Experience
                </button>
                <button
                  v-show="isResumeActive"
                  class="text-white dark:text-gray-900 px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
                  :class="{
                    active_inner: navStore.visible === 'education',
                  }"
                  @click="scrollToElement(navStore.refs?.education)"
                >
                  Education
                </button>
                <button
                  v-show="isResumeActive"
                  class="text-white dark:text-gray-900 px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
                  :class="{
                    active_inner: navStore.visible === 'projects',
                  }"
                  @click="scrollToElement(navStore.refs?.projects)"
                >
                  Projects
                </button>
                <button
                  v-show="isResumeActive"
                  class="text-white dark:text-gray-900 box-border px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
                  :class="{
                    active_inner: navStore.visible === 'skills',
                  }"
                  @click="scrollToElement(navStore.refs?.skills)"
                >
                  Skills
                </button>
              </button>
              <button
                class="text-black dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
                :class="{
                  active: navStore.visible === 'theBlog',
                }"
                @click="scrollToElement(navStore.refs?.theBlog)"
              >
                Blog
              </button>
              <button
                class="text-black dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
                :class="{
                  active: navStore.visible === 'theContacts',
                }"
                @click="scrollToElement(navStore.refs?.theContacts)"
              >
                Contacts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile menu, show/hide based on menu state. -->
    <div
      id="mobile-menu"
      class="sm:hidden bg-white dark:bg-gray-700 rounded-lg dark:ring-gray-600 absolute -z-10 transform duration-500 ease-in-out overflow-hidden ml-3 -mt-1"
      :class="{ 'menu-closed': !isMenuOpen }"
    >
      <div class="px-2 pt-2 pb-3 space-y-2 shadow-md">
        <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
        <button
          class="block text-black dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium"
          :class="{ active: navStore.visible === 'theHero' }"
          aria-current="page"
          @click="
            scrollToElement(navStore.refs?.theHero);
            toggleMenu();
          "
        >
          About
        </button>
        <button
          class="block text-black dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium"
          :class="{
            active: navStore.visible === 'the-resume',
          }"
          @click="scrollToElement(navStore.refs?.experience)"
        >
          Resume
        </button>
        <button
          class="block text-black dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium"
          :class="{ active: navStore.visible === 'theBlog' }"
          @click="
            scrollToElement(navStore.refs?.theBlog);
            toggleMenu();
          "
        >
          Blog
        </button>
        <button
          class="block text-black dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium"
          :class="{ active: navStore.visible === 'theContacts' }"
          @click="
            scrollToElement(navStore.refs?.theContacts);
            toggleMenu();
          "
        >
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

function scrollToElement(elem: MaybeRef<HTMLDivElement | null>) {
  if (elem) {
    if ("value" in elem) {
      elem = elem.value;
    }
    elem?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.active {
  @apply bg-gray-600 dark:bg-gray-300 text-white dark:text-black;
}

.active p {
  @apply hidden;
}

.active_inner {
  @apply bg-white text-black dark:bg-gray-600 dark:text-white;
}

.menu-closed {
  @apply scale-x-[0.3] scale-y-[0.09] opacity-0 -translate-y-48 -translate-x-9;
}
</style>
