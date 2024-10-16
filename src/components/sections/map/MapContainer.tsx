'use client';

import { NextPage } from 'next';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Marker, Property, Workspace } from '@/types';
import { workspaceActions, propertyActions, useAppDispatch, waitForDispatch } from '@/redux';
import { getMarkers } from '@/helper';
import { Map } from '@/components/common';
import { MapSlider } from '..';

type Props = {
  apiKey: string;
  styleId: string;
};

const MapContainer: NextPage<Props> = ({ apiKey, styleId }: Props) => {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [type, setType] = useState<'workspaces' | 'properties'>('workspaces');
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [slides, setSlides] = useState<Workspace[] | Property[] | null>(null);

  useEffect(() => {
    setLoading(true);
    const type = searchParams.get('type') || 'workspaces';
    if (type === 'workspaces') {
      setType(type);
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
            sort: 'desc',
            select: '_id,status,info,images,geocode,pricing,times,other,amenities',
            includeHost: false,
          }),
          state => {
            const { loading, workspaces } = state.workspace;
            if (workspaces) {
              setSlides(workspaces);
              setMarkers(getMarkers(workspaces));
            }
            setLoading(loading);
          }
        );
      } else {
        waitForDispatch(
          dispatch,
          workspaceActions.getAllWorkspaces({
            query: { status: 'active' },
            sort: 'desc',
            select: '_id,status,info,images,geocode,pricing,times,other,amenities',
            includeHost: false,
          }),
          state => {
            const { loading, workspaces } = state.workspace;
            if (workspaces) {
              setSlides(workspaces);
              setMarkers(getMarkers(workspaces));
            }
            setLoading(loading);
          }
        );
      }
    }
    if (type === 'properties') {
      setType(type);
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
            sort: 'desc',
            select: '_id,status,info,images,geocode,unitList,other,amenities',
            includeHost: false,
            includeUnitList: true,
          }),
          state => {
            const { loading, properties } = state.property;
            if (properties) {
              setSlides(properties);
              setMarkers(getMarkers(properties));
            }
            setLoading(loading);
          }
        );
      } else {
        waitForDispatch(
          dispatch,
          propertyActions.getAllProperties({
            query: { status: 'active' },
            sort: 'desc',
            select: '_id,status,info,images,geocode,unitList,other,amenities',
            includeHost: false,
            includeUnitList: true,
          }),
          state => {
            const { loading, properties } = state.property;
            if (properties) {
              setSlides(properties);
              setMarkers(getMarkers(properties));
            }
            setLoading(loading);
          }
        );
      }
    }
  }, [dispatch, searchParams]);

  return (
    <>
      <div className="h-screen w-full">
        <Map apiKey={apiKey} styleId={styleId} markers={markers} showCurrentLocation={true} />
      </div>
      <div className="absolute z-10 bottom-5 lg:bottom-7 w-full">
        <MapSlider loading={loading} type={type} slides={slides} />
      </div>
    </>
  );
};

export default MapContainer;
