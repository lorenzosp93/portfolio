<template>
  <div
    @click="openDetails"
    class="tinted-card tinted-card--warm group relative cursor-pointer overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    :class="{ 'pointer-events-none': detailsVisible }"
  >
    <img
      class="aspect-video w-full object-cover transition duration-300 group-hover:scale-102.5"
      :src="picture"
      :alt="'Picture for ' + name"
      loading="lazy"
      decoding="async"
    />
    <div class="list-card-body">
      <div class="w-full p-4 pb-2 text-ink dark:text-white">
        <p class="text-xs font-medium uppercase tracking-wide text-coralInk dark:text-coralSoft">{{ location }}{{ status }}</p>
        <h2 class="type-card-title list-card-title mt-1 w-full tracking-tight text-ink dark:text-white">
          <button ref="opener" type="button" class="text-left" :aria-label="`Open ${name}`" aria-haspopup="dialog" :aria-expanded="detailsVisible" @click.stop="openDetails">{{ name }}</button>
        </h2>
      </div>
      <div class="relative">
        <div
          v-html="truncatedContent"
          class="type-body list-card-content max-h-64 md:max-h-72 lg:max-h-80 overflow-hidden w-full p-4 pt-2 text-muted dark:text-gray-300"
        />
        <div class="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end p-4">
          <span
            class="list-card-more rounded-full px-2 py-0.5 text-sm font-bold leading-none tracking-wide text-coralInk shadow-sm ring-1 ring-coral/20 dark:text-coralSoft dark:ring-coralSoft/20"
          >
            •••
          </span>
        </div>
      </div>
    </div>
    <blog-entry-detail
      v-if="type == 'blog' && detailsMounted"
      :isOpen="detailsVisible"
      @card-closed="closeDetails"
      :name="name"
      :slug="slug"
      :canonical-url="canonical_url"
      :created_at="created_at"
      :created_by="created_by"
      :location="location"
      :picture="picture"
      :content="content"
      :attachments="attachments"
    />
    <project-entry-detail
      v-if="type == 'project' && detailsMounted"
      :isOpen="detailsVisible"
      @card-closed="closeDetails"
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
import { renderMarkdown } from "@/composables/markdown";
import { computed, defineAsyncComponent, ref } from "vue";
import type { Attachment, CreatedBy } from "@/models/models.interface";

const BlogEntryDetail = defineAsyncComponent(
  () => import("../../blog/BlogEntryDetail.vue")
);
const ProjectEntryDetail = defineAsyncComponent(
  () => import("../../resume/Projects/ProjectEntryDetail.vue")
);

const props = defineProps<{
  type?: string;
  uuid: string;
  name: string;
  slug?: string;
  canonical_url?: string;
  openOnMount?: boolean;
  created_at?: Date | string;
  created_by?: CreatedBy;
  location?: string;
  picture: string | null;
  content: string;
  status?: string;
  attachments: Attachment[];
  isActive: boolean;
}>();
const emit = defineEmits<{ (event: "open-change", open: boolean): void }>();

const opener = ref<HTMLButtonElement | null>(null);
const detailsVisible = ref(props.openOnMount ?? false);
const detailsMounted = ref(props.openOnMount ?? false);

const truncatedContent = computed(() => {
  return renderMarkdown(props.content, { breaks: true });
});

function openDetails(event?: MouseEvent) {
  if (event?.target instanceof Element && event.target.closest('a')) return;
  opener.value?.focus({ preventScroll: true });
  detailsMounted.value = true;
  detailsVisible.value = true;
  emit("open-change", true);
}
function closeDetails() {
  detailsVisible.value = false;
  emit("open-change", false);
}
</script>

<style scoped>
/* The picture covers the card's own corner tint, so the text area restarts it. */
.list-card-body {
  background: linear-gradient(155deg, var(--card-tint), transparent 180px);
}

.list-card-content {
  mask-image: linear-gradient(#000 40%, transparent 100%);
}

.list-card-more {
  background: var(--card-surface);
}

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
  @apply text-coralInk dark:text-coralSoft;
}
</style>
