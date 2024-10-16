'use client';

import { motion } from 'framer-motion';

import { Navigation } from '@/contexts';
import { tenantSlice, useAppSelector } from '@/redux';
import { PayRentForm } from '@/components/forms';

type Props = object;

const PayRent: React.FC<Props> = () => {
  const { tenantDetail } = useAppSelector(tenantSlice.selectTenant);
  const { direction, pageVariants } = Navigation.useNavigation();

  return (
    <div className="w-full h-full px-6">
      <div className="h-full">
        <motion.div
          custom={direction}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full h-full">
          {tenantDetail && <PayRentForm tenant={tenantDetail} />}
        </motion.div>
      </div>
    </div>
  );
};

export default PayRent;
