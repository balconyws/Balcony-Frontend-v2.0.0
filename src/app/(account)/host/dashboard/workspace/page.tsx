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
  DashboardCalender,
  DashboardPayoutCard,
  DashboardBookingAcceptance,
  DashboardPromoCard,
  DashboardWorkspaceManager,
  DashboardAllBookings,
} from '@/components/sections';

type Props = object;

const HostWorkspaceDashboard: NextPage<Props> = () => {
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
      const res = await UserServerActions.CreateOnBoardingAccount({ type: 'workspaces' });
      if ('data' in res) {
        const newTab = window.open(res.data.url, '_blank');
        if (newTab) {
          newTab.focus();
        }
      }
      setLoading(false);
    };
    if (user && !user.isWorkspaceAccountConnected) {
      setOpen(true);
      setTitle('important step!');
      setDescription(
        'please complete your payout information to receive payouts when bookings are completed'
      );
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
          <div
            className={`mt-6 lg:mt-16 flex justify-between items-start gap-6 flex-col ${
              !isLaptop ? 'xl:flex-row' : ''
            }`}>
            <div className={`w-full flex flex-col gap-6 ${!isLaptop ? 'xl:w-[46%]' : ''}`}>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex flex-col gap-6">
                  <DashboardViewRequestCard type="workspaces" />
                  <div className="flex flex-row lg:flex-col gap-6">
                    <DashboardProgressCard type="workspaces" balanceType="earned" />
                    <DashboardProgressCard type="workspaces" balanceType="deposited" />
                  </div>
                </div>
                <div className="flex flex-col justify-start items-center lg:items-end gap-6">
                  <DashboardCalender border={true} style="lg" />
                  <div className={`hidden flex-col gap-6 ${!isLaptop ? 'xl:flex' : ''}`}>
                    <div className="w-full md:w-[353px]">
                      <DashboardPayoutCard type="workspaces" />
                    </div>
                    <DashboardBookingAcceptance />
                  </div>
                </div>
                <div className={`hidden lg:flex flex-col gap-6 ${!isLaptop ? 'xl:hidden' : ''}`}>
                  <div className="w-full md:w-[353px]">
                    <DashboardPayoutCard type="workspaces" />
                  </div>
                  <DashboardBookingAcceptance />
                </div>
              </div>
              <div
                className={`hidden w-fit h-fit ${!isLaptop ? 'xl:block xl:-mt-[32.8%] xl:ml-[3.9%]' : ''}`}>
                <DashboardPromoCard applicableOn="workspace" />
              </div>
              <div className="w-fit h-fit z-10">
                <DashboardWorkspaceManager />
              </div>
            </div>
            <div className={`w-full ${!isLaptop ? 'xl:w-[46%]' : ''}`}>
              <DashboardAllBookings />
            </div>
            <div className={`block w-fit h-fit z-10 ${!isLaptop ? 'xl:hidden' : ''}`}>
              <DashboardPromoCard applicableOn="workspace" />
            </div>
            <div className="flex flex-col gap-6 lg:hidden">
              <div className="w-full md:w-[353px]">
                <DashboardPayoutCard type="workspaces" />
              </div>
              <DashboardBookingAcceptance />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default withProtectedRoute(HostWorkspaceDashboard, ['host', 'admin'], '/host/add/workspace');
