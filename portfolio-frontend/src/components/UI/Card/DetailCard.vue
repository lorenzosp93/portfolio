<template>
  <Teleport to="body">
    <div
      class="bottom-sheet shadow-xl"
      :class="{
        opened: opened,
        closed: opened === false,
        moving: moving,
      }"
      style="{'pointer-events': 'all'}"
      ref="bottomSheet"
    >
      <div
        class="backdrop-blur-md bottom-sheet__backdrop"
        ref="backdrop"
        @click="handleClickOnBottomSheet"
        @scroll.prevent="() => {}"
        @touchmove.prevent="() => {}"
      />
      <article
        class="bg-white dark:bg-gray-800 bottom-sheet__card fx-default md:max-w-lg lg:max-w-2xl"
        :style="[
          {
            bottom: cardP + 'px',
            maxHeight: maxHeight + '%',
          },
          { height: 'auto' },
          { 'padding-bottom': paddingBottom + 'px' },
        ]"
        id="detail-card"
        ref="card"
      >
        <div class="bottom-sheet__pan" ref="pan">
          <div class="bottom-sheet__bar bg-gray-300 dark:bg-white" />
          <header class="dark:text-white p-3 mt-auto border-b-2">
            <div
              class="text-gray-400 text-md dark:text-gray-300 sm:ml-auto sm:order-last"
            >
              <slot name="extra-title-content">Extra title content</slot>
            </div>
            <div>
              <div class="text-gray-600 text-2xl font-semibold dark:text-white">
                <slot name="title">Some title for the card</slot>
              </div>
              <div class="text-gray-400 text-md dark:text-gray-300 pb-auto">
                <slot name="subtitle"
                  >A subtitle for the card. This should be somewhat longer</slot
                >
              </div>
            </div>
          </header>
        </div>
        <div
          style="min-height: 40vh; min-height: 40svh"
          class="bottom-sheet__content min-h-[40vh] lg:min-h-[70vh]"
          :style="{ height: contentH }"
          ref="content"
        >
          <div
            class="container my-3 text-sm text-gray-700 dark:text-white px-auto"
          >
            <slot name="inner-content">
              Here goes the main content of the card. Lorem ipsum dolor sit,
              amet consectetur adipisicing elit. Dolorem alias, maiores ad dolor
              cum culpa similique voluptatibus. Molestias laudantium dolorum
              minus eaque minima qui, autem, veritatis earum pariatur,
              accusantium fugit.
            </slot>
          </div>
        </div>
      </article>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import { onBeforeUnmount, onMounted, Ref, ref, watch } from "vue";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";

const card: Ref<HTMLElement | null> = ref(null);
const content: Ref<HTMLElement | null> = ref(null);
const bottomSheet: Ref<HTMLElement | null> = ref(null);
const pan: Ref<HTMLElement | null> = ref(null);
const backdrop: Ref<HTMLElement | null> = ref(null);

const initiated = ref(false);
const maxHeight = ref(85);
const opened = ref(false);
const moving = ref(false);
const cardP: Ref<number | null> = ref(null);
const cardH: Ref<number | null> = ref(null);

const drag: Ref<Draggable | null> = ref(null);
const timeline: Ref<GSAPTimeline | null> = ref(null);

const contentH = ref("auto");
const paddingBottom = ref(12);

function init() {
  if (card.value && pan.value) {
    drag.value?.applyBounds({ maxY: 0, minY: 0 });
    cardP.value = 0;
    cardH.value = card.value.clientHeight;
    contentH.value = `${cardH.value - pan.value.clientHeight}px`;
    if (!initiated.value) {
      initiated.value = true;
      const tl = gsap.timeline();
      tl.from(card.value, {
        y: cardH.value,
        opacity: 0,
        duration: 0.4,
        ease: "power3",
      }).from(backdrop.value, { opacity: 0, duration: 0.3 }, 0);
      timeline.value = tl;
      let startY = 0;
      const dr = Draggable.create(card.value, {
        type: "y",
        trigger: pan.value,
        bounds: {
          maxY: 0,
          minY: 0,
        },
        liveSnap: (value) => {
          return value < 0 ? 0 : value;
        },
        inertia: true,
        edgeResistance: 0,
        autoScroll: 0,
        onPress: () => {
          startY = drag.value?.pointerY ?? 0;
        },
        onDrag: () => {
          let deltaY = startY - (drag.value?.pointerY ?? 0);
          if (deltaY > 0) {
            gsap.set(card.value, {
              "border-bottom": `${deltaY / 5}px solid transparent`,
            });
          }
        },
        onDragEnd: () => {
          gsap.set(card.value, {
            "border-bottom": `0px solid transparent`,
          });
          let deltaY = startY - (drag.value?.pointerY ?? 0);
          if (deltaY < -150) {
            close(deltaY);
          }
        },
      });
      drag.value = dr[0];
    } else {
      timeline.value?.restart();
    }
  }
}

const emit = defineEmits(["cardOpened", "cardClosed"]);

function open() {
  init();
  opened.value = true;
  emit("cardOpened");
}

function close(deltaY: number | null) {
  if (opened.value) {
    document.body.style.overflowY = "";
    if (deltaY != null) {
      const tl = gsap.timeline();
      tl.fromTo(
        card.value,
        { y: -deltaY },
        { y: (cardH?.value ?? 0) - deltaY, opacity: 0, duration: 0.4 }
      ).to(backdrop.value, { opacity: 0, duration: 0.3 }, 0.1);
      tl.eventCallback("onComplete", function (this: typeof tl) {
        this.kill();
      });
    } else {
      timeline.value?.reverse();
    }
    opened.value = false;
    emit("cardClosed");
  }
}

function handleClickOnBottomSheet(event: MouseEvent) {
  let target = event.target as HTMLElement;
  close(null);
  event.stopPropagation();
}

const props = defineProps<{
  isOpen: boolean;
}>();

watch(
  () => props.isOpen,
  (val: boolean) => {
    if (val) {
      open();
    } else {
      close(null);
    }
  }
);

onBeforeUnmount(() => {
  timeline.value?.kill();
  drag.value?.kill();
});

onMounted(() => {
  useEventListener("keyup", (event) => {
    if (event.key == "Escape") {
      close(null);
    }
  });
});
</script>

<style scoped>
.bottom-sheet * {
  box-sizing: content-box;
}
.bottom-sheet {
  z-index: 100;
  position: relative;
  overscroll-behavior: none !important;
}
.bottom-sheet__content {
  overflow-y: scroll;
  overscroll-behavior: contain !important;
}
.bottom-sheet__backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  opacity: 1;
  visibility: hidden;
}
.bottom-sheet__card {
  width: 100%;
  position: fixed;
  border-radius: 14px 14px 0 0;
  left: 50%;
  z-index: 100;
  margin: 0 auto;
}
.bottom-sheet__card.stripe {
  padding-bottom: 15px;
}
.bottom-sheet__card.fx-default {
  transform: translate(-50%, 0);
}
.bottom-sheet__pan {
  padding-bottom: 8px;
  padding-top: 12px;
}
.bottom-sheet__bar {
  display: block;
  width: 35px;
  height: 3px;
  border-radius: 14px;
  margin: 0 auto;
  cursor: grab;
}
.bottom-sheet__bar:active {
  cursor: grabbing;
}
.opened {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.opened .bottom-sheet__backdrop {
  visibility: visible;
}
</style>
