import { defineStore } from "pinia";
import { useBlogLimitOffset } from "@/composables/LimitOffset";
import { computed, ref } from "vue";

const TTL_MINUTES = 1440;

export const useBlogStore = defineStore("blog", () => {
  const { data, getLimitOffsetEntries } = useBlogLimitOffset("blog");

  const getBlogEntries = (limit: number) =>
    getLimitOffsetEntries(limit, TTL_MINUTES);

  const posts = computed(() => data.value.results);
  const total = computed(() => data.value.count);

  return { posts, total, getBlogEntries };
});
