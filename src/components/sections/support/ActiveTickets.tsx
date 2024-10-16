'use client';

import { useCallback, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { PlusIcon } from 'lucide-react';

import { Navigation } from '@/contexts';
import { Ticket } from '@/types';
import { useAppDispatch, ticketSlice, useAppSelector } from '@/redux';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/common';

type Props = object;

const ActiveTickets: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const { loading, tickets } = useAppSelector(ticketSlice.selectTicket);
  const { pushToStack } = Navigation.useNavigation();

  const goToTicket = useCallback(
    (ticket: Ticket) => {
      dispatch(ticketSlice.setTicketDetail({ ticketDetail: ticket }));
      pushToStack('add ticket');
    },
    [dispatch, pushToStack]
  );

  const addNewTicket = () => {
    dispatch(ticketSlice.setTicketDetail({ ticketDetail: undefined }));
    pushToStack('add ticket');
  };

  const columns: ColumnDef<Ticket>[] = useMemo(
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
        id: 'ticket #',
        accessorKey: 'name',
        accessorFn: row => row.workspace?.info.name || row.property?.info.name || 'N/A',
        enableHiding: true,
        header: () => (
          <Button
            variant="secondary"
            size="sm"
            className="flex justify-center items-center gap-2 px-0">
            <span className="text-[#71717A] text-[11px] font-medium leading-4">ticket #</span>
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-primary text-[13px] leading-5">{row.getValue('ticket #')}</div>
        ),
      },
      {
        id: 'view or reply',
        accessorKey: 'info',
        enableHiding: true,
        header: ({ column }) => (
          <Button
            variant="secondary"
            size="sm"
            className="flex justify-center items-center gap-2 px-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span className="text-[#71717A] text-[11px] font-medium leading-4">view or reply</span>
          </Button>
        ),
        cell: ({ row: { original } }) => (
          <Button
            variant="underline"
            className="text-[10px] bg-transparent font-medium border-none underline"
            onClick={() => goToTicket(original)}>
            view / reply
          </Button>
        ),
      },
    ],
    [goToTicket]
  );

  return (
    <div>
      <DataTable
        heading={
          <>
            <h1 className="text-[20px] leading-8 font-bold tracking-[-1px]">
              support tickets{' '}
              <span className="text-[12px] text-primary font-normal leading-3 tracking-[-1px]">
                (active)
              </span>
            </h1>
            <Button
              type="button"
              variant="secondary"
              className="!p-0 flex gap-[10px] justify-start items-center my-3"
              onClick={addNewTicket}>
              <div className="w-6 h-6 rounded-full border-[1.6px] border-primary flex justify-center items-center">
                <PlusIcon className="text-primary w-[14px] h-[14px]" />
              </div>
              <p className="text-[13px] font-medium leading-[14px]">add new support request</p>
            </Button>
          </>
        }
        columns={columns}
        data={tickets || []}
        isLoading={loading}
        minColumns={2}
        filters={{
          inputFilterColumnId: 'ticket #',
          view: true,
        }}
        LoadingClassName="!h-[158px]"
        TableClassName="lg:!max-h-[205px] overflow-y-scroll"
        showPagination={true}
        pageSize={3}
        paginationStyle="sm"
      />
    </div>
  );
};

export default ActiveTickets;
