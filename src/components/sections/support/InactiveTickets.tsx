'use client';

import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';

import { Navigation } from '@/contexts';
import { Ticket } from '@/types';
import { ticketSlice, useAppSelector } from '@/redux';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/common';

type Props = object;

const InactiveTickets: React.FC<Props> = () => {
  const { loading, history } = useAppSelector(ticketSlice.selectTicket);
  const { pushToStack } = Navigation.useNavigation();

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
        id: 'view',
        accessorKey: 'info',
        enableHiding: true,
        header: ({ column }) => (
          <Button
            variant="secondary"
            size="sm"
            className="flex justify-center items-center gap-2 px-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span className="text-[#71717A] text-[11px] font-medium leading-4">view</span>
          </Button>
        ),
        cell: () => (
          <Button
            variant="underline"
            className="text-[10px] bg-transparent font-medium border-none underline"
            onClick={() => pushToStack('view ticket')}>
            view
          </Button>
        ),
      },
    ],
    [pushToStack]
  );

  return (
    <div className="mb-4">
      <DataTable
        heading={
          <>
            <h1 className="text-[20px] leading-8 font-bold tracking-[-1px]">
              support tickets{' '}
              <span className="text-[12px] text-primary font-normal leading-3 tracking-[-1px]">
                (inactive)
              </span>
            </h1>
            <p className="text-[8px] leading-3 tracking-tighter">
              we hold this data up to 3 months
            </p>
          </>
        }
        columns={columns}
        data={history || []}
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

export default InactiveTickets;
