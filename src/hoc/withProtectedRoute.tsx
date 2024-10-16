'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { FC, ComponentType, useEffect, useState } from 'react';

import { Role } from '@/types';
import { ProtectedRoutes } from '@/routes';
import { Spinner } from '@/components/ui/Spinner';
import {
  subscriptionActions,
  useAppDispatch,
  authSlice,
  useAppSelector,
  waitForDispatch,
} from '@/redux';

const withProtectedRoute = <P extends object>(
  WrappedComponent: ComponentType<P>,
  allowedRoles: Role[],
  redirectTo?: string
): FC<P> => {
  const ProtectedRoute: FC<P> = props => {
    const dispatch = useAppDispatch();
    const params = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, user } = useAppSelector(authSlice.selectAuth);
    const [loading, setLoading] = useState<boolean>(true);

    const sourcePath = params.get('s');
    useEffect(() => {
      if (!isAuthenticated || !user) {
        if (sourcePath) {
          return router.replace(sourcePath);
        }
        return router.replace(
          `/error?error=${encodeURIComponent('please login to continue')}&code=401`
        );
      }
      const matchedRoute = ProtectedRoutes.find(p => pathname.startsWith(p.path));
      if (
        matchedRoute &&
        matchedRoute.requiredSubscription &&
        !matchedRoute.roles.includes('admin')
      ) {
        waitForDispatch(dispatch, subscriptionActions.getUserSubscriptionDetail(), state => {
          const { isFailed } = state.subscription;
          if (isFailed) {
            router.replace('/pricing');
          } else {
            setTimeout(() => setLoading(false), 1000);
          }
        });
        return;
      } else if (!allowedRoles.includes(user.role)) {
        if (redirectTo) {
          return router.replace(redirectTo);
        }
        return router.replace(
          `/error?error=${encodeURIComponent(user.role + ' cannot access this resource')}&code=403`
        );
      }
      setTimeout(() => setLoading(false), 1000);
    }, [isAuthenticated, user, router, params, sourcePath, pathname, dispatch]);

    if (loading) {
      return (
        <main className="flex flex-col justify-center items-center w-screen h-screen">
          <Spinner
            show={true}
            size="large"
            className="!text-primary w-20 h-20"
            iconClassName="w-20 h-20 stroke-1"
          />
        </main>
      );
    }
    return <WrappedComponent {...props} />;
  };
  return ProtectedRoute;
};

export default withProtectedRoute;
