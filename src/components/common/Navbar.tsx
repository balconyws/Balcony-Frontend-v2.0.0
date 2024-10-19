'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SearchIcon, ChevronLeftIcon, UserIcon } from 'lucide-react';

import { Navigation } from '@/contexts';
import { useAuthRedirect } from '@/hooks';
import { authSlice, useAppSelector } from '@/redux';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type Props = object;

const Navbar: React.FC<Props> = () => {
  const router = useRouter();
  const pathname = usePathname();
  const redirect = useAuthRedirect();
  const { isAuthenticated } = useAppSelector(authSlice.selectAuth);
  const { pushToStack, setDirection } = Navigation.useNavigation();
  const [tab, setTab] = useState<'user' | 'host'>(pathname.startsWith('/host') ? 'host' : 'user');

  useEffect(() => {
    setTab(pathname.startsWith('/host') ? 'host' : 'user');
  }, [pathname]);

  return (
    <header className="fixed z-20 flex justify-center items-center w-full pt-5">
      <nav className="w-[90%] lg:w-4/5 bg-white flex justify-between items-center px-4 lg:px-8 h-[70px] rounded-lg shadow-lg">
        <div className="w-full max-w-12 truncate sm:max-w-full">
          <Link href="/" className="text-primary text-[33px] w-fit">
            balcony
          </Link>
        </div>
        <div className="flex justify-center items-center gap-x-3 lg:gap-x-6">
          {isAuthenticated && (
            <div className="flex w-[134px] h-10 p-[5px] rounded-lg shadow-md">
              <Button
                variant={tab === 'user' ? 'default' : 'secondary'}
                className="w-1/2"
                onClick={() => {
                  router.push('/');
                  setTab('user');
                }}>
                user
              </Button>
              <Button
                variant={tab === 'host' ? 'default' : 'secondary'}
                className="w-1/2"
                onClick={() => {
                  redirect('/host/dashboard/workspace');
                  setTab('host');
                }}>
                host
              </Button>
            </div>
          )}
          <div
            className={`flex justify-center items-center rounded-lg shadow-md ${
              isAuthenticated ? 'flex-row w-2/5 lg:w-3/5' : 'w-full flex-row lg:flex-row-reverse'
            }`}>
            <Button
              variant="secondary"
              className="h-10 w-[52%] flex justify-center items-center gap-1 px-2 py-2 lg:px-4 lg:py-2"
              onClick={() => {
                pushToStack('menu');
                setDirection('none');
              }}>
              <UserIcon className="text-primary h-3 w-3" />
              <p className="hidden lg:block">account</p>
              <ChevronLeftIcon className="text-primary h-3 w-3" />
            </Button>
            <Separator
              orientation="vertical"
              className={`h-6 ${isAuthenticated ? 'block lg:hidden' : 'block'}`}
            />
            <Button
              variant="secondary"
              className="h-full w-full flex justify-center items-center gap-[6px] px-2 py-2 lg:px-4 lg:py-2"
              onClick={() => {
                pushToStack('search');
                setDirection('none');
              }}>
              <SearchIcon className="text-primary h-3 w-3" />
              <p className="hidden lg:block">search</p>
              <ChevronLeftIcon className="text-primary h-3 w-3 -ml-1" />
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
