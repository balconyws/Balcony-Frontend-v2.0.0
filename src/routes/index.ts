import { Role } from '@/types';

export const ProtectedRoutes: { path: string; roles: Role[]; requiredSubscription: boolean }[] = [
  { path: '/host/add/workspace', roles: ['user'], requiredSubscription: false },
  { path: '/host/add/property', roles: ['host'], requiredSubscription: true },
  { path: '/host/update/workspace', roles: ['host'], requiredSubscription: false },
  { path: '/host/update/property', roles: ['host'], requiredSubscription: true },
  { path: '/host/dashboard/workspace', roles: ['host'], requiredSubscription: false },
  { path: '/host/dashboard/property', roles: ['host'], requiredSubscription: true },
  { path: '/admin/dashboard/workspace', roles: ['admin'], requiredSubscription: false },
  { path: '/admin/dashboard/property', roles: ['admin'], requiredSubscription: false },
];
