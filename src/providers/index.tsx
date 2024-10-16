'use client';

import { useEffect, useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

import { store, persistor } from '@/redux';
import { Navigation, Cta } from '@/contexts';
import { Spinner } from '@/components/ui/Spinner';

const stripePromise = loadStripe(process.env.STRIPE_API_KEY!);

type Props = {
  children: React.ReactNode;
};

const RootProvider: React.FC<Props> = ({ children }: Props) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted)
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

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Navigation.NavigationProvider>
          <Cta.CtaProvider>
            <Elements stripe={stripePromise}>{children}</Elements>
          </Cta.CtaProvider>
        </Navigation.NavigationProvider>
      </PersistGate>
    </ReduxProvider>
  );
};

export default RootProvider;
