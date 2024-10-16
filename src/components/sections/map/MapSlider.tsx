'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { Swiper, SwiperSlide, SwiperRef } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import 'swiper/css';

import { Property, Workspace } from '@/types';
import { formatCurrency, imagePlaceholder } from '@/helper';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

type Props = {
  loading: boolean;
  type: 'workspaces' | 'properties';
  slides: Workspace[] | Property[] | null;
};

const MapSlider: React.FC<Props> = ({ loading, type, slides }: Props) => {
  const [isFirstSlide, setIsFirstSlide] = useState<boolean>(false);
  const [isLastSlide, setIsLastSlide] = useState<boolean>(false);
  const swiperRef = useRef<SwiperRef>(null);

  const isWorkspace = (item: Workspace | Property): item is Workspace =>
    (item as Workspace).pricing !== undefined;

  const goToNextSlide = () => {
    if (swiperRef && swiperRef.current) {
      swiperRef.current.swiper.slideNext();
      setIsFirstSlide(swiperRef.current.swiper.isBeginning);
      setIsLastSlide(swiperRef.current.swiper.isEnd);
    }
  };

  const goToPrevSlide = () => {
    if (swiperRef && swiperRef.current) {
      swiperRef.current.swiper.slidePrev();
      setIsFirstSlide(swiperRef.current.swiper.isBeginning);
      setIsLastSlide(swiperRef.current.swiper.isEnd);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className="w-[96%] lg:w-4/5">
        <div className="relative bg-transparent mt-10 w-full">
          <Swiper
            ref={swiperRef}
            loop={false}
            spaceBetween={14}
            slidesPerView={'auto'}
            navigation
            modules={[Navigation]}>
            {loading
              ? Array(6)
                  .fill(null)
                  .map((_, i: number) => (
                    <SwiperSlide key={i} className="!w-[230px] !h-[204px]">
                      <Card className="rounded-lg p-[5px] lg:p-[6px] drop-shadow-primary">
                        <CardContent className="relative">
                          <div className="w-full h-[140px] rounded-lg drop-shadow-primary">
                            <Skeleton className="w-full h-full bg-primary rounded-lg" />
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Skeleton className="w-1/3 h-3 bg-primary rounded-lg" />
                          <div className="mt-1 flex justify-start items-center">
                            <Image
                              src="/assets/icons/ratings.svg"
                              alt="rating"
                              width={92}
                              height={18}
                            />
                          </div>
                        </CardFooter>
                      </Card>
                    </SwiperSlide>
                  ))
              : slides &&
                slides.map((s: any, i: number) => (
                  <SwiperSlide key={i} className="!w-[230px] !h-[204px]">
                    <Link
                      href={`/${type === 'properties' ? 'property' : 'workspace'}/${s._id}`}
                      key={i}
                      className="w-full h-full">
                      <Card className="rounded-lg p-[5px] lg:p-[6px] drop-shadow-primary">
                        <CardContent className="relative">
                          <div className="relative bg-primary w-full h-[140px] rounded-lg">
                            <Image
                              src={s.images[0] || '/assets/img/image-placeholder.webp'}
                              alt={s.info.name}
                              fill={true}
                              className="rounded-lg"
                              placeholder={imagePlaceholder}
                            />
                          </div>
                          <div className="z-20 absolute bottom-3 right-3 flex justify-center items-center gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="px-2 py-[1px] rounded-3xl text-[8px]">
                              {s.info.country}
                            </Button>
                            {isWorkspace(s) && (
                              <Button
                                variant="secondary"
                                size="sm"
                                className="px-2 py-[1px] rounded-3xl text-[8px]">
                                {formatCurrency(s.pricing.totalPerDay, s.pricing.currency)}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter>
                          <h3 className="text-[14px] lg:text-[12px] leading-normal">
                            {s.info.name}
                          </h3>
                          <div className="mt-1 flex justify-start items-center">
                            <Image
                              src="/assets/icons/ratings.svg"
                              alt="rating"
                              width={92}
                              height={18}
                            />
                            <p className="text-[11px] lg:text-sm ml-1 leading-normal">(1)</p>
                          </div>
                        </CardFooter>
                      </Card>
                    </Link>
                  </SwiperSlide>
                ))}
          </Swiper>
          <div className="hidden lg:block absolute top-0 left-0 z-0 bg-transparent w-full h-full">
            <div className="relative w-full h-full z-0">
              <div className="absolute left-0 w-0 h-full">
                <div className="relative w-full h-full">
                  <Button
                    size="sm"
                    variant="default"
                    className={`absolute z-10 top-1/3 -left-16 xl:-left-24 w-[40px] xl:w-[50px] h-[40px] xl:h-[50px] rounded-full border-2 border-white flex justify-center items-center ${
                      isFirstSlide ? '!bg-border !cursor-default' : '!bg-primary !cursor-pointer'
                    }`}
                    onClick={goToPrevSlide}>
                    <ArrowLeftIcon className="text-primary-foreground w-7 xl:w-8 h-7 xl:h-8" />
                  </Button>
                </div>
              </div>
              <div className="absolute right-0 w-0 h-full">
                <div className="relative w-full h-full">
                  <Button
                    size="sm"
                    variant="default"
                    className={`absolute z-10 top-1/3 -right-16 xl:-right-24 w-[40px] xl:w-[50px] h-[40px] xl:h-[50px] rounded-full border-2 border-white flex justify-center items-center ${
                      isLastSlide ? '!bg-border !cursor-default' : '!bg-primary !cursor-pointer'
                    }`}
                    onClick={goToNextSlide}>
                    <ArrowRightIcon className="text-primary-foreground w-7 xl:w-8 h-7 xl:h-8" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapSlider;
