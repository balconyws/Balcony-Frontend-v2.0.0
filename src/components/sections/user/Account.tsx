'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BuildingIcon,
  CircleHelpIcon,
  CreditCardIcon,
  LayoutDashboardIcon,
  LayoutListIcon,
  LogOutIcon,
  MessageSquareIcon,
  UserIcon,
} from 'lucide-react';

import { Navigation } from '@/contexts';
import { authSlice, useAppSelector } from '@/redux';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Tabs = 'user' | 'host';

const SlideToggle = ({ activeTab }: { activeTab: Tabs }) => (
  <motion.div
    className="absolute inset-y-0 bg-primary rounded-lg m-[5px] shadow-md"
    layout
    initial={{ left: activeTab === 'user' ? 0 : '43%' }}
    animate={{ left: activeTab === 'user' ? 0 : '43%' }}
    transition={{
      type: 'just',
      stiffness: 300,
      damping: 20,
    }}
    style={{ width: '50%' }}
  />
);

const SlidingTabContent = ({
  children,
  direction,
  animate,
}: {
  children: React.ReactNode;
  direction: 'left' | 'right';
  animate: boolean;
}) => (
  <motion.div
    initial={animate ? { opacity: 0, x: direction === 'left' ? 50 : -50 } : {}}
    animate={animate ? { opacity: 1, x: 0 } : {}}
    exit={animate ? { opacity: 0, x: direction === 'left' ? -50 : 50 } : {}}
    transition={{ duration: 0.5 }}>
    {children}
  </motion.div>
);

type Props = object;

