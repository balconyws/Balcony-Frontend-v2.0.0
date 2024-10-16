'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import {
  PlusIcon,
  MoreHorizontalIcon,
  ChevronsLeftRightIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
} from 'lucide-react';
import {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/Spinner';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Props<TData, TValue> = {
  heading?: React.ReactNode;
  footer?: React.ReactNode;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  minColumns?: number;
  columnIndexToShow?: number;
  filters?: {
    inputFilterColumnId?: ColumnDef<TData, TValue>['id'];
    inputFilterClassName?: string;
    status?: boolean;
    priority?: boolean;
    view?: boolean;
    statusOptions?: string[];
    // eslint-disable-next-line no-unused-vars
    inputOnChange?: (value: string) => void;
  };
  filtersStyle?: 'sm' | 'md' | 'lg';
  filtersClassName?: string;
  showPagination?: boolean;
  pageSize?: number;
  paginationStyle?: 'sm' | 'md' | 'lg';
  showBorders?: boolean;
  showTableHead?: boolean;
  showTableFooter?: boolean;
  TableClassName?: string;
  TableCellClassName?: string;
  TableHeadClassName?: string;
  TableBodyClassName?: string;
  TableFooterClassName?: string;
  isLoading?: boolean;
  LoadingClassName?: string;
};

