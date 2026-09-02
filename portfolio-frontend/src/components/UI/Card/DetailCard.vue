<template>
  <Teleport to="body">
    <div
      class="bottom-sheet shadow-xl"
      :class="{
        opened: opened,
        closing: closing,
        closed: opened === false && closing === false,
        moving: moving,
      }"
      style="pointer-events: all"
      ref="bottomSheet"
    >
      <div
        class="bottom-sheet__backdrop bg-gradient-to-b from-ink/15 to-ink/35 dark:from-night/45 dark:to-night/75"
        ref="backdrop"
        @click="handleClickOnBottomSheet"
        @wheel.prevent="() => {}"
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
          { height: expandedCardHeight ? `${expandedCardHeight}px` : 'auto' },
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
        <div
          class="bottom-sheet__content-wrap bg-surface dark:bg-nightSurface"
          :class="{
            'can-scroll-up': canScrollUp,
            'can-scroll-down': canScrollDown,
          }"
        >
          <div
            style="min-height: 40vh; min-height: 40svh"
            class="bottom-sheet__content min-h-[40vh] lg:min-h-[70vh] bg-surface dark:bg-nightSurface"
            :style="{ height: contentH }"
            ref="content"
            @scroll.passive="updateScrollAffordances"
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
import { InertiaPlugin } from "gsap/InertiaPlugin";

gsap.registerPlugin(Draggable, InertiaPlugin);

const card: Ref<HTMLElement | null> = ref(null);
const content: Ref<HTMLElement | null> = ref(null);
const bottomSheet: Ref<HTMLElement | null> = ref(null);
const pan: Ref<HTMLElement | null> = ref(null);
const backdrop: Ref<HTMLElement | null> = ref(null);

const initiated = ref(false);
const maxHeight = ref(85);
const expandedCardHeight = ref<number | null>(null);
const isExpanded = ref(false);
const opened = ref(false);
const closing = ref(false);
const moving = ref(false);
const canScrollUp = ref(false);
const canScrollDown = ref(false);
const cardP: Ref<number | null> = ref(null);
const cardH: Ref<number | null> = ref(null);

const drag: Ref<Draggable | null> = ref(null);
const timeline: Ref<GSAPTimeline | null> = ref(null);
let velocityTracker: { get: (property: string) => number } | null = null;

const contentH = ref("auto");
const paddingBottom = ref(12);
const upwardDragLimit = -72;
const closeThreshold = 150;
const minCloseDuration = 0.16;
const maxCloseDuration = 0.42;
const openAnimationDurationMs = 400;
let previousBodyOverscrollBehavior = "";
let isBodyScrollLocked = false;

function lockBodyScroll() {
  if (isBodyScrollLocked) return;
  previousBodyOverscrollBehavior = document.body.style.overscrollBehavior;
  document.body.style.overscrollBehavior = "none";
  isBodyScrollLocked = true;
}

function unlockBodyScroll() {
  if (!isBodyScrollLocked) return;
  document.body.style.overscrollBehavior = previousBodyOverscrollBehavior;
  isBodyScrollLocked = false;
}

function getDownwardDragLimit() {
  return Math.max(closeThreshold * 1.5, (cardH.value ?? 0) * 0.75);
}

function updateDragBounds() {
  drag.value?.applyBounds({ maxY: getDownwardDragLimit(), minY: upwardDragLimit });
}

function getExpandedCardHeight(dragY: number) {
  const initialHeight = cardH.value ?? 0;
  const availableHeight = Math.max(getViewportHeight() - initialHeight, 0);
  const pullDistance = Math.max(-dragY, 0);
  const resistedPull = pullDistance * 0.55;
  return Math.min(initialHeight + resistedPull, initialHeight + availableHeight);
}

function getContentHeight(cardHeight: number) {
  return Math.max(cardHeight - (pan.value?.clientHeight ?? 0), 0);
}

