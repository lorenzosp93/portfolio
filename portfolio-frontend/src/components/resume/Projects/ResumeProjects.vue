<template>
  <div ref="root">
    <resume-panel
      :dataLoaded="projectStore.projects.length > 0"
      :ix="ix"
      :isLoading="isLoading"
    >
      <template v-slot:content>
        <ol
          v-if="projectStore.projects.length > 0"
          class="relative mx-10 my-1 flex flex-wrap"
        >
          <h1
            class="dark:text-white text-xl font-semibold capitalize pt-2 md:hidden"
          >
            Projects
          </h1>
          <div
            v-for="col in 4"
            :key="col"
            class="flex-[100%] md:flex-[50%] lg:flex-[25%] max-w-full md:max-w-[50%] lg:max-w-[25%] px-2.5 h-fit"
          >
            <list-card
              type="project"
              class="my-5"
              v-for="project in projectStore.projects.filter(
                (_, idx) =>
                  idx % (breakpoint == 'md' ? 1 : breakpoint == 'lg' ? 2 : 4) ==
                  col - 1
              )"
              :key="project.uuid"
              v-bind="project"
              :isActive="isActive"
            />
          </div>
        </ol>
        <div
          v-if="projectStore.projects.length < projectStore.total && !isLoading"
          @click="loadEntries"
          class="w-10 h-10 bg-gray-200 dark:bg-gray-600 shadow-md rounded-full mx-auto my-3 stroke-1 fill-gray-500 dark:fill-white animate-bounce cursor-pointer"
        >
          <chevron-double-down-icon
            class="h-5 absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2"
          ></chevron-double-down-icon>
        </div>
      </template>
    </resume-panel>
  </div>
</template>

<script setup lang="ts">
import { Ref, inject, ref, watch } from "vue";
import ListCard from "../../UI/Card/ListCard.vue";
import ResumePanel from "../../UI/Panels/ResumePanel.vue";
import { useBreakpoints } from "@/composables/breakpoint";
import { ChevronDoubleDownIcon } from "@heroicons/vue/24/outline";
import { useProjectStore } from "@/stores/resume.store";
import { useVisibilityObserver } from "@/composables/visibilityObserver";

const isLoading = ref(false);

const root: Ref<HTMLDivElement | null> = ref(null);
const { isActive } = useVisibilityObserver("projects", root);

const breakpoint = useBreakpoints();

defineProps<{
  ix: string;
}>();

const entriesLimit: () => number = inject("entriesLimit", () => 5);

const emit = defineEmits(["loadComplete"]);

const projectStore = useProjectStore();

watch(isActive, (val) => {
  if (val && !projectStore.projects.length && !isLoading.value) {
    isLoading.value = true;
    projectStore.getLimitOffsetEntries(entriesLimit()).then(() => {
      isLoading.value = false;
    });
  }
});

function loadEntries() {
  isLoading.value = true;
  projectStore.getLimitOffsetEntries(entriesLimit()).then(() => {
    isLoading.value = false;
    emit("loadComplete");
  });
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
