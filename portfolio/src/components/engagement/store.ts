"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { CardStats, PostEngagement, VoteValue } from "@/data/engagement";

/**
 * Client-side cache for likes/comments. Pages stay statically rendered (and
 * CDN-cached); these numbers are fetched live after hydration:
 * - post page: one /api/blog/posts/[id]/engagement call shared by the
 *   reactions bar and the comment section;
 * - post cards: ids collected for a tick, then one batched
 *   /api/blog/engagement?ids=… call for every card on screen.
 * A vote from a card or from the post page updates both views at once.
 *
 * Failures are terminal for the page view (no retry loop, no endless
 * spinner): the widgets simply stay hidden, and the next mount tries again.
 */

type Listener = () => void;

/* ------------------------------------------------- per-post engagement */

type EngagementState = { data: PostEngagement | null; failed: boolean };
type Entry = {
  state: EngagementState;
  listeners: Set<Listener>;
  subscribe: (listener: Listener) => () => void;
  started: boolean;
  composerOpen: boolean;
};
const entries = new Map<string, Entry>();
const EMPTY: EngagementState = { data: null, failed: false };

function entryFor(postId: string): Entry {
  let entry = entries.get(postId);
  if (!entry) {
    const listeners = new Set<Listener>();
    entry = {
      state: EMPTY,
      listeners,
      subscribe: (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      started: false,
      composerOpen: false,
    };
    entries.set(postId, entry);
  }
  return entry;
}

function notify(entry: Entry) {
  entry.listeners.forEach((listener) => listener());
}

export function setEngagement(postId: string, data: PostEngagement) {
  const entry = entryFor(postId);
  entry.state = { data, failed: false };
  notify(entry);
  setStats(postId, { score: data.score, comments: data.comments, myVote: data.myVote });
}

function loadEngagement(postId: string) {
  const entry = entryFor(postId);
  if (entry.started) return;
  entry.started = true;
  fetch(`/api/blog/posts/${postId}/engagement`)
    .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
    .then((data: PostEngagement) => setEngagement(postId, data))
    .catch(() => {
      entry.started = false; // a later mount (next visit of the page) retries
      if (!entry.state.data) {
        entry.state = { data: null, failed: true };
        notify(entry);
      }
    });
}

export function useEngagement(postId: string): EngagementState {
  const entry = entryFor(postId);
  const state = useSyncExternalStore(entry.subscribe, () => entry.state, () => EMPTY);
  useEffect(() => loadEngagement(postId), [postId]);
  return state;
}

/** Whether the comment form was opened from the reactions bar (no comments yet). */
export function useComposerOpen(postId: string): boolean {
  const entry = entryFor(postId);
  return useSyncExternalStore(entry.subscribe, () => entry.composerOpen, () => false);
}

export function setComposerOpen(postId: string, open: boolean) {
  const entry = entryFor(postId);
  entry.composerOpen = open;
  notify(entry);
}

/** POSTs JSON and returns the parsed body with the status. */
export async function postJson<T>(url: string, body: unknown): Promise<{ status: number; data: T | null }> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { status: response.status, data: (await response.json().catch(() => null)) as T | null };
  } catch {
    return { status: 0, data: null };
  }
}

/* ------------------------------------------------------------- voting */

const voting = new Set<string>();

/**
 * Casts (1 / -1) or withdraws (0) the visitor's vote. Optimistic: the
 * numbers move at once on the card and the post page, then settle on the
 * server's answer, or roll back if the request fails.
 */
export async function vote(postId: string, next: VoteValue): Promise<void> {
  const current = stats.get(postId) ?? entries.get(postId)?.state.data;
  if (!current || voting.has(postId)) return;
  voting.add(postId);

  const previousStats = stats.get(postId);
  const previousData = entries.get(postId)?.state.data ?? null;
  const optimistic = { score: current.score - current.myVote + next, myVote: next };
  setStats(postId, { comments: current.comments, ...optimistic });
  if (previousData) {
    const entry = entryFor(postId);
    entry.state = { data: { ...previousData, ...optimistic }, failed: false };
    notify(entry);
  }

  const { status, data } = await postJson<PostEngagement>(`/api/blog/posts/${postId}/vote`, { value: next });
  if (status === 200 && data) {
    setEngagement(postId, data);
  } else {
    if (previousStats) setStats(postId, previousStats);
    if (previousData) setEngagement(postId, previousData);
  }
  voting.delete(postId);
}

/* ------------------------------------------------ batched card counters */

const BATCH_LIMIT = 30;
const stats = new Map<string, CardStats>();
const statsListeners = new Map<string, Set<Listener>>();
const requested = new Set<string>();
let queue: string[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

function setStats(postId: string, value: CardStats) {
  stats.set(postId, value);
  statsListeners.get(postId)?.forEach((listener) => listener());
}

async function flush() {
  const ids = queue;
  queue = [];
  timer = null;
  for (let start = 0; start < ids.length; start += BATCH_LIMIT) {
    const chunk = ids.slice(start, start + BATCH_LIMIT);
    try {
      const response = await fetch(`/api/blog/engagement?ids=${chunk.join(",")}`);
      if (!response.ok) throw new Error(String(response.status));
      const data: { stats: Record<string, CardStats> } = await response.json();
      for (const [id, value] of Object.entries(data.stats)) setStats(id, value);
    } catch {
      // Leave these cards without counters for this page view; a later
      // mount asks again.
      chunk.forEach((id) => requested.delete(id));
    }
  }
}

function requestStats(postId: string) {
  if (requested.has(postId) || stats.has(postId)) return;
  requested.add(postId);
  queue.push(postId);
  timer ??= setTimeout(flush, 30);
}

export function usePostStats(postId: string): CardStats | null {
  const value = useSyncExternalStore(
    (listener) => {
      let set = statsListeners.get(postId);
      if (!set) statsListeners.set(postId, (set = new Set()));
      set.add(listener);
      return () => set.delete(listener);
    },
    () => stats.get(postId) ?? null,
    () => null
  );
  useEffect(() => requestStats(postId), [postId]);
  return value;
}
