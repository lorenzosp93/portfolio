<template>
  <Teleport to="body">
    <div
      class="bottom-sheet shadow-xl"
      :class="{
        opened: opened,
        closed: opened === false,
        moving: moving,
      }"
      style="pointer-events: all"
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
        class="bottom-sheet__card fx-default overflow-hidden bg-surface shadow-2xl ring-1 ring-ink/10 dark:bg-nightSurface dark:ring-white/10 md:max-w-lg lg:max-w-2xl"
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
        <div class="bottom-sheet__pan bg-sand/80 dark:bg-nightElevated" ref="pan">
          <div class="bottom-sheet__bar bg-teal dark:bg-tealSoft" />
          <header class="mt-auto border-b border-ink/10 bg-gradient-to-br from-sand via-surface to-tealSoft/40 p-4 dark:border-white/10 dark:from-nightElevated dark:via-nightSurface dark:to-teal/20">
            <div
              class="text-md text-muted dark:text-gray-300 sm:order-last sm:ml-auto"
            >
              <slot name="extra-title-content">Extra title content</slot>
            </div>
            <div>
              <div class="text-2xl font-semibold text-ink dark:text-white">
                <slot name="title">Some title for the card</slot>
              </div>
              <div class="text-md text-muted dark:text-gray-300 pb-auto">
                <slot name="subtitle"
                  >A subtitle for the card. This should be somewhat longer</slot
                >
              </div>
            </div>
          </header>
        </div>
        <div
          style="min-height: 40vh; min-height: 40svh"
          class="bottom-sheet__content min-h-[40vh] lg:min-h-[70vh] bg-surface dark:bg-nightSurface"
          :style="{ height: contentH }"
          ref="content"
        >
          <div
            class="container my-3 text-sm text-ink dark:text-gray-100 px-auto"
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
        edgeResistance: 0,
        autoScroll: 0,
        onPress: () => {
          startY = drag.value?.pointerY ?? 0;
        },
        onDragEnd: () => {
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
  box-sizing: border-box;
}
.bottom-sheet__card.stripe {
  padding-bottom: 15px;
}
.bottom-sheet__card.fx-default {
  transform: translate(-50%, 0);
}
.bottom-sheet__pan {
  padding-bottom: 0;
  padding-top: 12px;
}
.bottom-sheet__bar {
  display: block;
  width: 35px;
  height: 3px;
  border-radius: 14px;
  margin: 0 auto 8px;
  cursor: grab;
}
.bottom-sheet__bar:active {
  cursor: grabbing;
}
.opened {
  visibility: visible;
}
.closed {
  visibility: hidden;
  transition-delay: 0.45s;
}
.moving .bottom-sheet__card {
  transition: none;
}
</style>