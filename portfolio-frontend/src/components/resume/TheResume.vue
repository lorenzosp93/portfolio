<template>
<div class="container relative min-h-screen w-screen mx-auto mt-10">
  <div class="class container flex flex-wrap mx-auto mb-10">
    <h2 class="text-center text-xl w-full font-bold mx-auto  text-gray-600 dark:text-white">
      Here are a few things I've done.
    </h2>
    <p class="text-center w-full text-gray-600 dark:text-gray-300">
      Because I definitely needed a website to host my CV. Swipe horizontally to change section!
    </p>
  </div>
  <div class="z-10 sticky top-1/2 hidden md:block max-w-screen-lg mx-auto" id="arrow-holder-resume">
    <div @click="scrollToSibling(false)" class="absolute -left-5 rounded-full h-10 w-10 shadow-md bg-gray-50 dark:bg-gray-500 hidden hover:bg-gray-100 hover:dark:bg-gray-400 cursor-pointer select-none" :class="{'md:block': !isExperienceActive}">
        <div class="translate-y-full translate-x-1/4 h-1/3 w-1/3 mx-auto rotate-45 border-b-2 border-l-2 border-gray-600 dark:border-gray-900 box-border rounded-bl" ></div>
    </div>
    <div @click="scrollToSibling(true)" class="absolute -right-5 rounded-full h-10 w-10 shadow-md bg-gray-50 dark:bg-gray-500 hidden hover:dark:bg-gray-400 hover:bg-gray-100 cursor-pointer select-none" :class="{'md:block': !isSkillsActive}">
        <div class="translate-y-full -translate-x-1/4 h-1/3 w-1/3 mx-auto rotate-45 border-t-2 border-r-2 border-gray-600 dark:border-gray-900 box-border rounded-tr" ></div>
    </div>
  </div>
  <div class="container relative flex gap-6 overflow-x-scroll no-scrollbar snap-x snap-mandatory scroll-smooth w-full" id="resume-container">
    <div class="flex-none w-full grow snap-always snap-center resume-panels">
      <resume-timeline :ix="'first'" :observer="observer" :isActive="isExperienceActive" :kind="'experience'" id="experience" />
    </div>
    <div class="flex-none w-full grow snap-always snap-center resume-panels">
      <resume-timeline :ix="'center'" :observer="observer" :isActive="isEducationActive" :kind="'education'" id="education" />
    </div>
    <div class="flex-none w-full grow snap-always snap-center resume-panels">
      <resume-projects :ix="'center'" :observer="observer" id="projects" :isActive="isProjectsActive"/>
    </div>
    <div class="flex-none w-full grow snap-always snap-center resume-panels">
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
    scrollToSibling (next) {
      let scrollWidth = document.getElementById('arrow-holder-resume').clientWidth;
      if (next) {
        document.getElementById('resume-container').scrollLeft += scrollWidth;
      } else {
        document.getElementById('resume-container').scrollLeft -= scrollWidth;
      }
    }
  },
  beforeUnmount () {
    this.$lax.removeElements('.resume-panels');
    this.$lax.removeElements('#arrow-holder-resume');
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
        }
      }
    );
    this.$lax.addElements(
      '#arrow-holder-resume',
      {
        scrollY: {
          opacity: [
            ['elCenterY', 'elCenterY+(screenHeight/2)', 'elCenterY+(screenHeight)'],
            [0, 1, 0],
            {
              easing: 'easeOutQuad',
            }
          ],
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
