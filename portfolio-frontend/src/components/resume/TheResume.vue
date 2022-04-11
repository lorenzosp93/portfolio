<template>
<div class="container relative min-h-screen w-screen mx-auto">
  <div class="class container flex flex-wrap mx-auto my-10">
    <h2 class="text-center text-xl w-full font-bold mx-auto  text-gray-600 dark:text-white">
      Here are a few things I've done.
    </h2>
    <p class="text-center w-full text-gray-600 dark:text-gray-300">
      Because I definitely needed a website to host my CV. Swipe horizontally to change section!
    </p>
  </div>
  <div class="container relative  flex gap-6 overflow-x-scroll no-scrollbar snap-x snap-mandatory scroll-smooth" id="resume-container">
    <div class="flex-none w-full snap-always snap-center resume-panels">
      <resume-timeline :ix="'first'" :observer="observer" :isActive="isExperienceActive" :kind="'experience'" id="experience" />
    </div>
    <div class="flex-none w-full snap-always snap-center resume-panels">
      <resume-timeline :ix="'center'" :observer="observer" :isActive="isEducationActive" :kind="'education'" id="education" />
    </div>
    <div class="flex-none w-full snap-always snap-center resume-panels">
      <resume-projects :ix="'center'" :observer="observer" id="projects" :isActive="isProjectsActive"/>
    </div>
    <div class="flex-none w-full snap-always snap-center resume-panels">
      <resume-skills :ix="'last'" :observer="observer" id="skills" :isActive="isSkillsActive"/>
    </div>
  </div>
</div>
</template>

<script>
import ResumeProjects from './Projects/ResumeProjects.vue';
import ResumeSkills from './Skills/ResumeSkills.vue';
import ResumeTimeline from './Timeline/ResumeTimeline.vue';

export default {
  components: { ResumeTimeline, ResumeProjects, ResumeSkills },
  name: 'TheResume',
  
    ResumeProjectsdata () {
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
    isProjectsActive () {
      return this.isActive('projects')
    },
    isSkillsActive () {
      return this.isActive('skills')
    },
  },
  methods: {
    isActive (kind) {
      return this.elementsInView.filter(e => kind == e.target.id && e.isIntersecting)?.length > 0 ?? false
    },
  },
  beforeUnmount () {
    this.$lax.removeElements('.resume-animate');
    this.$lax.removeDriver('scrollX');
  },
  mounted () {
    let animationMap = ["elCenterX-(elWidth)", "elCenterX", "elCenterX+(elWidth)"];
    this.$lax.addElements(
      '.resume-panels',
      {
        containerScrollX: {
          opacity: [
            animationMap,
            [0.3, 1, 0.3],
            {
              easing: 'easeInOutCubic',
            }
          ],
          // translateY: [
          //   animationMap,
          //   [-100, 0, 100],
          //   {
          //     easing: 'easeInOutCubic',
          //   }
          // ],
          // scale: [
          //   animationMap,
          //   [0.8, 1, 0.8],
          //   {
          //     easing: 'easeInOutCubic',
          //   }
          // ]
        }
      }
    );
  },
  created () {
    this.$lax.addDriver('containerScrollX', () => {
      let scrollX = document.getElementById('resume-container')?.scrollLeft;
      return scrollX
    });
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.resume-panels {
  @apply flex-shrink-0
}
</style>
