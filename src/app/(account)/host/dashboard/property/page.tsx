'use client';

import { NextPage } from 'next';
import { useMediaQuery } from 'react-responsive';

import withProtectedRoute from '@/hoc/withProtectedRoute';
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
  const isLaptop: boolean = useMediaQuery({ query: '(min-width: 992px) and (max-width: 1880px)' });

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
                <DashboardViewRequestCard />
                <div className="flex flex-row gap-6">
                  <DashboardProgressCard type="earned" />
                  <DashboardProgressCard type="deposited" />
                </div>
                <div className="hidden lg:block xl:hidden w-full md:w-[400px]">
                  <DashboardPayoutCard />
                </div>
              </div>
              <DashboardProspectTenant />
              <div className="hidden xl:block w-full md:w-[400px]">
                <DashboardPayoutCard />
              </div>
              <div className="hidden lg:block">
                <DashboardPromoCard />
              </div>
            </div>
            <div className="w-full xl:flex-1 flex flex-col gap-6">
              <DashboardAllManagers />
              <div className="w-fit h-fit z-10">
                <DashboardAwaitingRentPayment />
              </div>
            </div>
            <div className="flex lg:hidden flex-col gap-6 w-full">
              <DashboardPromoCard />
              <DashboardPayoutCard />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default withProtectedRoute(HostPropertyDashboard, ['host', 'admin']);
