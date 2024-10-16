'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { Navigation } from '@/contexts';
import { Workspace } from '@/types';
import { BookingPaymentForm } from '@/components/forms';

type Props = object;

const BookingPayment: React.FC<Props> = () => {
  const { direction, pageVariants, dataPassed } = Navigation.useNavigation();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [selectedDates, setSelectedDates] = useState<{ from: Date; to: Date } | null>(null);

  useEffect(() => {
    if (dataPassed && dataPassed.workspace && dataPassed.selectedDates) {
      setWorkspace(dataPassed.workspace);
      setSelectedDates(dataPassed.selectedDates);
    }
  }, [dataPassed]);

  return (
    <div className="w-full h-full px-6">
      <div className="xl:pt-10 h-full">
        <motion.div
          custom={direction}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full h-full">
          {workspace && selectedDates && (
            <BookingPaymentForm workspace={workspace} selectedDates={selectedDates} />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default BookingPayment;
