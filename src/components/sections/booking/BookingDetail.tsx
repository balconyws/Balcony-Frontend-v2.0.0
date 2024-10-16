'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowLeftIcon } from 'lucide-react';

import { Navigation } from '@/contexts';
import { bookingSlice, authSlice, useAppSelector } from '@/redux';
import { capitalizeWords, formatCurrency, getNumberOfDays, validator } from '@/helper';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type Props = object;

const BookingDetail: React.FC<Props> = () => {
  const { bookingDetail } = useAppSelector(bookingSlice.selectBooking);
  const { user } = useAppSelector(authSlice.selectAuth);
  const { popFromStack, previousPage, direction, pageVariants } = Navigation.useNavigation();

  let days = 1;
  if (bookingDetail) {
    days = getNumberOfDays(new Date(bookingDetail.startDate), new Date(bookingDetail.endDate));
  }

  return (
    <motion.div
      custom={direction}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full h-full">
      <div className="w-full h-full px-6">
        <Button
          variant="outline"
          className="flex justify-center items-center gap-2 hover:[svg]:text-primary-foreground"
          onClick={popFromStack}>
          <ArrowLeftIcon className="w-4 h-4" />
          <span className="leading-6">back to {previousPage}</span>
        </Button>
        <div className="xl:pt-10 h-full">
          {bookingDetail && (
            <div className="flex flex-col w-full md:w-[383px]">
              <div className="mt-6 w-full h-fit pt-[1px] pb-4 pl-[1px] rounded-lg border border-[#E4E4E7] box-shadow-primary">
                <div className="rounded-t-lg form--header-bg p-6">
                  <h1 className="text-[17px] font-semibold leading-7 tracking-[-1px]">
                    Order {bookingDetail._id.slice(-10)}
                  </h1>
                  <p className="text-[13px] text-[#71717A] leading-5">
                    Date: {format(new Date(bookingDetail.createdAt), 'MMMM dd, yyyy')}
                  </p>
                </div>
                <div className="px-6 h-fit">
                  <div className="h-fit">
                    <p className="mt-6 text-[13px] font-semibold leading-5">Order Details</p>
                    <div className="mt-3 flex justify-between items-center">
                      <p className="text-[#71717A] text-[13px] leading-5">
                        {bookingDetail.workspace.info.name} x {days} day{days !== 1 ? 's' : ''}
                      </p>
                      <p className="text-[13px] leading-5">
                        {formatCurrency(
                          bookingDetail.workspace.pricing.totalPerDay * days,
                          bookingDetail.workspace.pricing.currency
                        )}
                      </p>
                    </div>
                    <Separator className="bg-[#E4E4E7] mt-12 h-[0.8px] mb-5" />
                    <div className="mt-3 flex justify-between items-center">
                      <p className="text-[#71717A] text-[13px] leading-5">subtotal</p>
                      <p className="text-[13px] leading-5">
                        {formatCurrency(bookingDetail.subtotal / 100)}
                      </p>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <p className="text-[#71717A] text-[13px] leading-5">fees</p>
                      <p className="text-[13px] leading-5">
                        {formatCurrency(5, bookingDetail.workspace.pricing.currency)}
                      </p>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <p className="text-[#71717A] text-[13px] leading-5">discount</p>
                      <p className="text-[13px] leading-5">
                        {formatCurrency(
                          -(bookingDetail.discount / 100),
                          bookingDetail.workspace.pricing.currency
                        )}
                      </p>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <p className="text-[#71717A] text-[13px] font-semibold leading-5">total</p>
                      <p className="text-[13px] leading-5">
                        {formatCurrency(
                          bookingDetail.subtotal / 100 + 5 - bookingDetail.discount / 100,
                          bookingDetail.workspace.pricing.currency
                        )}
                      </p>
                    </div>
                    <Separator className="bg-[#E4E4E7] my-4 h-[0.8px]" />
                    <p className="text-[13px] font-semibold leading-5">Customer Information</p>
                    <div className="mt-3 flex justify-between items-center">
                      <p className="text-[#71717A] text-[13px] leading-5">name</p>
                      <p className="text-[13px] leading-5">
                        {capitalizeWords(bookingDetail.user?.firstName ?? user?.firstName)}{' '}
                        {capitalizeWords(bookingDetail.user?.lastName ?? user?.lastName)}
                      </p>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <p className="text-[#71717A] text-[13px] leading-5">email</p>
                      <p className="text-[13px] leading-5">
                        {bookingDetail.user?.email ?? user?.email}
                      </p>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <p className="text-[#71717A] text-[13px] leading-5">phone</p>
                      <p className="text-[13px] leading-5">
                        {validator.formatPhoneNumber(
                          bookingDetail.user?.phone ?? user?.phone ?? ''
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BookingDetail;
