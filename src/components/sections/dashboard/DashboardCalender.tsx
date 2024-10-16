'use client';

import { useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';

import { bookingActions, useAppDispatch, bookingSlice, useAppSelector } from '@/redux';
import { Calendar } from '@/components/ui/calendar';

type Props = {
  border?: boolean;
  style?: 'sm' | 'lg';
};

const DashboardCalender: React.FC<Props> = ({ border, style }: Props) => {
  const dispatch = useAppDispatch();
  const { bookedDates } = useAppSelector(bookingSlice.selectBooking);

  const isTablet: boolean = useMediaQuery({ query: '(max-width: 768px)' });
  const isLaptop: boolean = useMediaQuery({ query: '(min-width: 769px) and (max-width: 1600px)' });

  useEffect(() => {
    dispatch(bookingActions.getBookedDates());
  }, [dispatch]);

  return (
    <div
      className={`p-6 flex flex-col h-fit w-full lg:w-fit ${
        border
          ? 'border border-[rgba(228,228,231,0.50)] rounded-lg box-shadow-primary justify-center items-center'
          : 'border-none justify-center items-start'
      }`}>
      <h1 className="text-[23px] font-bold leading-8 tracking-[-1px] mb-6">bookings overview</h1>
      <Calendar
        mode="multiple"
        numberOfMonths={style === 'lg' ? (isTablet ? 1 : 2) : isLaptop || isTablet ? 1 : 2}
        selected={bookedDates}
        className={`w-fit rounded-lg ${isTablet ? 'border border-primary' : 'border-t border-t-border'}`}
        icon={isTablet ? 'arrows' : 'badge-check'}
      />
    </div>
  );
};

export default DashboardCalender;