const DataTable: React.FC<Props<any, any>> = <TData extends object, TValue>({
  heading,
  footer,
  columns,
  data,
  minColumns = 1,
  columnIndexToShow,
  filters,
  filtersStyle = 'lg',
  filtersClassName,
  showPagination,
  pageSize = 6,
  paginationStyle = 'lg',
  showBorders = true,
  showTableHead = true,
  showTableFooter = false,
  TableClassName,
  TableCellClassName,
  TableHeadClassName,
  TableBodyClassName,
  TableFooterClassName,
  isLoading,
  LoadingClassName,
}: Props<TData, TValue>) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [columnSelection, setColumnSelection] = useState<string | undefined>(
    minColumns > 1 || columnIndexToShow
      ? undefined
      : columns[1] && columns[1].id
        ? columns[1].id
        : columns[0].id
  );

  const isMobile: boolean = useMediaQuery({ query: '(max-width: 600px)' });

  const tableColumns: ColumnDef<TData, TValue>[] = useMemo(
    () =>
      !isMobile || columns.length <= 1 || columns.length - 1 === minColumns
        ? columns
        : [
            ...columns,
            {
              id: 'actions',
              accessorKey: 'actions',
              enableHiding: false,
              header: () => (
                <Button variant="secondary" size="sm" className="p-0">
                  <ChevronsLeftRightIcon className="h-4 w-4" />
                </Button>
              ),
              cell: () => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="sm" className="h-4 w-4 px-0 bg-transparent">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {columns
                      .filter(column => column.enableHiding)
                      .map(column => (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="lowercase"
                          checked={columnSelection === column.id}
                          disabled={columnSelection === column.id}
                          onCheckedChange={value => {
                            setColumnVisibility(prev => ({
                              ...Object.fromEntries(
                                Object.keys(prev).map(id => [
                                  id,
                                  id === column.id
                                    ? value
                                    : id === 'actions' || id === 'select'
                                      ? true
                                      : false,
                                ])
                              ),
                            }));
                            setColumnSelection(column.id);
                          }}>
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
            },
          ],
    [isMobile, columns, minColumns, columnSelection]
  );

  useEffect(() => {
    setColumnVisibility(() =>
      columns.reduce((visibility, column, index) => {
        if (!column.id) return visibility;
        if (index < minColumns + 1 || index === columnIndexToShow) {
          visibility[column.id] = true;
        } else {
          visibility[column.id] = !isMobile;
        }
        return visibility;
      }, {} as VisibilityState)
    );
  }, [isMobile, columns, columnIndexToShow, minColumns]);

  const filteredData = useMemo(() => {
    if (selectedStatus) {
      return data.filter((item: TData) => 'status' in item && item.status === selectedStatus);
    }
    return data;
  }, [data, selectedStatus]);

  const table = useReactTable({
    data: filteredData,
    columns: tableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
  });

  return (
    <div className="w-full">
      {filters && (
        <div
          className={cn(
            'flex items-center gap-2',
            showTableHead ? 'mb-2' : 'mb-0',
            filtersClassName
          )}>
          {filters.inputFilterColumnId && (
            <Input
              placeholder="Filter search..."
              value={
                (table.getColumn(filters.inputFilterColumnId)?.getFilterValue() as string) ?? ''
              }
              onChange={event => {
                table
                  .getColumn(filters.inputFilterColumnId as string)
                  ?.setFilterValue(event.target.value);
                if (filters.inputOnChange) {
                  filters.inputOnChange(event.target.value);
                }
              }}
              className={cn(
                'max-w-sm h-[28px] px-3 py-2 border border-border rounded-sm text-[rgba(9,9,11,0.50)] text-[12px] leading-5 font-normal overflow-hidden text-ellipsis placeholder:text-[rgba(9,9,11,0.50)] placeholder:text-[12px] placeholder:leading-5 placeholder:font-normal box-shadow-primary',
                filters.inputFilterClassName
              )}
            />
          )}
          {filters.status && (
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                className="focus-visible:ring-offset-0 focus-visible:ring-transparent">
                <Button
                  variant="secondary"
                  className="relative flex justify-center items-center gap-2 w-[78px] h-[28px] !px-2 rounded-sm box-shadow-primary">
                  <div className="z-[1] w-3 h-3 rounded-full border border-primary flex justify-center items-center">
                    <PlusIcon className="text-primary w-[6px] h-[6px] ml-[1px]" />
                  </div>
                  <span className="text-[11px] leading-4 font-medium z-[1]">Status</span>
                  <Image
                    src="/assets/icons/round-border.png"
                    alt="border"
                    width={176}
                    height={64}
                    className="z-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[78px] h-[28px]"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {filters.statusOptions &&
                  filters.statusOptions.map((o: string, i: number) => (
                    <DropdownMenuCheckboxItem
                      key={i}
                      className="lowercase"
                      checked={selectedStatus === o}
                      onCheckedChange={value =>
                        value ? setSelectedStatus(o) : setSelectedStatus(undefined)
                      }>
                      {o}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {filters.priority && (
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                className="focus-visible:ring-offset-0 focus-visible:ring-transparent">
                <Button
                  variant="secondary"
                  className="relative flex justify-center items-center gap-2 w-[78px] h-[28px] !px-2 rounded-sm box-shadow-primary">
                  <div className="z-[1] w-3 h-3 rounded-full border border-primary flex justify-center items-center">
                    <PlusIcon className="text-primary w-[6px] h-[6px] ml-[1px]" />
                  </div>
                  <span className="text-[11px] leading-4 font-medium z-[1]">Priority</span>
                  <Image
                    src="/assets/icons/round-border.png"
                    alt="border"
                    width={176}
                    height={64}
                    className="z-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[78px] h-[28px]"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter(column => column.getCanHide())
                  .map(column => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="lowercase"
                      checked={column.getIsVisible()}
                      onCheckedChange={value => column.toggleVisibility(!!value)}>
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {filters.view && (
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                className={`focus-visible:ring-offset-0 focus-visible:ring-transparent ${
                  filtersStyle === 'sm' || !filters.status
                    ? 'w-[78px]'
                    : filtersStyle === 'md'
                      ? 'w-[78px] xl:mx-auto'
                      : 'w-[78px] lg:mx-auto'
                }`}>
                <Button
                  variant="secondary"
                  className="flex justify-center items-center gap-2 h-[28px] rounded-sm border border-[#E4E4E7] box-shadow-primary">
                  <Image
                    src="/assets/icons/filter.svg"
                    alt="view"
                    width={13}
                    height={11}
                    className=""
                  />
                  <span className="text-[11px] leading-4 font-medium">View</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter(column => column.getCanHide())
                  .map(column => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="lowercase"
                      checked={column.getIsVisible()}
                      onCheckedChange={value => column.toggleVisibility(!!value)}>
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
      {heading && <div>{heading}</div>}
      <div
        className={`rounded-sm ${showBorders ? 'border border-border' : 'border-none'} ${heading ? 'mt-2' : 'mt-0'}`}>
        <Table containerClassName={TableClassName}>
          {showTableHead && (
            <TableHeader
              className="sticky z-10 w-full h-12 top-0 bg-white"
              showBorder={showBorders}>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id} className="border-b-0">
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} className={TableHeadClassName}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
          )}
          <TableBody className={TableBodyClassName}>
            {isLoading ? (
              <TableRow>
                <TableCell
                  className={cn(TableCellClassName, LoadingClassName, 'h-[10vh] lg:h-[14vh]')}
                  colSpan={tableColumns.length}>
                  <Spinner
                    show={true}
                    className="w-full h-full"
                    iconClassName="w-6 lg:w-8 h-6 lg:h-8"
                  />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className={TableCellClassName}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className={cn('text-center', TableCellClassName)}>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {showTableFooter && (
            <TableFooter className={TableFooterClassName}>
              {footer && (
                <TableRow>
                  <TableCell className={TableCellClassName}>{footer}</TableCell>
                </TableRow>
              )}
            </TableFooter>
          )}
        </Table>
      </div>
      {showPagination && (
        <div
          className={`flex flex-wrap ${
            paginationStyle === 'md' ? 'gap-2 lg:gap-x-10 justify-start' : 'gap-2 justify-between'
          } ${
            paginationStyle === 'sm' && columns.length <= 1
              ? 'flex-col items-start mt-3'
              : paginationStyle === 'sm'
                ? 'flex-col items-start mt-3'
                : 'flex-col lg:flex-row items-start lg:items-center mt-3'
          }`}>
          {columns.length > 1 && (
            <div
              className={`text-[11px] text-[#71717A] font-normal leading-5 ${paginationStyle === 'md' ? '' : 'flex-1'}`}>
              {table.getFilteredSelectedRowModel().rows.length} of{' '}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
          )}
          <div className="flex gap-[30px]">
            <div className="flex items-center space-x-2">
              <p className="text-[9px] font-medium leading-5">Rows per page</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={value => {
                  table.setPageSize(Number(value));
                }}>
                <SelectTrigger className="flex justify-center items-center h-6 w-fit px-2 py-1 gap-[13px] rounded-sm text-[11px] font-normal box-shadow-primary">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[pageSize, pageSize * 2, pageSize * 3].map(pageSize => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div
              className={`flex items-center justify-center text-primary text-[9px] font-medium leading-5 ${
                paginationStyle === 'sm' ? '' : 'lg:w-[100px]'
              }`}>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
          </div>
          <div
            className={`flex items-center gap-2 ${paginationStyle !== 'lg' ? 'w-full mt-1' : ''}`}>
            <Button
              variant="secondary"
              size="sm"
              className="!p-1 rounded-sm border border-border box-shadow-primary"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}>
              <span className="sr-only">Go to first page</span>
              <ChevronsLeftIcon className="text-primary w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="!p-1 rounded-sm border border-border box-shadow-primary"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}>
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon className="text-primary w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="!p-1 rounded-sm border border-border box-shadow-primary"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}>
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon className="text-primary w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="!p-1 rounded-sm border border-border box-shadow-primary"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}>
              <span className="sr-only">Go to last page</span>
              <ChevronsRightIcon className="text-primary w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
