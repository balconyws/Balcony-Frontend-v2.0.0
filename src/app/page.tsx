import { NextPage } from 'next';

import { Hero, Slider, BottomBanner } from '@/components/sections';
import { Footer } from '@/components/common';

type Props = object;

const Home: NextPage<Props> = () => (
  <>
    <main>
      <Hero />
      <div className="mt-20 mb-10">
        <Slider type="properties" />
      </div>
      <div className="mt-20 lg:mt-36 mb-20">
        <Slider type="workspaces" />
      </div>
      <BottomBanner />
    </main>
    <Footer />
  </>
);

export default Home;
