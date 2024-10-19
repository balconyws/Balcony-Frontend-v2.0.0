'use client';

import { NextPage } from 'next';

import withProtectedRoute from '@/hoc/withProtectedRoute';
import { Footer } from '@/components/common';
import {
  DashboardTopbar,
  DashboardProgressCard,
  DashboardChart,
  DashboardPromoCard,
  DashboardAllManagers,
  DashboardProspectTenant,
  DashboardUsersData,
  DashboardHostData,
} from '@/components/sections';

type Props = object;

const AdminPropertyDashboard: NextPage<Props> = () => (
  <>
    <main className="relative z-[1] pt-28 md:pt-36 xl:pt-40 flex flex-col justify-center items-center mb-10 xl:-mb-20">
      <div className="w-[90%] lg:w-4/5">
        <DashboardTopbar type="admin" />
        <div className="mt-6 lg:mt-16 flex justify-between items-start gap-6 flex-col">
          <div className="w-full flex flex-col lg:flex-row gap-6">
            <div className="flex flex-row lg:flex-col justify-center items-center lg:justify-start lg:items-start gap-6">
              <DashboardProgressCard type="properties" balanceType="earned" />
              <DashboardProgressCard type="properties" balanceType="deposited" />
            </div>
            <div className="flex-1">
              <DashboardChart />
            </div>
          </div>
          <div className="w-full flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-6">
              <DashboardProspectTenant />
              <div className="w-fit h-fit hidden lg:flex flex-col gap-6">
                <DashboardPromoCard applicableOn="property" />
                <DashboardUsersData />
              </div>
            </div>
            <div className="w-full lg:w-2/3 xl:w-3/4 flex flex-col gap-6">
              <DashboardAllManagers />
              <div className="block lg:hidden">
                <DashboardUsersData />
              </div>
              <DashboardHostData />
            </div>
            <div className="w-fit h-fit block lg:hidden">
              <DashboardPromoCard applicableOn="property" />
            </div>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </>
);

export default withProtectedRoute(AdminPropertyDashboard, ['admin']);
