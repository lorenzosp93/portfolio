<template>
  <div class="sticky top-0 z-10" >
    <slot>
      <nav class="">
        <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 sm:bg-white sm:dark:bg-gray-600">
          <div class="relative flex items-center justify-between h-16">
            <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
              <!-- Mobile menu button-->
              <button type="button" @click="toggleMenu" class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-700 hover:dark:text-white hover:bg-white hover:dark:bg-gray-700 hover:outline-none hover:ring-2 hover:ring-inset hover:ring-gray-700 hover:dark:ring-white" aria-controls="mobile-menu" aria-expanded="false">
                <span class="sr-only">Open main menu</span>
                <!--
                  Icon when menu is closed.

                  Heroicon name: outline/menu

                  Menu open: "hidden", Menu closed: "block"
                -->
                <svg class="h-6 w-6" :class="{'hidden': isMenuOpen, 'block': !isMenuOpen}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <!--
                  Icon when menu is open.

                  Heroicon name: outline/x

                  Menu open: "block", Menu closed: "hidden"
                -->
                <svg class="h-6 w-6" :class="{'block': isMenuOpen, 'hidden': !isMenuOpen}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="flex-1 flex items-center justify-end sm:items-stretch sm:justify-start">
              <div class="flex-shrink-0 flex items-center m-3">
                <img id="heroLogo" class="h-9 w-auto rounded-full" src="@/assets/hero.jpeg" @load="this.$emit('imageLoaded')" alt="Hero image logo" :class="{'invisible': !isVisible}">
              </div>
              <div class="hidden  sm:block my-auto sm:ml-6">
                <div class="flex space-x-4">
                  <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
                   <a href="#the-hero" class="text-black dark:text-gray-300  px-3 py-2 rounded-md text-sm font-medium" :class="{active: elementInView === 'the-hero'}" aria-current="page">About</a>
                  <a href="#the-resume" class="text-black dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium" :class="{active: ['experience', 'education'].includes(elementInView)}">Resume</a>
                  <a href="#experience" class="text-black dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium scroll-smooth" v-show="['experience', 'education'].includes(elementInView)" :class="{active_outer: ['experience'].includes(elementInView)}">Experience</a>
                  <a href="#education" class="text-black dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium" v-show="['experience', 'education'].includes(elementInView)" :class="{active_outer: ['education'].includes(elementInView)}">Education</a>
                  <a href="#the-blog" class="text-black dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium" :class="{active: elementInView === 'the-blog'}">Blog</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile menu, show/hide based on menu state. -->
        <div class="sm:hidden bg-white dark:bg-gray-700 rounded-lg mx-3 ring-1 ring-gray-100 dark:ring-gray-600 relative" :class="{'hidden': !isMenuOpen,}" id="mobile-menu">
          <div class="px-2 pt-2 pb-3 space-y-1">
            <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
             <a href="#the-hero" class="block text-black dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium" :class="{active: elementInView === 'the-hero'}" aria-current="page">About</a>
            <a href="#the-resume" class="block text-black dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium" :class="{active: ['experience', 'education'].includes(elementInView)}">Resume</a>
            <a href="#experience" class="block text-black dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium scroll-smooth" v-show="['experience', 'education'].includes(elementInView)" :class="{active_outer: ['experience'].includes(elementInView)}">Experience</a>
            <a href="#education" class="block text-black dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium" v-show="['experience', 'education'].includes(elementInView)" :class="{active_outer: ['education'].includes(elementInView)}">Education</a>
            <a href="#the-blog" class="block text-black dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium" :class="{active: elementInView === 'the-blog'}">Blog</a>
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
      isMenuOpen: false
    };
  },
  props: [
    'elementsInView'
  ],
  inject: [
  ],
  methods: {
    toggleMenu () {
      this.isMenuOpen = !this.isMenuOpen;
    },
  },
  computed:{
    elementInView () {
      const a = this.elementsInView;
      a.sort(
        (x, y) => {
          return x.intersectionRatio < y.intersectionRatio ? 1 : -1
        }
      ).find(elem => elem)
      return a.length > 0 ? a[0].target.id : null
    },
    isVisible () {
      const e = this.elementsInView.filter(elem => elem.target.id == 'the-hero');
      if (e.length == 0) {return false}
      return e.filter(elem => elem.intersectionRatio > 0)?.length == 0
    }
  },
  mounted () {
    this.$lax.addElements(
      '#the-navbar',
      {
        scrollY: {
          opacity: [
            [0, 'elOutY'],
            [0, 1],
          ]
        }
      }

    )
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.active {
  @apply bg-gray-600 dark:bg-white text-white dark:text-black
}
.active_outer {
  @apply border-2 border-gray-600 text-gray-600 dark:border-white dark:text-white
}
</style>
