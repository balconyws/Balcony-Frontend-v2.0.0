'use client';

import { useRouter } from 'next/navigation';

import { Navigation } from '@/contexts';
import { authSlice, useAppSelector } from '@/redux';

const useAuthRedirect = () => {
  const { isAuthenticated } = useAppSelector(authSlice.selectAuth);
  const { pushToStack } = Navigation.useNavigation();
  const router = useRouter();

  const redirect = (url: string) => {
    if (isAuthenticated) {
      router.push(url);
    } else {
      pushToStack('auth', { redirectTo: url });
    }
  };

  return redirect;
};

export default useAuthRedirect;
