import { describe, expect, it } from "vitest";
import type { TimelineEntry } from "@/models/models.interface";
import { createJourneyPath, distanceAtY, journeySpacing } from "./journeyPath";
describe("journey scroll mapping", () => {
  it("advances monotonically through long loops and reaches each marker exactly", () => {
    const stops = [
      { y: 0, distance: 0 },
      { y: 100, distance: 100 },
      { y: 500, distance: 1100 },
      { y: 900, distance: 1550 },
    ];
    expect(distanceAtY(stops, -100)).toBe(0);
    expect(distanceAtY(stops, 100)).toBe(100);
    expect(distanceAtY(stops, 500)).toBe(1100);
    expect(distanceAtY(stops, 1000)).toBe(1550);
    let previous = 0;
    for (let y = 0; y < 1000; y += 10) {
      const distance = distanceAtY(stops, y);
      expect(distance).toBeGreaterThanOrEqual(previous);
      previous = distance;
    }
  });
  it("reserves extra room for motifs and keeps alternating compact cards up to 1023px", () => {
    const normal = journeySpacing(390, ["none", "none"]);
    for (const motif of ["loop", "detour", "breakthrough"] as const) {
      const narrow = journeySpacing(320, ["none", motif]);
      const wide = journeySpacing(1280, ["none", motif]);
      expect(narrow.gaps[0]).toBeGreaterThan(normal.gaps[0]);
      expect(narrow.gaps[0]).toBeGreaterThan(wide.gaps[0]);
    }
    expect(journeySpacing(1023, []).compact).toBe(true);
    expect(journeySpacing(1024, []).compact).toBe(false);
  });
});

describe("journey geometry", () => {
  it.each([390, 1024, 1440, 2400])("never backtracks on plain approaches at %ipx", (width) => {
    const compact = width < 1024;
    const entries = [0, 1].map(i => ({ uuid: `entry-${i}`, transition_motif: "breakthrough" }) as TimelineEntry);
    const { gaps } = journeySpacing(width, ["none", "breakthrough"]);
    const boxes = compact
      ? [{ left: 54, right: width - 23, top: 150, bottom: 450 },
        { left: 23, right: width - 54, top: 450 + gaps[0], bottom: 750 + gaps[0] }]
      : [{ left: width * .05, right: width * .36, top: 150, bottom: 450 },
        { left: width * .64, right: width * .95, top: 450 + gaps[0], bottom: 750 + gaps[0] }];
    // Only coordinates matter here; browser tests verify native arc lengths.
    const route = createJourneyPath(boxes, entries, width, d => d.length);
    for (let i = 1; i < route.samples.length; i++) {
      expect(route.samples[i].x).toBeGreaterThanOrEqual(route.samples[i - 1].x - 1e-7);
      expect(route.samples[i].y).toBeGreaterThanOrEqual(route.samples[i - 1].y - 1e-7);
    }
    expect(route.future).toBe(`M ${route.today.x} ${route.endY} L ${route.today.x} ${route.endY + 112}`);
  });
});

describe('loop approaches', () => {
  it.each([320, 390, 768, 1023, 1024, 1440, 2400])('turns continuously into either side of a loop at %ipx', width => {
    for (let seed = 0; seed < 7; seed++) {
      const entries = [0, 1, 2].map(i => ({ uuid: `loop-${seed}-${i}`, transition_motif: 'loop' }) as TimelineEntry);
      const { compact, gaps } = journeySpacing(width, ['none', 'loop', 'loop']);
      const inset = (width - Math.min(width - 46, 700)) / 2;
      const cardWidth = Math.max(250, width * .9 * .34);
      let top = 150;
      const boxes = entries.map((_, i) => {
        const left = compact ? inset + (i % 2 ? 0 : 31) : i % 2 ? width * .95 - cardWidth : width * .05;
        const box = { left, right: left + (compact ? width - 2 * inset - 31 : cardWidth), top, bottom: top + 300 };
        top = box.bottom + gaps[i];
        return box;
      });
      const route = createJourneyPath(boxes, entries, width, d => d.length);
      for (let i = 1; i < entries.length; i++) {
        const dir = Math.sign(route.points[i].x - route.points[i - 1].x);
        const span = route.samples.filter(p => p.distance >= route.points[i - 1].distance && p.distance <= route.points[i].distance);
        // The lead-in ends when the line first travels upward around the lobe.
        const end = span.findIndex((p, j) => j > 0 && p.y < span[j - 1].y - 1e-7);
        expect(end).toBeGreaterThan(3);
        let reverseTurn = 0;
        for (let j = 1; j < end - 1; j++) {
          const a = span[j - 1], b = span[j], c = span[j + 1];
          const ux = b.x - a.x, uy = b.y - a.y, vx = c.x - b.x, vy = c.y - b.y;
          reverseTurn += Math.max(0, dir * Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy));
        }
        // A tangent-only join used to counter-turn by 4–7 degrees here.
        expect(reverseTurn).toBeLessThan(1e-5);
      }
    }
  });
});
