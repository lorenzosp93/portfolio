<template>
  <div v-show="isVisible" class="sticky top-0 z-[200]">
    <slot>
      <nav class="bg-gray-800">
      <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div class="relative flex items-center justify-between h-16">
          <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <!-- Mobile menu button-->
            <button type="button" class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" aria-controls="mobile-menu" aria-expanded="false">
              <span class="sr-only">Open main menu</span>
              <!--
                Icon when menu is closed.

                Heroicon name: outline/menu

                Menu open: "hidden", Menu closed: "block"
              -->
              <svg class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <!--
                Icon when menu is open.

                Heroicon name: outline/x

                Menu open: "block", Menu closed: "hidden"
              -->
              <svg class="hidden h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
            <div class="flex-shrink-0 flex items-center">
              <img class="block lg:hidden h-8 w-auto" src="" alt="Hero image logo">
              <img class="hidden lg:block h-8 w-auto" src="" alt="Lorenzosp">
            </div>
            <div class="hidden sm:block sm:ml-6">
              <div class="flex space-x-4">
                <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
                <a href="#the-hero" class="text-gray-300 hover:bg-gray-700  px-3 py-2 rounded-md text-sm font-medium" :class="{active: elementsInView[0] === 'the-hero'}" aria-current="page">About</a>
                <a href="#the-resume" class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium" :class="{active: ['experience', 'education'].includes(elementsInView[0])}">Resume</a>
                <a href="#experience" class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium" v-if="['experience', 'education'].includes(elementsInView[0])" :class="{active_outer: ['experience'].includes(elementsInView[0])}">Experience</a>
                <a href="#education" class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium" v-if="['experience', 'education'].includes(elementsInView[0])" :class="{active_outer: ['education'].includes(elementsInView[0])}">Education</a>
                <a href="#" class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium" :class="{active: elementsInView[0] === 'the-blog'}">Blog</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile menu, show/hide based on menu state. -->
      <div class="sm:hidden" id="mobile-menu">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
          <a href="#the-hero" class="text-gray-300 hover:bg-gray-700  px-3 py-2 rounded-md text-sm font-medium" :class="{active: elementsInView[0] === 'the-hero'}" aria-current="page">About</a>
          <a href="#the-resume" class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium" :class="{active: ['experience', 'education'].includes(elementsInView[0])}">Resume</a>
          <a @click="jump('experience')" class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium scroll-smooth" v-show="['experience', 'education'].includes(elementsInView[0])" :class="{active_outer: ['experience'].includes(elementsInView[0])}">Experience</a>
          <a @click="jump('education')" class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium" v-show="['experience', 'education'].includes(elementsInView[0])" :class="{active_outer: ['education'].includes(elementsInView[0])}">Education</a>
          <a href="#" class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium" :class="{active: elementsInView[0] === 'the-blog'}">Blog</a>
      
        </div>
      </div>
    </nav>

    </slot>
  </div>
</template>

<script>
export default {
  name: 'TheNavbar',
  props: {
    isVisible: Boolean,
    elementsInView: Array,
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.active {
  @apply bg-gray-600 dark:bg-white text-gray-600 dark:text-black
}
.active_outer {
  @apply border-2 border-gray-600 text-gray-600 dark:border-white dark:text-white
}
</style>
