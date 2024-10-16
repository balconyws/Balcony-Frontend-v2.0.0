'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Swiper, SwiperSlide, SwiperRef, SwiperClass } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ArrowLeftIcon, ArrowRightIcon, PlusIcon } from 'lucide-react';
import 'swiper/css';

import { Property, Workspace } from '@/types';
import { imagePlaceholder, formatCurrency } from '@/helper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  workspaceActions,
  workspaceSlice,
  propertyActions,
  propertySlice,
  useAppDispatch,
  useAppSelector,
  waitForDispatch,
} from '@/redux';

type Props = {
  type: 'properties' | 'workspaces';
};

const Slider: React.FC<Props> = ({ type }: Props) => {
  const dispatch = useAppDispatch();
  const { loading: loading1, workspaces } = useAppSelector(workspaceSlice.selectWorkspace);
  const { loading: loading2, properties } = useAppSelector(propertySlice.selectProperty);
  const [swiperSlides, setSwiperSlides] = useState<Workspace[] | Property[] | null>(null);
  const [isFirstSlide, setIsFirstSlide] = useState<boolean>(false);
  const [isLastSlide, setIsLastSlide] = useState<boolean>(false);
  const [key, setKey] = useState<number>(0);
  const swiperRef = useRef<SwiperRef>(null);

  const isMobile: boolean = useMediaQuery({ query: '(max-width: 600px)' });
  const isTablet: boolean = useMediaQuery({ query: '(min-width: 601px) and (max-width: 991px)' });
  const isLaptop: boolean = useMediaQuery({ query: '(min-width: 992px) and (max-width: 1380px)' });

  const isWorkspace = (item: Workspace | Property): item is Workspace =>
    (item as Workspace).pricing !== undefined;

  useEffect(() => {
    if (type === 'workspaces') {
      waitForDispatch(
        dispatch,
        workspaceActions.getAllWorkspaces({
          query: { status: 'active' },
          page: 1,
          limit: 10,
          sort: 'desc',
          select: '_id,info,pricing,images',
          includeHost: false,
        }),
        state => {
          const { workspaces } = state.workspace;
          if (workspaces) {
            setSwiperSlides([...workspaces].reverse());
          }
        }
      );
    }
    if (type === 'properties') {
      waitForDispatch(
        dispatch,
        propertyActions.getAllProperties({
          query: { status: 'active' },
          page: 1,
          limit: 10,
          sort: 'desc',
          select: '_id,info,images',
          includeHost: false,
        }),
        state => {
          const { properties } = state.property;
          if (properties) {
            setSwiperSlides(properties);
          }
        }
      );
    }
  }, [dispatch, type]);

  useEffect(() => {
    if (type === 'workspaces' && workspaces) {
      setSwiperSlides([...workspaces].reverse());
    }
    if (type === 'properties' && properties) {
      setSwiperSlides(properties);
    }
    setKey(prev => prev + 1);
  }, [isMobile, properties, type, workspaces]);

  const onSlideChange = () => {
    if (swiperRef && swiperRef.current) {
      if (isFirstSlide) {
        setIsFirstSlide(false);
      } else {
        const isFirst = swiperRef.current.swiper.activeIndex === 0;
        setIsFirstSlide(isFirst);
      }
      if (isLastSlide) {
        setIsLastSlide(false);
      } else {
        const isLast = swiperSlides
          ? swiperRef.current.swiper.activeIndex === swiperSlides.length - 2
          : false;
        setIsLastSlide(isLast);
      }
    }
  };

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
      <div className="w-[90%] lg:w-4/5">
        <div
          className={`flex justify-start items-center gap-2 ${type === 'workspaces' && 'flex-row-reverse'}`}>
          <h1 className="text-xl lg:text-3xl !leading-normal text-stroke">{type}</h1>
          <Separator orientation="vertical" className="w-[2px] h-8" />
          <Link href={`/${type}`} className="h-full">
            <Button
              variant="secondary"
              size="sm"
              className="!p-0 flex justify-start items-center gap-2">
              <p className="text-base lg:text-xl !leading-normal font-normal">show more</p>
              <div className="w-6 h-6 rounded-full border-[1.6px] border-primary flex justify-center items-center">
                <PlusIcon className="text-primary w-[14px] h-[14px]" />
              </div>
            </Button>
          </Link>
        </div>
        <div
          key={key}
          className={cn(
            'relative bg-transparent mt-3 lg:mt-[23px] w-[110%] sm:w-full transition-transform duration-300',
            isMobile
              ? type === 'properties'
                ? isLastSlide
                  ? '-translate-x-9 xsm:-translate-x-10'
                  : 'translate-x-0'
                : type === 'workspaces'
                  ? isFirstSlide
                    ? 'translate-x-0'
                    : '-translate-x-9 xsm:-translate-x-10'
                  : ''
              : ''
          )}>
          <Swiper
            ref={swiperRef}
            loop={false}
            spaceBetween={20}
            slidesPerView={isMobile ? 'auto' : isTablet ? 3 : isLaptop ? 3 : 4}
            navigation
            modules={[Navigation]}
            onTouchEnd={onSlideChange}
            initialSlide={type === 'workspaces' && swiperSlides ? swiperSlides.length - 1 : 0}
            onInit={(swiper: SwiperClass) => {
              setIsFirstSlide(swiper.isBeginning);
              setIsLastSlide(swiper.isEnd);
            }}>
            {loading1 || loading2
              ? Array(isMobile ? 2 : isTablet ? 3 : isLaptop ? 3 : 4)
                  .fill(null)
                  .map((_, i: number) => (
                    <SwiperSlide key={i} className={`min-w-52 ${isMobile && '!w-3/5'}`}>
                      <div className="w-full h-full">
                        <Card>
                          <CardContent className="relative">
                            <div className="w-full h-[220px] lg:h-[300px] rounded-lg drop-shadow-primary">
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
                      </div>
                    </SwiperSlide>
                  ))
              : swiperSlides &&
                swiperSlides.map((s: Workspace | Property, i: number) => (
                  <SwiperSlide key={i} className={`min-w-52 ${isMobile && '!w-3/5'}`}>
                    <Link
                      href={`/${type === 'properties' ? 'property' : 'workspace'}/${s._id}`}
                      className="w-full h-full">
                      <Card>
                        <CardContent className="relative">
                          <div className="relative w-full h-[220px] lg:h-[300px] rounded-lg drop-shadow-primary">
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
                              className="px-2 py-[2px] rounded-3xl text-[8px]">
                              {s.info.country}
                            </Button>
                            {isWorkspace(s) && (
                              <Button
                                variant="secondary"
                                size="sm"
                                className="px-2 py-[2px] rounded-3xl text-[8px]">
                                {formatCurrency(s.pricing.totalPerDay, s.pricing.currency)}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter>
                          <h3 className="text-base lg:text-sm !leading-normal capitalize">
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
                    variant="secondary"
                    className={`absolute z-10 top-[40%] -left-16 xl:-left-24 !p-0 w-[30px] xl:w-[40px] h-[30px] xl:h-[40px] rounded-full border-2 flex justify-center items-center ${
                      isFirstSlide
                        ? 'border-border !cursor-default'
                        : 'border-primary !cursor-pointer'
                    }`}
                    onClick={goToPrevSlide}>
                    <ArrowLeftIcon
                      className={`w-5 xl:w-6 h-5 xl:h- ${isFirstSlide ? 'text-border' : 'text-primary'}`}
                    />
                  </Button>
                </div>
              </div>
              <div className="absolute right-0 w-0 h-full">
                <div className="relative w-full h-full">
                  <Button
                    size="sm"
                    variant="secondary"
                    className={`absolute z-10 top-[40%] -right-16 xl:-right-24 !p-0 w-[30px] xl:w-[40px] h-[30px] xl:h-[40px] rounded-full border-2 flex justify-center items-center ${
                      isLastSlide
                        ? 'border-border !cursor-default'
                        : 'border-primary !cursor-pointer'
                    }`}
                    onClick={goToNextSlide}>
                    <ArrowRightIcon
                      className={`w-5 xl:w-6 h-5 xl:h- ${isLastSlide ? 'text-border' : 'text-primary'}`}
                    />
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

export default Slider;
