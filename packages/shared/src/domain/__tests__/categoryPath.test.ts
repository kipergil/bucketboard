import { describe, expect, it } from 'vitest';
import {
  CategoryCycleError,
  UnknownCategoryError,
  isDescendantPath,
  recomputeCategoryPaths,
  type CategoryNode,
} from '../categoryPath';

describe('recomputeCategoryPaths', () => {
  it('computes path and depth for a flat top-level category', () => {
    const categories: CategoryNode[] = [{ id: '1', parentId: null, slug: 'food-drink' }];
    const result = recomputeCategoryPaths(categories);
    expect(result.get('1')).toEqual({ id: '1', path: 'food-drink', depth: 0 });
  });

  it('joins ancestor slugs for a deep tree, in any input order', () => {
    const categories: CategoryNode[] = [
      { id: 'c', parentId: 'b', slug: 'crisps' },
      { id: 'a', parentId: null, slug: 'food-drink' },
      { id: 'b', parentId: 'a', slug: 'snacks' },
    ];
    const result = recomputeCategoryPaths(categories);
    expect(result.get('a')).toEqual({ id: 'a', path: 'food-drink', depth: 0 });
    expect(result.get('b')).toEqual({ id: 'b', path: 'food-drink/snacks', depth: 1 });
    expect(result.get('c')).toEqual({ id: 'c', path: 'food-drink/snacks/crisps', depth: 2 });
  });

  it('recomputes an entire subtree when an ancestor is reparented', () => {
    // 'snacks' moved under 'world-foods' instead of 'food-drink'
    const categories: CategoryNode[] = [
      { id: 'food-drink', parentId: null, slug: 'food-drink' },
      { id: 'world-foods', parentId: null, slug: 'world-foods' },
      { id: 'snacks', parentId: 'world-foods', slug: 'snacks' },
      { id: 'crisps', parentId: 'snacks', slug: 'crisps' },
    ];
    const result = recomputeCategoryPaths(categories);
    expect(result.get('snacks')?.path).toBe('world-foods/snacks');
    expect(result.get('crisps')?.path).toBe('world-foods/snacks/crisps');
    expect(result.get('crisps')?.depth).toBe(2);
  });

  it('throws CategoryCycleError when a parent chain loops back to itself', () => {
    const categories: CategoryNode[] = [
      { id: 'a', parentId: 'b', slug: 'a' },
      { id: 'b', parentId: 'a', slug: 'b' },
    ];
    expect(() => recomputeCategoryPaths(categories)).toThrow(CategoryCycleError);
  });

  it('throws UnknownCategoryError when parent references a missing id', () => {
    const categories: CategoryNode[] = [{ id: 'a', parentId: 'ghost', slug: 'a' }];
    expect(() => recomputeCategoryPaths(categories)).toThrow(UnknownCategoryError);
  });
});

describe('isDescendantPath', () => {
  it('matches the ancestor path itself', () => {
    expect(isDescendantPath('food-drink', 'food-drink')).toBe(true);
  });

  it('matches a nested descendant', () => {
    expect(isDescendantPath('food-drink/snacks/crisps', 'food-drink')).toBe(true);
  });

  it('does not match a sibling with a shared prefix', () => {
    expect(isDescendantPath('food-drink-alt/snacks', 'food-drink')).toBe(false);
  });

  it('does not match an unrelated path', () => {
    expect(isDescendantPath('world-foods/spices', 'food-drink')).toBe(false);
  });
});
