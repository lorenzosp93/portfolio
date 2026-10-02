<template>
  <section v-if="site.highlightCards.length" id="the-leadership" ref="root" class="leadership-section scroll-mt-20 px-5 py-16 sm:px-8">
    <div ref="scene" class="leadership-scene mx-auto w-full max-w-6xl">
      <header class="mb-8">
        <p v-if="site.highlightsEyebrow" class="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-teal dark:text-tealSoft">{{ site.highlightsEyebrow }}</p>
        <h2 class="max-w-2xl text-2xl font-bold leading-tight sm:text-3xl">{{ site.highlightsHeading }}</h2>
      </header>
      <div ref="cardsRoot" class="leadership-cards grid gap-5 lg:grid-cols-3">
        <article v-for="(card, index) in site.highlightCards" :key="card.id" class="leadership-card portfolio-card p-6 shadow-lg" :class="{ 'portfolio-card--coral': card.icon === 'users' }">
          <div class="mb-6 flex items-center justify-between">
            <span class="leadership-icon inline-flex rounded-2xl bg-tealSoft/40 p-3 text-teal dark:bg-teal/20 dark:text-tealSoft">
              <component :is="icons[card.icon] || Square3Stack3DIcon" class="h-6 w-6" aria-hidden="true" />
            </span>
            <span class="text-xs text-muted dark:text-gray-400" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
          </div>
          <h3 class="mb-4 text-xl font-semibold leading-snug">{{ card.title }}</h3>
          <div class="prose prose-sm max-w-none leading-relaxed text-muted dark:prose-invert dark:text-gray-300" v-html="renderMarkdown(card.body)" />
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { useSiteStore } from '@/stores/site.store';
import { renderMarkdown } from '@/composables/markdown';
import { useVisibilityObserver } from '@/composables/visibilityObserver';
import { Square3Stack3DIcon, GlobeAltIcon, UserGroupIcon } from '@heroicons/vue/24/outline';
import type { MatchMedia } from 'gsap';

const site = useSiteStore();
const icons = { layers: Square3Stack3DIcon, globe: GlobeAltIcon, users: UserGroupIcon };
const root = ref<HTMLDivElement | null>(null);
const scene = ref<HTMLDivElement | null>(null);
const cardsRoot = ref<HTMLDivElement | null>(null);
useVisibilityObserver('theLeadership', root);
let media: MatchMedia | undefined;
let generation = 0;
let disposed = false;

async function animate() {
  const current = ++generation;
  media?.revert();
  await nextTick();
  if (!root.value || !scene.value || !cardsRoot.value) return;
  // Keep the initial page small; the animation module is loaded after mount.
  const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
  if (disposed || current !== generation) return;
  gsap.registerPlugin(ScrollTrigger);
  media = gsap.matchMedia();
  media.add({ desktop: '(min-width: 1024px)', compact: '(max-width: 1023px)', reduced: '(prefers-reduced-motion: reduce)' }, (context) => {
    const container = cardsRoot.value;
    const element = scene.value;
    if (!container || !element || !context.conditions) return;
    const cards = Array.from(container.querySelectorAll<HTMLElement>('.leadership-card'));
    const { desktop, reduced } = context.conditions;
    if (reduced || cards.length < 2) return;
    const height = Math.max(...cards.map(card => card.offsetHeight));
    const headingHeight = (element.querySelector('header')?.getBoundingClientRect().height ?? 0) + 32;
    // Long CMS copy, zoom, and short landscape windows retain the normal flow.
    if (height + headingHeight + 64 > window.innerHeight - 72) return;
    container.classList.add('is-animated');
    container.style.height = `${height + 32}px`;
    cards.forEach(card => { card.style.minHeight = `${height}px`; });
    const timeline = gsap.timeline({ scrollTrigger: {
      trigger: element, pin: true, start: 'top 88px',
      end: () => `+=${window.innerHeight * (cards.length - 1) * .9}`,
      scrub: true, invalidateOnRefresh: true,
    }});
    cards.forEach((card, index) => {
      gsap.set(card, { zIndex: index + 1 });
      if (index === 0) return;
      timeline.fromTo(card, { y: window.innerHeight + 60 }, { y: desktop ? 0 : index * 12, duration: 1, ease: 'none' }, index - 1);
      if (!desktop) timeline.to(cards[index - 1], { scale: .975, y: (index - 1) * 12 - 8, duration: 1, ease: 'none' }, index - 1);
    });
    timeline.to({}, { duration: .35 });
    return () => {
      container.classList.remove('is-animated');
      container.style.removeProperty('height');
      cards.forEach(card => card.style.removeProperty('min-height'));
    };
  });
}
watch(() => site.highlightCards, () => { void animate().catch(() => { media?.revert(); }); });
// Re-evaluate available reading space after viewport height changes as well.
let resizeTimer: ReturnType<typeof setTimeout>;
function resize() { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { void animate().catch(() => { media?.revert(); }); }, 200); }
onMounted(() => { void animate().catch(() => { media?.revert(); }); window.addEventListener('resize', resize); });
onBeforeUnmount(() => { disposed = true; generation++; clearTimeout(resizeTimer); window.removeEventListener('resize', resize); media?.revert(); });
</script>

<style scoped>
.leadership-section { position: relative; }

.leadership-card--coaching .leadership-icon { @apply bg-coralSoft/40 text-coral dark:bg-coral/20 dark:text-coralSoft; }
.is-animated { position: relative; }
.is-animated .leadership-card { grid-area: 1 / 1; transform-origin: center top; }
@media (min-width: 1024px) {
  .is-animated .leadership-card:nth-child(2) { grid-area: 1 / 2; }
  .is-animated .leadership-card:nth-child(3) { grid-area: 1 / 3; }
}
@media (max-width: 1023px) {
  .leadership-scene { max-width: 34rem; }
}
</style>
