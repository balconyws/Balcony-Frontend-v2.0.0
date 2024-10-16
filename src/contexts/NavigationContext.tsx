'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Variants } from 'framer-motion';

import { Pages } from '@/types';
import { Stack } from '@/helper';
import { authActions, authSlice, useAppDispatch, useAppSelector } from '@/redux';

type NavigationContextProps = {
  open: boolean;
  closeOnInteractOutside: boolean;
  currentPage: Pages;
  previousPage: Pages;
  direction: 'right' | 'left' | 'none';
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCloseOnInteractOutside: React.Dispatch<React.SetStateAction<boolean>>;
  setDirection: React.Dispatch<React.SetStateAction<'right' | 'left' | 'none'>>;
  pageVariants: Variants;
  dataPassed: any;
  // eslint-disable-next-line no-unused-vars
  pushToStack: (page: Pages, dataToPass?: any) => void;
  popFromStack: () => void;
  emptyTheStack: () => void;
};

const NavigationContext = createContext<NavigationContextProps | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

type NavigationProviderProps = {
  children: ReactNode;
};

const pageVariants: Variants = {
  initial: (direction: string) => ({
    x: direction === 'none' ? '0%' : direction === 'right' ? '100%' : '-100%',
    opacity: direction === 'none' ? 1 : 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
  exit: (direction: string) => ({
    x: direction === 'none' ? '0%' : direction === 'right' ? '-100%' : '100%',
    opacity: direction === 'none' ? 1 : 0,
    transition: direction === 'none' ? {} : { duration: 0.3, ease: 'easeInOut' },
  }),
};

const ProtectedPages: Pages[] = [
  'all booking',
  'cancel booking',
  'booking detail',
  'chatroom',
  'chats',
  'menu',
  'pay rent',
  'rent detail',
  'payment booking',
  'profile',
  'refund booking',
  'rental manager',
  'tenant application',
  'tenant approval',
  'tenant payment',
  'wallet',
  'support page',
  'add ticket',
  'view ticket',
];

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
}: NavigationProviderProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(authSlice.selectAuth);
  const [navigationStack] = useState<Stack>(() => new Stack(24, 'menu'));
  const [currentPage, setCurrentPage] = useState<Pages>(() => navigationStack.getTop());
  const [previousPage, setPreviousPage] = useState<Pages>(() => navigationStack.getSecondTop());
  const [direction, setDirection] = useState<'right' | 'left' | 'none'>('none');
  const [open, setOpen] = useState<boolean>(false);
  const [closeOnInteractOutside, setCloseOnInteractOutside] = useState<boolean>(true);
  const [dataPassed, setDataPassed] = useState<any>();

  const pushToStack = useCallback(
    (page: Pages, dataToPass?: any): void => {
      if (!dataPassed) {
        setDataPassed(undefined);
      }
      if (ProtectedPages.includes(page) && !isAuthenticated) {
        setOpen(true);
        setDataPassed({ redirectPage: page });
        if (currentPage === 'auth') return;
        navigationStack.push('auth');
        setCurrentPage(navigationStack.getTop());
        setPreviousPage(navigationStack.getSecondTop());
        return;
      }
      if (page === 'logout') {
        dispatch(authActions.logoutUser()).then(() => {
          navigationStack.empty();
          pushToStack('auth');
          setDataPassed(null);
          router.replace('/');
        });
        return;
      }
      if (page === 'menu') {
        navigationStack.empty();
      }
      setOpen(true);
      setDirection('right');
      setDataPassed(dataToPass);
      if (currentPage === page) return;
      navigationStack.push(page);
      setCurrentPage(navigationStack.getTop());
      setPreviousPage(navigationStack.getSecondTop());
    },
    [currentPage, dataPassed, dispatch, isAuthenticated, navigationStack, router]
  );

  const popFromStack = useCallback((): void => {
    if (!navigationStack.isEmpty() && navigationStack.getTop() !== 'menu') {
      navigationStack.pop();
      setCurrentPage(navigationStack.getTop());
      setPreviousPage(navigationStack.getSecondTop());
      setDirection('left');
    }
    setDataPassed(null);
  }, [navigationStack]);

  const emptyTheStack = (): void => {
    navigationStack.empty();
    setCurrentPage(navigationStack.getTop());
    setPreviousPage(navigationStack.getSecondTop());
    setDirection('right');
    setDataPassed(null);
  };

  useEffect(() => {
    if (!open) navigationStack.empty();
  }, [navigationStack, open]);

  useEffect(() => {
    if (currentPage === previousPage) {
      popFromStack();
    }
  }, [currentPage, popFromStack, previousPage]);

  useEffect(() => {
    if (isAuthenticated) {
      if (dataPassed && dataPassed.redirectTo) {
        popFromStack();
        router.push(dataPassed.redirectTo);
        setOpen(false);
        setDataPassed(null);
      }
      if (dataPassed && dataPassed.redirectPage) {
        popFromStack();
        pushToStack(dataPassed.redirectPage, null);
      }
    }
  }, [dataPassed, isAuthenticated, popFromStack, pushToStack, router]);

  useEffect(() => {
    if (isAuthenticated && currentPage === 'auth') {
      popFromStack();
    }
  }, [currentPage, isAuthenticated, popFromStack]);

  useEffect(() => {
    const htmlTag = document.documentElement;
    const bodyTag = document.body;
    bodyTag.style.marginRight = '0px !important';
    bodyTag.removeAttribute('data-scroll-locked');
    if (!open) {
      htmlTag.style.overflowX = 'hidden';
    } else {
      htmlTag.style.overflowX = '';
    }
    return () => {
      htmlTag.style.overflowX = '';
    };
  }, [open]);

  return (
    <NavigationContext.Provider
      value={{
        currentPage,
        previousPage,
        pushToStack,
        popFromStack,
        emptyTheStack,
        open,
        setOpen,
        closeOnInteractOutside,
        setCloseOnInteractOutside,
        direction,
        setDirection,
        pageVariants,
        dataPassed,
      }}>
      {children}
    </NavigationContext.Provider>
  );
};
