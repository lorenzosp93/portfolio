<template>
  <div ref="root" class="site-background" aria-hidden="true">
    <div class="background-cloud cloud-teal" />
    <div class="background-cloud cloud-coral" />
    <div class="background-cloud cloud-amber" />
  </div>
</template>
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
const root = ref<HTMLElement | null>(null);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
let frame = 0;
function draw() {
  frame = 0;
  const speeds = window.innerWidth < 1024 ? [.12, .075, .04] : [.18, .105, .055];
  root.value?.querySelectorAll<HTMLElement>('.background-cloud').forEach((cloud, index) => {
    cloud.style.backgroundPosition = `0 ${reduced.matches ? 0 : -window.scrollY * speeds[index] * 1.5}px`;
  });
}
function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
onMounted(() => {
  draw();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  reduced.addEventListener('change', schedule);
});
onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  window.removeEventListener('scroll', schedule);
  window.removeEventListener('resize', schedule);
  reduced.removeEventListener('change', schedule);
});
</script>
<style scoped>
.site-background { position: fixed; inset: 0; z-index: -1; pointer-events: none; }
.background-cloud { position: absolute; inset: 0; opacity: .7; background-repeat: repeat-y; background-size: 100% 1100px; }
.cloud-teal { background-image: radial-gradient(ellipse 380px 290px at 2% 270px, #d5e9df 0%, #e4eee3 40%, transparent 76%); }
.cloud-coral { background-image: radial-gradient(ellipse 360px 300px at 98% 430px, #f7dfd2 0%, #fae9dd 40%, transparent 78%); }
.cloud-amber { background-image: radial-gradient(ellipse 280px 240px at 55% 780px, #f5ebc8 0%, transparent 78%); opacity: .55; }
:global(.dark .site-background .cloud-teal) { opacity: .28; background-image: radial-gradient(ellipse 380px 290px at 2% 270px, #183c36 0%, #122b2d 40%, transparent 76%); }
:global(.dark .site-background .cloud-coral) { opacity: .28; background-image: radial-gradient(ellipse 360px 300px at 98% 430px, #442b32 0%, #2a202a 40%, transparent 78%); }
:global(.dark .site-background .cloud-amber) { opacity: .18; background-image: radial-gradient(ellipse 280px 240px at 55% 780px, #3c3420 0%, transparent 78%); }
@media (max-width: 1023px) { .cloud-amber { display: none; } }
</style>
