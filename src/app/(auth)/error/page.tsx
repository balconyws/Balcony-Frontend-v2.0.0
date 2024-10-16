'use client';

import { NextPage } from 'next';
import NotFound from 'next/error';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { NextAuth } from '@/config';
import { Navigation, Cta } from '@/contexts';
import {
  useAppDispatch,
  authSlice,
  cardSlice,
  chatSlice,
  userSlice,
  workspaceSlice,
  useAppSelector,
} from '@/redux';

type Props = object;

const ErrorPage: NextPage<Props> = () => {
  const params = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(authSlice.selectAuth);
  const { setOpen } = Navigation.useNavigation();
  const { setOpen: CtaOpenHandler } = Cta.useCta();
  const [code, setCode] = useState<number>(501);
  const [message, setMessage] = useState<string>('something went wrong, please try again');

  useEffect(() => {
    const error = params.get('error');
    const errorCode = params.get('code');
    if (error) {
      setTimeout(() => {
        setOpen(false);
        CtaOpenHandler(false);
      }, 100);
      const nextAuthError = NextAuth.getErrorMessage(error);
      if (nextAuthError) {
        setMessage(nextAuthError);
      } else {
        setMessage(error);
      }
      if (errorCode) {
        const parsedCode = parseInt(errorCode, 10);
        setCode(parsedCode);
        document.title = `${parsedCode} - Balcony`;
      }
      dispatch(authSlice.stopLoading());
      dispatch(cardSlice.stopLoading());
      dispatch(chatSlice.stopLoading());
      dispatch(userSlice.stopLoading());
      dispatch(workspaceSlice.stopLoading());
      return;
    }
    router.replace('/');
  }, [CtaOpenHandler, dispatch, params, router, setOpen]);

  useEffect(() => {
    if (
      isAuthenticated &&
      (message.includes('user account is currently inactive') ||
        message.includes('cannot access this resource') ||
        message.includes('not authorized') ||
        message.includes('please login to continue'))
    ) {
      router.replace('/');
    }
  }, [isAuthenticated, message, router]);

  useEffect(() => {
    if (message.includes('please purchase a plan')) {
      router.replace('/pricing');
    }
  }, [message, router]);

  return (
    <div>
      <NotFound statusCode={code} title={message} />
    </div>
  );
};

export default ErrorPage;
