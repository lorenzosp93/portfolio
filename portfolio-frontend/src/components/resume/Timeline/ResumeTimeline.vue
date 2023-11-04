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
          class="relative border-l border-gray-200 dark:border-gray-600 ml-5 lg:ml-10 py-[1px]"
        >
          <h1
            class="dark:text-white text-xl font-semibold px-5 pt-2 capitalize md:hidden"
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
            class="h-10 w-10 bg-gray-200 dark:bg-gray-600 shadow-md rounded-full mx-auto stroke-1 fill-gray-500 dark:fill-white animate-bounce cursor-pointer"
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
