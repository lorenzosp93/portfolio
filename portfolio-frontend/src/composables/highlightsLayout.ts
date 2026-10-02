export const HIGHLIGHTS_PIN_TOP = 88;

// Explore and the navigation link must land at the same animation start.
// Never stop before the navbar reaches its sticky position.
export function highlightsScrollTop(): number | null {
  const scene = document.querySelector<HTMLElement>('.leadership-scene');
  if (!scene) return null;
  const pinTop = Number(scene.dataset.pinTop ?? HIGHLIGHTS_PIN_TOP);
  const start = scene.dataset.scrollStart;
  const destination = start !== undefined ? Number(start)
    : window.scrollY + scene.getBoundingClientRect().top - pinTop;
  const hero = document.getElementById('the-hero');
  const stickyStart = hero ? window.scrollY + hero.getBoundingClientRect().bottom : 0;
  return Math.max(destination, stickyStart);
}
