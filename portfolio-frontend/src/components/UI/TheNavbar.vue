<template>
  <div class="sticky top-0 z-10" >
    <slot>
      <nav class="bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div class="relative flex items-center justify-between h-16">
          <div class="flex-1 flex items-center sm:items-stretch justify-start">
            <div class="flex-shrink-0 flex items-center">
              <img id="heroLogo" class="h-9 w-auto rounded-full dark:ring-white ring-1" src="@/assets/hero.jpeg" @load="this.$emit('imageLoaded')" alt="Hero image logo" :class="{'invisible': !isVisible}">
            </div>
            <div class="hidden sm:block sm:ml-6">
              <div class="flex space-x-4">
                <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
                <a href="#the-hero" class="text-black dark:text-gray-300 hover:bg-gray-700  px-3 py-2 rounded-md text-sm font-medium" :class="{active: elementInView === 'the-hero'}" aria-current="page">About</a>
                <a href="#the-resume" class="text-black dark:text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium" :class="{active: ['experience', 'education'].includes(elementInView)}">Resume</a>
                <a @click="jump('experience')" class="text-black dark:text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium scroll-smooth" v-show="['experience', 'education'].includes(elementInView)" :class="{active_outer: ['experience'].includes(elementInView)}">Experience</a>
                <a @click="jump('education')" class="text-black dark:text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium" v-show="['experience', 'education'].includes(elementInView)" :class="{active_outer: ['education'].includes(elementInView)}">Education</a>
                <a href="#" class="text-black dark:text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium" :class="{active: elementInView === 'the-blog'}">Blog</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile menu, show/hide based on menu state. -->
      <div class="sm:hidden" id="mobile-menu">
        <div class="dark:px-2 pt-2 pb-3 space-y-1">
          <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
          <a href="#the-hero" class="text-black dark:text-gray-300 hover:bg-gray-700  px-3 py-2 rounded-md text-sm font-medium" :class="{active: elementInView === 'the-hero'}" aria-current="page">About</a>
          <a href="#the-resume" class="text-black dark:text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium" :class="{active: ['experience', 'education'].includes(elementInView)}">Resume</a>
          <a href="#experience" class="text-black dark:text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium scroll-smooth" v-show="['experience', 'education'].includes(elementInView)" :class="{active_outer: ['experience'].includes(elementInView)}">Experience</a>
          <a href="#education" class="text-black dark:text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium" v-show="['experience', 'education'].includes(elementInView)" :class="{active_outer: ['education'].includes(elementInView)}">Education</a>
          <a href="#" class="text-black dark:text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium" :class="{active: elementInView === 'the-blog'}">Blog</a>
      
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
    elementsInView: Array,
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
