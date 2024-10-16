import { NextPage } from 'next';

import { MapContainer } from '@/components/sections';

const apiKey: string = process.env.MAP_API_KEY || '';
const styleId: string = process.env.MAP_STYLE_ID || '';

type Props = object;

const Search: NextPage<Props> = () => (
  <main className="w-full h-screen">
    <MapContainer apiKey={apiKey} styleId={styleId} />
  </main>
);
export default Search;
