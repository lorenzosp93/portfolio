<template>
  <div
    class="z-10 absolute w-full top-1/2 hidden md:block mx-auto"
    ref="arrowContainer"
  >
    <div
      v-show="!begin"
      @click="scrollToSibling(false)"
      class="absolute left-2 rounded-full h-10 w-10 shadow-md bg-gray-50 dark:bg-gray-500 hover:bg-gray-100 hover:dark:bg-gray-400 cursor-pointer select-none"
    >
      <chevron-left-icon
        class="w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      ></chevron-left-icon>
    </div>
    <div
      v-show="!end"
      @click="scrollToSibling(true)"
      class="absolute right-2 rounded-full h-10 w-10 shadow-md bg-gray-50 dark:bg-gray-500 hover:dark:bg-gray-400 hover:bg-gray-100 cursor-pointer select-none"
    >
      <chevron-right-icon
        class="w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      ></chevron-right-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/outline";
import { useDebounceFn, useEventListener, useThrottleFn } from "@vueuse/core";
import { watch, ref } from "vue";

const props = defineProps<{
  scrollContainer: HTMLDivElement | null;
}>();
const emit = defineEmits(["end"]);

let begin = ref(true);
let end = ref(false);

function scrollToSibling(next: boolean) {
  let scrollWidth = 0;
  if (props.scrollContainer) {
    scrollWidth = props.scrollContainer.children[0].clientWidth ?? 0;

    if (next) {
      props.scrollContainer.scrollLeft += scrollWidth;
    } else {
      props.scrollContainer.scrollLeft -= scrollWidth;
    }
  }
}

function calculateScrollPosition(target: HTMLDivElement) {
  return useDebounceFn(() => {
    if (target.scrollLeft <= 0) {
      begin.value = true;
    } else {
      begin.value = false;
    }
    if (target.scrollLeft + target.clientWidth >= target.scrollWidth) {
      end.value = true;
      return useThrottleFn(
        () => {
          emit("end");
        },
        1000,
        true
      )();
    } else {
      end.value = false;
    }
  }, 500)();
}

watch(
  () => props.scrollContainer,
  (val) => {
    if (val) {
      calculateScrollPosition(val);
      useEventListener(props.scrollContainer, "scroll", (event) => {
        calculateScrollPosition(event.target as HTMLDivElement);
      });

      useEventListener(
        props.scrollContainer,
        "keydown",
        (event: KeyboardEvent) => {
          if (event.key === "ArrowRight") {
            scrollToSibling(true);
          } else if (event.key === "ArrowLeft") {
            scrollToSibling(false);
          }
        }
      );
    }
  }
);
</script>
