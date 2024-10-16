'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CircleCheckBigIcon } from 'lucide-react';

import { Navigation } from '@/contexts';
import { Plan } from '@/types';
import { useAuthRedirect } from '@/hooks';
import { DefaultCard } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  subscriptionActions,
  cardActions,
  authActions,
  useAppDispatch,
  subscriptionSlice,
  authSlice,
  cardSlice,
  useAppSelector,
  waitForDispatch,
} from '@/redux';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from '@/components/ui/dialog';

type Props = {
  plans: Plan[];
};

const PricingCards: React.FC<Props> = ({ plans }: Props) => {
  const { pushToStack } = Navigation.useNavigation();
  const redirect = useAuthRedirect();
  const dispatch = useAppDispatch();
  const params = useSearchParams();
  const { subscriptionDetail } = useAppSelector(subscriptionSlice.selectSubscription);
  const { isAuthenticated } = useAppSelector(authSlice.selectAuth);
  const { cards } = useAppSelector(cardSlice.selectCard);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [resError, setResError] = useState<string>('');

  useEffect(() => {
    if (!open) {
      setSelectedPlan(null);
    }
  }, [open]);

  const getCustomPlan = () => {
    const subject = encodeURIComponent('Inquiry About Custom Plan for Additional Units');
    const body = encodeURIComponent(
      `Dear Balcony,\nI hope this message finds you well. I am writing to express my interest in exploring the options available for purchasing a custom plan to accommodate more units for our operations. Our current plan is proving to be insufficient as our needs continue to grow, and we believe that upgrading to a custom plan would be the best solution to ensure seamless functionality.\n\nCould you please provide more details on the available custom plans, including pricing, features, and any potential benefits? Additionally, I would appreciate any insights you may have on how quickly we could implement this upgrade.\n\nThank you for your assistance. I look forward to your prompt response so that we can make an informed decision.\n\nBest regards,\n[Your Name]\n[Your Email Address]\n[Your Phone Number]`
    );
    window.open(`mailto:info.balcony.ws@gmail.com?subject=${subject}&body=${body}`);
  };

  const getStarted = async (p: Plan) => {
    if (p.name === subscriptionDetail?.name || loading) return;
    if (!isAuthenticated) {
      pushToStack('auth', { redirectTo: '/pricing' });
      return;
    }
    setSelectedPlan(p);
    if (cards) {
      setOpen(true);
    } else {
      await waitForDispatch(dispatch, cardActions.getAllCards(), state => {
        const { isFailed, cards } = state.card;
        if (!isFailed && cards) {
          if (cards.length === 0) {
            pushToStack('wallet', 'add');
            setSelectedPlan(null);
          } else {
            setOpen(true);
          }
        }
      });
    }
  };

  const purchsePlan = async () => {
    if (selectedPlan?.name === subscriptionDetail?.name || loading) return;
    if (isAuthenticated && selectedPlan) {
      setLoading(true);
      const sourcePath = params.get('s');
      await waitForDispatch(
        dispatch,
        subscriptionActions.purchasePlan({ productId: selectedPlan.id }),
        state => {
          const { isFailed, error } = state.subscription;
          if (!isFailed) {
            dispatch(authActions.reAuthenticate()).then(() =>
              redirect(sourcePath || '/host/dashboard/property')
            );
          } else {
            setResError(error?.message || 'something went wrong');
          }
          setLoading(false);
          setOpen(false);
        }
      );
    }
  };

  return (
    <div>
      <h1 className="text-[28px] lg:text-[37px] font-medium">pricing</h1>
      <div className="mt-[26px] lg:mt-6 flex flex-col lg:flex-row flex-wrap justify-center lg:justify-start items-center lg:items-start gap-6 lg:gap-4">
        {plans.map((p: Plan, i: number) => (
          <Card
            key={i}
            className={`w-full md:w-[288px] py-3 px-4 rounded-2xl border border-t-[12px] ${
              p.name === 'free plan' ? 'border-[#D9E5E5]' : 'border-primary'
            } ${p.name === 'custom plan' ? 'mb-[57px] lg:mb-0' : 'mb-0'}`}>
            <CardHeader>
              <CardTitle className="text-[27px] font-bold leading-[39px]">{p.name}</CardTitle>
              <CardDescription className={p.name === 'custom plan' ? '-mt-1' : 'mt-8'}>
                {p.name === 'custom plan' && (
                  <p className="mb-[19px] text-[10px] font-bold leading-[18px]">
                    &bull; need more units{' '}
                  </p>
                )}
                <Button
                  variant={p.name === 'free plan' ? 'outline' : 'default'}
                  className={`w-full rounded-md text-[13px] h-[46px] font-semibold leading-[19px] ${
                    p.name === 'free plan' ? 'py-3' : 'py-[13px]'
                  }
                  ${p.name === 'custom plan' ? 'mb-16' : 'mb-0'}
                  ${
                    p.name === subscriptionDetail?.name && p.name === 'free plan'
                      ? 'hover:text-secondary-foreground'
                      : 'hover:text-primary-foreground'
                  }
                  ${
                    (selectedPlan?.name === 'free plan' || p.name === subscriptionDetail?.name) &&
                    p.name === 'free plan'
                      ? 'hover:bg-inherit'
                      : ''
                  }
                  `}
                  isLoading={selectedPlan?.id === p.id}
                  strokeColor={p.name === 'free plan' ? '#005451' : 'white'}
                  disabled={!!selectedPlan || p.name === subscriptionDetail?.name}
                  onClick={() => (p.name === 'custom plan' ? getCustomPlan() : getStarted(p))}>
                  Get Started
                </Button>
              </CardDescription>
            </CardHeader>
            {p.name !== 'custom plan' && (
              <>
                <CardContent className="mt-[14px]">
                  {p.price === 0 ? (
                    <h1 className="text-[27px] font-bold leading-[46px]">always free</h1>
                  ) : (
                    <h1 className="text-[31px] font-bold leading-[46px]">
                      {p.price}
                      <span className="text-[12px] leading-5">/mo</span>
                    </h1>
                  )}
                  <Separator className="mt-[18px] bg-[#D4E0ED]" />
                </CardContent>
                <CardFooter className="mt-8 flex flex-col gap-3">
                  {p.description &&
                    p.description.split(',').map((d: string, index: number) => (
                      <div key={index}>
                        <div className="flex justify-start items-center gap-3">
                          <CircleCheckBigIcon className="text-primary w-4 h-4" />
                          <p className="text-[13px] leading-[21px]">{d}</p>
                        </div>
                        {index === 0 && <Separator className="mt-3" />}
                      </div>
                    ))}
                </CardFooter>
              </>
            )}
          </Card>
        ))}
      </div>
      <Dialog open={open} onOpenChange={val => !loading && setOpen(val)}>
        <DialogContent>
          {selectedPlan && (
            <>
              <DialogHeader>
                <DialogTitle className="flex gap-1">
                  <span className="text-[21px] font-bold leading-5">{selectedPlan.name}</span>
                  <span className="text-[21px] font-bold leading-5">
                    {selectedPlan.price === 0 ? (
                      'always free'
                    ) : (
                      <>
                        {selectedPlan.price}
                        <span className="text-[12px] leading-5">/mo</span>
                      </>
                    )}
                  </span>
                </DialogTitle>
                <DialogDescription>{selectedPlan.description}</DialogDescription>
              </DialogHeader>
              <Separator />
              <DefaultCard
                onClickUpdate={() => {
                  setOpen(false);
                  setSelectedPlan(null);
                }}
              />
              {resError && <p className="text-[10px] font-medium text-destructive">{resError}</p>}
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={`leading-6 border-[#E2E8F0] ${
                      loading && 'hover:bg-secondary hover:text-secondary-foreground'
                    }`}
                    disabled={loading}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  className="leading-6 w-[94px] h-[42px]"
                  onClick={purchsePlan}
                  disabled={loading || cards?.length === 0}
                  isLoading={loading}>
                  Continue
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PricingCards;
