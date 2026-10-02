<template>
  <section
    ref="root"
    class="min-h-[45vh] lg:min-h-[50vh] w-full relative flex flex-wrap mx-auto py-20 md:py-28"
  >
    <div class="flex w-full max-w-7xl flex-col items-center mx-auto mb-8 px-5 md:mb-12">
      <h2 class="section-heading">
        Thoughts from the blog.
      </h2>
      <p class="section-lede px-2">
        Writing about product, engineering, and the systems behind everyday work.
      </p>
      <PushSubscribe class="mt-3 dark:fill-white" />
    </div>
    <div class="relative w-full">
      <ArrowScroller @end="loadEntries" :scroll-container="blogContainer" />
      <div
        class="relative flex items-start overflow-x-scroll overflow-y-hidden no-scrollbar snap-x snap-proximity h-full w-full scroll-smooth px-[12.5%] md:px-[25%] lg:px-16 xl:px-24 py-5 gap-x-5"
        id="blog-container"
        ref="blogContainer"
      >
        <div
          v-for="post in blogStore.posts"
          :key="post?.uuid"
          class="blog-card-shell flex w-full lg:w-[30%] snap-center flex-none mx-auto"
        >
          <list-card
            type="blog"
            class="blog-card w-full"
            v-bind="post"
            :isActive="isActive"
            :open-on-mount="!!linkedSlug && post.slug === linkedSlug"
            @open-change="(open: boolean) => syncPostUrl(open ? post.slug : undefined)"
          />
        </div>
        <retry-button
          v-if="!isLoading && !blogStore.posts.length"
          @load-entries="loadEntries"
        />
      </div>
      <div
        class="pointer-events-none absolute right-5 top-5 z-10 h-12 w-12 rounded-full bg-white shadow-md dark:bg-gray-900"
        v-if="isLoading"
      >
        <svg
          role="status" aria-label="Loading articles"
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
    </div>
  </section>
</template>

<script setup lang="ts">
import ListCard from "../UI/Card/ListCard.vue";
import RetryButton from "../UI/Buttons/RetryButton.vue";
import { Ref, inject, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useBlogStore } from "@/stores/blog.store";
import { useVisibilityObserver } from "@/composables/visibilityObserver";
import ArrowScroller from "../composables/ArrowScroller.vue";
import PushSubscribe from "./PushSubscribe.vue";

const blogContainer = ref<HTMLDivElement | null>(null);

const isLoading = ref(false);

const root: Ref<HTMLDivElement | null> = ref(null);

const { isActive } = useVisibilityObserver("theBlog", root);

const entriesLimit: () => number = inject("entriesLimit", () => 5);

const blogStore = useBlogStore();

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const entranceAnimations = new Map<HTMLElement, Animation>();
let entranceObserver: IntersectionObserver | undefined;
let rowInView = false;
let entrancePlayed = false;

function finishEntrances() {
  entranceAnimations.forEach(animation => animation.cancel());
  entranceAnimations.clear();
}

function playEntrance() {
  const row = blogContainer.value;
  if (!row || !rowInView || entrancePlayed || isLoading.value || !blogStore.posts.length) return;
  entrancePlayed = true;
  entranceObserver?.disconnect();
  if (reducedMotion.matches) return;
  const viewport = row.getBoundingClientRect();
  // Animate only the initial visible batch. Horizontal browsing and pagination
  // must never hide neighboring cards or replay the section entrance.
  const cards = [...row.querySelectorAll<HTMLElement>('.blog-card')].filter(card => {
    const rect = card.getBoundingClientRect();
    return rect.right > viewport.left && rect.left < viewport.right;
  });
  cards.forEach((card, index) => {
    const animation = card.animate([
      { opacity: 0, transform: 'translateY(48px) scale(.97)' },
      { opacity: 1, transform: 'translateY(0) scale(1)' },
    ], { duration: 600, delay: index * 180, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' });
    entranceAnimations.set(card, animation);
    animation.onfinish = () => {
      animation.cancel();
      entranceAnimations.delete(card);
    };
  });
}

function motionPreferenceChanged() {
  if (reducedMotion.matches) finishEntrances();
}

onMounted(() => {
  if (!('IntersectionObserver' in window) || !blogContainer.value) return;
  entranceObserver = new IntersectionObserver(entries => {
    rowInView = entries.some(entry => entry.isIntersecting);
    playEntrance();
  }, { threshold: 0, rootMargin: '0px 0px -48px 0px' });
  entranceObserver.observe(blogContainer.value);
  reducedMotion.addEventListener('change', motionPreferenceChanged);
  blogContainer.value.addEventListener('focusin', finishEntrances);
  blogContainer.value.addEventListener('pointerdown', finishEntrances, { passive: true });
  blogContainer.value.addEventListener('wheel', finishEntrances, { passive: true });
});
watch([() => blogStore.posts.length, isLoading], playEntrance, { flush: 'post' });
onBeforeUnmount(() => {
  entranceObserver?.disconnect();
  finishEntrances();
  reducedMotion.removeEventListener('change', motionPreferenceChanged);
  blogContainer.value?.removeEventListener('focusin', finishEntrances);
  blogContainer.value?.removeEventListener('pointerdown', finishEntrances);
  blogContainer.value?.removeEventListener('wheel', finishEntrances);
});

watch(isActive, (val) => {
  if (val && blogStore.posts.length == 0 && !isLoading.value) {
    void loadEntries();
  }
});

// Deep links: /?post=<slug> opens that post; opening a card updates the URL.
// ListCard reads openOnMount only once, so the slug must be known before the
// linked card renders (the store adds it before loadLinkedPost resolves).
const articlePath = window.location.pathname.match(/^\/writing\/([^/]+)\/?$/);
const linkedSlug = ref(articlePath ? decodeURIComponent(articlePath[1]) : new URLSearchParams(window.location.search).get("post"));

function syncPostUrl(slug?: string) {
  const url = new URL(window.location.href);
  if (articlePath) {
    url.pathname = slug ? `/writing/${encodeURIComponent(slug)}/` : '/';
    url.searchParams.delete('post');
  } else {
    if (slug) url.searchParams.set("post", slug);
    else url.searchParams.delete("post");
  }
  window.history.replaceState(window.history.state, "", url);
}

onMounted(async () => {
  const slug = linkedSlug.value;
  if (!slug) return;
  try {
    const post = await blogStore.loadLinkedPost(slug);
    if (!post) {
      linkedSlug.value = null;
      syncPostUrl();
      return;
    }
    root.value?.scrollIntoView({ block: "start" });
  } catch {
    // Fall back to the normal list if the post can't be fetched.
  }
});

async function loadEntries() {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    await blogStore.getBlogEntries(entriesLimit());
  } catch {
    // The empty state exposes the retry control once loading is cleared.
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* Reserve a consistent preview height so pagination cannot move the page.
   The full title and article remain available in the detail card. */
.blog-card :deep(.list-card-title) {
  min-height: 5.25rem;
  height: 5.25rem;
}
.blog-card :deep(.list-card-title button) {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
.blog-card :deep(.list-card-content) { height: 16rem; }
@media (min-width: 768px) {
  .blog-card :deep(.list-card-content) { height: 18rem; }
}
@media (min-width: 1024px) {
  .blog-card :deep(.list-card-content) { height: 20rem; }
}
</style>
