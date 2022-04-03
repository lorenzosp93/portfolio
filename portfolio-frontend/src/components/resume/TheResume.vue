<template>
<div class="container min-h-screen m-5 text-center">
  <h2 class="my-5 dark:text-white">Resume</h2>
  <div class="container flex overflow-x-scroll snap-x snap-mandatory scrolling-touch scroll-pl-8 items-start">
    <div class="flex-none w-11/12 mx-8 snap-always snap-center">
      <resume-timeline :observer="observer" :isActive="isExperienceActive" :kind="'experience'" id="experience" />
    </div>
    <div class="flex-none w-11/12 mx-8 snap-always snap-center">
      <resume-timeline :observer="observer" :isActive="isEducationActive" :kind="'education'" id="education" />
    </div>
  </div>
</div>
</template>

<script>
import ResumeTimeline from './ResumeTimeline.vue';

export default {
  components: { ResumeTimeline },
  name: 'TheResume',
  data () {
    return {
    }
  },
  props: [
    "observer",
    "elementsInView",
  ],
  computed: {
    isExperienceActive () {
      return this.elementsInView.includes('experience');
    },
    isEducationActive () {
      return this.elementsInView.includes('education');
    },
  },
  methods: {
  },
  mounted() {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