const Account: React.FC<Props> = () => {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAppSelector(authSlice.selectAuth);
  const { pushToStack, direction, pageVariants, setOpen } = Navigation.useNavigation();

  const [activeTab, setActiveTab] = useState<Tabs>('user');

  const prevTab = useRef<Tabs | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  const getDirection = (currentTab: Tabs) => {
    if (!prevTab.current) return 'right';
    return prevTab.current === 'user' && currentTab === 'host' ? 'right' : 'left';
  };

  const handleTabChange = (value: string) => {
    prevTab.current = activeTab;
    setActiveTab(value as Tabs);
  };

  return (
    <motion.div
      custom={direction}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full h-full px-4 lg:px-0">
      {isAuthenticated && user && user.role === 'admin' ? (
        <div className="mt-20 flex justify-center items-center">
          <div className="p-6 w-[92%] lg:w-full flex flex-col rounded-lg border border-border box-shadow-secondary">
            <Link href="/admin/dashboard/workspace?" onClick={() => setOpen(false)}>
              <Button
                variant="secondary"
                className="w-full flex justify-start items-center gap-4 px-2 py-[10px]">
                <LayoutDashboardIcon className="text-primary w-5 h-5" />
                <p className="text-[13px] font-medium leading-[14px]">super admin dashboard</p>
              </Button>
            </Link>
            <Button
              variant="secondary"
              className="w-full flex justify-start items-center gap-4 px-2 py-[10px]"
              onClick={() => pushToStack('logout')}>
              <LogOutIcon className="text-primary w-5 h-5" />
              <p className="text-[13px] font-medium leading-[14px]">logout</p>
            </Button>
          </div>
        </div>
      ) : (
        <Tabs
          defaultValue="user"
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full mt-8">
          <div className="relative w-[134px] h-10 p-[5px] rounded-lg shadow-md">
            <TabsList className="flex w-full h-full relative z-10 shadow-none">
              <TabsTrigger
                value="user"
                className="w-1/2 bg-transparent data-[state=active]:bg-transparent">
                user
              </TabsTrigger>
              <TabsTrigger
                value="host"
                className="w-1/2 bg-transparent data-[state=active]:bg-transparent">
                host
              </TabsTrigger>
            </TabsList>
            <SlideToggle activeTab={activeTab} />
          </div>
          <div className="mt-3 w-full px-6 pt-5 pb-3 rounded-lg border border-[#E4E4E7] box-shadow-account">
            <TabsContent value="user" className="w-full overflow-hidden">
              <SlidingTabContent direction={getDirection('user')} animate={!isFirstRender.current}>
                <Button
                  variant="secondary"
                  className="w-full flex justify-start items-center gap-4 px-2 py-[10px]"
                  onClick={() => pushToStack('profile')}>
                  <UserIcon className="text-primary w-5 h-5" />
                  <p className="text-[13px] font-medium leading-[14px]">profile</p>
                </Button>
                <Button
                  variant="secondary"
                  className="w-full flex justify-start items-center gap-4 px-2 py-[10px]"
                  onClick={() => pushToStack('chats')}>
                  <MessageSquareIcon className="text-primary w-5 h-5" />
                  <p className="text-[13px] font-medium leading-[14px]">chat</p>
                </Button>
                <Button
                  variant="secondary"
                  className="w-full flex justify-start items-center gap-4 px-2 py-[10px]"
                  onClick={() => pushToStack('wallet')}>
                  <CreditCardIcon className="text-primary w-5 h-5" />
                  <p className="text-[13px] font-medium leading-[14px]">wallet</p>
                </Button>
                <Button
                  variant="secondary"
                  className="w-full flex justify-start items-center gap-4 px-2 py-[10px]"
                  onClick={() => pushToStack('all booking')}>
                  <LayoutListIcon className="text-primary w-5 h-5" />
                  <p className="text-[13px] font-medium leading-[14px]">
                    works - workspace booking history
                  </p>
                </Button>
                <Button
                  variant="secondary"
                  className="w-full flex justify-start items-center gap-4 px-2 py-[10px]"
                  onClick={() => pushToStack('rental manager')}>
                  <BuildingIcon className="text-primary w-5 h-5" />
                  <p className="text-[13px] font-medium leading-[14px]">stays - rental manager</p>
                </Button>
                <Button
                  variant="secondary"
                  className="w-full flex justify-start items-center gap-4 px-2 py-[10px]"
                  onClick={() => pushToStack('support page')}>
                  <CircleHelpIcon className="text-primary w-5 h-5" />
                  <p className="text-[13px] font-medium leading-[14px]">support</p>
                </Button>
                <Button
                  variant="secondary"
                  className="w-full flex justify-start items-center gap-4 px-2 py-[10px]"
                  onClick={() => pushToStack('logout')}>
                  <LogOutIcon className="text-primary w-5 h-5" />
                  <p className="text-[13px] font-medium leading-[14px]">logout</p>
                </Button>
              </SlidingTabContent>
            </TabsContent>
            <TabsContent value="host" className="w-full overflow-hidden">
              <SlidingTabContent direction={getDirection('host')} animate={!isFirstRender.current}>
                <Button
                  variant="secondary"
                  className="w-full flex justify-start items-center gap-4 px-2 py-[10px]"
                  onClick={() => pushToStack('profile')}>
                  <UserIcon className="text-primary w-5 h-5" />
                  <p className="text-[13px] font-medium leading-[14px]">profile</p>
                </Button>
                <Button
                  variant="secondary"
                  className="w-full flex justify-start items-center gap-4 px-2 py-[10px]"
                  onClick={() => pushToStack('chats')}>
                  <MessageSquareIcon className="text-primary w-5 h-5" />
                  <p className="text-[13px] font-medium leading-[14px]">chat</p>
                </Button>
                <Link
                  href={`/host/dashboard/workspace?s=${pathname}`}
                  onClick={() => setOpen(false)}>
                  <Button
                    variant="secondary"
                    className="w-full flex justify-start items-center gap-4 px-2 py-[10px]">
                    <LayoutDashboardIcon className="text-primary w-5 h-5" />
                    <p className="text-[13px] font-medium leading-[14px]">
                      host - workspace dashboard
                    </p>
                  </Button>
                </Link>
                <Link
                  href={`/host/dashboard/property?s=${pathname}`}
                  onClick={() => setOpen(false)}>
                  <Button
                    variant="secondary"
                    className="w-full flex justify-start items-center gap-4 px-2 py-[10px]">
                    <LayoutListIcon className="text-primary w-5 h-5" />
                    <p className="text-[13px] font-medium leading-[14px]">
                      host - property rental dashboard
                    </p>
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  className="w-full flex justify-start items-center gap-4 px-2 py-[10px]"
                  onClick={() => pushToStack('logout')}>
                  <LogOutIcon className="text-primary w-5 h-5" />
                  <p className="text-[13px] font-medium leading-[14px]">logout</p>
                </Button>
              </SlidingTabContent>
            </TabsContent>
          </div>
        </Tabs>
      )}
    </motion.div>
  );
};

export default Account;
