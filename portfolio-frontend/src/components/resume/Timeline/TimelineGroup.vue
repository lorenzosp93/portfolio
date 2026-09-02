<template>
  <div
    class="my-4 mx-3 justify-start rounded-2xl bg-surface/70 shadow-sm ring-1 ring-ink/10 dark:bg-nightElevated/70 dark:text-gray-300 dark:ring-white/10 sm:mx-5 lg:ml-10 z-1"
  >
    <span
      class="flex absolute -translate-x-1/2 mt-3 left-0 justify-center items-center h-7 lg:w-10 aspect-square rounded-full bg-paper ring-4 ring-paper dark:bg-night dark:ring-night"
    >
      <img
        class="object-contain rounded-full shadow-lg ring-1 ring-ink/10 dark:ring-white/10"
        :src="entityPicture"
        :alt="entityName + 'logo'"
      />
    </span>
    <h3
      class="flex items-center mx-4 pt-4 align-text-bottom text-base font-semibold text-ink dark:text-white sm:mx-5 sm:text-lg"
    >
      {{ entityName }}
    </h3>
    <ol v-if="group" class="pb-0.5">
      <timeline-entry
        v-for="(entry, entryIndex) in group.childs"
        :key="entry.uuid"
        v-bind="entry"
        :isActive="isActive"
        :isFirstEntry="isFirstGroup && entryIndex === 0"
      />
    </ol>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TimelineEntry from "./TimelineEntry.vue";
export default defineComponent({
  name: "TimelineGroup",
  components: { TimelineEntry },
  data() {
    return {};
  },
  computed: {
    entityName() {
      return this.group?.name;
    },
    entityPicture() {
      return this.group?.picture;
    },
  },
  props: {
    groupKey: String,
    group: Object,
    kind: { type: String, default: "" },
    isActive: Boolean,
    isFirstGroup: Boolean,
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
