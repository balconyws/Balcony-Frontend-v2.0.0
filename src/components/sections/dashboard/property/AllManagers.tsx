'use client';

import { useEffect } from 'react';

import { tenantActions, useAppDispatch, authSlice, useAppSelector } from '@/redux';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardPropertyManager, DashboardTenantManager } from '../..';

type Props = object;

const AllManagers: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(authSlice.selectAuth);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        dispatch(
          tenantActions.getAllTenants({
            includeSelectedUnit: true,
            includeProperty: true,
            includeHost: true,
          })
        );
      }
      if (user.role === 'host') {
        dispatch(tenantActions.getHostTenants({ hostId: user._id, status: 'pending requests' }));
        dispatch(tenantActions.getHostTenants({ hostId: user._id, status: 'current tenants' }));
        dispatch(tenantActions.getHostTenants({ hostId: user._id, status: 'awaiting payments' }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <div className="flex flex-col gap-6">
          <DashboardPropertyManager />
          <DashboardTenantManager />
        </div>
      </CardContent>
    </Card>
  );
};

export default AllManagers;
