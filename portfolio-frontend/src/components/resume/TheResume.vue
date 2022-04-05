<template>
<div class="container relative snap-start snap-always w-screen mx-auto">
  <div class="class container flex flex-wrap mx-auto my-10">
    <h2 class="text-center text-xl w-full font-bold mx-auto  text-gray-600 dark:text-white">
      Here are a few things I've done.
    </h2>
    <p class="text-center w-full text-gray-600 dark:text-gray-300">
      Some sub-tytle for the blog section. Lorem Ipsum dolor ...
    </p>
  </div>
  <div class="container relative w-screen flex gap-6 overflow-x-scroll no-scrollbar snap-x snap-mandatory scrolling-touch">
    <div class="flex-none  w-full snap-always snap-center">
      <resume-timeline :observer="observer" :isActive="isExperienceActive" :kind="'experience'" id="experience" />
    </div>
    <div class="flex-none  w-full snap-always snap-center">
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
    'observer',
    'elementsInView',
  ],
  inject: [
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
            [0, 'elCenterY'],
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
