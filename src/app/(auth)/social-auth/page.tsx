'use client';

import { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { SocialAuthCredentials } from '@/types';
import { useAppDispatch, authActions, authSlice, useAppSelector } from '@/redux';
import { Spinner } from '@/components/ui/Spinner';

type Props = object;

const Loading: NextPage<Props> = () => {
  const session = useSession();
  const params = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { error, isAuthenticated } = useAppSelector(authSlice.selectAuth);
  const redirectTo = params.get('to');

  useEffect(() => {
    const loginUser = async (payload: SocialAuthCredentials) =>
      await dispatch(authActions.socialAuth(payload));

    if (session.status === 'loading') return;
    if (session.status === 'authenticated' && session.data?.user) {
      const { name, email } = session.data.user;
      if (name && email) {
        const names = name.trim().split(' ');
        const firstName = names[0];
        const lastName = names.slice(1).join(' ');
        const payload = {
          firstName,
          lastName,
          email,
          password: email,
        };
        loginUser(payload);
        return;
      }
    }
    router.replace(redirectTo || '/');
  }, [dispatch, redirectTo, router, session]);

  useEffect(() => {
    if (error) {
      router.replace(`/error?error=${error.message}`);
    }
    if (isAuthenticated) {
      router.replace(redirectTo && redirectTo !== '/error' ? redirectTo : '/');
    }
  }, [error, isAuthenticated, redirectTo, router]);

  return (
    <main className="flex flex-col justify-center items-center w-screen h-screen">
      <Spinner
        show={true}
        size="large"
        className="!text-primary w-20 h-20"
        iconClassName="w-20 h-20 stroke-1"
      />
    </main>
  );
};

export default Loading;
