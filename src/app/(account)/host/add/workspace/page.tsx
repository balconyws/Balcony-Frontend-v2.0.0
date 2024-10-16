'use client';

import { NextPage } from 'next';

import withProtectedRoute from '@/hoc/withProtectedRoute';
import { AddWorkspaceForm } from '@/components/forms';
import { Footer } from '@/components/common';

type Props = object;

const HostAddWorkspace: NextPage<Props> = () => (
  <>
    <main className="relative z-[1] pt-28 md:pt-36 xl:pt-40 flex flex-col justify-center items-center mb-16 lg:-mb-10 xl:-mb-20">
      <div className="w-[90%] lg:w-4/5">
        <AddWorkspaceForm />
      </div>
    </main>
    <Footer />
  </>
);

export default withProtectedRoute(HostAddWorkspace, ['user', 'host', 'admin']);
