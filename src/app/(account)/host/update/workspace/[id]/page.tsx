'use client';

import { NextPage } from 'next';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Country, State, City, ICountry, IState, ICity } from 'country-state-city';

import withProtectedRoute from '@/hoc/withProtectedRoute';
import { Workspace } from '@/types';
import { WorkspaceServerActions } from '@/server';
import { getSelectedAmenities, totalAmenities } from '@/helper';
import { Spinner } from '@/components/ui/Spinner';
import { AddWorkspaceForm } from '@/components/forms';
import { ErrorMessage, Footer } from '@/components/common';

type Props = object;

const HostUpdateWorkspace: NextPage<Props> = () => {
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [workspace, setWorkspace] = useState<Workspace | string>('');

  useEffect(() => {
    const getWorkspaceDetail = async (id: string): Promise<void> => {
      const res = await WorkspaceServerActions.FindWorkspaceById({ workspaceId: id });
      if ('data' in res) {
        setWorkspace(res.data.workspace);
      } else if ('error' in res) {
        setWorkspace(res.error.message);
      } else {
        setWorkspace('something went wrong');
      }
      setLoading(false);
    };
    getWorkspaceDetail(params.id);
  }, [params.id]);

  if (!loading && typeof workspace === 'string') {
    return <ErrorMessage errorCode={404} message={workspace} />;
  }

  if (typeof workspace !== 'string') {
    const country: ICountry = Country.getAllCountries().filter(
      c => c.name.toLowerCase() === workspace.info.country.toLowerCase()
    )[0];
    const state: IState = State.getStatesOfCountry(country.isoCode).filter(
      s => s.name.toLowerCase() === workspace.info.state.toLowerCase()
    )[0];
    const city: ICity = City.getCitiesOfState(country.isoCode, state.isoCode)[0];

    return (
      <>
        <main className="relative z-[1] pt-28 md:pt-36 xl:pt-40 flex flex-col justify-center items-center mb-16 lg:-mb-10 xl:-mb-20">
          <div className="w-[90%] lg:w-4/5">
            <AddWorkspaceForm
              workspaceId={workspace._id}
              formData={{
                img1: workspace.images[0] ?? '',
                img2: workspace.images[1] ?? '',
                img3: workspace.images[2] ?? '',
                workspaceName: workspace.info.name,
                address: workspace.info.address,
                floor: workspace.info.floor,
                city: city.name,
                state: state.isoCode,
                country: country.isoCode,
                times: {
                  sunday: {
                    selected: !!workspace.times.sunday,
                    startTime: workspace.times.sunday?.startTime ?? '',
                    endTime: workspace.times.sunday?.endTime ?? '',
                  },
                  monday: {
                    selected: !!workspace.times.monday,
                    startTime: workspace.times.monday?.startTime ?? '',
                    endTime: workspace.times.monday?.endTime ?? '',
                  },
                  tuesday: {
                    selected: !!workspace.times.tuesday,
                    startTime: workspace.times.tuesday?.startTime ?? '',
                    endTime: workspace.times.tuesday?.endTime ?? '',
                  },
                  wednesday: {
                    selected: !!workspace.times.wednesday,
                    startTime: workspace.times.wednesday?.startTime ?? '',
                    endTime: workspace.times.wednesday?.endTime ?? '',
                  },
                  thursday: {
                    selected: !!workspace.times.thursday,
                    startTime: workspace.times.thursday?.startTime ?? '',
                    endTime: workspace.times.thursday?.endTime ?? '',
                  },
                  friday: {
                    selected: !!workspace.times.friday,
                    startTime: workspace.times.friday?.startTime ?? '',
                    endTime: workspace.times.friday?.endTime ?? '',
                  },
                  saturday: {
                    selected: !!workspace.times.saturday,
                    startTime: workspace.times.saturday?.startTime ?? '',
                    endTime: workspace.times.saturday?.endTime ?? '',
                  },
                },
                indoorSpace: workspace.other.isIndoorSpace,
                outdoorSpace: workspace.other.isOutdoorSpace,
                coWorkingWorkspace: workspace.other.isCoWorkingWorkspace,
                summary: workspace.info.summary ?? '',
                currency: workspace.pricing.currency,
                totalPerDay: workspace.pricing.totalPerDay.toString(),
                additionalGuests: workspace.other.additionalGuests.toString(),
                cleaningFee: workspace.pricing.cleaning?.fee.toString() ?? '',
                cleaningFeeType: workspace.pricing.cleaning?.type ?? '',
                maintenanceFee: workspace.pricing.maintenance?.fee.toString() ?? '',
                maintenanceFeeType: workspace.pricing.maintenance?.type ?? '',
                additionalFee: workspace.pricing.additional?.fee.toString() ?? '',
                additionalFeeType: workspace.pricing.additional?.type ?? '',
                amenities: getSelectedAmenities(workspace.amenities ?? []),
                addManualAmenity: workspace.amenities
                  ? !!workspace.amenities[totalAmenities]
                  : false,
                manualAmenity: workspace.amenities ? workspace.amenities[totalAmenities] : '',
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

export default withProtectedRoute(HostUpdateWorkspace, ['host', 'admin'], '/host/add/workspace');
