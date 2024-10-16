'use client';

import { useEffect } from 'react';

import { formatCurrency } from '@/helper';
import { userActions, useAppDispatch, userSlice, authSlice, useAppSelector } from '@/redux';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const MAX_AMOUNT = 100000; // Maximum amount set to 1 lac dollars

type Props = {
  type: 'earned' | 'deposited';
};

const DashboardProgressCard: React.FC<Props> = ({ type }: Props) => {
  const dispatch = useAppDispatch();
  const { balance } = useAppSelector(userSlice.selectUser);
  const { user } = useAppSelector(authSlice.selectAuth);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        dispatch(userActions.getAdminBalance());
      }
      if (user.role === 'host') {
        dispatch(userActions.getHostBalance({ hostId: user._id }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const currentAmount = type === 'earned' ? (balance?.earnings ?? 0) : (balance?.deposits ?? 0);
  const progressValue = Math.min((currentAmount / MAX_AMOUNT) * 100, 100);

  return (
    <Card className="w-[174px] md:w-[188px] border border-border rounded-md box-shadow-primary">
      <CardContent className="p-6">
        <p className="text-[#71717A] text-[13px] leading-5">total {type}</p>
        <div className="flex justify-center items-center w-full h-full">
          <h1 className="my-[6px] flex-1 text-[2em] font-semibold leading-10 tracking-[-1px]">
            {type === 'earned'
              ? formatCurrency(balance?.earnings ?? 0, 'usd')
              : formatCurrency(balance?.deposits ?? 0, 'usd')}
          </h1>
        </div>
        <p className="text-[#71717A] text-[12px] leading-4">
          this {type === 'earned' ? 'month' : 'year'}
        </p>
        <Progress value={progressValue} className="mt-6" />
      </CardContent>
    </Card>
  );
};

export default DashboardProgressCard;
