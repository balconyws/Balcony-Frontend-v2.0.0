'use client';

import { useEffect } from 'react';

import { autoActions, useAppDispatch, autoSlice, useAppSelector } from '@/redux';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/Spinner';

type Props = object;

const DashboardBookingAcceptance: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const { loading, status } = useAppSelector(autoSlice.selectAuto);

  useEffect(() => {
    dispatch(autoActions.checkStatus());
  }, [dispatch]);

  const handleAutoBooking = async (auto: boolean) => {
    if (auto && !status?.autoBooking) {
      await dispatch(autoActions.toggleAutoAcceptBooking());
    }
    if (!auto && status?.autoBooking) {
      await dispatch(autoActions.toggleAutoAcceptBooking());
    }
  };

  return (
    <Card className="w-full md:w-[353px] border border-border rounded-md box-shadow-primary">
      <CardContent className="p-6">
        <h1 className="text-[23px] font-semibold leading-6 tracking-[-1px]">booking acceptance</h1>
        <p className="mt-3 text-[rgba(0,84,81,0.70)] text-[12px] leading-5">
          you can automatically accept bookings as they come in or you may also manually accept
          orders as well.
        </p>
        <div
          className={`mt-6 flex w-[225px] h-10 p-[5px] rounded-lg shadow-md ${
            loading && 'justify-center items-center'
          }`}>
          {loading ? (
            <Spinner size="medium" show={true} />
          ) : (
            <>
              <Button
                variant={status?.autoBooking ? 'secondary' : 'default'}
                className="w-1/2"
                onClick={async () => {
                  await handleAutoBooking(false);
                }}>
                manually
              </Button>
              <Button
                variant={status?.autoBooking ? 'default' : 'secondary'}
                className="w-1/2"
                onClick={async () => {
                  await handleAutoBooking(true);
                }}>
                automatically
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardBookingAcceptance;
