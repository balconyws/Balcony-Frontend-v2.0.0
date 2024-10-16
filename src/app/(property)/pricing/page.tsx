'use client';

import { NextPage } from 'next';
import { useEffect, useState } from 'react';

import { Spinner } from '@/components/ui/Spinner';
import { PricingCards } from '@/components/sections';
import { ErrorMessage, Footer } from '@/components/common';
import {
  subscriptionActions,
  useAppDispatch,
  subscriptionSlice,
  authSlice,
  useAppSelector,
  waitForDispatch,
} from '@/redux';

type Props = object;

const Pricing: NextPage<Props> = () => {
  const dispatch = useAppDispatch();
  const { error, plans } = useAppSelector(subscriptionSlice.selectSubscription);
  const { isAuthenticated } = useAppSelector(authSlice.selectAuth);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isAuthenticated) {
      waitForDispatch(dispatch, subscriptionActions.getUserSubscriptionDetail(), state => {
        const { loading } = state.subscription;
        setLoading(loading);
      });
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    waitForDispatch(dispatch, subscriptionActions.getAllPlans(), state => {
      const { loading } = state.subscription;
      setLoading(loading);
    });
  }, [dispatch]);

  if (loading) {
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
  }

  if (plans) {
    return (
      <>
        <main className="pt-28 md:pt-36 xl:pt-40 flex flex-col justify-center items-center">
          <div className="w-[90%] lg:w-4/5">
            <PricingCards plans={plans} />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return <ErrorMessage errorCode={500} message={error?.message || 'something went wrong'} />;
};

export default Pricing;