function setContentHeight(cardHeight: number) {
  contentH.value = `${getContentHeight(cardHeight)}px`;
  nextTick(updateScrollAffordances);
}

function updateScrollAffordances() {
  const el = content.value;
  if (!el) {
    canScrollUp.value = false;
    canScrollDown.value = false;
    return;
  }

  const maxScrollTop = Math.max(el.scrollHeight - el.clientHeight, 0);
  canScrollUp.value = el.scrollTop > 1;
  canScrollDown.value = el.scrollTop < maxScrollTop - 1;
}

function getViewportHeight() {
  return window.visualViewport?.height ?? window.innerHeight;
}

function resetExpansion(animate = false) {
  if (!isExpanded.value || !card.value || !cardH.value) return;

  const cardElement = card.value;
  maxHeight.value = 100;
  gsap.set(cardElement, { y: 0 });

  if (!animate) {
    gsap.set(cardElement, { height: cardH.value });
    setContentHeight(cardH.value);
    expandedCardHeight.value = cardH.value;
    isExpanded.value = false;
    maxHeight.value = 85;
    return;
  }

  gsap.to(cardElement, {
    height: cardH.value,
    duration: 0.34,
    ease: "elastic.out(1, 0.65)",
    overwrite: "auto",
    onComplete: () => {
      expandedCardHeight.value = cardH.value;
      isExpanded.value = false;
      setContentHeight(cardH.value ?? 0);
      maxHeight.value = 85;
    },
  });
  if (content.value) {
    gsap.to(content.value, {
      height: getContentHeight(cardH.value),
      duration: 0.34,
      ease: "elastic.out(1, 0.65)",
      overwrite: "auto",
    });
  }
}

function getCloseDuration(currentY: number, velocityY: number) {
  const remainingDistance = Math.max((cardH.value ?? 0) - currentY, 0);
  const downwardVelocity = Math.max(velocityY, 0);
  const fallbackVelocity = remainingDistance / maxCloseDuration;
  const effectiveVelocity = Math.max(downwardVelocity, fallbackVelocity, 1);

  return gsap.utils.clamp(
    minCloseDuration,
    maxCloseDuration,
    remainingDistance / effectiveVelocity
  );
}

function getBackdropCloseDuration(cardCloseDuration: number) {
  return gsap.utils.clamp(0.1, 0.18, cardCloseDuration * 0.55);
}

