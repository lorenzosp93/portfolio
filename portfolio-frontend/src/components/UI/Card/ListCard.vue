<template>
  <div
    @click="toggleDetails"
    class="rounded-xl shadow-md dark:bg-gray-600 bg-white cursor-pointer"
    :class="{ 'pointe-events-none': detailsVisible }"
  >
    <img
      class="object-cover aspect-video w-full overflow-hidden rounded-t-2xl pb-1 border-b-2 border-gray-300"
      :src="picture"
      :alt="'Picture for ' + name"
    />
    <div class="flex flex-wrap p-3 w-full text-lg text-black dark:text-white">
      <p class="text-xs w-full text-gray-400">{{ location }}{{ status }}</p>
      <h2 class="font-semibold w-full text-gray-900 dark:text-white">
        {{ name }}
      </h2>
      <div
        v-html="truncatedContent"
        class="text-sm my-3 w-full text-ellipsis text-gray-500 dark:text-gray-300 after:content-['_⏎'] after:text-gray-400"
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
