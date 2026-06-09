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
        <p
          class="text-xs sm:text-sm font-normal text-muted dark:text-gray-300 sm:order-last sm:mb-0 float-right pt-1"
        >
          {{ start_date__date }} — {{ end_date__date }}
        </p>
        <p class="font-semibold text-ink dark:text-white">
          {{ name }}
        </p>
        <p class="text-xs sm:text-sm text-teal dark:text-tealSoft">
          {{ location }}
        </p>
      </div>
      <div
        class="p-2 flex text-xs sm:text-sm font-normal text-ellipsis text-muted bg-paper/70 rounded-xl shadow-sm dark:bg-night dark:text-gray-300 after:content-['_⏎'] after:ml-auto after:mt-auto after:text-coral"
        v-html="truncatedDescription"
      />
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
    truncatedDescription() {
      return marked.parse(
        this.description.slice(0, this.truncationAmount()) +
          (this.truncationAmount() < this.description.length ? "... " : " ")
      );
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>