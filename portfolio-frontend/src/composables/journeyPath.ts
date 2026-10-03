import type { TimelineEntry } from "@/models/models.interface";

export type Motif = "none" | "loop" | "detour" | "breakthrough";
interface Point {
  x: number;
  y: number;
}
export interface PathSample extends Point {
  distance: number;
}
interface Sample extends Point {
  dx: number;
  dy: number;
}
export interface CardBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
}
export interface Station extends Point {
  edge: number;
  distance: number;
}
export interface Stop {
  y: number;
  distance: number;
}
export interface Obstacle extends Point {
  type: "detour" | "breakthrough";
  distance: number;
}
export const clamp = (v: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, v));

export function motifFor(entry: TimelineEntry, index: number): Motif {
  if (!index) return "none";
  if (entry.transition_motif && entry.transition_motif !== "none")
    return entry.transition_motif;
  return index % 4 === 1 ? "loop" : "none";
}

export function journeySpacing(width: number, motifs: Motif[]) {
  const compact = width < 1024;
  const run = compact ? Math.min(width - 46, 700) : width * 0.288 - 50;
  const extra = Math.max(0, 320 - run) * 0.55;
  const gaps = motifs.map((_, i) => {
    if (i === motifs.length - 1) return 130;
    const next = motifs[i + 1];
    const base = { loop: 440, detour: 340, breakthrough: 280, none: 220 }[next];
    return Math.ceil(base + (next === "none" ? 0 : extra));
  });
  return { compact, run, gaps };
}

/** Map scroll through dated stations to arc length, including loops that turn upward. */
export function distanceAtY(stops: Stop[], y: number) {
  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1],
      b = stops[i];
    if (y <= b.y)
      return (
        a.distance + (b.distance - a.distance) * clamp((y - a.y) / (b.y - a.y))
      );
  }
  return stops.at(-1)?.distance ?? 0;
}

