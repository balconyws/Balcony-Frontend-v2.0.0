'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronsUpDownIcon, HourglassIcon, MoreHorizontalIcon, TimerIcon } from 'lucide-react';

import { Navigation } from '@/contexts';
import { Booking } from '@/types';
import { bookingActions, useAppDispatch, bookingSlice, authSlice, useAppSelector } from '@/redux';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/common';

type Props = object;

const OngoingBookings: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(authSlice.selectAuth);
  const { inProgress } = useAppSelector(bookingSlice.selectBooking);
  const { pushToStack } = Navigation.useNavigation();
  const [loading, setLoading] = useState<boolean>(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role === 'host') {
      dispatch(bookingActions.getHostInProgressBookings({ hostId: user._id })).then(() =>
        setLoading(false)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const goToRefundBooking = useCallback(
    (booking: Booking) => {
      dispatch(bookingSlice.setBookingDetail({ booking }));
      pushToStack('refund booking');
    },
    [dispatch, pushToStack]
  );

  const columns: ColumnDef<Booking>[] = useMemo(
    () => [
      {
        id: 'select',
        accessorKey: 'select',
        enableSorting: false,
        enableHiding: false,
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="w-4 h-4 rounded border border-zinc-900 box-shadow-secondary"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={value => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="w-4 h-4 rounded border border-zinc-900 box-shadow-secondary"
          />
        ),
      },
      {
        id: 'workspace',
        accessorKey: 'name',
        accessorFn: row => row.workspace?.info?.name,
        enableHiding: true,
        header: () => (
          <Button
            variant="secondary"
            size="sm"
            className="flex justify-center items-center gap-2 px-0">
            <span className="text-[#71717A] text-[11px] font-medium leading-4">workspace</span>
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-primary text-[13px] leading-5">{row.getValue('workspace')}</div>
        ),
      },
      {
        id: 'status',
        accessorKey: 'status',
        enableHiding: true,
        header: ({ column }) => (
          <Button
            variant="secondary"
            size="sm"
            className="flex justify-center items-center gap-2 px-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span className="text-[#71717A] text-[11px] font-medium leading-4">status</span>
            <ChevronsUpDownIcon className="text-primary w-3 h-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <>
            {row.getValue('status') === 'pending' ? (
              <div className="flex justify-start items-center gap-2">
                <HourglassIcon className="text-primary w-4 h-4" />
                <p className="text-primary text-[13px] leading-5">{row.getValue('status')}</p>
              </div>
            ) : (
              <div className="flex justify-start items-center gap-2">
                <TimerIcon className="text-primary w-4 h-4" />
                <p className="text-primary text-[13px] leading-5">{row.getValue('status')}</p>
              </div>
            )}
          </>
        ),
      },
      {
        id: 'accept / reject',
        accessorKey: 'acceptance',
        enableHiding: true,
        header: ({ column }) => (
          <Button
            variant="secondary"
            size="sm"
            className="flex justify-center items-center gap-2 px-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span className="text-[#71717A] text-[11px] font-medium leading-4">
              accept / reject
            </span>
            <ChevronsUpDownIcon className="text-primary w-3 h-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <>
            {row.getValue('accept / reject') === 'pending' ? (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className={`w-[70px] h-[30px] text-[10px] leading-6 ${
                    row.original._id === rejectingId &&
                    'hover:bg-secondary hover:text-secondary-foreground'
                  }`}
                  isLoading={row.original._id === rejectingId}
                  strokeColor="#005451"
                  onClick={async () => {
                    if (rejectingId || acceptingId) return;
                    setRejectingId(row.original._id);
                    await dispatch(
                      bookingActions.rejectBooking({
                        bookingId: row.original._id,
                      })
                    ).then(() => setRejectingId(null));
                  }}>
                  reject
                </Button>
                <Button
                  className="w-[70px] h-[30px] text-[10px] leading-6"
                  isLoading={row.original._id === acceptingId}
                  onClick={async () => {
                    if (acceptingId || rejectingId) return;
                    setAcceptingId(row.original._id);
                    await dispatch(
                      bookingActions.acceptBooking({
                        bookingId: row.original._id,
                      })
                    ).then(() => setAcceptingId(null));
                  }}>
                  accept
                </Button>
              </div>
            ) : (
              <p className="text-[10px] leading-5">{row.getValue('accept / reject')}</p>
            )}
          </>
        ),
      },
      {
        id: 'info',
        accessorKey: 'info',
        enableHiding: true,
        header: ({ column }) => (
          <Button
            variant="secondary"
            size="sm"
            className="flex justify-center items-center gap-2 px-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span className="text-[#71717A] text-[11px] font-medium leading-4">more info</span>
          </Button>
        ),
        cell: ({ row: { original } }) => (
          <Button
            variant="secondary"
            size="sm"
            className="h-4 w-4 px-0 bg-transparent"
            onClick={() => goToRefundBooking(original)}>
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [acceptingId, dispatch, goToRefundBooking, rejectingId]
  );

  return (
    <DataTable
      heading={
        <h1 className="text-[20px] leading-8 font-bold tracking-[-1px]">ongoing bookings</h1>
      }
      columns={columns}
      data={inProgress || []}
      isLoading={loading}
      showPagination={true}
      pageSize={3}
      LoadingClassName="!h-[158px]"
      TableClassName="lg:!max-h-[225px] overflow-y-scroll"
      filters={{
        inputFilterColumnId: 'workspace',
        status: true,
        view: true,
        statusOptions: ['pending', 'in progress'],
      }}
      filtersClassName="flex-wrap gap-3"
      filtersStyle="md"
    />
  );
};

export default OngoingBookings;
