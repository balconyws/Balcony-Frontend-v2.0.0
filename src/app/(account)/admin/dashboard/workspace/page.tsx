'use client';

import { NextPage } from 'next';

import withProtectedRoute from '@/hoc/withProtectedRoute';
import { Footer } from '@/components/common';
import {
  DashboardTopbar,
  DashboardProgressCard,
  DashboardChart,
  DashboardCalender,
  DashboardPromoCard,
  DashboardWorkspaceManager,
  DashboardAllBookings,
  DashboardUsersData,
  DashboardHostData,
} from '@/components/sections';

type Props = object;

const AdminWorkspaceDashboard: NextPage<Props> = () => (
  <>
    <main className="relative z-[1] pt-28 md:pt-36 xl:pt-40 flex flex-col justify-center items-center mb-10 lg:mb-0">
      <div className="w-[90%] lg:w-4/5">
        <DashboardTopbar type="admin" />
        <div className="mt-6 lg:mt-16 flex justify-between items-start gap-6 flex-col">
          <div className="w-full flex flex-col lg:flex-row gap-6">
            <div className="flex flex-row lg:flex-col justify-center items-center lg:justify-start lg:items-start gap-6">
              <DashboardProgressCard type="earned" />
              <DashboardProgressCard type="deposited" />
            </div>
            <div className="flex-1">
              <DashboardChart />
            </div>
          </div>
          <div className="w-full flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-2/5 flex flex-col items-end gap-0 lg:gap-6">
              <DashboardCalender border={false} style="sm" />
              <DashboardWorkspaceManager />
              <div className="w-fit h-fit hidden lg:block">
                <DashboardPromoCard />
              </div>
            </div>
            <div className="w-full lg:w-3/5 flex flex-col gap-6">
              <DashboardAllBookings />
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-[30px]">
                <DashboardUsersData />
                <DashboardHostData />
              </div>
            </div>
            <div className="w-fit h-fit block lg:hidden">
              <DashboardPromoCard />
            </div>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </>
);

export default withProtectedRoute(AdminWorkspaceDashboard, ['admin']);
