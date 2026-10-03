<template>
  <section ref="resumeSection" class="section-tint relative w-full py-20 md:py-28">
    <Teleport to="body">
      <a v-if="isActive" :href="cvUrl" target="_blank" rel="noopener" data-testid="cv-fab"
        class="cv-fab fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full bg-teal px-5 py-3 text-sm font-semibold text-white shadow-lg focus-visible:ring-2 focus-visible:ring-tealSoft dark:bg-tealSoft dark:text-night">
        <document-arrow-down-icon class="h-5 w-5" aria-hidden="true" /><span>My CV</span>
      </a>
    </Teleport>
    <div class="journey-shell mx-auto w-full max-w-7xl">
      <header class="journey-header px-5 md:px-12">
        <h2 class="section-heading">{{ copy.heading }}</h2>
        <p v-if="copy.intro" class="section-lede">{{ copy.intro }}</p>
        <div class="mt-5 flex flex-wrap items-center gap-6 text-sm font-semibold text-teal dark:text-tealSoft">
          <button v-if="store.data?.entries.length" type="button" class="min-h-11" @click="timeline?.jumpToToday()">Jump to today <span aria-hidden="true">↓</span></button>
        </div>
      </header>
      <div v-if="store.loading && !store.data" class="px-5 py-20 text-muted dark:text-gray-300" role="status">Loading the journey…</div>
      <div v-else-if="store.error" class="px-5 py-20" role="alert">
        <p>{{ store.error }}</p><button class="mt-4 min-h-11 text-teal underline dark:text-tealSoft" type="button" @click="store.load">Try again</button>
      </div>
      <resume-timeline v-else-if="store.data?.entries.length" ref="timeline" :entries="store.data.entries" :copy="copy" />
      <p v-else-if="store.data" class="px-5 py-20 text-muted dark:text-gray-300">The journey is being written. Check back soon.</p>
      <resume-skills v-if="site.showSkills" id="skills" ix="skills" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { DocumentArrowDownIcon } from '@heroicons/vue/24/outline';
import { useSiteStore } from '@/stores/site.store';
import { useTimelineStore } from '@/stores/resume.store';
import { useVisibilityObserver } from '@/composables/visibilityObserver';
import ResumeSkills from './Skills/ResumeSkills.vue';
import ResumeTimeline from './Timeline/ResumeTimeline.vue';
const site = useSiteStore(), store = useTimelineStore();
const resumeSection = ref<HTMLDivElement | null>(null);
const { isActive } = useVisibilityObserver('theResume', resumeSection);
const timeline = ref<InstanceType<typeof ResumeTimeline> | null>(null);
const cvUrl = `${import.meta.env.VITE_APP_BACKEND_URL ?? ''}/api/resume/cv/`;
const copy = computed(() => store.data?.copy ?? {
  heading: 'Experience leading products and teams.',
  intro: 'From engineering foundations to leading products and people.',
  closing_heading: 'Still building.', closing_body: 'New problems, the same curiosity.',
});
onMounted(() => { void store.load(); });
</script>
