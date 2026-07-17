/** Fields Directus attaches to every managed collection. */
export interface SystemFields {
  id: string;
  date_created: string | null;
  date_updated: string | null;
  user_created: string | DirectusUserRef | null;
  user_updated: string | DirectusUserRef | null;
}

/**
 * A relation field is typed as `string | T` because @directus/sdk returns the
 * raw foreign key (string) unless the field is expanded via `fields: [...]`,
 * in which case it returns the nested item. Callers narrow with a type guard
 * or by trusting the `fields` they requested.
 */
export type Relation<T> = string | T;

/** Minimal shape of directus_users we rely on; extended with custom fields in users.ts. */
export interface DirectusUserRef {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
}

export function isExpanded<T extends { id: string }>(value: Relation<T>): value is T {
  return typeof value === 'object' && value !== null;
}

export function relationId<T extends { id: string }>(value: Relation<T>): string {
  return isExpanded(value) ? value.id : value;
}
