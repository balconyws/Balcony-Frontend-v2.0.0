'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';

import { Navigation } from '@/contexts';
import { Tenant } from '@/types';
import { useAppDispatch, tenantSlice, useAppSelector, tenantActions } from '@/redux';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/common';

type Props = object;

const AwaitingReview: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const { awaiting } = useAppSelector(tenantSlice.selectTenant);
  const { pushToStack } = Navigation.useNavigation();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    dispatch(tenantActions.getUserAsTenants({ status: 'awaiting' })).then(() => setLoading(false));
  }, [dispatch]);

  const goToTenantPayment = useCallback(
    (tenant: Tenant) => {
      dispatch(tenantSlice.setTenantDetail({ tenant }));
      pushToStack('tenant payment');
    },
    [dispatch, pushToStack]
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
        id: 'building',
        accessorKey: 'name',
        accessorFn: row => row.selectedUnit.property.info.name,
        enableHiding: true,
        header: () => (
          <Button
            variant="secondary"
            size="sm"
            className="flex justify-center items-center gap-2 px-0">
            <span className="text-[#71717A] text-[11px] font-medium leading-4">building</span>
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-primary text-[13px] leading-5">{row.getValue('building')}</div>
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
          <>
            {original.acceptance === 'approved' ? (
              <Button
                variant="outline"
                className="rounded-md text-[8px] font-medium leading-[8px] !py-0 !px-2 -rotate-1"
                onClick={() => goToTenantPayment(original)}>
                approved, finish application
              </Button>
            ) : (
              <p className="flex text-[8px] font-medium leading-6">
                pending approval:
                <Button
                  variant="underline"
                  className="ml-1 text-[8px] bg-transparent font-medium border-none underline"
                  onClick={() => pushToStack('tenant application', { tenant: original })}>
                  review app..
                </Button>
              </p>
            )}
          </>
        ),
      },
    ],
    [goToTenantPayment, pushToStack]
  );

  return (
    <DataTable
      heading={
        <h1 className="text-[20px] leading-8 font-bold tracking-[-1px]">
          awaiting review{' '}
          <span className="text-[12px] text-primary font-normal leading-3 tracking-[-1px]">
            (active)
          </span>
        </h1>
      }
      columns={columns}
      data={awaiting || []}
      isLoading={loading}
      minColumns={2}
      filters={{
        inputFilterColumnId: 'building',
        view: true,
      }}
      showBorders={true}
      TableClassName="lg:!max-h-[160px] overflow-y-scroll"
      LoadingClassName="!h-[58px]"
      filtersStyle="sm"
      showPagination={true}
      pageSize={3}
      paginationStyle="sm"
    />
  );
};

export default AwaitingReview;
