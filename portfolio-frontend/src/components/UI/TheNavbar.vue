<template>
  <div class="sticky top-0 z-20 opacity-0 w-screen">
    <slot>
      <nav class="">
        <div class=" mx-auto sm:bg-white sm:dark:bg-gray-600">
          <div class="relative flex items-center justify-between h-16">
            <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
              <!-- Mobile menu button-->
              <button type="button" @click="toggleMenu"
                class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-700 hover:dark:text-white hover:bg-white hover:dark:bg-gray-700 hover:shadow-md ml-3"
                aria-controls="mobile-menu" aria-expanded="false">
                <span class="sr-only">Open main menu</span>
                <!--
                  Icon when menu is closed.

                  Heroicon name: outline/menu

                  Menu open: "hidden", Menu closed: "block"
                -->
                <svg class="h-6 w-6" :class="{'hidden': isMenuOpen, 'block': !isMenuOpen}"
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <!--
                  Icon when menu is open.

                  Heroicon name: outline/x

                  Menu open: "block", Menu closed: "hidden"
                -->
                <svg class="h-6 w-6" :class="{'block': isMenuOpen, 'hidden': !isMenuOpen}"
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="flex-1 flex items-center justify-end sm:items-stretch sm:justify-start">
              <div @click="scrollToElement('the-hero')" class="flex-shrink-0 flex items-center m-3">
                <img id="heroLogo"
                  class="h-10 w-10 rounded-full opacity-100 cursor-pointer hover:scale-105 transition duration-300 ease-in-out ring-1 ring-white"
                  src="@/assets/hero-logo.webp" @load="this.$emit('imageLoaded')" alt="Hero image logo"
                  >
              </div>
              <div class="hidden  sm:block my-auto sm:ml-6 justify-end">
                <div class="flex space-x-3 overflow-x-auto no-scrollbar ">
                  <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
                  <a @click="scrollToElement('the-hero')"
                    class="text-black dark:text-gray-300 px-3 py-2 ml-auto rounded-md text-sm font-medium cursor-pointer"
                    :class="{active: elementInView === 'the-hero'}" aria-current="page">About</a>
                  <a 
                    class="px-0.5 py-2 rounded-lg text-sm font-medium cursor-pointer" :class="{active: ['experience', 'education','projects', 'skills'].includes(elementInView)}" >
                    <p @click="scrollToElement('the-resume')" class="text-black dark:text-gray-300">Resume</p>
                    <a @click="scrollToElement('experience')"
                      class="text-white dark:text-gray-900  px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
                      v-show="['experience', 'education', 'projects', 'skills'].includes(elementInView)"
                      :class="{active_inner: ['experience'].includes(elementInView)}">Experience</a>
                    <a @click="scrollToElement('education')"
                      class="text-white dark:text-gray-900 px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
                      v-show="['experience', 'education', 'projects', 'skills'].includes(elementInView)"
                      :class="{active_inner: ['education'].includes(elementInView)}">Education</a>
                    <a @click="scrollToElement('projects')"
                      class="text-white dark:text-gray-900 px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
                      v-show="['experience', 'education', 'projects', 'skills'].includes(elementInView)"
                      :class="{active_inner: ['projects'].includes(elementInView)}">Projects</a>
                    <a @click="scrollToElement('skills')"
                      class="text-white dark:text-gray-900 box-border px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
                      v-show="['experience', 'education', 'projects', 'skills'].includes(elementInView)"
                      :class="{active_inner: ['skills'].includes(elementInView)}">Skills</a>
                  </a>
                  <a @click="scrollToElement('the-blog')"
                    class="text-black dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
                    :class="{active: elementInView === 'the-blog'}">Blog</a>
                  <a @click="scrollToElement('the-contacts')"
                    class="text-black dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
                    :class="{active: elementInView === 'the-contacts'}">Contacts</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile menu, show/hide based on menu state. -->
        <div
          class="sm:hidden bg-white dark:bg-gray-700 rounded-lg  dark:ring-gray-600 absolute -z-10 transform duration-500 ease-in-out overflow-hidden ml-3 -mt-1"
          :class="{'menu-closed': !isMenuOpen,}" id="mobile-menu">
          <div class="px-2 pt-2 pb-3 space-y-2 shadow-md">
            <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
            <a @click="scrollToElement('the-hero'); toggleMenu()" class="block text-black dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium"
              :class="{active: elementInView === 'the-hero'}" aria-current="page">About</a>
            <a @click="scrollToElement('experience')" class="block text-black dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium"
              :class="{active: ['experience'].includes(elementInView)}">Experience</a>
            <a @click="scrollToElement('education')" class="block text-black dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium"
              :class="{active: ['education'].includes(elementInView)}">Education</a>
            <a @click="scrollToElement('projects')" class="block text-black dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium"
              :class="{active: ['projects'].includes(elementInView)}">Projects</a>
            <a @click="scrollToElement('skills')" class="block text-black dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium"
              :class="{active: ['skills'].includes(elementInView)}">Skills</a>
            <a @click="scrollToElement('the-blog'); toggleMenu()" class="block text-black dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium"
              :class="{active: elementInView === 'the-blog'}">Blog</a>
            <a @click="scrollToElement('the-contacts'); toggleMenu()" class="block text-black dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium"
              :class="{active: elementInView === 'the-contacts'}">Contacts</a>
          </div>
        </div>
      </nav>
    </slot>
  </div>
</template>

<script>
export default {
  name: 'TheNavbar',
  data () {
    return {
      isMenuOpen: false,
      loadAnimation: false,
    };
  },
  props: [
    'elementInView',
  ],
  inject: [
  ],
  methods: {
    toggleMenu () {
      this.isMenuOpen = !this.isMenuOpen;
    },
    scrollToElement (elem) {
      document.getElementById(elem).scrollIntoView({behavior: 'smooth'})
    }
  },
  computed:{
  },
  beforeUnmount () {
  },
  mounted () {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.active {
  @apply bg-gray-600 dark:bg-gray-300 text-white dark:text-black
}


.active p {
  @apply hidden
}

.active_inner {
  @apply bg-white text-black dark:bg-gray-600 dark:text-white
}

.menu-closed {
  @apply scale-x-[0.3] scale-y-[0.09] opacity-0 -translate-y-48 -translate-x-9
}
</style>
