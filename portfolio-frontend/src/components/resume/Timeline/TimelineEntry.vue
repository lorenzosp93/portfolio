<template>
  <li @click="openDetails" class="mx-2 my-2 z-2 sm:mx-3 sm:my-3">
    <span
      class="absolute mt-5 left-0 -translate-x-1/2 ring-4 ring-paper dark:ring-night"
    >
      <div
        class="w-2 lg:w-3 aspect-square rounded-full bg-coral shadow-sm dark:bg-coralSoft"
      ></div>
    </span>
    <div
      class="cursor-pointer rounded-xl bg-paper/45 p-3 ring-1 ring-transparent transition hover:bg-paper/75 hover:ring-teal/30 dark:bg-night/45 dark:hover:bg-night/70 dark:hover:ring-tealSoft/30 sm:p-4"
    >
      <div class="mb-2 flex w-full flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <time
          class="order-2 rounded-full bg-surface/80 px-2.5 py-1 text-[0.68rem] font-normal text-muted ring-1 ring-ink/5 dark:bg-nightSurface dark:text-gray-300 dark:ring-white/10 sm:text-xs"
        >
          {{ start_date__date }} — {{ end_date__date }}
        </time>
        <p class="order-1 min-w-0 flex-1 font-semibold text-ink dark:text-white">
          {{ name }}
        </p>
        <p class="order-3 w-full text-xs text-teal dark:text-tealSoft sm:text-sm">
          {{ location }}
        </p>
      </div>
      <div class="relative border-t border-ink/5 pt-2 dark:border-white/10">
        <div
          ref="descriptionEl"
          class="timeline-description overflow-hidden text-xs font-normal leading-relaxed text-muted dark:text-gray-300 sm:text-sm"
          :class="descriptionHeightClass"
          v-html="renderedDescription"
        />
        <div
          v-if="isDescriptionClipped"
          class="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end bg-gradient-to-t from-paper via-paper/90 to-transparent pt-8 dark:from-night dark:via-night/90"
        >
          <span
            class="rounded-full bg-surface/95 px-2 py-0.5 text-sm font-bold leading-none tracking-wide text-coral shadow-sm ring-1 ring-coral/20 dark:bg-nightSurface/95 dark:text-coralSoft dark:ring-coralSoft/20"
          >
            •••
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
import { defineComponent, nextTick } from "vue";

export default defineComponent({
  name: "TimelineEntry",
  components: { TimelineEntryDetail },
  data() {
    return {
      detailsVisible: false,
      justClosed: false,
      isDescriptionClipped: false,
    };
  },
  computed: {
    renderedDescription() {
      return this.parse(this.description ?? "");
    },
    descriptionHeightClass() {
      return this.isFirstEntry
        ? "max-h-32 sm:max-h-40 md:max-h-48"
        : "max-h-20 sm:max-h-24 md:max-h-28";
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
    updateDescriptionClipState() {
      nextTick(() => {
        const descriptionEl = this.$refs.descriptionEl as HTMLElement | undefined;
        if (!descriptionEl) return;
        this.isDescriptionClipped =
          descriptionEl.scrollHeight > descriptionEl.clientHeight + 1;
      });
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
    isFirstEntry: Boolean,
  },
  updated() {
    this.updateDescriptionClipState();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.updateDescriptionClipState);
  },
  mounted() {
    this.updateDescriptionClipState();
    window.addEventListener("resize", this.updateDescriptionClipState);
  },
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
