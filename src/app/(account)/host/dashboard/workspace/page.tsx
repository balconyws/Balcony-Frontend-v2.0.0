'use client';

import { NextPage } from 'next';
import { useMediaQuery } from 'react-responsive';

import withProtectedRoute from '@/hoc/withProtectedRoute';
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
  const isLaptop: boolean = useMediaQuery({ query: '(min-width: 992px) and (max-width: 1880px)' });

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
                  <DashboardViewRequestCard />
                  <div className="flex flex-row lg:flex-col gap-6">
                    <DashboardProgressCard type="earned" />
                    <DashboardProgressCard type="deposited" />
                  </div>
                </div>
                <div className="flex flex-col justify-start items-center lg:items-end gap-6">
                  <DashboardCalender border={true} style="lg" />
                  <div className={`hidden flex-col gap-6 ${!isLaptop ? 'xl:flex' : ''}`}>
                    <div className="w-full md:w-[353px]">
                      <DashboardPayoutCard />
                    </div>
                    <DashboardBookingAcceptance />
                  </div>
                </div>
                <div className={`hidden lg:flex flex-col gap-6 ${!isLaptop ? 'xl:hidden' : ''}`}>
                  <div className="w-full md:w-[353px]">
                    <DashboardPayoutCard />
                  </div>
                  <DashboardBookingAcceptance />
                </div>
              </div>
              <div
                className={`hidden w-fit h-fit ${!isLaptop ? 'xl:block xl:-mt-[32.8%] xl:ml-[3.9%]' : ''}`}>
                <DashboardPromoCard />
              </div>
              <div className="w-fit h-fit z-10">
                <DashboardWorkspaceManager />
              </div>
            </div>
            <div className={`w-full ${!isLaptop ? 'xl:w-[46%]' : ''}`}>
              <DashboardAllBookings />
            </div>
            <div className={`block w-fit h-fit z-10 ${!isLaptop ? 'xl:hidden' : ''}`}>
              <DashboardPromoCard />
            </div>
            <div className="flex flex-col gap-6 lg:hidden">
              <div className="w-full md:w-[353px]">
                <DashboardPayoutCard />
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
