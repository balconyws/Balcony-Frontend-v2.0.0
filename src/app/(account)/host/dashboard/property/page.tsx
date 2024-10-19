'use client';

import { NextPage } from 'next';
import { useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';

import withProtectedRoute from '@/hoc/withProtectedRoute';
import { Cta } from '@/contexts';
import { authSlice, useAppSelector } from '@/redux';
import { UserServerActions } from '@/server';
import { Footer } from '@/components/common';
import {
  DashboardTopbar,
  DashboardViewRequestCard,
  DashboardProgressCard,
  DashboardPayoutCard,
  DashboardPromoCard,
  DashboardProspectTenant,
  DashboardAllManagers,
  DashboardAwaitingRentPayment,
} from '@/components/sections';

type Props = object;

const HostPropertyDashboard: NextPage<Props> = () => {
  const { user } = useAppSelector(authSlice.selectAuth);
  const isLaptop: boolean = useMediaQuery({ query: '(min-width: 992px) and (max-width: 1880px)' });

  const {
    setOpen,
    setTitle,
    setDescription,
    setSubmitBtnText,
    setSubmitBtnAction,
    setCloseBtnText,
    setLoading,
  } = Cta.useCta();

  useEffect(() => {
    const handlePayout = async () => {
      setLoading(true);
      const res = await UserServerActions.CreateOnBoardingAccount({ type: 'properties' });
      if ('data' in res) {
        const newTab = window.open(res.data.url, '_blank');
        if (newTab) {
          newTab.focus();
        }
      }
      setLoading(false);
    };
    if (user && !user.isPropertyAccountConnected) {
      setOpen(true);
      setTitle('important step!');
      setDescription('please complete your payout information to receive payouts for rentals');
      setSubmitBtnText('add payout info');
      setSubmitBtnAction(() => () => handlePayout());
      setCloseBtnText('close');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <main
        className={`relative z-[1] min-h-full pt-28 md:pt-36 flex flex-col justify-center items-center mb-10 lg:-mb-10 ${
          !isLaptop ? 'xl:pt-40 xl:-mb-20' : ''
        }`}>
        <div className="w-[90%] lg:w-4/5">
          <DashboardTopbar type="host" />
          <div className="mt-6 lg:mt-16 flex justify-between items-start gap-6 flex-col xl:flex-row">
            <div className="w-full xl:w-fit flex flex-col lg:flex-row xl:flex-col gap-6">
              <div className="flex flex-col gap-6">
                <DashboardViewRequestCard type="properties" />
                <div className="flex flex-row gap-6">
                  <DashboardProgressCard type="properties" balanceType="earned" />
                  <DashboardProgressCard type="properties" balanceType="deposited" />
                </div>
                <div className="hidden lg:block xl:hidden w-full md:w-[400px]">
                  <DashboardPayoutCard type="properties" />
                </div>
              </div>
              <DashboardProspectTenant />
              <div className="hidden xl:block w-full md:w-[400px]">
                <DashboardPayoutCard type="properties" />
              </div>
              <div className="hidden lg:block">
                <DashboardPromoCard applicableOn="property" />
              </div>
            </div>
            <div className="w-full xl:flex-1 flex flex-col gap-6">
              <DashboardAllManagers />
              <div className="w-fit h-fit z-10">
                <DashboardAwaitingRentPayment />
              </div>
            </div>
            <div className="flex lg:hidden flex-col gap-6 w-full">
              <DashboardPromoCard applicableOn="property" />
              <DashboardPayoutCard type="properties" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default withProtectedRoute(HostPropertyDashboard, ['host', 'admin']);
