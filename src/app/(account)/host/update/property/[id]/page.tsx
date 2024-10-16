'use client';

import { NextPage } from 'next';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Country, State, City, ICountry, IState, ICity } from 'country-state-city';

import withProtectedRoute from '@/hoc/withProtectedRoute';
import { Property } from '@/types';
import { PropertyServerActions } from '@/server';
import { getSelectedAmenities, totalAmenities } from '@/helper';
import { Spinner } from '@/components/ui/Spinner';
import { AddPropertyForm } from '@/components/forms';
import { ErrorMessage, Footer } from '@/components/common';

type Props = object;

const HostUpdateProperty: NextPage<Props> = () => {
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [property, setProperty] = useState<Property | string>('');

  useEffect(() => {
    const getPropertyDetail = async (id: string): Promise<void> => {
      const res = await PropertyServerActions.FindPropertyById({ propertyId: id });
      if ('data' in res) {
        setProperty(res.data.property);
      } else if ('error' in res) {
        setProperty(res.error.message);
      } else {
        setProperty('something went wrong');
      }
      setLoading(false);
    };
    getPropertyDetail(params.id);
  }, [params.id]);

  if (!loading && typeof property === 'string') {
    return <ErrorMessage errorCode={404} message={property} />;
  }

  if (typeof property !== 'string') {
    const country: ICountry = Country.getAllCountries().filter(
      c => c.name.toLowerCase() === property.info.country.toLowerCase()
    )[0];
    const state: IState = State.getStatesOfCountry(country.isoCode).filter(
      s => s.name.toLowerCase() === property.info.state.toLowerCase()
    )[0];
    const city: ICity = City.getCitiesOfState(country.isoCode, state.isoCode)[0];

    return (
      <>
        <main className="relative z-[1] pt-28 md:pt-36 xl:pt-40 flex flex-col justify-center items-center mb-16 lg:-mb-10 xl:-mb-20">
          <div className="w-[90%] lg:w-4/5">
            <AddPropertyForm
              propertyId={property._id}
              formData={{
                img1: property.images[0] ?? '',
                img2: property.images[1] ?? '',
                img3: property.images[2] ?? '',
                propertyName: property.info.name,
                address: property.info.address,
                city: city.name,
                state: state.isoCode,
                country: country.isoCode,
                summary: property.info.summary ?? '',
                unitList: property.unitList,
                chargeFeeFromRent: property.other.chargeFeeFromRent,
                chargeFeeAsAddition: property.other.chargeFeeAsAddition,
                leaseDuration: property.other.leaseDuration,
                leasingPolicyDoc: property.other.leasingPolicyDoc,
                amenities: getSelectedAmenities(property.amenities ?? []),
                addManualAmenity: property.amenities ? !!property.amenities[totalAmenities] : false,
                manualAmenity: property.amenities ? property.amenities[totalAmenities] : '',
                termsAndPolicy: true,
                acknowledge: true,
              }}
            />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <main className="flex flex-col justify-center items-center w-screen h-screen">
      <Spinner
        show={true}
        size="large"
        className="!text-primary w-20 h-20"
        iconClassName="w-20 h-20 stroke-1"
      />
    </main>
  );
};

export default withProtectedRoute(HostUpdateProperty, ['host', 'admin']);
