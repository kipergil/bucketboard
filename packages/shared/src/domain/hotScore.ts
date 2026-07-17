const GRAVITY = 1.8;
const MS_PER_HOUR = 1000 * 60 * 60;

/**
 * Age-decayed "hot" ranking score (Hacker News-style gravity decay), used
 * by the scheduled Flow that maintains `items.hot_score`. Score can be
 * negative (net down-voted items decay too); `ageHours` is clamped to 0.
 */
export function computeHotScore(
  voteScore: number,
  publishedAt: Date,
  now: Date = new Date(),
): number {
  const ageHours = Math.max(0, (now.getTime() - publishedAt.getTime()) / MS_PER_HOUR);
  const sign = voteScore > 0 ? 1 : voteScore < 0 ? -1 : 0;
  const magnitude = Math.log10(Math.max(Math.abs(voteScore), 1));
  return sign * magnitude - ageHours / (GRAVITY * 24);
}
