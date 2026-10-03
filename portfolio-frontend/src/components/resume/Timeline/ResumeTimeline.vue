<template>
  <div
    ref="world"
    class="journey-world"
    :class="{ 'is-narrow': compact, 'is-ready': ready, 'is-static': reduced }"
  >
    <div class="journey-background" aria-hidden="true">
      <template v-for="(_, i) in entries" :key="i">
        <div
          class="journey-haze"
          :class="{ warm: i % 2 }"
          :style="{ top: `${hazeTop(i)}px` }"
        />
      </template>
    </div>
    <div v-if="layout" class="journey-years" aria-hidden="true">
      <span
        v-for="milestone in yearMilestones"
        :key="milestone.year"
        class="journey-year"
        :class="{
          'is-right': milestone.index % 2,
          'journey-current-year': milestone.today,
        }"
        :style="{
          top: `${milestone.today ? milestone.y + 24 : milestone.y - (compact ? 157 : 190)}px`,
        }"
      >
        {{ milestone.year }}
      </span>
    </div>
    <svg
      v-if="layout"
      class="journey-route"
      :width="width"
      :height="height"
      :viewBox="`0 0 ${width} ${height}`"
      aria-hidden="true"
    >
      <path class="journey-past" :d="layout.past" />
      <path
        ref="ink"
        class="journey-inkline"
        :d="layout.d"
        :stroke-dasharray="layout.length"
        :stroke-dashoffset="layout.length"
      />
      <path class="journey-tail" :d="layout.future" />
      <g
        v-for="(effect, i) in layout.effects"
        :key="`effect-${i}`"
        class="journey-obstacle"
        :data-effect="effect.type"
      >
        <template v-if="effect.type === 'breakthrough'">
          <rect
            class="barrier-piece"
            :x="effect.x - 4"
            :y="effect.y - 22"
            width="8"
            height="22"
            rx="2"
          />
          <rect
            class="barrier-piece"
            :x="effect.x - 4"
            :y="effect.y"
            width="8"
            height="22"
            rx="2"
          />
        </template>
        <rect
          v-else
          :x="effect.x - 20"
          :y="effect.y - 36"
          width="40"
          height="72"
          rx="5"
        />
      </g>
      <g v-for="(point, i) in layout.points" :key="entries[i].uuid">
        <path
          class="journey-connector"
          :d="`M ${point.x} ${point.y} L ${point.edge} ${point.y}`"
        />
        <g class="journey-station" :data-distance="point.distance">
          <rect
            v-if="entries[i].kind === 'education'"
            class="journey-node"
            :x="point.x - 6"
            :y="point.y - 6"
            width="12"
            height="12"
            :transform="`rotate(45 ${point.x} ${point.y})`"
          />
          <circle
            v-else
            class="journey-node"
            :cx="point.x"
            :cy="point.y"
            r="7"
          />
        </g>
      </g>
      <g class="journey-today">
        <circle
          class="journey-node"
          :cx="layout.today.x"
          :cy="layout.today.y"
          r="7"
        />
        <text
          class="journey-date"
          :x="layout.today.x + 14"
          :y="layout.today.y + 4"
        >
          Today
        </text>
      </g>
      <circle ref="tip" class="journey-tip" r="7" />
    </svg>
    <ol
      class="journey-rows"
      aria-label="Experience and education, oldest first"
    >
      <li
        v-for="(entry, i) in entries"
        :key="`${entry.kind}-${entry.uuid}`"
        class="journey-row"
        :data-kind="entry.kind"
        :data-motif="motifFor(entry, i)"
        @focusin="revealFocused(i)"
        @focusout="clearFocused"
      >
        <aside
          v-if="entry.narrative_heading || entry.narrative_body"
          class="journey-story"
        >
          <h3 v-if="entry.narrative_heading" class="type-card-title">{{ entry.narrative_heading }}</h3>
          <p v-if="entry.narrative_body" class="type-body">{{ entry.narrative_body }}</p>
        </aside>
        <journey-card :entry="entry" />
      </li>
    </ol>
    <div ref="outro" class="journey-outro" tabindex="-1">
      <h3 v-if="copy.closing_heading" class="type-detail-title">{{ copy.closing_heading }}</h3>
      <p v-if="copy.closing_body" class="type-body">{{ copy.closing_body }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
/* global defineExpose */
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from "vue";
import { useEventListener, useMediaQuery } from "@vueuse/core";
import type { ResumeTimeline, TimelineEntry } from "@/models/models.interface";
import {
  clamp,
  createJourneyPath,
  distanceAtY,
  journeySpacing,
  motifFor,
  pointAtDistance,
} from "@/composables/journeyPath";
import JourneyCard from "./JourneyCard.vue";

const props = defineProps<{
  entries: TimelineEntry[];
  copy: ResumeTimeline["copy"];
}>();
const world = ref<HTMLDivElement | null>(null);
const ink = ref<SVGPathElement | null>(null),
  tip = ref<SVGCircleElement | null>(null),
  outro = ref<HTMLDivElement | null>(null);
const layout = shallowRef<ReturnType<typeof createJourneyPath> | null>(null);
const currentYear = new Date().getFullYear().toString();
// A year belongs to its first station, including the current year.
const yearMilestones = computed(() => {
  const route = layout.value;
  if (!route) return [];
  const seen = new Set<string>();
  const milestones = props.entries.flatMap((entry, index) => {
    const year = entry.start_date.slice(0, 4);
    if (seen.has(year)) return [];
    seen.add(year);
    return [
      {
        year,
        index,
        y: route.points[index].y,
        distance: route.points[index].distance,
        today: false,
      },
    ];
  });
  if (seen.has(currentYear)) return milestones;
  return [
    ...milestones,
    {
      year: currentYear,
      index: props.entries.length - 1,
      y: route.today.y,
      distance: route.length,
      today: true,
    },
  ];
});
const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
const compact = ref(false),
  ready = ref(false),
  width = ref(0),
  height = ref(0);
let observer: ResizeObserver | null = null,
  frame = 0,
  layoutFrame = 0,
  disposed = false,
  focusIndex = -1;
let signature = "";
let rows: HTMLElement[] = [],
  stations: Element[] = [],
  connectors: Element[] = [],
  effects: Element[] = [],
  ending: Element[] = [],
  years: HTMLElement[] = [],
  hazes: HTMLElement[] = [];
let jumpFrame = 0;

async function measure() {
  layoutFrame = 0;
  const el = world.value;
  if (!el || !props.entries.length) return;
  width.value = el.clientWidth;
  compact.value = width.value < 1024;
  await nextTick();
  if (disposed) return;
  rows = Array.from(el.querySelectorAll<HTMLElement>(".journey-row"));
  const cards = Array.from(el.querySelectorAll<HTMLElement>(".journey-card"));
  rows.forEach((row) => observer?.observe(row));
  const nextSignature = `${width.value}:${cards.map((c) => c.offsetHeight)}:${rows.map((r) => r.offsetHeight)}`;
  if (signature === nextSignature && layout.value) return;
  signature = nextSignature;
  const { gaps } = journeySpacing(width.value, props.entries.map(motifFor));
  rows.forEach((row, i) =>
    row.style.setProperty("--journey-gap", `${gaps[i]}px`),
  );
  const boxes = cards.map((card) => {
    let left = 0,
      top = 0,
      node: HTMLElement | null = card;
    while (node && node !== el) {
      left += node.offsetLeft;
      top += node.offsetTop;
      node = node.offsetParent as HTMLElement | null;
    }
    return {
      left,
      right: left + card.offsetWidth,
      top,
      bottom: top + card.offsetHeight,
    };
  });
  const ruler = document.createElementNS("http://www.w3.org/2000/svg", "path");
  layout.value = createJourneyPath(boxes, props.entries, width.value, (d) => {
    ruler.setAttribute("d", d);
    return ruler.getTotalLength();
  });
  height.value = el.offsetHeight;
  await nextTick();
  if (disposed) return;
  years = Array.from(el.querySelectorAll<HTMLElement>(".journey-year"));
  hazes = Array.from(el.querySelectorAll<HTMLElement>(".journey-haze"));
  stations = Array.from(el.querySelectorAll(".journey-station"));
  connectors = Array.from(el.querySelectorAll(".journey-connector"));
  effects = Array.from(el.querySelectorAll(".journey-obstacle"));
  ending = Array.from(
    el.querySelectorAll(".journey-tail,.journey-today,.journey-outro"),
  );
  update();
  ready.value = true;
}
function scheduleLayout() {
  if (!layoutFrame)
    layoutFrame = requestAnimationFrame(() => {
      void measure();
    });
}
function hazeTop(index: number) {
  return clamp(
    (layout.value?.points[index]?.y ?? 250) - 250,
    0,
    Math.max(0, height.value - 500),
  );
}
function update() {
  frame = 0;
  const route = layout.value,
    el = world.value;
  if (!route || !el || !ink.value) return;
  const readingY = window.innerHeight * 0.52 - el.getBoundingClientRect().top;
  const focusedDistance =
    focusIndex >= 0 ? (route.points[focusIndex]?.distance ?? 0) : 0;
  const traveled = reduced.value
    ? route.length
    : Math.max(distanceAtY(route.stops, readingY), focusedDistance);
  const complete = traveled >= route.length - 0.1;
  ink.value.style.strokeDashoffset = String(route.length - traveled);
  const point = pointAtDistance(route.samples, traveled);
  tip.value?.setAttribute("cx", String(point.x));
  tip.value?.setAttribute("cy", String(point.y));
  if (tip.value)
    tip.value.style.opacity =
      reduced.value || complete || traveled === 0 ? "0" : "1";
  rows.forEach((row, i) => {
    const reached = traveled + 0.1 >= route.points[i].distance;
    row.classList.toggle("is-reached", reached);
    row.classList.toggle("is-keyboard-focused", i === focusIndex);
    stations[i]?.classList.toggle("is-reached", reached);
    connectors[i]?.classList.toggle("is-reached", reached);
  });
  effects.forEach((effect, i) => {
    effect.classList.toggle(
      "is-near",
      traveled >= route.effects[i].distance - 100,
    );
    effect.classList.toggle(
      "is-broken",
      !reduced.value && traveled >= route.effects[i].distance,
    );
  });
  years.forEach((year, i) => {
    const milestone = yearMilestones.value[i];
    year.classList.toggle(
      "is-reached",
      reduced.value ||
        (milestone.today ? complete : traveled >= milestone.distance - 160),
    );
    const drift =
      reduced.value || milestone.today
        ? 0
        : clamp((readingY - milestone.y) * 0.22, -75, 100);
    year.style.transform = `translateY(${drift}px)`;
  });
  ending.forEach((node) => node.classList.toggle("is-reached", complete));
  // Animate small, feathered surfaces, not a document-height filtered layer.
  // This avoids oversized compositing tiles and clipped blur edges in iOS Safari.
  hazes.forEach((haze, i) => {
    const home = hazeTop(i);
    const drift = reduced.value
      ? 0
      : clamp((readingY - route.points[i].y) * 0.3, -120, 120);
    const bounded = clamp(drift, -home, Math.max(0, height.value - home - 500));
    haze.style.transform = `translateY(${bounded}px)`;
  });
}
function scheduleUpdate() {
  if (!frame) frame = requestAnimationFrame(update);
}
function revealFocused(index: number) {
  focusIndex = index;
  update();
}
function clearFocused() {
  focusIndex = -1;
  scheduleUpdate();
}
function cancelJump() {
  cancelAnimationFrame(jumpFrame);
  jumpFrame = 0;
}
function jumpToToday() {
  cancelJump();
  const target = outro.value;
  if (!target) return;
  clearFocused();
  const start = window.scrollY;
  const end = clamp(
    start +
      target.getBoundingClientRect().top +
      target.offsetHeight / 2 -
      window.innerHeight / 2,
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  const finish = () => target.focus({ preventScroll: true });
  if (reduced.value) {
    window.scrollTo({ top: end, behavior: "instant" });
    finish();
    return;
  }
  // A deliberate journey at roughly 700px/s, with a gentle start and landing.
  const duration = clamp(Math.abs(end - start) / 0.7, 1800, 12000);
  const began = performance.now();
  const advance = (now: number) => {
    const t = clamp((now - began) / duration);
    const eased = t * t * (3 - 2 * t);
    window.scrollTo({
      top: start + (end - start) * eased,
      behavior: "instant",
    });
    if (t < 1) jumpFrame = requestAnimationFrame(advance);
    else {
      jumpFrame = 0;
      finish();
    }
  };
  jumpFrame = requestAnimationFrame(advance);
}
function interruptJourney() {
  cancelJump();
  clearFocused();
}
defineExpose({ jumpToToday });
useEventListener(window, "scroll", scheduleUpdate, { passive: true });
useEventListener(
  window,
  "resize",
  () => {
    interruptJourney();
    scheduleLayout();
  },
  { passive: true },
);
useEventListener(window, "wheel", interruptJourney, { passive: true });
useEventListener(window, "touchstart", interruptJourney, { passive: true });
useEventListener(window, "pointerdown", cancelJump, { passive: true });
useEventListener(window, "keydown", (event) => {
  if (
    [
      "Escape",
      "ArrowDown",
      "ArrowUp",
      "PageDown",
      "PageUp",
      "Home",
      "End",
      " ",
      "Tab",
    ].includes(event.key)
  )
    cancelJump();
});
watch(reduced, () => {
  cancelJump();
  scheduleUpdate();
});
watch(
  () => props.entries,
  () => {
    signature = "";
    scheduleLayout();
  },
  { deep: true },
);
onMounted(() => {
  observer = new ResizeObserver(scheduleLayout);
  if (world.value) observer.observe(world.value);
  void document.fonts?.ready.then(() => {
    if (!disposed) scheduleLayout();
  });
  scheduleLayout();
});
onBeforeUnmount(() => {
  disposed = true;
  cancelJump();
  observer?.disconnect();
  cancelAnimationFrame(frame);
  cancelAnimationFrame(layoutFrame);
});
</script>

<style src="./journey.css"></style>
