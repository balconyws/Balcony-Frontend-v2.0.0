'use client';

import { motion } from 'framer-motion';

import { Navigation } from '@/contexts';
import { bookingSlice, useAppSelector } from '@/redux';
import { BookingPaymentForm } from '@/components/forms';

type Props = object;

const BookingPayment: React.FC<Props> = () => {
  const { direction, pageVariants } = Navigation.useNavigation();
  const { selectedBooking } = useAppSelector(bookingSlice.selectBooking);

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
          {selectedBooking && (
            <BookingPaymentForm
              workspace={selectedBooking.workspace}
              selectedDates={{
                from: new Date(selectedBooking.selectedDates.from),
                to: new Date(selectedBooking.selectedDates.to),
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default BookingPayment;
