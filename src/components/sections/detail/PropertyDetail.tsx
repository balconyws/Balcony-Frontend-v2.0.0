'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronsUpDownIcon, CircleXIcon, ShareIcon } from 'lucide-react';

import { Navigation } from '@/contexts';
import { Property } from '@/types';
import { chatActions, useAppDispatch, chatSlice, useAppSelector, waitForDispatch } from '@/redux';
import { imagePlaceholder, formatAddress } from '@/helper';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable, SingleColumnTable, Map } from '@/components/common';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';

type Props = {
  data: Property;
  apiKey: string;
  styleId: string;
};

const PropertDetail: React.FC<Props> = ({ data, apiKey, styleId }: Props) => {
  const dispatch = useAppDispatch();
  const { pushToStack, setDirection } = Navigation.useNavigation();
  const { loading } = useAppSelector(chatSlice.selectChat);
  const [viewFloorPlan, setViewFloorPlan] = useState<string | null>('');
  const [open, setOpen] = useState<boolean>(false);

  const columns: ColumnDef<Property['unitList']>[] = useMemo(
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
        id: 'unit',
        accessorKey: 'unit',
        enableHiding: true,
        header: ({ column }) => (
          <Button
            variant="secondary"
            size="sm"
            className="flex justify-center items-center gap-2 px-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span className="text-[#71717A] text-[11px] font-medium leading-4">unit</span>
            <ChevronsUpDownIcon className="text-primary w-3 h-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-primary text-[13px] leading-5">{row.getValue('unit')}</div>
        ),
      },
      {
        id: 'beds',
        accessorKey: 'beds',
        enableHiding: true,
        header: ({ column }) => (
          <Button
            variant="secondary"
            size="sm"
            className="flex justify-center items-center gap-2 px-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span className="text-[#71717A] text-[11px] font-medium leading-4">beds</span>
            <ChevronsUpDownIcon className="text-primary w-3 h-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-primary text-[13px] leading-5">{row.getValue('beds')}</div>
        ),
      },
      {
        id: 'baths',
        accessorKey: 'baths',
        enableHiding: true,
        header: ({ column }) => (
          <Button
            variant="secondary"
            size="sm"
            className="flex justify-center items-center gap-2 px-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span className="text-[#71717A] text-[11px] font-medium leading-4">baths</span>
            <ChevronsUpDownIcon className="text-primary w-3 h-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-primary text-[13px] leading-5">{row.getValue('baths')}</div>
        ),
      },
      {
        id: 'price',
        accessorKey: 'price',
        enableHiding: true,
        header: ({ column }) => (
          <Button
            variant="secondary"
            size="sm"
            className="flex justify-center items-center gap-2 px-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span className="text-[#71717A] text-[11px] font-medium leading-4">price</span>
            <ChevronsUpDownIcon className="text-primary w-3 h-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-primary text-[13px] leading-5">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(row.getValue('price'))}
          </div>
        ),
      },
      {
        id: 'floor plan',
        accessorKey: 'floorPlanImg',
        enableHiding: true,
        header: ({ column }) => (
          <Button
            variant="secondary"
            size="sm"
            className="flex justify-center items-center gap-2 px-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <span className="text-[#71717A] text-[11px] font-medium leading-4">floor plan</span>
            <ChevronsUpDownIcon className="text-primary w-3 h-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setViewFloorPlan(row.getValue('floor plan'));
              setOpen(true);
            }}
            className="bg-transparent border-b border-b-primary p-0 rounded-none text-[13px] leading-5 font-normal">
            view
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-0 lg:mb-12 xl:mb-0">
      <div className="flex flex-col w-full lg:w-[405px] gap-3">
        {/* Images */}
        <div className="relative w-full h-[173px] md:h-[249px] lg:h-[204px] rounded-2xl md:rounded-lg">
          <Image
            src={data.images[0]}
            alt={data.info.name}
            fill={true}
            placeholder={imagePlaceholder}
            className="rounded-2xl md:rounded-lg"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative w-1/2 h-[173px] md:h-[249px] lg:h-[205px] rounded-2xl md:rounded-lg">
            <Image
              src={data.images[1]}
              alt={data.info.name}
              fill={true}
              placeholder={imagePlaceholder}
              className="rounded-2xl md:rounded-lg"
            />
          </div>
          <div className="relative w-1/2 h-[173px] md:h-[249px] lg:h-[205px] rounded-2xl md:rounded-lg">
            <Image
              src={data.images[2]}
              alt={data.info.name}
              fill={true}
              placeholder={imagePlaceholder}
              className="rounded-2xl md:rounded-lg"
            />
          </div>
        </div>
        {/* Booking */}
        <div className="w-2/3 mt-[47px] lg:mt-[33px]">
          <h1 className="text-[28px] lg:text-[32px]">{data.info.name}</h1>
          <div className="mt-4 flex justify-end items-start gap-[30px] w-full">
            <div className="flex justify-center items-center w-fit">
              <Image src="/assets/icons/ratings-2.svg" alt="rating" width={117} height={23} />
              <p className="text-[17px]">(1)</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="m-0 p-0"
              onClick={() =>
                window.open(`https://web.whatsapp.com/send?text=${window.location.href}`)
              }>
              <ShareIcon className="text-primary w-6 h-6" />
            </Button>
          </div>
          <div className="mt-12">
            <Button
              className="leading-6 px-8"
              onClick={() => {
                pushToStack('tenant application', { property: data });
                setDirection('none');
              }}>
              apply for tenancy
            </Button>
          </div>
          <Separator className="block lg:hidden h-[0.9px] my-8 w-[87vw]" />
          <div className="mt-12 p-6 border border-border rounded-lg w-fit">
            <h1 className="text-[23px] leading-6 font-semibold tracking-[-1px]">lease duration</h1>
            <p className="mt-3 text-sm font-medium">months to years</p>
            <div className="mt-[6px] p-2 border border-border rounded-sm w-fit">
              <p className="text-sm text-[rgba(15,23,42,0.50)]">{data.other.leaseDuration}</p>
            </div>
          </div>
          <div className="mt-8 lg:mt-12">
            <Button variant="secondary" size="sm" className="leading-[14px] pl-0 ml-0">
              contact host for support
            </Button>
          </div>
          <p className="leading-5 text-sm">chat &/or call with the workspace host before booking</p>
          <Separator className="my-4 h-[0.8px]" />
          <div className="flex gap-4 w-fit">
            <Button
              variant="secondary"
              size="sm"
              className={`p-0 rounded-none w-[29px] h-[21px] leading-5 font-normal ${
                !loading && 'border-b border-b-primary'
              }`}
              isLoading={loading}
              strokeColor="#005451"
              onClick={async () => {
                await waitForDispatch(
                  dispatch,
                  chatActions.startConversation({ userId: data.host._id }),
                  state => {
                    const { conversations } = state.chat;
                    if (conversations) {
                      pushToStack('chats', { chat: conversations[0] });
                      setDirection('none');
                    }
                  }
                );
              }}>
              chat
            </Button>
            <Separator orientation="vertical" className="h-auto" />
            <Link href={`tel:${data.host?.phone}`}>
              <Button
                variant="secondary"
                size="sm"
                className="border-b border-b-primary p-0 rounded-none leading-5 font-normal">
                call
              </Button>
            </Link>
          </div>
          {/* Tables for Laptop Screens */}
          <div className="mt-12 w-[240px] hidden lg:flex xl:hidden flex-col gap-[30px]">
            {/* Location */}
            <SingleColumnTable
              type="location"
              data={[
                formatAddress({
                  address: data.info.address,
                  city: data.info.city,
                  state: data.info.state,
                  country: data.info.country,
                }),
              ]}
            />
            {/* Amenities */}
            {data.amenities && (
              <SingleColumnTable
                type="amenities"
                data={data.amenities}
                bodyHeight="max-h-[34vh] lg:max-h-[42vh]"
              />
            )}
          </div>
        </div>
      </div>
      <Separator orientation="vertical" className="h-auto hidden lg:block" />
      <div className="mt-12 lg:mt-0 lg:pl-6 flex flex-1 flex-col gap-[30px]">
        <div className="w-full flex flex-col xl:flex-row gap-[30px]">
          {/* Data Table */}
          <div className="flex-1 h-fit border border-border rounded-lg py-4 px-6">
            <DataTable
              heading={
                <h1 className="text-[20px] leading-8 font-medium tracking-[-1px]">availability</h1>
              }
              columns={columns}
              data={data.unitList.filter(i => i.status === 'not leased')}
              showPagination={true}
              TableClassName="max-h-[50vh] lg:max-h-[60vh] overflow-y-scroll"
              showBorders={true}
              filters={{
                inputFilterColumnId: 'unit',
                view: true,
              }}
            />
          </div>
          {/* Tables for Mobile & Desktop Screens */}
          <div className="w-full lg:w-[240px] flex lg:hidden xl:flex flex-col gap-[30px]">
            {/* Location */}
            <SingleColumnTable
              type="location"
              data={[
                formatAddress({
                  address: data.info.address,
                  city: data.info.city,
                  state: data.info.state,
                  country: data.info.country,
                }),
              ]}
            />
            {/* Amenities */}
            {data.amenities && (
              <SingleColumnTable
                type="amenities"
                data={data.amenities}
                bodyHeight="max-h-[24vh] xl:max-h-[52vh]"
              />
            )}
          </div>
        </div>
        {/* Details & Map */}
        <div className="flex flex-col xl:flex-row justify-center md:justify-start gap-[29px] mt-8 lg:mt-0 mb-[30px] lg:mb-0">
          <div className="w-full xl:w-1/2 p-6 rounded-lg border border-border">
            <h1 className="text-[28px] mb-[25px]">property overview</h1>
            <p className="text-[15px]">{data.info.summary}</p>
          </div>
          <Separator orientation="vertical" className="h-auto my-5 hidden xl:block" />
          <div className="w-full xl:w-1/2 h-[200px] md:h-[300px] xl:my-10">
            <Map
              apiKey={apiKey}
              styleId={styleId}
              showCurrentLocation={false}
              markers={[
                {
                  id: 1,
                  name: data.info.name,
                  address: formatAddress({
                    address: data.info.address,
                    city: data.info.city,
                    state: data.info.state,
                    country: data.info.country,
                  }),
                  lat: data.geocode.lat,
                  lon: data.geocode.lon,
                },
              ]}
              className="rounded-lg"
            />
          </div>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="!top-1/2 !left-1/2 min-w-[90vw] lg:min-w-[80vw] h-[90vh]">
          <DialogHeader className="relative w-full">
            <DialogTitle className="mb-5">floor plan</DialogTitle>
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                className="!p-0 absolute -top-4 -right-2 z-10">
                <CircleXIcon className="text-primary w-8 h-8" />
              </Button>
            </DialogClose>
            <DialogDescription className="relative w-full h-full">
              {viewFloorPlan && (
                <Image
                  src={viewFloorPlan}
                  alt={data.info.name}
                  fill={true}
                  placeholder={imagePlaceholder}
                  className="rounded-lg"
                />
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertDetail;
