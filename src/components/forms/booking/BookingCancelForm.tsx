'use client';

import Link from 'next/link';
import { useState } from 'react';
import { format } from 'date-fns';

import { Booking } from '@/types';
import { Navigation, Cta } from '@/contexts';
import { capitalizeWords, formatCurrency, getNumberOfDays } from '@/helper';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  bookingActions,
  chatActions,
  useAppDispatch,
  bookingSlice,
  authSlice,
  chatSlice,
  useAppSelector,
  waitForDispatch,
} from '@/redux';

type Props = {
  booking: Booking;
};

const BookingCancelForm: React.FC<Props> = ({ booking }: Props) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(bookingSlice.selectBooking);
  const { user } = useAppSelector(authSlice.selectAuth);
  const { loading: chatLoading } = useAppSelector(chatSlice.selectChat);
  const { setOpen, pushToStack, popFromStack, setDirection } = Navigation.useNavigation();
  const [resError, setResError] = useState<string>('');
  const {
    setOpen: CtaOpenHandler,
    setTitle,
    setDescription,
    setSubmitBtnText,
    setSubmitBtnAction,
    setCloseBtnText,
  } = Cta.useCta();

  const days = getNumberOfDays(new Date(booking.startDate), new Date(booking.endDate));

  const onCancelBooking = async () => {
    setResError('');
    await waitForDispatch(
      dispatch,
      bookingActions.cancelBookingByUser({
        bookingId: booking._id,
      }),
      state => {
        const { isFailed, error } = state.booking;
        if (!isFailed) {
          setOpen(false);
          CtaOpenHandler(true);
          setTitle('your all set!');
          setDescription('You should receive an email with the cancellation & refund.');
          setSubmitBtnText('visit booking details page');
          setSubmitBtnAction(() => () => {
            popFromStack();
            pushToStack('all booking');
            CtaOpenHandler(false);
          });
          setCloseBtnText('done');
        } else {
          setResError(error?.message || 'something went wrong');
        }
      }
    );
  };

  return (
    <div className="flex flex-col w-full md:w-[383px]">
      <div className="mt-6 w-full h-fit pt-[1px] pl-[1px] rounded-lg border border-[#E4E4E7] box-shadow-primary">
        <div className="rounded-t-lg form--header-bg p-6">
          <h1 className="text-[17px] font-semibold leading-7 tracking-[-1px]">
            Order {booking._id.slice(-10)}
          </h1>
          <p className="text-[13px] text-[#71717A] leading-5">
            Date: {format(new Date(booking.createdAt), 'MMMM dd, yyyy')}
          </p>
        </div>
        <ScrollArea className="px-6 h-[35vh] lg:h-[40vh] xl:h-[45vh]">
          <div className="h-fit">
            <p className="mt-6 text-[13px] font-semibold leading-5">Order Details</p>
            <div className="mt-3 flex justify-between items-center">
              <p className="text-[#71717A] text-[13px] leading-5">
                {booking.workspace.info.name} x {days} day{days !== 1 ? 's' : ''}
              </p>
              <p className="text-[13px] leading-5">
                {formatCurrency(
                  booking.workspace.pricing.totalPerDay * days,
                  booking.workspace.pricing.currency
                )}
              </p>
            </div>
            <Separator className="bg-[#E4E4E7] mt-12 h-[0.8px] mb-5" />
            <div className="mt-3 flex justify-between items-center">
              <p className="text-[#71717A] text-[13px] leading-5">subtotal</p>
              <p className="text-[13px] leading-5">{formatCurrency(booking.subtotal / 100)}</p>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <p className="text-[#71717A] text-[13px] leading-5">fees</p>
              <p className="text-[13px] leading-5">
                {formatCurrency(5, booking.workspace.pricing.currency)}
              </p>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <p className="text-[#71717A] text-[13px] leading-5">discount</p>
              <p className="text-[13px] leading-5">
                {formatCurrency(-(booking.discount / 100), booking.workspace.pricing.currency)}
              </p>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <p className="text-[#71717A] text-[13px] font-semibold leading-5">total</p>
              <p className="text-[13px] leading-5">
                {formatCurrency(
                  booking.subtotal / 100 + 5 - booking.discount / 100,
                  booking.workspace.pricing.currency
                )}
              </p>
            </div>
            <Separator className="bg-[#E4E4E7] my-4 h-[0.8px]" />
            <p className="text-[13px] font-semibold leading-5">Customer Information</p>
            <div className="mt-3 flex justify-between items-center">
              <p className="text-[#71717A] text-[13px] leading-5">Customer</p>
              <p className="text-[13px] leading-5">
                {capitalizeWords(user?.firstName ?? '')} {capitalizeWords(user?.lastName ?? '')}
              </p>
            </div>
            <Separator className="bg-[#E4E4E7] my-4 h-[0.8px]" />
            <p className="text-[13px] font-semibold leading-5">cancel order</p>
            <p className="mt-[5px] text-[8px] font-semibold leading-[10px]">
              You can cancel before 24 hours of the book start date/time for a full refund. Failure
              to cancel before 24 hours results in a 25% late cancelation charge.
            </p>
            {resError && (
              <p className="text-[10px] mt-2 -mb-2 font-medium text-destructive">{resError}</p>
            )}
            <Button
              variant="outline"
              className={`mt-4 mb-6 w-[160px] h-[38px] leading-6 font-medium ${
                loading && 'hover:bg-secondary hover:text-secondary-foreground'
              }`}
              strokeColor="#005451"
              isLoading={loading}
              onClick={onCancelBooking}>
              cancel booking
            </Button>
          </div>
        </ScrollArea>
      </div>
      <div className="mt-12">
        <Button variant="secondary" size="sm" className="leading-[14px] pl-0 ml-0 !cursor-default">
          contact host for support
        </Button>
      </div>
      <div className="w-[252px]">
        <p className="leading-5 text-sm">chat &/or call with the workspace host before booking</p>
        <Separator className="my-4" />
      </div>
      <div className="flex gap-4 w-fit">
        <Button
          variant="secondary"
          size="sm"
          className={`p-0 rounded-none w-[29px] h-[21px] leading-5 font-normal ${
            !chatLoading && 'border-b border-b-primary'
          }`}
          isLoading={chatLoading}
          strokeColor="#005451"
          onClick={async () => {
            await waitForDispatch(
              dispatch,
              chatActions.startConversation({ userId: booking.workspace.host._id }),
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
        <Link href={`tel:${booking.workspace.host?.phone}`}>
          <Button
            variant="secondary"
            size="sm"
            className="border-b border-b-primary p-0 rounded-none leading-5 font-normal">
            call
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default BookingCancelForm;
