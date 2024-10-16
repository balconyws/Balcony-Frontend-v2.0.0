'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import { Navigation } from '@/contexts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SigninForm, SignupForm, ForgotPasswordForm } from '@/components/forms';

type Tabs = 'signin' | 'signup' | 'password-reset';

const SlideToggle = ({ activeTab }: { activeTab: Tabs }) => {
  const leftPositions = {
    signin: 0,
    signup: '72px',
    'password-reset': '150px',
  };

  return (
    <motion.div
      className="absolute inset-y-0 bg-primary rounded-lg m-[5px] shadow-md"
      layout
      initial={{ left: leftPositions[activeTab] }}
      animate={{ left: leftPositions[activeTab] }}
      transition={{
        type: 'just',
        stiffness: 300,
        damping: 20,
      }}
      style={{
        width: activeTab === 'password-reset' ? '154px' : activeTab === 'signin' ? '82px' : '88px',
      }}
    />
  );
};

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

const Auth: React.FC<Props> = () => {
  const { direction, pageVariants } = Navigation.useNavigation();
  const [activeTab, setActiveTab] = useState<Tabs>('signin');

  const prevTab = useRef<'left' | 'right' | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  const getDirection = () => (prevTab.current === 'right' ? 'left' : 'right');

  const handleTabChange = (value: string) => {
    prevTab.current = getDirection();
    setActiveTab(value as Tabs);
  };

  return (
    <motion.div
      custom={direction}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full h-full">
      <Tabs
        defaultValue="signin"
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full mt-8">
        <div className="relative w-[314px] h-10 p-[5px] rounded-lg shadow-md">
          <TabsList className="flex w-full h-full relative z-10 shadow-none">
            <TabsTrigger
              value="signin"
              className="w-[88px] px-3 py-[6px] bg-transparent data-[state=active]:bg-transparent">
              sign in
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="w-[88px] px-3 py-[6px] bg-transparent data-[state=active]:bg-transparent">
              sign up
            </TabsTrigger>
            <TabsTrigger
              value="password-reset"
              className="w-[178px] px-3 py-[6px] bg-transparent data-[state=active]:bg-transparent">
              password reset
            </TabsTrigger>
          </TabsList>
          <SlideToggle activeTab={activeTab} />
        </div>
        <TabsContent value="signin" className="w-full ring-0 focus-visible:ring-0 border-none">
          <SlidingTabContent direction={getDirection()} animate={!isFirstRender.current}>
            <SigninForm />
          </SlidingTabContent>
        </TabsContent>
        <TabsContent value="signup" className="w-full">
          <SlidingTabContent direction={getDirection()} animate={!isFirstRender.current}>
            <SignupForm />
          </SlidingTabContent>
        </TabsContent>
        <TabsContent value="password-reset" className="w-full">
          <SlidingTabContent direction={getDirection()} animate={!isFirstRender.current}>
            <ForgotPasswordForm />
          </SlidingTabContent>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Auth;
