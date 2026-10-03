<template>
  <article
    class="journey-card"
    :class="`journey-card--${entry.kind}`"
    @click="openDetails"
  >
    <div class="journey-meta type-meta">
      <time :datetime="entry.start_date">{{ startDate }} — {{ endDate }}</time>
    </div>
    <div class="journey-brand">
      <img
        v-if="entry.entity.picture"
        class="journey-logo"
        :src="entry.entity.picture"
        alt=""
        width="44"
        height="44"
        decoding="async"
      />
      <p class="journey-org type-support font-semibold">{{ entry.entity.name }}</p>
    </div>
    <h3 class="type-card-title">{{ entry.name }}</h3>
    <p class="journey-location type-support">
      {{ [entry.department, entry.location].filter(Boolean).join(" · ") }}
    </p>
    <div class="journey-summary type-body" v-html="summary" />
    <button
      ref="opener"
      class="journey-details"
      type="button"
      aria-haspopup="dialog"
      :aria-expanded="detailsVisible"
      :aria-label="`View ${entry.name} details`"
      @click.stop="openDetails"
    >
      <span aria-hidden="true">•••</span>
    </button>
    <timeline-entry-detail
      v-if="detailsMounted"
      v-bind="detailProps"
      :start_date__date="startDate"
      :end_date__date="endDate"
      :open="detailsVisible"
      @card-closed="detailsVisible = false"
    />
  </article>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, ref } from "vue";
import type { TimelineEntry } from "@/models/models.interface";
import { renderMarkdown } from "@/composables/markdown";
const TimelineEntryDetail = defineAsyncComponent(
  () => import("./TimelineEntryDetail.vue"),
);
const props = defineProps<{ entry: TimelineEntry }>();
const detailProps = computed(() => ({
  uuid: props.entry.uuid,
  name: props.entry.name,
  start_date: props.entry.start_date,
  end_date: props.entry.end_date ?? undefined,
  current: props.entry.current,
  description: props.entry.description ?? "",
  key_achievements: props.entry.key_achievements,
  department: props.entry.department,
  location: props.entry.location,
  entity: props.entry.entity,
  keywords: props.entry.keywords,
  project: props.entry.projects,
  attachments: props.entry.attachments,
}));
const date = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
const startDate = computed(() => date(props.entry.start_date));
const endDate = computed(() =>
  props.entry.current
    ? "Present"
    : props.entry.end_date
      ? date(props.entry.end_date)
      : "—",
);
// Clipped previews must not contain offscreen focusable links. Full links live in the Detail Card.
const summary = computed(() =>
  renderMarkdown(
    props.entry.timeline_summary ||
      props.entry.description ||
      props.entry.key_achievements ||
      "",
  )
    .replace(/<\/?a\b[^>]*>/gi, "")
    .replace(/<img\b[^>]*>/gi, ""),
);
const detailsMounted = ref(false),
  detailsVisible = ref(false),
  opener = ref<HTMLButtonElement | null>(null);
async function openDetails() {
  opener.value?.focus({ preventScroll: true });
  detailsMounted.value = true;
  await nextTick();
  detailsVisible.value = true;
}
</script>
