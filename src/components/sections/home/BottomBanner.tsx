'use client';

import Image from 'next/image';

import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useAuthRedirect } from '@/hooks';

type Props = object;

const BottomBanner: React.FC<Props> = () => {
  const redirect = useAuthRedirect();

  return (
    <div className="flex justify-center items-center mt-20 lg:mt-40 mb-10">
      <div className="w-[90%] lg:w-4/5">
        <div className="flex flex-col lg:flex-row justify-center lg:justify-start items-center lg:items-start gap-12 w-full">
          <Image
            src="/assets/img/banner.svg"
            alt="banner"
            width={510}
            height={510}
            quality={100}
            priority
            className="w-full lg:w-1/3 z-10"
          />
          <div className="w-full lg:w-2/3">
            <h1 className="text-[26px] lg:text-[30px] !leading-normal text-stroke">
              host your workspace or property
            </h1>
            <p className="text-sm leading-[14px] font-medium mt-8">indoor and outdoor</p>
            <p className="text-sm font-medium mt-[6px]">
              let people discover your workspace on our platform
            </p>
            <Separator className="my-4 w-60" />
            <div className="flex justify-start items-center gap-4">
              <p className="text-sm">learn</p>
              <Separator orientation="vertical" className="h-5" />
              <p className="text-sm">work</p>
              <Separator orientation="vertical" className="h-5" />
              <p className="text-sm">collaborate</p>
            </div>
            <div className="flex justify-center lg:justify-start items-center mt-8 lg:mt-6 gap-4">
              <Button onClick={() => redirect('/host/dashboard/workspace')}>
                sign up workspace
              </Button>
              <Button variant="outline" onClick={() => redirect('/host/dashboard/property')}>
                sign up property
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomBanner;
