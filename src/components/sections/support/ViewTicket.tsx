'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowLeftIcon } from 'lucide-react';

import { Navigation } from '@/contexts';
import { ticketSlice, useAppSelector } from '@/redux';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

type Props = object;

const ViewTicket: React.FC<Props> = () => {
  const { ticketDetail } = useAppSelector(ticketSlice.selectTicket);
  const { popFromStack, previousPage, direction, pageVariants } = Navigation.useNavigation();

  return (
    <motion.div
      custom={direction}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full h-full">
      <div className="h-full w-full px-5 xl:pl-16">
        <Button
          variant="outline"
          className="flex justify-center items-center gap-2 hover:[svg]:text-primary-foreground"
          onClick={popFromStack}>
          <ArrowLeftIcon className="w-4 h-4" />
          <span className="leading-6">back to {previousPage}</span>
        </Button>
        <div className="h-full">
          <div className="mt-6 w-full rounded-lg bg-[#CCDDDC] flex justify-center items-center px-6 py-[10px] gap-[13px]">
            <h1 className="text-[17px] font-semibold leading-5 tracking-[-1px] w-full">
              Support #: {ticketDetail?._id?.slice(-5)}
            </h1>
          </div>
          {ticketDetail && (
            <>
              <Separator className="my-6" />
              <ScrollArea className="pb-2 h-[56vh] md:h-[81vh] lg:h-[66vh] xl:h-[74vh]">
                {ticketDetail.conversation.map((c, i: number) => (
                  <div key={i} className="flex flex-col mb-3">
                    {c.from === 'user' && (
                      <div className="p-6 rounded-lg border border-[rgba(0,84,81,0.40)] box-shadow-primary">
                        <div className="flex justify-between items-center">
                          <p className="text-[12px] font-medium leading-3">your request</p>
                          <p className="text-[12px] font-medium leading-3">
                            {format(new Date(c.sendOn), 'MMMM d, yyyy')}
                          </p>
                        </div>
                        <Separator className="my-3" />
                        <p className="w-full max-h-[102px] text-[13px] leading-5 multi-line-ellipsis">
                          {c.context}
                        </p>
                      </div>
                    )}
                    {c.from === 'host' && (
                      <div className="p-6 rounded-lg border border-[rgba(0,84,81,0.40)] box-shadow-primary">
                        <div className="flex justify-between items-center">
                          <p className="text-[12px] font-medium leading-3">host response</p>
                          <p className="text-[12px] font-medium leading-3">
                            {format(new Date(c.sendOn), 'MMMM d, yyyy')}
                          </p>
                        </div>
                        <Separator className="my-3" />
                        <p className="w-full max-h-[102px] text-[13px] leading-5 multi-line-ellipsis">
                          {c.context}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </ScrollArea>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ViewTicket;
