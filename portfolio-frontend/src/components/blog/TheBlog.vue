<template>
  <section
    ref="root"
    class="min-h-[45vh] lg:min-h-[50vh] w-full relative flex flex-wrap mx-auto my-[25vh]"
  >
    <div class="flex flex-wrap mx-auto my-10">
      <h2
        class="w-full mt-auto text-center text-xl font-bold text-gray-600 dark:text-white"
      >
        Thoughts from the blog.
      </h2>
      <p class="w-full mb-auto text-center text-gray-600 dark:text-gray-300">
        Who needs MySpace when you can create your own blog and write whatever
        comes to mind on it, right?
      </p>
      <PushSubscribe class="mx-auto dark:fill-white" />
    </div>
    <ArrowScroller @end="loadEntries" :scroll-container="blogContainer" />
    <div
      class="relative flex overflow-x-scroll no-scrollbar snap-x snap-proximity h-full w-full scroll-smooth px-[12.5%] md:px-[33.3%] lg:px-32 py-5 gap-x-5"
      id="blog-container"
      ref="blogContainer"
    >
      <list-card
        type="blog"
        class="blog-card w-full lg:w-[30%] snap-center flex-none mx-auto"
        v-for="post in blogStore.posts"
        :key="post?.uuid"
        v-bind="post"
        :isActive="isActive"
      />
      <div
        class="snap-center relative w-10 h-10 p-6 my-auto mx-10 flex bg-white dark:bg-gray-900 shadow-md container flex-none rounded-full"
        v-if="isLoading"
      >
        <svg
          role="status"
          class="absolute left-1 top-1 w-10 h-10 text-gray-100 animate-spin dark:text-gray-400 fill-gray-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
      </div>
      <retry-button
        v-else-if="!blogStore.posts.length"
        @load-entries="loadEntries"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import ListCard from "../UI/Card/ListCard.vue";
import RetryButton from "../UI/Buttons/RetryButton.vue";
import { Ref, inject, ref, watch } from "vue";
import { useBlogStore } from "@/stores/blog.store";
import { useVisibilityObserver } from "@/composables/visibilityObserver";
import ArrowScroller from "../composables/ArrowScroller.vue";
import PushSubscribe from "./PushSubscribe.vue";

const blogContainer = ref(null);

const isLoading = ref(false);

const root: Ref<HTMLDivElement | null> = ref(null);

const { isActive } = useVisibilityObserver("theBlog", root);

const entriesLimit: () => number = inject("entriesLimit", () => 5);

const blogStore = useBlogStore();

watch(isActive, (val) => {
  if (val && blogStore.posts.length == 0 && !isLoading.value) {
    isLoading.value = true;
    loadEntries();
  }
});

function loadEntries() {
  isLoading.value = true;
  blogStore.getBlogEntries(entriesLimit()).then(() => {
    isLoading.value = false;
  });
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
