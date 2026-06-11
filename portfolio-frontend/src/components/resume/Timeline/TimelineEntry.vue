<template>
  <li @click="openDetails" class="mx-3 my-3 z-2">
    <span
      class="absolute mt-5 left-0 -translate-x-1/2 ring-4 ring-paper dark:ring-night"
    >
      <div
        class="w-2 lg:w-3 aspect-square rounded-full bg-coral shadow-sm dark:bg-coralSoft"
      ></div>
    </span>
    <div
      class="cursor-pointer rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-ink/10 transition hover:ring-teal/30 dark:bg-nightSurface dark:ring-white/10"
    >
      <div class="justify-between items-center mb-3 w-full">
        <time
          class="float-right ml-3 rounded-xl bg-paper/70 px-2.5 py-1 text-xs sm:text-sm font-normal text-muted shadow-sm dark:bg-night dark:text-gray-300 sm:order-last sm:mb-0"
        >
          {{ start_date__date }} — {{ end_date__date }}
        </time>
        <p class="font-semibold text-ink dark:text-white">
          {{ name }}
        </p>
        <p class="text-xs sm:text-sm text-teal dark:text-tealSoft">
          {{ location }}
        </p>
      </div>
      <div class="relative rounded-xl bg-paper/70 shadow-sm dark:bg-night">
        <div
          class="timeline-description max-h-24 overflow-hidden p-2 text-xs sm:text-sm font-normal text-muted dark:text-gray-300"
          v-html="renderedDescription"
        />
        <div
          class="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end rounded-b-xl bg-gradient-to-t from-paper via-paper/90 to-transparent p-2 pt-8 dark:from-night dark:via-night/90"
        >
          <span
            class="rounded-full bg-surface/95 px-2 py-0.5 text-sm font-bold leading-none text-coral shadow-sm ring-1 ring-coral/20 dark:bg-nightSurface/95 dark:text-coralSoft dark:ring-coralSoft/20"
          >
            …
          </span>
        </div>
      </div>
    </div>
    <timeline-entry-detail
      v-if="isActive"
      v-bind="$props"
      :end_date__date="end_date__date"
      :start_date__date="start_date__date"
      @card-closed="closeDetails"
      :open="detailsVisible"
    />
  </li>
</template>

<script lang="ts">
import { marked } from "marked";
import TimelineEntryDetail from "./TimelineEntryDetail.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "TimelineEntry",
  components: { TimelineEntryDetail },
  data() {
    return {
      detailsVisible: false,
      justClosed: false,
    };
  },
  computed: {
    renderedDescription() {
      return this.parse(this.description ?? "");
    },
    start_date__date() {
      let date = new Date(this.start_date);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
    end_date__date() {
      if (this.current) {
        return "Present";
      }
      let date = new Date(this.end_date);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  inject: ["truncationAmount"],
  methods: {
    openDetails() {
      if (!this.justClosed) {
        this.detailsVisible = true;
      }
    },
    closeDetails() {
      this.justClosed = true;
      this.detailsVisible = false;
      setTimeout(() => (this.justClosed = false), 100);
    },
    parse(text: string) {
      return marked.parse(text, { breaks: true });
    },
  },
  props: {
    name: {
      type: String,
      required: true,
    },
    uuid: String,
    start_date: {
      type: String,
      required: true,
    },
    current: Boolean,
    end_date: String,
    location: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      default: "",
    },
    description: String,
    key_achievements: {
      type: String,
      default: "",
    },
    entity: {
      type: Object,
      required: true,
    },
    project: Array,
    keywords: Array,
    attachments: Object,
    isActive: Boolean,
  },
  beforeUnmount() {},
  mounted() {},
});
</script>

<style scoped>
.timeline-description :deep(p) {
  margin: 0;
}

.timeline-description :deep(p + p) {
  margin-top: 0.25rem;
}

.timeline-description :deep(ul),
.timeline-description :deep(ol) {
  margin: 0.25rem 0 0;
  padding-left: 1rem;
}

.timeline-description :deep(ul) {
  list-style: disc;
}

.timeline-description :deep(ol) {
  list-style: decimal;
}

.timeline-description :deep(li) {
  margin: 0.1rem 0;
}

.timeline-description :deep(a) {
  @apply text-coral dark:text-coralSoft;
}
</style>