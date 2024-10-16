'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FilterIcon, MapIcon } from 'lucide-react';

import { Navigation } from '@/contexts';
import { Workspace, Property } from '@/types';
import { imagePlaceholder, formatCurrency } from '@/helper';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { workspaceActions, propertyActions, useAppDispatch, waitForDispatch } from '@/redux';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE: number = 12;

type Props = {
  type: 'properties' | 'workspaces';
};

const ListView: React.FC<Props> = ({ type }: Props) => {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const { pushToStack, setDirection } = Navigation.useNavigation();
  const [currentData, setCurrentData] = useState<Workspace[] | Property[] | null>(null);
  const [pageNo, setPageNo] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  const isWorkspace = (item: Workspace | Property): item is Workspace =>
    (item as Workspace).pricing !== undefined;

  useEffect(() => {
    const searchPage = searchParams.get('p');
    if (searchPage) {
      const searchPageNo: number = Number(searchPage);
      setPageNo(searchPageNo > 0 ? searchPageNo : 1);
    }
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    if (type === 'workspaces') {
      const place = searchParams.get('place');
      const checkin = searchParams.get('checkin');
      const checkout = searchParams.get('checkout');
      const people = searchParams.get('people');
      if (place !== null || checkin !== null || checkout !== null || people !== null) {
        waitForDispatch(
          dispatch,
          workspaceActions.searchWorkspaces({
            place: place ?? undefined,
            checkin: checkin ?? undefined,
            checkout: checkout ?? undefined,
            people: people ?? undefined,
            page: pageNo,
            limit: ITEMS_PER_PAGE,
            sort: 'desc',
            select: '_id,status,info,images,geocode,pricing,times,other,amenities',
            includeHost: false,
          }),
          state => {
            const { loading, workspaces, pagination } = state.workspace;
            if (workspaces) {
              setCurrentData(workspaces);
            }
            if (pagination) {
              setTotalPages(pagination.totalPages || 0);
            }
            setLoading(loading);
          }
        );
      } else {
        waitForDispatch(
          dispatch,
          workspaceActions.getAllWorkspaces({
            query: { status: 'active' },
            page: pageNo,
            limit: ITEMS_PER_PAGE,
            sort: 'desc',
            select: '_id,status,info,images,geocode,pricing,times,other,amenities',
            includeHost: false,
          }),
          state => {
            const { loading, workspaces, pagination } = state.workspace;
            if (workspaces) {
              setCurrentData(workspaces);
            }
            if (pagination) {
              setTotalPages(pagination.totalPages || 0);
            }
            setLoading(loading);
          }
        );
      }
    }
    if (type === 'properties') {
      const place = searchParams.get('place');
      const beds = searchParams.get('beds');
      const baths = searchParams.get('baths');
      const minrange = searchParams.get('minrange');
      const maxrange = searchParams.get('maxrange');
      if (
        place !== null ||
        beds !== null ||
        baths !== null ||
        minrange !== null ||
        maxrange !== null
      ) {
        waitForDispatch(
          dispatch,
          propertyActions.searchProperties({
            place: place ?? undefined,
            beds: beds ?? undefined,
            baths: baths ?? undefined,
            minrange: minrange ?? undefined,
            maxrange: maxrange ?? undefined,
            page: pageNo,
            limit: ITEMS_PER_PAGE,
            sort: 'desc',
            select: '_id,status,info,images,geocode,unitList,other,amenities',
            includeHost: false,
            includeUnitList: true,
          }),
          state => {
            const { loading, properties, pagination } = state.property;
            if (properties) {
              setCurrentData(properties);
            }
            if (pagination) {
              setTotalPages(pagination.totalPages || 0);
            }
            setLoading(loading);
          }
        );
      } else {
        waitForDispatch(
          dispatch,
          propertyActions.getAllProperties({
            query: { status: 'active' },
            page: pageNo,
            limit: ITEMS_PER_PAGE,
            sort: 'desc',
            select: '_id,status,info,images,geocode,unitList,other,amenities',
            includeHost: false,
            includeUnitList: true,
          }),
          state => {
            const { loading, properties, pagination } = state.property;
            if (properties) {
              setCurrentData(properties);
            }
            if (pagination) {
              setTotalPages(pagination.totalPages || 0);
            }
            setLoading(loading);
          }
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, pageNo, type]);

  const getPaginationRange = (pageNo: number, totalPages: number) => {
    const pages = [];
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (pageNo <= 2) {
        pages.push(1, 2, 3);
      } else if (pageNo >= totalPages - 1) {
        pages.push(totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(pageNo - 1, pageNo, pageNo + 1);
      }
    }
    return pages;
  };

  const paginationRange = getPaginationRange(pageNo, totalPages);

  return (
    <div className="w-[88%] lg:w-4/5 xl:w-3/4">
      <div className="w-full flex justify-end items-center gap-x-6 lg:gap-x-9">
        <Link
          href={`/search?type=${type}&${new URLSearchParams(searchParams.toString())}`}
          className="flex flex-col justify-center items-center">
          <MapIcon className="text-primary w-6 lg:w-10 h-6 lg:h-10 stroke-2 lg:stroke-1" />
          <p className="text-[10px] lg:text-sm leading-normal">map view</p>
        </Link>
        <Link
          href={`/search?type=${type}&${new URLSearchParams(searchParams.toString())}`}
          className="flex flex-col justify-center items-center"
          onClick={() => {
            pushToStack('map search filter');
            setDirection('none');
          }}>
          <FilterIcon className="text-primary w-6 lg:w-10 h-6 lg:h-10 stroke-2 lg:stroke-1" />
          <p className="text-[10px] lg:text-sm leading-normal">filter</p>
        </Link>
      </div>
      <h1 className="text-[28px] xl:text-4xl leading-normal font-medium text-right lg:text-left my-5 lg:my-8">
        {type}
      </h1>
      <div className="grid place-items-center place-content-center grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-8 sm:gap-6 lg:gap-7 xl:gap-[30px]">
        {loading ? (
          Array(ITEMS_PER_PAGE)
            .fill(null)
            .map((_, i: number) => (
              <div key={i} className="w-full h-full">
                <Card className="w-full h-[355px]">
                  <CardContent className="relative">
                    <div className="w-full h-[220px] lg:h-[300px] rounded-lg drop-shadow-primary">
                      <Skeleton className="w-full h-full bg-primary rounded-lg" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="w-1/3 h-3 bg-primary rounded-lg" />
                    <div className="mt-1 flex justify-start items-center">
                      <Image src="/assets/icons/ratings.svg" alt="rating" width={92} height={18} />
                    </div>
                  </CardFooter>
                </Card>
              </div>
            ))
        ) : currentData && currentData.length > 0 ? (
          currentData.map((d: Workspace | Property, i: number) => (
            <Link
              href={`/${type === 'properties' ? 'property' : 'workspace'}/${d._id}`}
              key={i}
              className="w-full h-full">
              <Card className="w-full h-[355px]">
                <CardContent className="relative">
                  <div className="relative w-full h-[301px] rounded-lg drop-shadow-primary">
                    <Image
                      src={d.images[0] || '/assets/img/image-placeholder.webp'}
                      alt={d.info.name}
                      fill={true}
                      className="rounded-lg"
                      placeholder={imagePlaceholder}
                    />
                  </div>
                  <div className="z-10 absolute bottom-3 right-3 flex justify-center items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="px-2 py-[2px] rounded-3xl text-[8px]">
                      {d.info.country}
                    </Button>
                    {isWorkspace(d) && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="px-2 py-[2px] rounded-3xl text-[8px]">
                        {formatCurrency(d.pricing.totalPerDay, d.pricing.currency)}
                      </Button>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <h3 className="text-[14px] leading-normal">{d.info.name}</h3>
                  <div className="mt-1 flex justify-start items-center">
                    <Image src="/assets/icons/ratings.svg" alt="rating" width={92} height={18} />
                    <p className="text-sm leading-normal ml-1">(1)</p>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))
        ) : (
          <div className="w-full text-left">
            <p className="text-sm font-semibold">No {type} found for this search.</p>
          </div>
        )}
      </div>
      <Pagination className="justify-start my-14">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={pageNo > 1 ? `?p=${pageNo - 1}` : '#'}
              disabled={pageNo <= 1}
            />
          </PaginationItem>
          {paginationRange.map(page => (
            <PaginationItem key={page}>
              <PaginationLink
                href={`?p=${page}`}
                isActive={pageNo === page}
                className="h-[40px] w-[40px]">
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          {totalPages > 3 && pageNo + 1 < totalPages && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          <PaginationItem>
            <PaginationNext
              href={pageNo < totalPages ? `?p=${pageNo + 1}` : '#'}
              disabled={pageNo >= totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default ListView;
