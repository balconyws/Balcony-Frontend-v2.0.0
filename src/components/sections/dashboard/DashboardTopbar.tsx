'use client';

import { usePathname, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type Props = {
  type: 'host' | 'admin';
};

const DashboardTopbar: React.FC<Props> = ({ type }: Props) => {
  const pathname = usePathname();
  const router = useRouter();

  const links: {
    href: string;
    label: string;
  }[] = [
    { href: `/${type}/dashboard/workspace`, label: 'workspaces' },
    { href: `/${type}/dashboard/property`, label: 'property rentals' },
  ];

  return (
    <>
      <div className="flex w-[277px] h-10 p-[5px] rounded-lg shadow-md mb-6">
        {links.map(
          (
            link: {
              href: string;
              label: string;
            },
            i: number
          ) => (
            <Button
              key={i}
              variant={pathname === link.href ? 'default' : 'secondary'}
              className="w-1/2 leading-6"
              onClick={() => router.push(link.href)}>
              {link.label}
            </Button>
          )
        )}
      </div>
      <Separator />
    </>
  );
};

export default DashboardTopbar;
