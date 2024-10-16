'use client';

import { useEffect } from 'react';

import { bookingActions, useAppDispatch, authSlice, useAppSelector } from '@/redux';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardOngoingBookings, DashboardPastBookings } from '../..';

type Props = object;

const AllBookings: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(authSlice.selectAuth);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        dispatch(bookingActions.getAllBookings({ includeWorkspace: true, includeHost: true }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  return (
    <Card className="w-full border border-border rounded-md box-shadow-primary">
      <CardContent className="px-6 py-4">
        <div className="flex flex-col gap-6 lg:gap-12">
          <DashboardOngoingBookings />
          <DashboardPastBookings />
        </div>
      </CardContent>
    </Card>
  );
};

export default AllBookings;
