import { Marker, Property, Workspace } from '@/types';

export const getMarkers = (data: (Property | Workspace)[]): Marker[] => {
  const isWorkspace = (item: Workspace | Property): item is Workspace =>
    (item as Workspace).pricing !== undefined;
  return data.map((d, i: number) => {
    const { geocode, info } = d;
    return {
      id: i,
      name: info.name,
      lat: geocode.lat,
      lon: geocode.lon,
      price: isWorkspace(d) ? d.pricing.totalPerDay : d.unitList[0].price,
      address: info.address,
    };
  });
};
