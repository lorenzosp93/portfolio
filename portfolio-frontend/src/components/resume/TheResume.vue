<template>
  <div class="relative min-h-screen w-full mx-auto my-[10vh]">
    <div class="flex flex-wrap w-full mx-auto mb-10 px-5">
      <h2
        class="text-center text-xl md:text-2xl w-full font-bold mx-auto text-ink dark:text-white"
      >
        Here are a few things I've done.
      </h2>
      <p class="text-center w-full text-muted dark:text-gray-300">
        Because I definitely needed a website to host my CV.
      </p>
      <p
        v-if="!isMobile"
        class="mx-auto mt-4 rounded-full bg-surface/80 px-4 py-1.5 text-xs font-semibold text-muted shadow-sm ring-1 ring-ink/10 dark:bg-nightSurface/80 dark:text-gray-300 dark:ring-white/10"
      >
        Scroll horizontally or use the arrows to explore
      </p>
    </div>
    <div v-if="!isMobile" class="relative w-full">
      <ArrowScroller :scroll-container="resumeContainer" />
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-y-0 left-0 z-[5] w-12 bg-gradient-to-r from-sand via-sand/80 to-transparent dark:from-night dark:via-night/80 md:w-20"
      />
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-y-0 right-0 z-[5] w-12 bg-gradient-to-l from-sand via-sand/80 to-transparent dark:from-night dark:via-night/80 md:w-20"
      />
      <div
        class="relative flex gap-6 overflow-x-scroll overflow-y-hidden no-scrollbar snap-x snap-mandatory scroll-smooth w-full"
        id="resume-container"
        ref="resumeContainer"
      >
        <div
          v-for="comp in resumeList"
          :key="comp.id"
          :ref="comp.id"
          :id="comp.id"
          class="flex-none w-full snap-center"
        >
          <component :is="comp.component" v-bind="comp.props" />
        </div>
      </div>
    </div>
    <div v-if="isMobile" class="px-3">
      <ul
        class="my-3 flex flex-wrap border-b border-ink/10 text-ink dark:border-white/10 dark:text-white capitalize"
      >
        <li
          v-for="comp in resumeList"
          :key="comp.id"
          :class="[
            'px-3 py-2 inline-flex items-center justify-center cursor-pointer mx-auto first:ml-0 last:mr-0 text-sm transition text-muted dark:text-gray-300',
            { active: currentTab === comp.id },
          ]"
          @click="switchTab(comp.id)"
        >
          {{ comp.id }}
        </li>
      </ul>
      <component
        :is="currentComp?.component"
        v-bind="currentComp?.props"
        :id="currentComp?.id"
        ix="last"
        class="mt-3"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import ResumeProjects from "./Projects/ResumeProjects.vue";
import ResumeSkills from "./Skills/ResumeSkills.vue";
import ResumeTimeline from "./Timeline/ResumeTimeline.vue";
import ArrowScroller from "../composables/ArrowScroller.vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";

const resumeList = [
  {
    component: ResumeTimeline,
    props: {
      ix: "first",
      kind: "experience",
    },
    id: "experience",
  },
  {
    component: ResumeTimeline,
    props: {
      ix: "center",
      kind: "education",
    },
    id: "education",
  },
//  {
//    component: ResumeProjects,
//    props: {
//      ix: "center",
//    },
//    id: "projects",
//  },
  {
    component: ResumeSkills,
    props: {
      ix: "last",
    },
    id: "skills",
  },
];

const currentTab = ref("experience");
const currentComp = computed(() => {
  return resumeList.find((c) => c.id == currentTab.value);
});

const switchTab = (id: string) => {
  currentTab.value = id;
};

const resumeContainer = ref(null);
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.active {
  @apply border-b-2 border-coral font-bold text-coral dark:border-coralSoft dark:text-coralSoft;
}
</style>