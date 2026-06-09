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
        class="bottom-sheet__backdrop bg-ink/10 backdrop-blur-md dark:bg-night/50"
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
        <div class="bottom-sheet__pan bg-gradient-to-br from-sand via-surface to-tealSoft/40 dark:from-nightElevated dark:via-nightSurface dark:to-teal/20" ref="pan">
          <div class="bottom-sheet__bar bg-teal dark:bg-tealSoft" />
          <header class="mt-auto border-b border-ink/10 p-4 dark:border-white/10">
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
        <div class="bottom-sheet__content-wrap bg-surface dark:bg-nightSurface">
          <div
            style="min-height: 40vh; min-height: 40svh"
            class="bottom-sheet__content min-h-[40vh] lg:min-h-[70vh] bg-surface dark:bg-nightSurface"
            :style="{ height: contentH }"
            ref="content"
            @scroll="handleContentScroll"
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
        </div>
      </article>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import { nextTick, onBeforeUnmount, onMounted, Ref, ref, watch } from "vue";
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
const upwardDragLimit = -72;
const closeThreshold = 150;
const openAnimationDurationMs = 400;
const scrollNudgeBufferMs = 120;
const hasNudgedContent = ref(false);
const isNudgingContent = ref(false);
let nudgeTimer: ReturnType<typeof window.setTimeout> | null = null;

function init() {
  if (card.value && pan.value) {
    drag.value?.applyBounds({ maxY: 0, minY: upwardDragLimit });
    cardP.value = 0;
    cardH.value = card.value.clientHeight;
    contentH.value = `${cardH.value - pan.value.clientHeight}px`;
    if (!initiated.value) {
      initiated.value = true;
      const tl = gsap.timeline();
      tl.from(card.value, {
        y: cardH.value,
        opacity: 0,
        duration: openAnimationDurationMs / 1000,
        ease: "power3",
      }).from(backdrop.value, { opacity: 0, duration: 0.3 }, 0);
      timeline.value = tl;
      let startY = 0;
      const dr = Draggable.create(card.value, {
        type: "y",
        trigger: pan.value,
        bounds: {
          maxY: 0,
          minY: upwardDragLimit,
        },
        liveSnap: (value) => {
          return value < upwardDragLimit ? upwardDragLimit : value;
        },
        edgeResistance: 0.65,
        autoScroll: 0,
        onPress: () => {
          startY = drag.value?.pointerY ?? 0;
          gsap.killTweensOf(card.value);
        },
        onDragStart: () => {
          moving.value = true;
        },
        onDragEnd: () => {
          moving.value = false;
          const endY = drag.value?.pointerY ?? startY;
          const deltaY = startY - endY;
          if (deltaY < -closeThreshold) {
            close(deltaY);
            return;
          }
          gsap.to(card.value, {
            y: 0,
            duration: 0.22,
            ease: "power2.out",
          });
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
  clearNudgeTimer();
  hasNudgedContent.value = false;
  init();
  opened.value = true;
  scheduleContentNudge();
  emit("cardOpened");
}

function close(deltaY: number | null) {
  if (opened.value) {
    clearNudgeTimer();
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

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function hasOverflow(el: HTMLElement) {
  return el.scrollHeight > el.clientHeight + 2;
}

function handleContentScroll() {
  if (!isNudgingContent.value) {
    hasNudgedContent.value = true;
  }
}

function maybeNudgeContent() {
  const el = content.value;
  if (!opened.value || !el || hasNudgedContent.value || prefersReducedMotion() || !hasOverflow(el)) {
    return;
  }

  hasNudgedContent.value = true;
  isNudgingContent.value = true;
  const startTop = el.scrollTop;
  const nudgeTop = Math.min(startTop + 18, el.scrollHeight - el.clientHeight);

  el.scrollTo({ top: nudgeTop, behavior: "smooth" });
  window.setTimeout(() => {
    el.scrollTo({ top: startTop, behavior: "smooth" });
  }, 220);
  window.setTimeout(() => {
    isNudgingContent.value = false;
  }, 700);
}

function scheduleContentNudge() {
  nudgeTimer = window.setTimeout(() => {
    nextTick(maybeNudgeContent);
  }, openAnimationDurationMs + scrollNudgeBufferMs);
}

function clearNudgeTimer() {
  if (nudgeTimer) {
    window.clearTimeout(nudgeTimer);
    nudgeTimer = null;
  }
}

function maybeNudgeContentAfterRender() {
  if (opened.value && !hasNudgedContent.value) {
    clearNudgeTimer();
    scheduleContentNudge();
  }
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
  clearNudgeTimer();
  timeline.value?.kill();
  drag.value?.kill();
});

onMounted(() => {
  useEventListener("keyup", (event) => {
    if (event.key == "Escape") {
      close(null);
    }
  });
  useEventListener("resize", maybeNudgeContentAfterRender);
});
</script>

<style scoped>
.bottom-sheet {
  z-index: 100;
  position: relative;
  overscroll-behavior: none !important;
}
.bottom-sheet__content-wrap {
  position: relative;
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
.opened .bottom-sheet__backdrop {
  visibility: visible;
}
.closed .bottom-sheet__backdrop {
  visibility: hidden;
  transition-delay: 0.45s;
}
.bottom-sheet__card {
  width: 100%;
  position: fixed;
  border-radius: 14px 14px 0 0;
  left: 50%;
  z-index: 101;
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