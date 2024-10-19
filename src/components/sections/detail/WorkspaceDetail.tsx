'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { DateRange } from 'react-day-picker';
import { RWebShare } from 'react-web-share';
import { ShareIcon } from 'lucide-react';

import { Navigation } from '@/contexts';
import { Workspace } from '@/types';
import { SingleColumnTable, Map } from '@/components/common';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { imagePlaceholder, formatAddress, formatWorkspaceTimes, formatCurrency } from '@/helper';
import {
  chatActions,
  useAppDispatch,
  bookingSlice,
  chatSlice,
  useAppSelector,
  waitForDispatch,
} from '@/redux';

const formatWorkspaceOther = (workspace: Workspace): string[] => {
  const { isCoWorkingWorkspace, isIndoorSpace, isOutdoorSpace } = workspace.other;
  const result: string[] = [];
  if (isCoWorkingWorkspace) {
    result.push('shared co-working space');
  }
  if (isIndoorSpace) {
    result.push('indoor');
  }
  if (isOutdoorSpace) {
    result.push('outdoor');
  }
  return result;
};

const today = new Date();

type Props = {
  data: Workspace;
  apiKey: string;
  styleId: string;
};

const WorkspaceDetail: React.FC<Props> = ({ data, apiKey, styleId }: Props) => {
  const dispatch = useAppDispatch();
  const { pushToStack, setDirection } = Navigation.useNavigation();
  const { loading } = useAppSelector(chatSlice.selectChat);
  const [selectedDates, setSelectedDates] = useState<DateRange | undefined>({
    from: today,
    to: today,
  });
  const [resError, setResError] = useState<string>('');

  const isTablet: boolean = useMediaQuery({ query: '(min-width: 900px) and (max-width: 1315px)' });
  const isLaptop: boolean = useMediaQuery({ query: '(min-width: 992px) and (max-width: 1880px)' });

  const bookWorkspace = () => {
    setResError('');
    if (!selectedDates?.from) {
      setResError('please select a valid date range to book the workspace');
      return;
    }
    const from = selectedDates.from;
    const to = selectedDates.to || from;
    dispatch(
      bookingSlice.setSelectedBooking({
        booking: {
          workspace: data,
          selectedDates: { from: from.toISOString(), to: to.toISOString() },
        },
      })
    );
    pushToStack('payment booking');
    setDirection('none');
  };

  return (
    <>
      <div
        className={`h-full flex flex-wrap gap-[42px] ${isTablet ? 'justify-start' : 'justify-start lg:justify-center'}`}>
        {/* Images */}
        <div
          className={`${isTablet ? 'w-full' : `${isLaptop ? 'w-[720px]' : 'w-full xl:w-[600px]'} w-full lg:w-[720px]`} flex flex-col gap-3 lg:gap-6 order-1`}>
          <div className="relative w-full h-[173px] md:h-[249px] lg:h-[349px] rounded-2xl md:rounded-lg">
            <Image
              src={data.images[0]}
              alt={data.info.name}
              fill={true}
              placeholder={imagePlaceholder}
              className="rounded-2xl md:rounded-lg"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative w-1/2 h-[173px] md:h-[249px] lg:h-[351px] rounded-2xl md:rounded-lg">
              <Image
                src={data.images[1]}
                alt={data.info.name}
                fill={true}
                placeholder={imagePlaceholder}
                className="rounded-2xl md:rounded-lg"
              />
            </div>
            <div className="relative w-1/2 h-[173px] md:h-[249px] lg:h-[351px] rounded-2xl md:rounded-lg">
              <Image
                src={data.images[2]}
                alt={data.info.name}
                fill={true}
                placeholder={imagePlaceholder}
                className="rounded-2xl md:rounded-lg"
              />
            </div>
          </div>
        </div>
        <Separator
          orientation="vertical"
          className={`h-auto order-2 ${isTablet ? 'hidden' : 'hidden lg:block'}`}
        />
        {/* Tables */}
        <div
          className={`flex flex-col lg:flex-row gap-6 justify-center ${isLaptop ? 'w-full order-5' : 'w-full xl:w-[470px] order-5 xl:order-3'}`}>
          {/* Amenities Desktop */}
          {data.amenities && (
            <div
              className={`hidden lg:block w-full ${isLaptop ? 'lg:w-[250px]' : 'lg:w-[230px] '} order-2 lg:order-1`}>
              <SingleColumnTable type="amenities" data={data.amenities} />
            </div>
          )}
          <div
            className={`${isLaptop ? 'w-1/2 flex-row gap-6 flex-wrap order-2' : 'w-full xl:w-[250px] xl:justify-start flex-col gap-[15px] xl:gap-4 flex-wrap xl:flex-nowrap'} flex justify-center content-start items-start order-1`}>
            {/* Location */}
            <div className={`${isLaptop ? 'w-[47%]' : 'w-full'}`}>
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
            </div>
            {/* Amenities Mobile */}
            {data.amenities && (
              <div className="block lg:hidden w-full lg:w-[47%] xl:w-full">
                <SingleColumnTable type="amenities" data={data.amenities} />
              </div>
            )}
            {/* Booking Info */}
            <div className={`${isLaptop ? 'w-[47%]' : 'w-full'}`}>
              <SingleColumnTable
                type="bookingInfo"
                data={[
                  `${(formatCurrency(data.pricing.totalPerDay), 'usd')} per person`,
                  `${data.other.additionalGuests} extra guests allowed`,
                ]}
              />
            </div>
            {/* Service Hours */}
            <div className={`${isLaptop ? 'w-[47%]' : 'w-full'}`}>
              <SingleColumnTable type="serviceHours" data={formatWorkspaceTimes(data, 'EST')} />
            </div>
            {/* Workspace Info */}
            <div className={`${isLaptop ? 'w-[47%]' : 'w-full'}`}>
              <SingleColumnTable type="workspaceInfo" data={formatWorkspaceOther(data)} />
            </div>
          </div>
        </div>
        <Separator
          orientation="vertical"
          className={`h-auto hidden order-4 ${isLaptop ? 'hidden' : 'xl:block'}`}
        />
        {/* Booking */}
        <div className={`w-[278px] order-3 ${isLaptop ? 'order-3' : 'xl:order-5'} `}>
          <h1 className="text-[28px] lg:text-[32px] capitalize">{data.info.name}</h1>
          <div className="mt-4 flex justify-end items-start gap-[30px] w-full">
            <div className="flex justify-center items-center w-fit">
              <Image src="/assets/icons/ratings-2.svg" alt="rating" width={117} height={23} />
              <p className="text-[17px]">(1)</p>
            </div>
            <RWebShare
              data={{
                title: data.info.name,
                text: data.info.summary
                  ? data.info.summary.length > 100
                    ? data.info.summary.slice(0, 100) + '...'
                    : data.info.summary
                  : data.info.name,
                url: `${process.env.NEXT_PUBLIC_URL}/workspaces/${data._id}`,
              }}>
              <Button variant="secondary" size="sm" className="m-0 p-0">
                <ShareIcon className="text-primary w-6 h-6" />
              </Button>
            </RWebShare>
          </div>
          <div className="mt-8">
            <Calendar
              mode="range"
              selected={selectedDates}
              onSelect={dates => {
                setSelectedDates(dates);
                setResError('');
              }}
              initialFocus
              fromDate={today}
              className="rounded-md border border-primary"
            />
            {resError && (
              <p className="mt-6 -mb-6 text-[14px] font-medium text-destructive">{resError}</p>
            )}
          </div>
          <div className="mt-12">
            <Button className="leading-6 px-8" onClick={bookWorkspace}>
              book workspace
            </Button>
          </div>
          <Separator className="block lg:hidden mt-[55px] mb-8 w-[90vw]" />
          <div className="mt-12">
            <Button
              variant="secondary"
              size="sm"
              className="leading-[14px] pl-0 ml-0 !cursor-default">
              contact host for support
            </Button>
          </div>
          <p className="leading-5 text-sm">chat &/or call with the workspace host before booking</p>
          <Separator className="my-4" />
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
        </div>
      </div>
      <Separator className="mt-20 mb-[60px] hidden lg:block" />
      {/* Details & Map */}
      <div className="flex flex-col lg:flex-row justify-center md:justify-start gap-[23px] lg:gap-10 mt-6 lg:mt-0 mb-[30px] lg:mb-0">
        <div className="w-full lg:w-2/5 p-6 rounded-lg border border-border">
          <h1 className="text-[28px] mb-[25px]">workspace overview</h1>
          <p className="text-[15px]">{data.info.summary}</p>
        </div>
        <Separator orientation="vertical" className="h-auto my-5 hidden lg:block" />
        <div className="w-full lg:w-[500px] h-[200px] md:h-[300px] lg:my-10">
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
                price: data.pricing.totalPerDay,
                lat: data.geocode.lat,
                lon: data.geocode.lon,
              },
            ]}
            className="rounded-lg"
          />
        </div>
      </div>
    </>
  );
};

export default WorkspaceDetail;
