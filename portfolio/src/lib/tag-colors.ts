/**
 * Deterministic color "tones" for tags and cards: the same tag always gets
 * the same hue on every page, picked by hashing its slug. Ten hues, each
 * tuned for light and dark mode.
 *
 * Cards also get a decorative "accent" (tone + shape, see CardDecor). In a
 * list, accentsFor() keeps each card's hashed pick stable but never repeats
 * a color or a shape within three neighbours, so no two cards in a row look
 * alike.
 *
 * Every class is written out in full so Tailwind can see it at build time.
 */
export type Tone = {
  /** Tinted chip: border + background + text. */
  chip: string;
  /** Extra hover state for chips that are links. */
  chipHover: string;
  /** Solid fill for dots and small marks. */
  dot: string;
  /** Solid fill for avatars (white text on top). */
  solid: string;
  /** Ring color around logos. */
  ring: string;
  /** Text color the card decorations paint with (`currentColor`). */
  text: string;
};

const TONES: readonly Tone[] = [
  {
    chip: "border-emerald-700/25 bg-emerald-600/10 text-emerald-800 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-300",
    chipHover: "hover:border-emerald-700/60 hover:bg-emerald-600/15 dark:hover:border-emerald-400/60",
    dot: "bg-emerald-600 dark:bg-emerald-400",
    solid: "bg-emerald-600",
    ring: "ring-emerald-600/40 dark:ring-emerald-400/40",
    text: "text-emerald-500 dark:text-emerald-400",
  },
  {
    chip: "border-violet-600/25 bg-violet-600/10 text-violet-800 dark:border-violet-400/25 dark:bg-violet-400/10 dark:text-violet-300",
    chipHover: "hover:border-violet-600/60 hover:bg-violet-600/15 dark:hover:border-violet-400/60",
    dot: "bg-violet-600 dark:bg-violet-400",
    solid: "bg-violet-600",
    ring: "ring-violet-600/40 dark:ring-violet-400/40",
    text: "text-violet-500 dark:text-violet-400",
  },
  {
    chip: "border-amber-600/30 bg-amber-500/15 text-amber-900 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-200",
    chipHover: "hover:border-amber-600/70 hover:bg-amber-500/20 dark:hover:border-amber-400/60",
    dot: "bg-amber-500 dark:bg-amber-400",
    solid: "bg-amber-600",
    ring: "ring-amber-500/50 dark:ring-amber-400/40",
    text: "text-amber-500 dark:text-amber-300",
  },
  {
    chip: "border-sky-600/25 bg-sky-500/10 text-sky-800 dark:border-sky-400/25 dark:bg-sky-400/10 dark:text-sky-300",
    chipHover: "hover:border-sky-600/60 hover:bg-sky-500/15 dark:hover:border-sky-400/60",
    dot: "bg-sky-600 dark:bg-sky-400",
    solid: "bg-sky-600",
    ring: "ring-sky-600/40 dark:ring-sky-400/40",
    text: "text-sky-500 dark:text-sky-400",
  },
  {
    chip: "border-rose-600/25 bg-rose-500/10 text-rose-800 dark:border-rose-400/25 dark:bg-rose-400/10 dark:text-rose-300",
    chipHover: "hover:border-rose-600/60 hover:bg-rose-500/15 dark:hover:border-rose-400/60",
    dot: "bg-rose-600 dark:bg-rose-400",
    solid: "bg-rose-600",
    ring: "ring-rose-600/40 dark:ring-rose-400/40",
    text: "text-rose-500 dark:text-rose-400",
  },
  {
    chip: "border-fuchsia-600/25 bg-fuchsia-500/10 text-fuchsia-800 dark:border-fuchsia-400/25 dark:bg-fuchsia-400/10 dark:text-fuchsia-300",
    chipHover: "hover:border-fuchsia-600/60 hover:bg-fuchsia-500/15 dark:hover:border-fuchsia-400/60",
    dot: "bg-fuchsia-600 dark:bg-fuchsia-400",
    solid: "bg-fuchsia-600",
    ring: "ring-fuchsia-600/40 dark:ring-fuchsia-400/40",
    text: "text-fuchsia-500 dark:text-fuchsia-400",
  },
  {
    chip: "border-orange-600/25 bg-orange-500/10 text-orange-800 dark:border-orange-400/25 dark:bg-orange-400/10 dark:text-orange-300",
    chipHover: "hover:border-orange-600/60 hover:bg-orange-500/15 dark:hover:border-orange-400/60",
    dot: "bg-orange-500 dark:bg-orange-400",
    solid: "bg-orange-600",
    ring: "ring-orange-500/40 dark:ring-orange-400/40",
    text: "text-orange-500 dark:text-orange-400",
  },
  {
    chip: "border-cyan-600/25 bg-cyan-500/10 text-cyan-800 dark:border-cyan-400/25 dark:bg-cyan-400/10 dark:text-cyan-300",
    chipHover: "hover:border-cyan-600/60 hover:bg-cyan-500/15 dark:hover:border-cyan-400/60",
    dot: "bg-cyan-600 dark:bg-cyan-400",
    solid: "bg-cyan-600",
    ring: "ring-cyan-600/40 dark:ring-cyan-400/40",
    text: "text-cyan-500 dark:text-cyan-300",
  },
  {
    chip: "border-indigo-600/25 bg-indigo-500/10 text-indigo-800 dark:border-indigo-400/25 dark:bg-indigo-400/10 dark:text-indigo-300",
    chipHover: "hover:border-indigo-600/60 hover:bg-indigo-500/15 dark:hover:border-indigo-400/60",
    dot: "bg-indigo-600 dark:bg-indigo-400",
    solid: "bg-indigo-600",
    ring: "ring-indigo-600/40 dark:ring-indigo-400/40",
    text: "text-indigo-500 dark:text-indigo-300",
  },
  {
    chip: "border-lime-700/30 bg-lime-500/15 text-lime-900 dark:border-lime-400/25 dark:bg-lime-400/10 dark:text-lime-300",
    chipHover: "hover:border-lime-700/60 hover:bg-lime-500/20 dark:hover:border-lime-400/60",
    dot: "bg-lime-600 dark:bg-lime-400",
    solid: "bg-lime-700",
    ring: "ring-lime-600/40 dark:ring-lime-400/40",
    text: "text-lime-600 dark:text-lime-300",
  },
];

