<template>
  <div ref="root">
    <resume-panel
      :dataLoaded="skillStore.data.length > 0"
      :isLoading="isLoading"
      :ix="ix"
    >
      <template v-slot:content>
        <ol
          v-if="skillStore.data.length > 0"
          class="relative mx-10 my-1 flex flex-wrap"
        >
          <h1
            class="dark:text-white text-xl font-semibold capitalize pt-2 md:hidden"
          >
            Skills
          </h1>
          <div
            v-for="col in 4"
            :key="col"
            class="flex-[100%] md:flex-[50%] lg:flex-[25%] max-w-full md:max-w-[50%] lg:max-w-[25%] px-2.5 h-fit"
          >
            <skills-category
              class="my-5"
              v-for="category in skillStore.data.filter(
                (_, idx) =>
                  idx % (breakpoint == 'md' ? 1 : breakpoint == 'lg' ? 2 : 4) ==
                  col - 1
              )"
              :key="category.name"
              v-bind="category"
              :isActive="isActive"
            >
            </skills-category>
          </div>
        </ol>
      </template>
    </resume-panel>
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints } from "@/composables/breakpoint";
import ResumePanel from "../../UI/Panels/ResumePanel.vue";
import SkillsCategory from "./SkillsCategory.vue";
import { watch, ref, Ref } from "vue";
import { useSkillStore } from "@/stores/resume.store";
import { useVisibilityObserver } from "@/composables/visibilityObserver";

const isLoading = ref(false);

const root: Ref<HTMLDivElement | null> = ref(null);
const { isActive } = useVisibilityObserver("skills", root);

const breakpoint = useBreakpoints();
const skillStore = useSkillStore();

defineProps<{
  ix: string;
}>();

watch(isActive, (val) => {
  if (val && !skillStore.data.length && !isLoading.value) {
    isLoading.value = true;
    skillStore.getEntries().then(() => {
      isLoading.value = false;
    });
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
