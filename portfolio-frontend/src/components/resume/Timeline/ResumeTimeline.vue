<template>
  <div ref="root">
    <resume-panel
      @load-entries="loadEntries()"
      :ix="ix"
      :dataLoaded="store.entities.length > 0"
      :isLoading="isLoading"
    >
      <template v-slot:content>
        <ol
          v-if="store.entities.length > 0"
          class="relative ml-5 border-l border-teal/20 py-[1px] dark:border-tealSoft/20 lg:ml-10"
        >
          <h1
            class="px-5 pt-2 text-xl font-semibold capitalize text-ink dark:text-white md:hidden"
          >
            {{ kind }}
          </h1>
          <timeline-group
            v-for="entity in store.entities"
            :key="entity.uuid"
            :kind="kind"
            :groupKey="entity.uuid"
            :group="entity"
            :isActive="isActive"
          />
          <div
            v-if="store.results.length < store.total && !isLoading"
            @click="loadEntries()"
            class="mx-auto h-10 w-10 cursor-pointer rounded-full bg-tealSoft fill-teal shadow-md stroke-1 animate-bounce dark:bg-teal/30 dark:fill-tealSoft"
          >
            <chevron-double-down-icon
              class="h-5 absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2"
            ></chevron-double-down-icon>
          </div>
        </ol>
      </template>
    </resume-panel>
  </div>
</template>

<script setup lang="ts">
import TimelineGroup from "./TimelineGroup.vue";
import ResumePanel from "../../UI/Panels/ResumePanel.vue";
import { ChevronDoubleDownIcon } from "@heroicons/vue/24/outline";
import { Ref, computed, inject, ref, watch } from "vue";
import { useEducationStore, useExperienceStore } from "@/stores/resume.store";
import { useVisibilityObserver } from "@/composables/visibilityObserver";

const props = defineProps<{
  kind: string;
  ix: string;
}>();

const isLoading = ref(false);

const root: Ref<HTMLDivElement | null> = ref(null);
const observer = computed(() => {
  return useVisibilityObserver(props.kind, root);
});

const isActive = computed(() => {
  return observer.value?.isActive.value;
});

const entriesLimit: () => number = inject("entriesLimit", () => 5);

const emit = defineEmits(["loadComplete"]);

const store = computed(() => {
  return props.kind === "education"
    ? useEducationStore()
    : useExperienceStore();
});

watch(isActive, (val) => {
  if (val) {
    if (!store.value.entities.length && !isLoading.value) {
      isLoading.value = true;
      store.value.getLimitOffsetEntries(entriesLimit()).then(() => {
        isLoading.value = false;
      });
    }
  }
});

function loadEntries() {
  isLoading.value = true;
  store.value.getLimitOffsetEntries(entriesLimit()).then(() => {
    isLoading.value = false;
    emit("loadComplete");
  });
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>