import { NextPage } from 'next';
import type { Metadata } from 'next';

import { Workspace } from '@/types';
import { WorkspaceServerActions } from '@/server';
import { WorkspaceDetail } from '@/components/sections';
import { ErrorMessage, Footer } from '@/components/common';

type Props = {
  params: {
    id: string;
  };
};

const getWorkspaceDetail = async (id: string): Promise<Workspace | string> => {
  const res = await WorkspaceServerActions.FindWorkspaceById({ workspaceId: id });
  if ('data' in res) {
    return res.data.workspace;
  }
  return res.error.message;
};

export async function generateMetadata({ params: { id } }: Props): Promise<Metadata> {
  const workspace = await getWorkspaceDetail(id);
  if (typeof workspace === 'string') {
    return {};
  }
  const title = `${workspace.info.name} | Workspaces - balcony`;
  return {
    title,
    description: workspace.info.summary,
    openGraph: {
      title,
      images: [workspace.images[0]],
    },
    keywords: [workspace.info.name],
  };
}

const apiKey: string = process.env.MAP_API_KEY || '';
const styleId: string = process.env.MAP_STYLE_ID || '';

const WorkspaceDetailPage: NextPage<Props> = async ({ params: { id } }: Props) => {
  const workspace = await getWorkspaceDetail(id);
  if (typeof workspace === 'string') {
    return <ErrorMessage errorCode={404} message={workspace} />;
  }
  return (
    <>
      <main className="pt-28 md:pt-36 xl:pt-40 flex flex-col justify-center items-center">
        <div className="w-[90%] lg:w-4/5">
          <WorkspaceDetail data={workspace} apiKey={apiKey} styleId={styleId} />
        </div>
      </main>
      <Footer />
    </>
  );
};

export default WorkspaceDetailPage;
