'use client';

import { useState } from 'react';
import { ExternalLinkIcon } from 'lucide-react';

import { UserServerActions } from '@/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Props = {
  type: 'workspaces' | 'properties';
};

const DashboardPayoutCard: React.FC<Props> = ({ type }: Props) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handlePayout = async () => {
    setLoading(true);
    const res = await UserServerActions.CreateOnBoardingAccount({ type });
    if ('data' in res) {
      const newTab = window.open(res.data.url, '_blank');
      if (newTab) {
        newTab.focus();
      }
    }
    setLoading(false);
  };

  return (
    <Card className="w-fit border border-border rounded-md box-shadow-primary">
      <CardContent className="p-6">
        <h1 className="text-[23px] font-semibold leading-6 tracking-[-1px]">update payout</h1>
        <p className="mt-3 text-[rgba(0,84,81,0.70)] text-[12px] leading-5">
          please click the link below as it would prompt you to a different link which is with our
          payment partner Stripe. You are able to update your payout info there.
        </p>
        <Button
          className="mt-[22px] w-[181px] h-[43px] leading-6 flex justify-center items-center gap-2 -rotate-1"
          onClick={handlePayout}
          isLoading={loading}>
          <ExternalLinkIcon className="w-4 h-6" />
          <p className="text-inherit">update payout info</p>
        </Button>
      </CardContent>
    </Card>
  );
};

export default DashboardPayoutCard;
