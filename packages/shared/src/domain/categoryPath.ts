export interface CategoryNode {
  id: string;
  parentId: string | null;
  slug: string;
}

export interface CategoryPathEntry {
  id: string;
  path: string;
  depth: number;
}

export class CategoryCycleError extends Error {
  constructor(public readonly categoryId: string) {
    super(`Category ${categoryId} is part of a cycle (its parent chain loops back to itself)`);
    this.name = 'CategoryCycleError';
  }
}

export class UnknownCategoryError extends Error {
  constructor(public readonly categoryId: string) {
    super(`Unknown category id: ${categoryId}`);
    this.name = 'UnknownCategoryError';
  }
}

/**
 * Recomputes the materialized `path` (slash-joined ancestor slugs) and
 * `depth` for every category in a tenant's tree. Pure — takes a flat list,
 * returns a lookup of id -> {path, depth}. Callers (a Directus Flow /
 * hook) diff this against current rows and persist only what changed.
 *
 * Recomputing the whole tenant tree on every create/move (rather than
 * patching incrementally) is deliberate: category trees are small
 * (tens of nodes) and this keeps the logic trivially correct — no
 * partial-update bugs when a subtree is reparented.
 */
export function recomputeCategoryPaths(categories: CategoryNode[]): Map<string, CategoryPathEntry> {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const resolved = new Map<string, CategoryPathEntry>();

  function resolve(id: string, trail: Set<string>): CategoryPathEntry {
    const cached = resolved.get(id);
    if (cached) return cached;

    if (trail.has(id)) {
      throw new CategoryCycleError(id);
    }

    const node = byId.get(id);
    if (!node) {
      throw new UnknownCategoryError(id);
    }

    trail.add(id);

    const entry: CategoryPathEntry =
      node.parentId === null
        ? { id: node.id, path: node.slug, depth: 0 }
        : (() => {
            const parentEntry = resolve(node.parentId as string, trail);
            return {
              id: node.id,
              path: `${parentEntry.path}/${node.slug}`,
              depth: parentEntry.depth + 1,
            };
          })();

    trail.delete(id);
    resolved.set(id, entry);
    return entry;
  }

  for (const category of categories) {
    resolve(category.id, new Set());
  }

  return resolved;
}

/** True when `path` is `ancestorPath` itself or lives anywhere in its subtree. */
export function isDescendantPath(path: string, ancestorPath: string): boolean {
  return path === ancestorPath || path.startsWith(`${ancestorPath}/`);
}
