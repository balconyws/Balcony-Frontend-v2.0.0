'use client';

import { useCallback, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ChevronsUpDownIcon } from 'lucide-react';

import { Navigation } from '@/contexts';
import { Tenant } from '@/types';
import { tenantActions, useAppDispatch, tenantSlice, useAppSelector } from '@/redux';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/common';
import { Spinner } from '@/components/ui/Spinner';

type Props = object;

const TenantManager: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const { loading, tenants } = useAppSelector(tenantSlice.selectTenant);
  const { pushToStack, setDirection } = Navigation.useNavigation();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const goToTenantApproval = useCallback(
    (tenant: Tenant) => {
      dispatch(tenantSlice.setTenantDetail({ tenant, isViewOnly: true }));
      pushToStack('tenant approval');
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
        id: 'tenant’s name',
        accessorKey: 'name',
        accessorFn: row => row.info.firstName + ' ' + row.info.lastName,
        enableHiding: true,
        header: () => (
          <Button
            variant="secondary"
            size="sm"
            className="flex justify-center items-center gap-2 px-0">
            <span className="text-[#71717A] text-[11px] font-medium leading-4">tenant’s name</span>
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-primary text-[13px] leading-5">{row.getValue('tenant’s name')}</div>
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
          <div
            className={`flex w-[80px] h-6 p-[2px] rounded-lg shadow-md ${
              updatingId === row.original._id && 'justify-center items-center'
            }`}>
            {updatingId === row.original._id ? (
              <Spinner size="small" show={true} />
            ) : (
              <>
                <Button
                  variant={row.getValue('status') === 'active' ? 'default' : 'secondary'}
                  className="w-1/2 text-[8px]"
                  onClick={async () => {
                    if (row.getValue('status') === 'active') return;
                    setUpdatingId(row.original._id);
                    await dispatch(
                      tenantActions.updateStatus({
                        tenantId: row.original._id,
                        status: 'active',
                      })
                    ).then(() => setUpdatingId(null));
                  }}>
                  active
                </Button>
                <Button
                  variant={row.getValue('status') === 'inactive' ? 'default' : 'secondary'}
                  className="w-1/2 text-[8px]"
                  onClick={async () => {
                    if (row.getValue('status') === 'inactive') return;
                    setUpdatingId(row.original._id);
                    await dispatch(
                      tenantActions.updateStatus({
                        tenantId: row.original._id,
                        status: 'inactive',
                      })
                    ).then(() => setUpdatingId(null));
                  }}>
                  inactive
                </Button>
              </>
            )}
          </div>
        ),
      },
      {
        id: 'property',
        accessorKey: 'property',
        accessorFn: row => row.selectedUnit.property.info.name,
        enableHiding: true,
        header: ({ column }) => (
          <Button
            variant="secondary"
            size="sm"
            className="flex justify-center items-center gap-2 px-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span className="text-[#71717A] text-[11px] font-medium leading-4">property</span>
            <ChevronsUpDownIcon className="text-primary w-3 h-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-primary text-[13px] leading-5">{row.getValue('property')}</div>
        ),
      },
      {
        id: 'units',
        accessorKey: 'units',
        accessorFn: row => row.selectedUnit.unit,
        enableHiding: true,
        header: ({ column }) => (
          <Button
            variant="secondary"
            size="sm"
            className="flex justify-center items-center gap-2 px-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span className="text-[#71717A] text-[11px] font-medium leading-4">units</span>
            <ChevronsUpDownIcon className="text-primary w-3 h-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-primary text-[13px] leading-5">{row.getValue('units')}</div>
        ),
      },
      {
        id: 'lease end date',
        accessorKey: 'leasedEndDate',
        accessorFn: row => row.agreement?.leaseEndDate,
        enableHiding: true,
        header: ({ column }) => (
          <Button
            variant="secondary"
            size="sm"
            className="flex justify-center items-center gap-2 px-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span className="text-[#71717A] text-[11px] font-medium leading-4">lease end date</span>
            <ChevronsUpDownIcon className="text-primary w-3 h-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-primary text-[13px] leading-5">
            {format(new Date(row.getValue('lease end date') ?? Date()), 'MMMM dd, yyyy')}
          </div>
        ),
      },
      {
        id: 'lease overview',
        accessorKey: 'view',
        enableHiding: true,
        header: ({ column }) => (
          <Button
            variant="secondary"
            size="sm"
            className="flex justify-center items-center gap-2 px-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span className="text-[#71717A] text-[11px] font-medium leading-4">lease overview</span>
            <ChevronsUpDownIcon className="text-primary w-3 h-3" />
          </Button>
        ),
        cell: ({ row: { original } }) => (
          <Button
            variant="outline"
            className="text-[8px] !px-3 !py-[2px] -rotate-1"
            onClick={() => goToTenantApproval(original)}>
            view
          </Button>
        ),
      },
    ],
    [dispatch, goToTenantApproval, updatingId]
  );

  return (
    <Card className="w-full border border-border rounded-md box-shadow-primary">
      <CardContent className="px-6 py-4">
        <DataTable
          heading={
            <h1 className="text-[20px] leading-8 font-bold tracking-[-1px]">tenant manager</h1>
          }
          columns={columns}
          data={tenants || []}
          isLoading={loading}
          filters={{
            inputFilterColumnId: 'tenant’s name',
            inputFilterClassName: 'w-full',
            status: true,
            view: true,
            statusOptions: ['active', 'inactive'],
          }}
          filtersClassName="flex-wrap gap-3"
          showPagination={true}
          showBorders={true}
          TableClassName="lg:!max-h-[348px] overflow-y-scroll"
          LoadingClassName="!h-[128px]"
        />
      </CardContent>
    </Card>
  );
};

export default TenantManager;
