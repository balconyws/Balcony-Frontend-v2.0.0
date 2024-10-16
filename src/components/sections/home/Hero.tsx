'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SearchIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkspacesForm, PropertiesForm } from '@/components/forms';

type Tabs = 'workspaces' | 'properties';

const SlideToggle = ({ activeTab }: { activeTab: Tabs }) => (
  <motion.div
    className="absolute inset-y-0 bg-primary rounded-lg m-[5px] shadow-md"
    layout
    initial={{ left: activeTab === 'workspaces' ? 0 : '45.5%' }}
    animate={{ left: activeTab === 'workspaces' ? 0 : '45.5%' }}
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
    initial={animate ? { opacity: 0, x: direction === 'left' ? 150 : -150 } : {}}
    animate={animate ? { opacity: 1, x: 0 } : {}}
    exit={animate ? { opacity: 0, x: direction === 'left' ? -150 : 150 } : {}}
    transition={{ duration: 0.5 }}>
    {children}
  </motion.div>
);

type Props = object;

const Hero: React.FC<Props> = () => {
  const [activeTab, setActiveTab] = useState<Tabs>('workspaces');

  const prevTab = useRef<Tabs | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  const getDirection = (currentTab: Tabs) => {
    if (!prevTab.current) return 'right';
    return prevTab.current === 'workspaces' && currentTab === 'properties' ? 'right' : 'left';
  };

  const handleTabChange = (value: string) => {
    prevTab.current = activeTab;
    setActiveTab(value as Tabs);
  };

  return (
    <div className="relative">
      <Image
        src="/assets/img/hero.svg"
        alt="bg-1"
        width={1200}
        height={1200}
        quality={100}
        priority
        className="w-full hidden lg:block"
      />
      <div className="static lg:absolute lg:top-0 w-full flex justify-center lg:justify-start items-start">
        <div className="w-3/5 hidden lg:block"></div>
        <div className="w-[90%] lg:w-2/5 mt-32 lg:mt-[16%] xl:mt-[13%] lg:mr-[10%] flex justify-end">
          <Tabs
            defaultValue="workspaces"
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full lg:w-[400px]">
            <div className="flex w-[312px]">
              <Button variant="secondary" className="!cursor-default leading-6 Buttonpl-0 md:pl-4">
                <SearchIcon className="text-primary h-4 w-4 mr-2" />
                <p>search</p>
              </Button>
              <div className="relative w-2/3 md:w-[229px] h-[42px] p-[5px] rounded-lg shadow-md">
                <TabsList className="flex w-full h-full relative z-10 shadow-none">
                  <TabsTrigger
                    value="workspaces"
                    className="bg-transparent data-[state=active]:bg-transparent">
                    workspaces
                  </TabsTrigger>
                  <TabsTrigger
                    value="properties"
                    className="bg-transparent data-[state=active]:bg-transparent">
                    properties
                  </TabsTrigger>
                </TabsList>
                <SlideToggle activeTab={activeTab} />
              </div>
            </div>
            <div className="mt-3 w-full p-6 shadow-md rounded-lg bg-white border border-border">
              <TabsContent value="workspaces" className="-mx-1 px-1 overflow-hidden">
                <SlidingTabContent
                  direction={getDirection('workspaces')}
                  animate={!isFirstRender.current}>
                  <WorkspacesForm />
                </SlidingTabContent>
              </TabsContent>
              <TabsContent value="properties" className="-mx-1 px-1 overflow-hidden">
                <SlidingTabContent
                  direction={getDirection('properties')}
                  animate={!isFirstRender.current}>
                  <PropertiesForm />
                </SlidingTabContent>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Hero;
