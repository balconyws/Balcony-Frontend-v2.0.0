'use client';

import { useEffect, useState } from 'react';

import { Sidebar } from '.';
import { Navigation, Cta } from '@/contexts';
import { authSlice, authActions, useAppSelector, useAppDispatch } from '@/redux';
import {
  Chat,
  Account,
  Wallet,
  UpdateUserProfile,
  AllBookings,
  BookingRefund,
  BookingCancel,
  BookingPayment,
  BookingDetail,
  RentalManager,
  TenantPayment,
  TenantApplication,
  TenantApproval,
  PayRent,
  RentDetail,
  Auth,
  Search,
  MapSearchFilter,
  AddTicket,
  ViewTicket,
  TenantRenewLease,
  AllTickets,
} from '@/components/sections';
import { OTPForm, UpdatePasswordForm } from '../forms';

type Props = object;

const StackNavigation: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isReAuthenticate, otpDialog, resetDialog } = useAppSelector(
    authSlice.selectAuth
  );
  const { currentPage, open, setOpen, pushToStack, emptyTheStack } = Navigation.useNavigation();
  const [dimensions, setDimensions] = useState<{ width: string; height: string }>({
    width: 'w-[31%] xl:w-[26%]',
    height: 'h-[70vh]',
  });
  const {
    open: CtaOpen,
    setOpen: CtaOpenHandler,
    setTitle,
    setDescription,
    setSubmitBtnText,
    setSubmitBtnAction,
    setCloseBtnText,
    setCloseBtnAction,
  } = Cta.useCta();

  useEffect(() => {
    dispatch(authSlice.setLoading({ state: false }));
  }, [dispatch]);

  useEffect(() => {
    if (otpDialog.show || resetDialog) {
      setOpen(false);
    }
  }, [otpDialog, resetDialog, setOpen]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(authActions.reAuthenticate());
    }
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        dispatch(authActions.reAuthenticate());
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (isReAuthenticate && !isAuthenticated) {
      emptyTheStack();
      setOpen(false);
      CtaOpenHandler(true);
      setTitle('session expired!');
      setDescription('please login again to continue');
      setSubmitBtnText('login');
      setSubmitBtnAction(() => () => {
        pushToStack('auth');
        CtaOpenHandler(false);
      });
      setCloseBtnText('close');
      setCloseBtnAction(
        () => () => dispatch(authSlice.setReAuthenticate({ reauthenticate: false }))
      );
    }
  }, [
    CtaOpenHandler,
    dispatch,
    emptyTheStack,
    isAuthenticated,
    isReAuthenticate,
    pushToStack,
    setCloseBtnAction,
    setCloseBtnText,
    setDescription,
    setOpen,
    setSubmitBtnAction,
    setSubmitBtnText,
    setTitle,
  ]);

  useEffect(() => {
    if (CtaOpen) {
      dispatch(authSlice.setReAuthenticate({ reauthenticate: false }));
    }
  }, [CtaOpen, dispatch]);

  useEffect(() => {
    if (currentPage === 'all booking')
      setDimensions({ width: 'w-[85%] lg:w-[65%] xl:w-[60%]', height: 'h-[80vh]' });
    if (
      currentPage === 'menu' ||
      currentPage === 'auth' ||
      currentPage === 'search' ||
      currentPage === 'map search filter'
    )
      setDimensions({ width: 'w-[51%] lg:w-[31%] xl:w-[26%]', height: 'h-[70vh]' });
    if (currentPage === 'add ticket' || currentPage === 'view ticket')
      setDimensions({ width: 'w-[51%] lg:w-[31%] xl:w-[26%]', height: 'h-[80vh]' });
    if (currentPage === 'support page')
      setDimensions({ width: 'w-[53%] lg:w-[33%] xl:w-[28%]', height: 'h-[80vh]' });
    if (
      currentPage === 'profile' ||
      currentPage === 'wallet' ||
      currentPage === 'refund booking' ||
      currentPage === 'cancel booking' ||
      currentPage === 'booking detail' ||
      currentPage === 'payment booking' ||
      currentPage === 'rental manager' ||
      currentPage === 'tenant application' ||
      currentPage === 'tenant approval' ||
      currentPage === 'tenant payment' ||
      currentPage === 'tenant renew lease' ||
      currentPage === 'pay rent' ||
      currentPage === 'rent detail'
    )
      setDimensions({ width: 'w-[59%] lg:w-[39%] xl:w-[32%]', height: 'h-[80vh]' });
  }, [currentPage]);

  return (
    <>
      <Sidebar
        open={open}
        onOpenChange={setOpen}
        ariaDescribedBy={currentPage}
        width={dimensions.width}
        height={dimensions.height}
        content={
          <div className="w-full h-full transition-all duration-300 ease-in-out">
            {isAuthenticated ? (
              <>
                {currentPage === 'menu' && <Account />}
                {currentPage === 'profile' && <UpdateUserProfile />}
                {(currentPage === 'chats' || currentPage === 'chatroom') && (
                  <Chat setDimensions={setDimensions} />
                )}
                {currentPage === 'wallet' && <Wallet />}
                {currentPage === 'all booking' && <AllBookings />}
                {currentPage === 'refund booking' && <BookingRefund />}
                {currentPage === 'cancel booking' && <BookingCancel />}
                {currentPage === 'payment booking' && <BookingPayment />}
                {currentPage === 'booking detail' && <BookingDetail />}
                {currentPage === 'rental manager' && <RentalManager />}
                {currentPage === 'tenant application' && <TenantApplication />}
                {currentPage === 'tenant approval' && <TenantApproval />}
                {currentPage === 'tenant payment' && <TenantPayment />}
                {currentPage === 'tenant renew lease' && <TenantRenewLease />}
                {currentPage === 'pay rent' && <PayRent />}
                {currentPage === 'rent detail' && <RentDetail />}
                {currentPage === 'support page' && <AllTickets />}
                {currentPage === 'add ticket' && <AddTicket />}
                {currentPage === 'view ticket' && <ViewTicket />}
              </>
            ) : (
              <>{currentPage === 'auth' && <Auth />}</>
            )}
            {currentPage === 'search' && <Search />}
            {currentPage === 'map search filter' && <MapSearchFilter />}
          </div>
        }
      />
      {!isAuthenticated && (
        <>
          <OTPForm />
          <UpdatePasswordForm />
        </>
      )}
    </>
  );
};

export default StackNavigation;
