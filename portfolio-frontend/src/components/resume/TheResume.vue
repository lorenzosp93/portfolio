<template>
<div class="container relative snap-start snap-always w-screen m-auto">
  <h2 class="my-5 text-center dark:text-white">Resume</h2>
  <div class="container relative w-full flex gap-6 overflow-x-scroll no-scrollbar snap-x snap-mandatory scrolling-touch scroll-px-5 items-start">
    <div class="shrink-0 flex-none mr-5 w-full snap-always snap-center">
      <resume-timeline :observer="observer" :isActive="isExperienceActive" :kind="'experience'" id="experience" />
    </div>
    <div class="shrink-0 flex-none mr-3 w-full snap-always snap-center">
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
      return this.isActive('experience')
    },
    isEducationActive () {
      return this.isActive('education')
    },
  },
  methods: {
    isActive (kind) {
      return this.elementsInView.filter(e => kind == e.target.id && e.isIntersecting)?.length > 0 ?? false
    },
  },
  mounted() {
    this.$lax.addElements(
      '#the-resume',
      {
        scrollY: {
          opacity: [
            [0, 'elInY'],
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
</style>
