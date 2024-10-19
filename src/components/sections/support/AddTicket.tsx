'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowLeftIcon } from 'lucide-react';

import { Cta, Navigation } from '@/contexts';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AddTicketRequestForm } from '@/components/forms';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ticketActions,
  useAppDispatch,
  ticketSlice,
  useAppSelector,
  waitForDispatch,
} from '@/redux';

type Props = object;

const AddTicket: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const { ticketDetail, loading } = useAppSelector(ticketSlice.selectTicket);
  const { setOpen, pushToStack, popFromStack, previousPage, direction, pageVariants } =
    Navigation.useNavigation();
  const {
    setOpen: CtaOpenHandler,
    setTitle,
    setDescription,
    setSubmitBtnText,
    setSubmitBtnAction,
    setCloseBtnText,
  } = Cta.useCta();

  const onCloseTicket = async () => {
    if (!ticketDetail) return;
    await waitForDispatch(
      dispatch,
      ticketActions.closeTicket({ ticketId: ticketDetail._id }),
      state => {
        const { isFailed } = state.ticket;
        if (!isFailed) {
          setOpen(false);
          CtaOpenHandler(true);
          setTitle('all set!');
          setDescription('the request has been successfully closed.');
          setSubmitBtnText('back to support page');
          setSubmitBtnAction(() => () => {
            popFromStack();
            pushToStack('support page');
            CtaOpenHandler(false);
          });
          setCloseBtnText('done');
        }
      }
    );
  };

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
          {ticketDetail && (
            <div className="mt-6 w-full rounded-lg bg-[#CCDDDC] flex justify-center items-center px-6 py-[10px] gap-[13px]">
              <h1 className="text-[17px] font-semibold leading-5 tracking-[-1px] w-36">
                Support #: {ticketDetail?._id?.slice(-5)}
              </h1>
              <Separator orientation="vertical" className="h-[56px]" />
              <Button
                variant="secondary"
                className="leading-6 w-32 box-shadow-button"
                isLoading={loading}
                onClick={onCloseTicket}>
                close ticket
              </Button>
            </div>
          )}
          <ScrollArea className="mt-2 py-2 h-[60vh] md:h-[85vh] lg:h-[70vh] xl:h-[78vh]">
            <AddTicketRequestForm ticketId={ticketDetail ? ticketDetail._id : undefined} />
            {ticketDetail && (
              <>
                <Separator className="my-6" />
                {ticketDetail.conversation
                  .slice()
                  .sort((a, b) => new Date(b.sendOn).getTime() - new Date(a.sendOn).getTime())
                  .map((c, i: number) => (
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
              </>
            )}
          </ScrollArea>
        </div>
      </div>
    </motion.div>
  );
};

export default AddTicket;
