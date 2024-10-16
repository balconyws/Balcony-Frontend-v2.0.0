'use client';

import { NextPage } from 'next';
import { useEffect, useState, useRef } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';

import { Cords, Marker } from '@/types';
import { cn } from '@/lib/utils';

type Props = {
  apiKey: string;
  styleId: string;
  markers?: Marker[];
  showCurrentLocation?: boolean;
  className?: string;
};

const zoom = 14;

const Map: NextPage<Props> = ({
  apiKey,
  styleId,
  markers,
  showCurrentLocation,
  className,
}: Props) => {
  maptilersdk.config.apiKey = apiKey;
  const [currentPosition, setCurrentPosition] = useState<Cords | undefined>(undefined);
  const [center, setCenter] = useState<Cords | undefined>(undefined);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maptilersdk.Map | null>(null);

  useEffect(() => {
    if (mapRef.current) return;
    if (containerRef && containerRef.current && center) {
      mapRef.current = new maptilersdk.Map({
        container: containerRef.current,
        style: styleId,
        center: [center.lon, center.lat],
        zoom: zoom,
        navigationControl: false,
        geolocateControl: false,
        language: 'name_int',
      });
    }
  }, [center, styleId]);

  useEffect(() => {
    if (showCurrentLocation) {
      navigator.geolocation.getCurrentPosition(position => {
        setCurrentPosition({ lat: position.coords.latitude, lon: position.coords.longitude });
      });
    }
  }, [showCurrentLocation]);

  useEffect(() => {
    if (showCurrentLocation && currentPosition) {
      setCenter(currentPosition);
    } else if (markers && markers.length === 1) {
      setCenter({ lat: markers[0].lat, lon: markers[0].lon });
    } else {
      setCenter(undefined);
    }
  }, [currentPosition, showCurrentLocation, markers]);

  useEffect(() => {
    if (mapRef && mapRef.current && center && showCurrentLocation) {
      const el = document.createElement('div');
      el.style.backgroundImage = 'url(/assets/icons/current-location.svg)';
      el.style.backgroundPosition = 'center';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.backgroundSize = 'contain';
      el.style.width = '48px';
      el.style.height = '48px';
      el.style.cursor = 'pointer';
      new maptilersdk.Marker({ element: el })
        .setLngLat([center.lon, center.lat])
        .addTo(mapRef.current);
    }
  }, [center, showCurrentLocation]);

  useEffect(() => {
    if (markers && markers.length > 0) {
      markers.forEach(({ name, price, address, lat, lon }) => {
        if (mapRef && mapRef.current) {
          const el = document.createElement('div');
          el.style.backgroundImage = "url('/assets/icons/map-pin.svg')";
          el.style.backgroundPosition = 'center';
          el.style.backgroundRepeat = 'no-repeat';
          el.style.backgroundSize = 'contain';
          el.style.width = '27px';
          el.style.height = '27px';
          el.style.cursor = 'pointer';
          const popup = new maptilersdk.Popup({
            offset: 25,
            focusAfterOpen: true,
          }).setHTML(
            `<div className="w-ful h-full flex flex-col justify-start items-start">
                <h1>${name}</h1>
                ${price ? `<p>$${price}</p>` : ''}
                <p>${address}</p>
              </div>`
          );
          new maptilersdk.Marker({ element: el })
            .setLngLat([lon, lat])
            .setPopup(popup)
            .addTo(mapRef.current);
        }
      });
    }
  }, [markers, mapRef, center]);

  return <div ref={containerRef} className={cn('w-full h-full', className)}></div>;
};

export default Map;
