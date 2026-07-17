'use client';

import { createContext, useContext, type ReactNode } from 'react';

export interface TenantContextValue {
  id: string;
  slug: string;
  name: string;
  defaultCurrency: string;
  defaultLocale: string;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({
  tenant,
  children,
}: {
  tenant: TenantContextValue;
  children: ReactNode;
}) {
  return <TenantContext.Provider value={tenant}>{children}</TenantContext.Provider>;
}

/** Client Component hook for the current tenant. Server Components should call the tenants service directly. */
export function useTenant(): TenantContextValue {
  const tenant = useContext(TenantContext);
  if (!tenant) {
    throw new Error('useTenant must be used within <TenantProvider>');
  }
  return tenant;
}
