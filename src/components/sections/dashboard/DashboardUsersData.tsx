'use client';

import { useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronsUpDownIcon } from 'lucide-react';

import { User } from '@/types';
import { userActions, useAppDispatch, userSlice, useAppSelector } from '@/redux';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common';
import { Spinner } from '@/components/ui/Spinner';

type Props = object;

const DashboardUsersData: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const { users, loading } = useAppSelector(userSlice.selectUser);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(userActions.getAllUsers());
  }, [dispatch]);

  const columns: ColumnDef<User>[] = useMemo(
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
        id: 'user',
        accessorKey: 'name',
        accessorFn: row => row.firstName + ' ' + row.lastName,
        enableHiding: true,
        header: () => (
          <Button
            variant="secondary"
            size="sm"
            className="flex justify-center items-center gap-2 px-0">
            <span className="text-[#71717A] text-[11px] font-medium leading-4">user</span>
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-primary text-[13px] leading-5">{row.getValue('user')}</div>
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
                      userActions.updateStatus({
                        userId: row.original._id,
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
                      userActions.updateStatus({
                        userId: row.original._id,
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
    ],
    [dispatch, updatingId]
  );

  return (
    <Card className="w-full md:w-[400px] h-fit border border-border rounded-md box-shadow-primary">
      <CardContent className="py-6 px-4">
        <DataTable
          heading={
            <div className="flex flex-col gap-2">
              <h1 className="text-[23px] leading-8 font-bold tracking-[-1px]">users</h1>
              <p className="text-[13px] font-medium leading-[14px]">*without host access</p>
            </div>
          }
          columns={columns}
          data={users ?? []}
          isLoading={loading}
          minColumns={2}
          filters={{
            inputFilterColumnId: 'user',
            inputFilterClassName: 'w-full',
            status: true,
            view: true,
            statusOptions: ['active', 'inactive'],
          }}
          TableClassName="!max-h-[311px] overflow-y-scroll"
          showBorders={true}
          filtersStyle="sm"
          filtersClassName="flex-wrap gap-3"
          showPagination={true}
          pageSize={3}
          paginationStyle="sm"
        />
      </CardContent>
    </Card>
  );
};

export default DashboardUsersData;
