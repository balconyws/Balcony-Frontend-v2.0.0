import { NextPage } from 'next';
import type { Metadata } from 'next';

import { Property } from '@/types';
import { PropertyServerActions } from '@/server';
import { PropertyDetail } from '@/components/sections';
import { ErrorMessage, Footer } from '@/components/common';

type Props = {
  params: {
    id: string;
  };
};

const getPropertyDetail = async (id: string): Promise<Property | string> => {
  const res = await PropertyServerActions.FindPropertyById({ propertyId: id });
  if ('data' in res) {
    return res.data.property;
  }
  return res.error.message;
};

export async function generateMetadata({ params: { id } }: Props): Promise<Metadata> {
  const property = await getPropertyDetail(id);
  if (typeof property === 'string') {
    return {};
  }
  const title = `${property.info.name} | Properties - balcony`;
  return {
    title,
    description: property.info.summary,
    openGraph: {
      title,
      images: [property.images[0]],
    },
    keywords: [property.info.name],
  };
}

const apiKey: string = process.env.MAP_API_KEY || '';
const styleId: string = process.env.MAP_STYLE_ID || '';

const PropertyDetailPage: NextPage<Props> = async ({ params: { id } }: Props) => {
  const property = await getPropertyDetail(id);
  if (typeof property === 'string') {
    return <ErrorMessage errorCode={404} message={property} />;
  }
  return (
    <>
      <main className="pt-28 md:pt-36 xl:pt-40 flex flex-col justify-center items-center">
        <div className="w-[90%] lg:w-4/5">
          <PropertyDetail data={property} apiKey={apiKey} styleId={styleId} />
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PropertyDetailPage;