function init() {
  if (card.value && pan.value) {
    cardP.value = 0;
    cardH.value = card.value.clientHeight;
    expandedCardHeight.value = cardH.value;
    isExpanded.value = false;
    setContentHeight(cardH.value);
    updateDragBounds();

    if (!velocityTracker) {
      velocityTracker = InertiaPlugin.track(card.value, "y")[0];
    }

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

      const dr = Draggable.create(card.value, {
        type: "y",
        trigger: pan.value,
        bounds: {
          maxY: getDownwardDragLimit(),
          minY: upwardDragLimit,
        },
        liveSnap: (value) => {
          return value < upwardDragLimit ? upwardDragLimit : value;
        },
        edgeResistance: 0.85,
        autoScroll: 0,
        onPress: () => {
          gsap.killTweensOf(card.value);
        },
        onDragStart: () => {
          moving.value = true;
        },
        onDrag: function (this: Draggable) {
          if (this.y < 0) {
            maxHeight.value = 100;
            const nextCardHeight = getExpandedCardHeight(this.y);
            isExpanded.value = true;
            expandedCardHeight.value = nextCardHeight;
            setContentHeight(nextCardHeight);
            gsap.set(card.value, { y: 0 });
            return;
          }

          resetExpansion();
          const opacity = gsap.utils.clamp(0, 1, 1 - Math.max(this.y, 0) / closeThreshold);
          gsap.set(backdrop.value, { opacity });
        },
        onDragEnd: function (this: Draggable) {
          moving.value = false;
          const currentY = this.y;
          const velocityY = velocityTracker?.get("y") ?? 0;

          if (isExpanded.value) {
            resetExpansion(true);
            return;
          }

          if (currentY > closeThreshold) {
            close({ currentY, velocityY });
            return;
          }

          gsap.to(card.value, {
            y: 0,
            duration: 0.22,
            ease: "power3.out",
            overwrite: "auto",
          });
          gsap.to(backdrop.value, {
            opacity: 1,
            duration: 0.18,
            ease: "power2.out",
            overwrite: "auto",
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
  lockBodyScroll();
  closing.value = false;
  init();
  opened.value = true;
  nextTick(updateScrollAffordances);
  emit("cardOpened");
}

type DragCloseState = {
  currentY: number;
  velocityY: number;
};

function close(dragState: DragCloseState | null) {
  if (opened.value) {
  unlockBodyScroll();
  closing.value = true;
    resetExpansion();
    if (dragState != null) {
      const closeDuration = getCloseDuration(
        dragState.currentY,
        dragState.velocityY
      );
      const backdropCloseDuration = getBackdropCloseDuration(closeDuration);
      const tl = gsap.timeline();
      tl.to(card.value, {
        y: cardH.value ?? 0,
        opacity: 0,
        duration: closeDuration,
        ease: "power1.out",
        overwrite: "auto",
      }).to(
        backdrop.value,
        {
          opacity: 0,
          duration: backdropCloseDuration,
          ease: "power2.out",
          overwrite: "auto",
        },
        0
      );
      tl.eventCallback("onComplete", function (this: typeof tl) {
        closing.value = false;
        this.kill();
      });
    } else {
      timeline.value?.eventCallback("onReverseComplete", () => {
        closing.value = false;
      });
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

function releaseActiveDrag() {
  if (!drag.value?.isPressed) return;

  // Let Draggable run its normal onDragEnd callback so the card either closes
  // or returns to its resting position.
  drag.value.endDrag();
}

function handleWindowMouseOut(event: MouseEvent) {
  // A null related target means the pointer left the browser window, rather
  // than simply moving between elements within the page.
  if (event.relatedTarget === null) {
    releaseActiveDrag();
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
  unlockBodyScroll();
  timeline.value?.kill();
  drag.value?.kill();
  if (card.value) {
    InertiaPlugin.untrack(card.value, "y");
  }
  velocityTracker = null;
});

onMounted(() => {
  useEventListener("keyup", (event) => {
    if (event.key == "Escape") {
      close(null);
    }
  });
  useEventListener("resize", () => {
    updateDragBounds();
    nextTick(updateScrollAffordances);
  });
  useEventListener(window, "mouseout", handleWindowMouseOut);
  useEventListener(window, "blur", releaseActiveDrag);
  useEventListener(document, "visibilitychange", () => {
    if (document.hidden) {
      releaseActiveDrag();
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
.bottom-sheet__content-wrap {
  position: relative;
  overflow: hidden;
}
.bottom-sheet__content-wrap::before,
.bottom-sheet__content-wrap::after {
  content: "";
  position: absolute;
  z-index: 1;
  right: 0;
  left: 0;
  height: 18px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 140ms ease-out;
}
.bottom-sheet__content-wrap::before {
  top: 0;
  background: linear-gradient(to bottom, rgb(15 23 42 / 0.14), transparent);
}
.bottom-sheet__content-wrap::after {
  bottom: 0;
  background: linear-gradient(to top, rgb(15 23 42 / 0.18), transparent);
}
.bottom-sheet__content-wrap.can-scroll-up::before,
.bottom-sheet__content-wrap.can-scroll-down::after {
  opacity: 1;
}
.dark .bottom-sheet__content-wrap::before,
.dark .bottom-sheet__content-wrap::after {
  filter: opacity(0.55);
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
@media (min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .bottom-sheet__backdrop {
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
  }
}
.opened .bottom-sheet__backdrop,
.closing .bottom-sheet__backdrop {
  visibility: visible;
}
.closed .bottom-sheet__backdrop {
  visibility: hidden;
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
