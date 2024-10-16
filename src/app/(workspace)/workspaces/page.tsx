import { NextPage } from 'next';
import { Suspense } from 'react';

import { ListView, Footer } from '@/components/common';

type Props = object;

const Workspaces: NextPage<Props> = () => (
  <>
    <main className="pt-28 md:pt-32 xl:pt-36 flex flex-col justify-center items-center">
      <Suspense>
        <ListView type="workspaces" />
      </Suspense>
    </main>
    <Footer />
  </>
);
export default Workspaces;
