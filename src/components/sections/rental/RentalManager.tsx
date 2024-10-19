'use client';

import { motion } from 'framer-motion';
import { ArrowLeftIcon } from 'lucide-react';

import { Navigation } from '@/contexts';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AwaitingReview, Renting, RentedHistory } from '..';

type Props = object;

const RentalManager: React.FC<Props> = () => {
  const { popFromStack, previousPage, direction, pageVariants } = Navigation.useNavigation();

  return (
    <motion.div
      custom={direction}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full h-full">
      <div className="h-full w-full pl-2 xl:pl-12">
        <Button
          variant="outline"
          className="flex justify-center items-center gap-2 hover:[svg]:text-primary-foreground"
          onClick={popFromStack}>
          <ArrowLeftIcon className="w-4 h-4" />
          <span className="leading-6">back to {previousPage}</span>
        </Button>
        <div className="mt-6 xl:mt-8 w-full h-full">
          <ScrollArea className="w-full h-[70vh] lg:h-[78vh] xl:h-[84vh] overflow-hidden -mr-3 pr-3">
            <div className="flex flex-col gap-6 mt-[2px] ml-[2px]">
              <AwaitingReview />
              <Renting />
              <RentedHistory />
            </div>
          </ScrollArea>
        </div>
      </div>
    </motion.div>
  );
};

export default RentalManager;
