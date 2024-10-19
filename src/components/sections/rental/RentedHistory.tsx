'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontalIcon } from 'lucide-react';

import { Navigation } from '@/contexts';
import { Tenant } from '@/types';
import { useAppDispatch, tenantSlice, useAppSelector, tenantActions } from '@/redux';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/common';

type Props = object;

const RentedHistory: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const { history } = useAppSelector(tenantSlice.selectTenant);
  const { pushToStack } = Navigation.useNavigation();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    dispatch(tenantActions.getUserAsTenants({ status: 'history' })).then(() => setLoading(false));
  }, [dispatch]);

  const goToRentDetail = useCallback(
    (tenant: Tenant) => {
      dispatch(tenantSlice.setTenantDetail({ tenant }));
      pushToStack('rent detail');
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
          <Button
            variant="secondary"
            size="sm"
            className="h-4 w-4 px-0 bg-transparent"
            onClick={() => goToRentDetail(original)}>
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [goToRentDetail]
  );

  return (
    <div className="mb-4">
      <DataTable
        heading={
          <>
            <h1 className="text-[20px] leading-8 font-bold tracking-[-1px]">
              rented history{' '}
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
        filters={{
          inputFilterColumnId: 'building',
          view: true,
        }}
        showBorders={true}
        TableClassName="lg:!max-h-[212px] overflow-y-scroll"
        LoadingClassName="!h-[128px]"
        filtersStyle="sm"
        showPagination={true}
        pageSize={3}
        paginationStyle="sm"
      />
    </div>
  );
};

export default RentedHistory;