/** Interpolate a precomputed arc-length lookup; avoid SVG tessellation on every scroll. */
export function pointAtDistance(
  samples: PathSample[],
  distance: number,
): Point {
  let lo = 0,
    hi = samples.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >>> 1;
    if (samples[mid].distance < distance) lo = mid;
    else hi = mid;
  }
  const a = samples[lo],
    b = samples[hi];
  const t = clamp((distance - a.distance) / (b.distance - a.distance || 1));
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/** Geometry is independent of scroll/entry transforms. Measure uses the browser's SVG arc lengths. */
export function createJourneyPath(
  boxes: CardBox[],
  entries: TimelineEntry[],
  width: number,
  measure: (d: string) => number,
) {
  const motifs = entries.map(motifFor);
  const { compact, run, gaps } = journeySpacing(width, motifs);
  const points: Station[] = boxes.map((r, i) => ({
    x: compact
      ? i % 2
        ? r.right + 31
        : r.left - 31
      : i % 2
        ? r.left - 25
        : r.right + 25,
    y: r.top + 53,
    edge: compact ? (i % 2 ? r.right : r.left) : i % 2 ? r.left : r.right,
    distance: 0,
  }));
  const first = points[0],
    last = points[points.length - 1];
  const startY = first.y - 82;
  const effects: Obstacle[] = [],
    stops: Stop[] = [{ y: startY, distance: 0 }];
  const step = 3.125,
    vertical = { x: 0, y: step };
  let d = `M ${first.x} ${startY}`,
    cursor: Point = { x: first.x, y: startY },
    velocity = vertical,
    curvature = 0;
  const samples: PathSample[] = [{ ...cursor, distance: 0 }];
  let checkpoint = 0;
  function sample(point: Point) {
    const previous = samples[samples.length - 1];
    samples.push({
      x: point.x,
      y: point.y,
      distance:
        previous.distance +
        Math.hypot(point.x - previous.x, point.y - previous.y),
    });
  }
  // Normalize each span against the browser's exact SVG length so marker,
  // stroke, and tip share the same station distances without accumulating drift.
  function measureDistance() {
    const length = measure(d),
      start = samples[checkpoint].distance;
    const span = samples[samples.length - 1].distance - start;
    for (let i = checkpoint + 1; i < samples.length; i++) {
      samples[i].distance =
        start +
        ((samples[i].distance - start) * (length - start)) / (span || 1);
    }
    checkpoint = samples.length - 1;
    return length;
  }
  const number = (v: number) => Number(v.toFixed(4));

  // Short Hermite cubics preserve the analytic curves. Approaches match both
  // tangent and signed curvature, so loops never flatten at their joins.
  function appendCurve(
    evaluate: (t: number) => Sample,
    n: number,
    segments = n,
  ) {
    let a = evaluate(0);
    for (let j = 1; j <= segments; j++) {
      const b = evaluate(j / segments),
        k = 1 / (3 * segments);
      d += ` C ${[a.x + a.dx * k, a.y + a.dy * k, b.x - b.dx * k, b.y - b.dy * k, b.x, b.y].map(number).join(" ")}`;
      sample(evaluate((j - 0.5) / segments));
      sample(b);
      a = b;
    }
    cursor = { x: a.x, y: a.y };
    velocity = { x: a.dx / n, y: a.dy / n };
  }
  function flowTo(end: Point, endVelocity = vertical, endCurvature = 0) {
    const n = Math.max(
      8,
      Math.ceil(Math.hypot(end.x - cursor.x, end.y - cursor.y) / step),
    );
    const delta = { x: end.x - cursor.x, y: end.y - cursor.y };
    const unit = (v: Point) => {
      const size = Math.hypot(v.x, v.y);
      return { x: v.x / size, y: v.y / size };
    };
    const from = unit(velocity),
      to = unit(endVelocity);
    // Bound plain spans along both axes; their control points stay ordered
    // rather than overshooting on long horizontal or vertical stretches.
    let handle = Math.hypot(delta.x, delta.y) * 0.24;
    for (const axis of ["x", "y"] as const) {
      const extent = 2 * (Math.abs(from[axis]) + Math.abs(to[axis]));
      if (extent > 1e-8)
        handle = Math.min(handle, Math.abs(delta[axis]) / extent);
    }
    const speed = handle * 5;
    // Let the vertical lead-in turn before it reaches the lobe. Equal endpoint
    // speeds force a brief counter-turn when a wide approach meets a small loop.
    const loopApproach = endCurvature !== 0 && curvature === 0;
    const startSpeed = loopApproach
      ? 1.5 * (delta.y - delta.x * to.y / to.x)
      : speed;
    const endSpeed = loopApproach ? Math.hypot(delta.x, delta.y) : speed;
    const acceleration = (direction: Point, bend: number, speed: number) => ({
      x: -direction.y * bend * speed ** 2,
      y: direction.x * bend * speed ** 2,
    });
    const fromAcceleration = acceleration(from, curvature, startSpeed),
      toAcceleration = acceleration(to, endCurvature, endSpeed);
    const coefficients = (axis: "x" | "y") => {
      const p = cursor[axis], d = delta[axis],
        v0 = from[axis] * startSpeed, v1 = to[axis] * endSpeed,
        a0 = fromAcceleration[axis], a1 = toAcceleration[axis];
      return [p, v0, a0 / 2,
        10 * d - 6 * v0 - 4 * v1 - 1.5 * a0 + .5 * a1,
        -15 * d + 8 * v0 + 7 * v1 + 1.5 * a0 - a1,
        6 * d - 3 * v0 - 3 * v1 - .5 * a0 + .5 * a1];
    };
    const x = coefficients("x"), y = coefficients("y");
    const value = (c: number[], t: number) =>
      c[0] + c[1] * t + c[2] * t ** 2 + c[3] * t ** 3 + c[4] * t ** 4 + c[5] * t ** 5;
    const slope = (c: number[], t: number) =>
      c[1] + 2 * c[2] * t + 3 * c[3] * t ** 2 + 4 * c[4] * t ** 3 + 5 * c[5] * t ** 4;
    appendCurve(
      (t) => ({
        x: value(x, t),
        y: value(y, t),
        dx: slope(x, t),
        dy: slope(y, t),
      }),
      n,
      Math.max(4, Math.ceil(n / 4)),
    );
    curvature = endCurvature;
  }
  function corner(c1: Point, c2: Point, end: Point) {
    const start = { ...cursor };
    appendCurve((t) => {
      const s = 1 - t;
      return {
        x:
          s ** 3 * start.x +
          3 * s * s * t * c1.x +
          3 * s * t * t * c2.x +
          t ** 3 * end.x,
        y:
          s ** 3 * start.y +
          3 * s * s * t * c1.y +
          3 * s * t * t * c2.y +
          t ** 3 * end.y,
        dx:
          3 * s * s * (c1.x - start.x) +
          6 * s * t * (c2.x - c1.x) +
          3 * t * t * (end.x - c2.x),
        dy:
          3 * s * s * (c1.y - start.y) +
          6 * s * t * (c2.y - c1.y) +
          3 * t * t * (end.y - c2.y),
      };
    }, 8);
  }
  function station(p: Station) {
    p.distance = measureDistance();
    stops.push({ y: p.y, distance: p.distance });
  }
  flowTo(first);
  station(first);
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1],
      b = points[i],
      aBox = boxes[i - 1];
    const dir = Math.sign(b.x - a.x),
      midX = (a.x + b.x) / 2;
    const gap = gaps[i - 1],
      midY = aBox.bottom + gap * 0.54,
      motif = motifs[i];
    flowTo({ x: a.x, y: aBox.bottom + 24 });
    if (motif === "loop") {
      const seed = Array.from(entries[i].uuid).reduce(
        (v, c) => (v * 31 + c.charCodeAt(0)) >>> 0,
        17,
      );
      const advance = 112 + (seed % 7) * 2,
        drop = clamp(120 - (run - 245) * 0.3, 36, 110);
      const start = { x: midX - (dir * advance) / 2, y: midY - drop / 2 },
        delta = { x: dir * advance, y: drop },
        n = 64;
      const length = Math.hypot(delta.x, delta.y),
        u = { x: delta.x / length, y: delta.y / length };
      const normal = {
        x: (-dir * delta.y) / length,
        y: Math.abs(delta.x) / length,
      };
      const amplitude = length * 0.72,
        height = length * 0.5;
      const loopCurvature = -dir * 4 * Math.PI ** 2 * height / (length + 2 * Math.PI * amplitude) ** 2;
      flowTo(start, { x: delta.x / n, y: delta.y / n }, loopCurvature);
      // The lobe is almost square; the exit advances instead of closing a circle.
      appendCurve((t) => {
        const angle = 2 * Math.PI * t,
          f = Math.sin(angle), g = 1 - Math.cos(angle),
          df = 2 * Math.PI * Math.cos(angle), dg = 2 * Math.PI * Math.sin(angle);
        return {
          x:
            start.x + delta.x * t + u.x * amplitude * f - normal.x * height * g,
          y:
            start.y + delta.y * t + u.y * amplitude * f - normal.y * height * g,
          dx: delta.x + u.x * amplitude * df - normal.x * height * dg,
          dy: delta.y + u.y * amplitude * df - normal.y * height * dg,
        };
      }, n);
      curvature = loopCurvature;
    } else if (motif === "detour") {
      // Deliberately more angular: a close rounded bypass makes the obstacle legible.
      const p = (x: number, y: number) => ({ x: midX + dir * x, y: midY + y }),
        k = 10 * 0.5522847498,
        v = (3 * k) / 8;
      flowTo(p(-80, 0), { x: dir * v, y: 0 });
      effects.push({
        type: motif,
        x: midX,
        y: midY,
        distance: measureDistance(),
      });
      flowTo(p(-48, 0), { x: dir * v, y: 0 });
      corner(p(-48 + k, 0), p(-38, -10 + k), p(-38, -10));
      flowTo(p(-38, -56), { x: 0, y: -v });
      corner(p(-38, -56 - k), p(-28 - k, -66), p(-28, -66));
      flowTo(p(28, -66), { x: dir * v, y: 0 });
      corner(p(28 + k, -66), p(38, -56 - k), p(38, -56));
      flowTo(p(38, -10), { x: 0, y: v });
      corner(p(38, -10 + k), p(48 - k, 0), p(48, 0));
      flowTo(p(80, 0), { x: dir * step, y: 0 });
    } else {
      flowTo({ x: midX, y: midY }, { x: dir * step, y: 0 });
      if (motif === "breakthrough")
        effects.push({
          type: motif,
          x: midX,
          y: midY,
          distance: measureDistance(),
        });
    }
    flowTo({ x: b.x, y: aBox.bottom + gap - 24 });
    flowTo(b);
    station(b);
  }
  const endY = boxes[boxes.length - 1].bottom + 62;
  flowTo({ x: last.x, y: endY });
  const length = measureDistance();
  stops.push({ y: endY, distance: length });
  return {
    d,
    length,
    points,
    stops,
    effects,
    endY,
    samples,
    past: `M ${first.x} ${startY - 48} L ${first.x} ${startY}`,
    future: `M ${last.x} ${endY} L ${last.x} ${endY + 112}`,
    today: { x: last.x, y: endY },
  };
}
