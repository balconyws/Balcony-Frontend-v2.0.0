'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { ColumnDef } from '@tanstack/react-table';
import {
  BanIcon,
  ChevronsUpDownIcon,
  CircleCheckBigIcon,
  CircleDollarSignIcon,
  MoreHorizontalIcon,
} from 'lucide-react';

import { Navigation } from '@/contexts';
import { Booking } from '@/types';
import { bookingActions, useAppDispatch, bookingSlice, useAppSelector } from '@/redux';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/common';

type Props = object;

const BookingHistory: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const { history } = useAppSelector(bookingSlice.selectBooking);
  const { pushToStack } = Navigation.useNavigation();
  const [loading, setLoading] = useState<boolean>(true);
  const isTablet: boolean = useMediaQuery({ query: '(max-width: 768px)' });

  useEffect(() => {
    dispatch(bookingActions.getUserHistoryBookings()).then(() => setLoading(false));
  }, [dispatch]);

  const goToBookingDetail = useCallback(
    (booking: Booking) => {
      dispatch(bookingSlice.setBookingDetail({ booking }));
      pushToStack('booking detail');
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
        accessorFn: row => row.workspace.info.name,
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
          <div className="text-primary text-[13px] leading-5 truncate max-w-[100px] md:max-w-fit">
            {row.getValue('workspace')}
          </div>
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
          <div className="flex justify-start items-center gap-2">
            {row.getValue('status') === 'done' ? (
              <CircleCheckBigIcon className="text-primary w-4 h-4" />
            ) : row.getValue('status') === 'canceled' ? (
              <BanIcon className="text-primary w-4 h-4" />
            ) : (
              <CircleDollarSignIcon className="text-primary w-4 h-4" />
            )}
            <p className="text-primary text-[13px] leading-5">{row.getValue('status')}</p>
          </div>
        ),
      },
      {
        id: 'order no',
        accessorKey: '_id',
        enableHiding: true,
        header: ({ column }) => (
          <Button
            variant="secondary"
            size="sm"
            className="flex justify-center items-center gap-2 px-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span className="text-[#71717A] text-[11px] font-medium leading-4">order number</span>
            <ChevronsUpDownIcon className="text-primary w-3 h-3" />
          </Button>
        ),
        cell: ({ row: { original } }) => (
          <p className="text-primary text-[13px] leading-5">ORD{original._id.slice(-10)}</p>
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
            onClick={() => goToBookingDetail(original)}>
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [goToBookingDetail]
  );

  return (
    <div className="mb-4">
      <DataTable
        heading={
          <>
            <h1 className="text-[20px] leading-8 font-bold tracking-[-1px]">
              booking history{' '}
              <span className="text-[12px] text-primary font-normal leading-3 tracking-[-1px]">
                (inactive)
              </span>
            </h1>
            <p className="text-[8px] leading-3 tracking-tighter">we hold this data up to 1 year</p>
          </>
        }
        columns={columns}
        data={history || []}
        isLoading={loading}
        showPagination={true}
        LoadingClassName="!h-[158px]"
        TableClassName="lg:!max-h-[317px] overflow-y-scroll"
        filters={{
          inputFilterColumnId: 'workspace',
          status: !isTablet,
          view: true,
          statusOptions: ['done', 'canceled', 'partially refunded'],
        }}
      />
    </div>
  );
};

export default BookingHistory;
