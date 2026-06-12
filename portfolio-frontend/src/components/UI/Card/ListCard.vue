<template>
  <div
    @click="toggleDetails"
    class="group overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-ink/10 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-teal/30 dark:bg-nightSurface dark:ring-white/10"
    :class="{ 'pointer-events-none': detailsVisible }"
  >
    <img
      class="aspect-video w-full object-cover transition duration-300 group-hover:scale-102.5"
      :src="picture"
      :alt="'Picture for ' + name"
    />
    <div class="w-full border-b border-ink/10 bg-sand/70 p-4 text-lg text-ink dark:border-white/10 dark:bg-nightElevated dark:text-white">
      <p class="text-xs font-medium uppercase tracking-wide text-coral dark:text-coralSoft">{{ location }}{{ status }}</p>
      <h2 class="mt-1 w-full text-xl font-semibold tracking-tight text-ink dark:text-white">
        {{ name }}
      </h2>
    </div>
    <div class="relative">
      <div
        v-html="truncatedContent"
        class="list-card-content max-h-64 md:max-h-72 lg:max-h-80 overflow-hidden w-full p-4 text-sm leading-relaxed text-muted dark:text-gray-300"
      />
      <div
        class="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end bg-gradient-to-t from-surface via-surface/90 to-transparent p-4 pt-10 dark:from-nightSurface dark:via-nightSurface/90"
      >
        <span
          class="rounded-full bg-sand/95 px-2 py-0.5 text-sm font-bold leading-none tracking-wide text-coral shadow-sm ring-1 ring-coral/20 dark:bg-nightElevated/95 dark:text-coralSoft dark:ring-coralSoft/20"
        >
          •••
        </span>
      </div>
    </div>
    <blog-entry-detail
      v-if="type == 'blog' && isActive"
      :isOpen="detailsVisible"
      @card-closed="toggleDetails"
      :name="name"
      :created_at="created_at"
      :created_by="created_by"
      :location="location"
      :picture="picture"
      :content="content"
      :attachments="attachments"
    />
    <project-entry-detail
      v-if="type == 'project' && isActive"
      :isOpen="detailsVisible"
      @card-closed="toggleDetails"
      :name="name"
      :location="location"
      :picture="picture"
      :content="content"
      :status="status"
      :attachments="attachments"
    />
  </div>
</template>

<script setup lang="ts">
import { marked } from "marked";
import BlogEntryDetail from "../../blog/BlogEntryDetail.vue";
import ProjectEntryDetail from "../../resume/Projects/ProjectEntryDetail.vue";
import { computed, inject, ref } from "vue";
import type { Attachment, CreatedBy } from "@/models/models.interface";

const detailsVisible = ref(false);

const props = defineProps<{
  type?: string;
  uuid: string;
  name: string;
  created_at?: Date | string;
  created_by?: CreatedBy;
  location?: string;
  picture: string;
  content: string;
  status?: string;
  attachments: Attachment[];
  isActive: boolean;
}>();
const truncationAmount: (() => number) | undefined = inject("truncationAmount");

const truncatedContent = computed(() => {
  return marked.parse(props.content ?? "", { breaks: true });
});

function toggleDetails() {
  detailsVisible.value = !detailsVisible.value;
}
</script>

<style scoped>
.list-card-content :deep(p) {
  margin: 0;
}

.list-card-content :deep(p + p) {
  margin-top: 0.5rem;
}

.list-card-content :deep(ul),
.list-card-content :deep(ol) {
  margin: 0.5rem 0 0;
  padding-left: 1.25rem;
}

.list-card-content :deep(ul) {
  list-style: disc;
}

.list-card-content :deep(ol) {
  list-style: decimal;
}

.list-card-content :deep(li) {
  margin: 0.15rem 0;
}

.list-card-content :deep(a) {
  @apply text-coral dark:text-coralSoft;
}
</style>