/**
 * Hue family of each tone above (same order). Sky and cyan, or rose and
 * fuchsia, are different tones but read as the same color side by side, so
 * neighbouring cards avoid the family, not just the tone.
 */
const TONE_FAMILY = [
  "green", // emerald
  "purple", // violet
  "warm", // amber
  "blue", // sky
  "pink", // rose
  "pink", // fuchsia
  "warm", // orange
  "blue", // cyan
  "purple", // indigo
  "green", // lime
] as const;

/** The brand tone, for things without a tag. */
export const BRAND_TONE: Tone = TONES[0];

/** Decoration layouts drawn by CardDecor. */
export const SHAPES = [
  "disc",
  "rings",
  "corner",
  "diamond",
  "dots",
  "stripes",
  "half",
  "waves",
  "blob",
] as const;
export type Shape = (typeof SHAPES)[number];

export type Accent = { tone: Tone; shape: Shape };

function hash(value: string): number {
  let h = 0;
  for (let index = 0; index < value.length; index++) {
    h = (h * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(h);
}

export function toneFor(key: string | undefined): Tone {
  return key ? TONES[hash(key) % TONES.length] : BRAND_TONE;
}

/** Hashed pick, bumped past any value `taken` rejects. */
function pick(start: number, size: number, taken: (value: number) => boolean): number {
  let value = start % size;
  for (let tries = 0; tries < size && taken(value); tries++) value = (value + 1) % size;
  return value;
}

/**
 * One accent per card, in list order. Each key keeps its own hashed tone and
 * shape unless a close neighbour already uses it, so a list never shows the
 * same color family or the same shape twice within three cards.
 */
export function accentsFor(keys: readonly string[]): Accent[] {
  const tones: number[] = [];
  const shapes: number[] = [];
  return keys.map((key) => {
    const nearFamilies = tones.slice(-2).map((index) => TONE_FAMILY[index]);
    const nearShapes = shapes.slice(-2);
    const tone = pick(hash(key), TONES.length, (index) => nearFamilies.includes(TONE_FAMILY[index]));
    const shape = pick(hash(`${key}:shape`), SHAPES.length, (index) => nearShapes.includes(index));
    tones.push(tone);
    shapes.push(shape);
    return { tone: TONES[tone], shape: SHAPES[shape] };
  });
}

/** Accent for a card shown on its own. */
export function accentFor(key: string): Accent {
  return accentsFor([key])[0];
}
