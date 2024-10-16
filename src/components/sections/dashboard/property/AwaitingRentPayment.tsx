'use client';

import { useCallback, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontalIcon } from 'lucide-react';

import { Navigation } from '@/contexts';
import { Tenant } from '@/types';
import { useAppDispatch, tenantSlice, useAppSelector } from '@/redux';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common';

type Props = object;

const DashboardAwaitingRentPayment: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const { loading, awaitingRents } = useAppSelector(tenantSlice.selectTenant);
  const { pushToStack, setDirection } = Navigation.useNavigation();

  const goToTenantRenewLease = useCallback(
    (tenant: Tenant) => {
      dispatch(tenantSlice.setTenantDetail({ tenant, isViewOnly: false }));
      pushToStack('tenant renew lease');
      setDirection('none');
    },
    [dispatch, pushToStack, setDirection]
  );

  const columns: ColumnDef<Tenant>[] = useMemo(
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
        id: 'tenant application',
        accessorKey: 'tenant',
        accessorFn: row => row.info.firstName + ' ' + row.info.lastName,
        enableHiding: true,
        header: () => (
          <Button
            variant="secondary"
            size="sm"
            className="flex justify-center items-center gap-2 px-0">
            <span className="text-[#71717A] text-[11px] font-medium leading-4">
              tenant application
            </span>
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-primary text-[13px] leading-5">
            {row.getValue('tenant application')}
          </div>
        ),
      },
      {
        id: 'view',
        accessorKey: 'view',
        enableHiding: true,
        header: () => <MoreHorizontalIcon className="h-4 w-4" />,
        cell: ({ row: { original } }) => (
          <Button
            variant="outline"
            className="text-[8px] !px-3 !py-[2px] -rotate-1"
            onClick={() => goToTenantRenewLease(original)}>
            view
          </Button>
        ),
      },
    ],
    [goToTenantRenewLease]
  );

  return (
    <Card className="w-full md:w-[400px] h-fit border border-border rounded-md box-shadow-primary">
      <CardContent className="px-6 py-4">
        <DataTable
          heading={
            <div className="flex flex-col gap-2">
              <h1 className="text-[20px] leading-8 font-bold tracking-[-1px]">
                awaiting rent payment
              </h1>
              <p className="text-[13px] font-medium leading-[14px] mb-2">
                still pending rent. If 2 days go by after the first of the month, and we don’t see
                the payment, it shows up here:
              </p>
            </div>
          }
          columns={columns}
          data={awaitingRents || []}
          isLoading={loading}
          minColumns={2}
          filters={{
            inputFilterColumnId: 'tenant application',
            inputFilterClassName: 'w-full',
            status: true,
            view: true,
            statusOptions: ['active', 'inactive'],
          }}
          filtersStyle="sm"
          filtersClassName="flex-wrap gap-3"
          showPagination={true}
          pageSize={3}
          paginationStyle="sm"
          showBorders={true}
          TableClassName="lg:!max-h-[212px] overflow-y-scroll"
          LoadingClassName="!h-[128px]"
        />
      </CardContent>
    </Card>
  );
};

export default DashboardAwaitingRentPayment;
