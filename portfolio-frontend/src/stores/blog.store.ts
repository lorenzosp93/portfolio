import { defineStore } from "pinia";
import { useBlogLimitOffset } from "@/composables/LimitOffset";
import backendService from "@/services/api.service";
import type { BlogPost } from "@/models/models.interface";
import { computed, ref } from "vue";

const TTL_MINUTES = 1440;

export const useBlogStore = defineStore("blog", () => {
  const { data, getLimitOffsetEntries } = useBlogLimitOffset("blog");
  // A deep-linked post that may not be on the first page yet.
  const linkedPost = ref<BlogPost | null>(null);

  const getBlogEntries = (limit: number) =>
    getLimitOffsetEntries(limit, TTL_MINUTES);

  const posts = computed(() => {
    const results = data.value.results;
    const linked = linkedPost.value;
    if (!linked || results.some((post) => post.uuid === linked.uuid)) return results;
    return [linked, ...results];
  });
  const total = computed(() => data.value.count);

  async function loadLinkedPost(slug: string): Promise<BlogPost | null> {
    const cached = data.value.results.find((post) => post.slug === slug);
    if (cached) return cached;
    const response = await backendService.loadBlogPostBySlug(slug);
    linkedPost.value = response.data.results[0] ?? null;
    return linkedPost.value;
  }

  return { posts, total, getBlogEntries, loadLinkedPost };
});
