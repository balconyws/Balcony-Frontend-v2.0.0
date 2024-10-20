'use client';

import { useEffect } from 'react';
import { CircleAlertIcon } from 'lucide-react';

import { Navigation } from '@/contexts';
import { ticketActions, useAppDispatch, ticketSlice, useAppSelector } from '@/redux';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Props = {
  type: 'workspaces' | 'properties';
};

const DashboardViewRequestCard: React.FC<Props> = ({ type }: Props) => {
  const dispatch = useAppDispatch();
  const { workspaceTickets, propertyTickets } = useAppSelector(ticketSlice.selectTicket);
  const { pushToStack, setDirection } = Navigation.useNavigation();

  useEffect(() => {
    dispatch(ticketActions.getAllTicket());
  }, [dispatch]);

  const viewTickets = () => {
    dispatch(ticketSlice.setTicketsType({ ticketType: type }));
    pushToStack('support page');
    setDirection('none');
  };

  return (
    <Card className="sticky top-4 z-10 w-[174px] md:w-[188px] border border-border rounded-md box-shadow-primary">
      <CardContent className="p-6">
        <div className="flex justify-start items-center gap-[6px]">
          <CircleAlertIcon className="text-primary w-6 h-6" />
          <p className="text-[#71717A] text-[13px] leading-5">open support requests</p>
        </div>
        <h1 className="mt-[6px] text-[35px] font-semibold leading-10 tracking-[-1px]">
          {type === 'workspaces'
            ? workspaceTickets
              ? workspaceTickets.tickets.length
              : 0
            : type === 'properties' && propertyTickets
              ? propertyTickets.tickets.length
              : 0}
        </h1>
        <Button className="mt-[22px] leading-6" onClick={viewTickets}>
          view requests
        </Button>
      </CardContent>
    </Card>
  );
};

export default DashboardViewRequestCard;
