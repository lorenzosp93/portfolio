<template>
  <div class="relative min-h-screen w-full mx-auto my-[10vh]">
    <div class="flex flex-wrap w-full mx-auto mb-10">
      <h2
        class="text-center text-xl w-full font-bold mx-auto text-gray-600 dark:text-white"
      >
        Here are a few things I've done.
      </h2>
      <p class="text-center w-full text-gray-600 dark:text-gray-300">
        Because I definitely needed a website to host my CV.
        <span class="md:hidden"> Swipe horizontally to change section!</span>
      </p>
    </div>
    <ArrowScroller :scroll-container="resumeContainer" />
    <div
      class="relative flex gap-6 overflow-x-scroll no-scrollbar snap-x snap-mandatory scroll-smooth w-full"
      id="resume-container"
      ref="resumeContainer"
    >
      <div ref="experience" class="flex-none w-full snap-center">
        <resume-timeline :ix="'first'" :kind="'experience'" id="experience" />
      </div>
      <div class="flex-none w-full snap-center">
        <resume-timeline :ix="'center'" :kind="'education'" id="education" />
      </div>
      <div class="flex-none w-full snap-center">
        <resume-projects :ix="'center'" id="projects" />
      </div>
      <div class="flex-none w-full snap-center">
        <resume-skills :ix="'last'" id="skills" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ResumeProjects from "./Projects/ResumeProjects.vue";
import ResumeSkills from "./Skills/ResumeSkills.vue";
import ResumeTimeline from "./Timeline/ResumeTimeline.vue";
import ArrowScroller from "../composables/ArrowScroller.vue";

const resumeContainer = ref(null);
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
