import type { AuthProvider } from '../enums.js';

/**
 * Custom fields added to directus_users. Panel logins (staff) stay native
 * Directus accounts; end users are synced from Clerk and carry the fields below.
 */
export interface DirectusUsersCustomFields {
  external_identifier: string | null; // Clerk user id
  auth_provider: AuthProvider | null; // provider used at signup/last login
  avatar_url: string | null; // OAuth avatar, falls back to Directus avatar file
}

export interface DirectusUser extends DirectusUsersCustomFields {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar: string | null;
  status: 'active' | 'invited' | 'draft' | 'suspended' | 'archived';
  role: string | null;
}
