'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronsUpDownIcon, PlusIcon } from 'lucide-react';

import { Property } from '@/types';
import { Cta } from '@/contexts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/common';
import { Spinner } from '@/components/ui/Spinner';
import { propertyActions, useAppDispatch, authSlice, propertySlice, useAppSelector } from '@/redux';

type Props = object;

const PropertyManager: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(authSlice.selectAuth);
  const { loading, properties } = useAppSelector(propertySlice.selectProperty);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const {
    setOpen,
    setTitle,
    setDescription,
    setSubmitBtnText,
    setSubmitBtnAction,
    setCloseBtnText,
    setCloseBtnAction,
    setLoading,
  } = Cta.useCta();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        dispatch(propertyActions.getAllProperties({}));
      }
      if (user.role === 'host') {
        dispatch(
          propertyActions.getHostProperties({
            hostId: user._id,
          })
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const handleDelete = useCallback(
    (id: string) => {
      setOpen(true);
      setTitle('permanently delete this property?');
      setDescription('');
      setSubmitBtnText('delete');
      setSubmitBtnAction(() => () => {
        setLoading(true);
        dispatch(propertyActions.deleteProperty({ propertyId: id })).then(() => {
          setOpen(false);
        });
      });
      setCloseBtnText('cancel');
      setCloseBtnAction(() => () => {});
    },
    [
      dispatch,
      setCloseBtnAction,
      setCloseBtnText,
      setDescription,
      setLoading,
      setOpen,
      setSubmitBtnAction,
      setSubmitBtnText,
      setTitle,
    ]
  );

  const columns: ColumnDef<Property>[] = useMemo(
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
        id: 'property',
        accessorKey: 'name',
        accessorFn: row => row.info.name,
        enableHiding: true,
        header: () => (
          <Button
            variant="secondary"
            size="sm"
            className="flex justify-center items-center gap-2 px-0">
            <span className="text-[#71717A] text-[11px] font-medium leading-4">property</span>
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-primary text-[13px] leading-5">{row.getValue('property')}</div>
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
                      propertyActions.updateStatus({
                        propertyId: row.original._id,
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
                      propertyActions.updateStatus({
                        propertyId: row.original._id,
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
        id: 'total units',
        accessorKey: 'unitList',
        enableHiding: true,
        header: ({ column }) => (
          <Button
            variant="secondary"
            size="sm"
            className="flex justify-center items-center gap-2 px-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span className="text-[#71717A] text-[11px] font-medium leading-4">total units</span>
            <ChevronsUpDownIcon className="text-primary w-3 h-3" />
          </Button>
        ),
        cell: ({ row: { original } }) => (
          <div className="text-primary text-[13px] leading-5">
            {Array.isArray(original?.unitList) && original.unitList.length}
          </div>
        ),
      },
      {
        id: 'leased',
        accessorKey: 'leased',
        enableHiding: true,
        header: ({ column }) => (
          <Button
            variant="secondary"
            size="sm"
            className="flex justify-center items-center gap-2 px-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span className="text-[#71717A] text-[11px] font-medium leading-4">leased</span>
            <ChevronsUpDownIcon className="text-primary w-3 h-3" />
          </Button>
        ),
        cell: ({ row: { original } }) => (
          <div className="text-primary text-[13px] leading-5">
            {original.unitList?.filter(i => i.status === 'leased').length}
          </div>
        ),
      },
      {
        id: 'not leased yet',
        accessorKey: 'notLeased',
        enableHiding: true,
        header: ({ column }) => (
          <Button
            variant="secondary"
            size="sm"
            className="flex justify-center items-center gap-2 px-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span className="text-[#71717A] text-[11px] font-medium leading-4">not leased yet</span>
            <ChevronsUpDownIcon className="text-primary w-3 h-3" />
          </Button>
        ),
        cell: ({ row: { original } }) => (
          <div className="text-primary text-[13px] leading-5">
            {original.unitList?.filter(i => i.status === 'not leased').length}
          </div>
        ),
      },
      {
        id: 'edit tenant info',
        accessorKey: 'edit',
        enableHiding: true,
        header: ({ column }) => (
          <Button
            variant="secondary"
            size="sm"
            className="flex justify-center items-center gap-2 px-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span className="text-[#71717A] text-[11px] font-medium leading-4">
              edit tenant info
            </span>
          </Button>
        ),
        cell: ({ row: { original } }) => (
          <div className="flex justify-start items-center gap-3">
            <Link href={`/host/update/property/${original._id}`}>
              <Button variant="outline" className="text-[8px] !px-3 !py-[2px] -rotate-1">
                update
              </Button>
            </Link>
            <Button
              variant="underline"
              className="text-[8px] font-normal !bg-transparent"
              onClick={() => handleDelete(original._id)}>
              delete
            </Button>
          </div>
        ),
      },
    ],
    [dispatch, handleDelete, updatingId]
  );

  return (
    <Card className="w-full border border-border rounded-md box-shadow-primary">
      <CardContent className="px-6 py-4">
        <DataTable
          heading={
            <div className="flex flex-col lg:flex-row items-start justify-center lg:justify-start lg:items-center gap-2 lg:gap-12 my-3">
              <h1 className="text-[20px] leading-8 font-bold tracking-[-1px]">property manager</h1>
              {user && user.role === 'host' && (
                <Link href="/host/add/property" className="w-fit h-fit">
                  <Button
                    type="button"
                    variant="secondary"
                    className="!p-0 flex gap-[10px] justify-start items-center">
                    <div className="w-6 h-6 rounded-full border-[1.6px] border-primary flex justify-center items-center">
                      <PlusIcon className="text-primary w-[14px] h-[14px]" />
                    </div>
                    <p className="text-[13px] font-medium leading-[14px]">add new property</p>
                  </Button>
                </Link>
              )}
            </div>
          }
          columns={columns}
          data={properties ?? []}
          isLoading={loading}
          filters={{
            inputFilterColumnId: 'property',
            inputFilterClassName: 'w-full',
            status: true,
            view: true,
            statusOptions: ['active', 'inactive'],
          }}
          TableClassName="max-h-[60vh] lg:max-h-[70vh] overflow-y-scroll"
          showBorders={true}
          filtersClassName="flex-wrap gap-3"
          showPagination={true}
        />
      </CardContent>
    </Card>
  );
};

export default PropertyManager;
