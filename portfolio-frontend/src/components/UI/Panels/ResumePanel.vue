<template>
  <div
    class="m-auto rounded-lg md:max-w-xl lg:max-w-4xl xl:max-w-6xl shadow-md bg-white dark:bg-gray-900 py-1 mx-auto no-scrollbar border-2 dark:border-gray-900 border-white max-w-[99%] overflow-y-scroll"
    style="max-height: 95vh; max-height: 95svh"
    @touchstart="onTouchStart"
    ref="innerScroll"
  >
    <div class="mx-auto">
      <div
        class="absolute top-1/2 -translate-y-1/2 -right-2.5 md:hidden"
        :class="{ hidden: ix == 'last' }"
      >
        <div
          class="w-10 p-0.5 rounded-lg cursor-grab active:cursor-grabbing bg-gray-300 rotate-90"
        />
      </div>
      <slot name="content"> </slot>
      <loading-card v-if="isLoading" />
      <retry-button
        v-else-if="!dataLoaded"
        @load-entries="$emit('loadEntries')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import LoadingCard from "../Card/LoadingCard.vue";
import RetryButton from "../Buttons/RetryButton.vue";
import { type Ref, ref, onMounted } from "vue";
import { useEventListener } from "@vueuse/core";

defineProps<{
  ix: string;
  dataLoaded: boolean;
  isLoading: boolean;
}>();
defineEmits(["loadEntries"]);

const innerScroll: Ref<HTMLDivElement | null> = ref(null);
let startY = 0;
let startX = 0;
let scrollY = 0;
let innerHeight = innerScroll.value?.scrollHeight ?? 0;
let visibleHeight = innerScroll.value?.offsetHeight ?? 0;

const onTouchStart = (e: TouchEvent) => {
  startY = e.touches[0].pageY;
  startX = e.touches[0].pageX;
  innerHeight = innerScroll.value?.scrollHeight ?? 0;
  visibleHeight = innerScroll.value?.offsetHeight ?? 0;
  scrollY = innerScroll.value?.scrollTop ?? 0;
};

const onTouchMove = (e: TouchEvent) => {
  const touchY = e.touches[0].pageY;
  const touchX = e.touches[0].pageX;
  const scrollDeltaY = touchY - startY;
  const scrollDeltaX = touchX - startX;
  const up = scrollDeltaY > 0;

  if (
    (scrollY === 0 && up) ||
    (scrollY + visibleHeight >= innerHeight && !up)
  ) {
    e.preventDefault();
    window.scrollBy({
      top: -scrollDeltaY,
      left: scrollDeltaX,
      behavior: "instant",
    });
  }
};

onMounted(() => {
  useEventListener(innerScroll, "touchmove", onTouchMove, {
    passive: false,
  });
});
</script>
