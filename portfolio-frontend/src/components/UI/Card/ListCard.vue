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
    <div class="flex flex-wrap p-4 w-full text-lg text-ink dark:text-white">
      <p class="text-xs font-medium uppercase tracking-wide text-coral dark:text-coralSoft">{{ location }}{{ status }}</p>
      <h2 class="mt-1 w-full text-xl font-semibold tracking-tight text-ink dark:text-white">
        {{ name }}
      </h2>
      <div
        v-html="truncatedContent"
        class="mt-3 w-full text-sm leading-relaxed text-muted dark:text-gray-300 after:content-['_⏎'] after:text-coral"
      />
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
  if (truncationAmount)
    return marked.parse(
      props.content.slice(0, truncationAmount() ?? 0) +
        (truncationAmount() < props.content.length ? "... " : " ")
    );
});

function toggleDetails() {
  detailsVisible.value = !detailsVisible.value;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
