'use client';

import { motion } from 'framer-motion';

import { tenantSlice, useAppSelector } from '@/redux';
import { Navigation } from '@/contexts';
import { TenantPaymentForm } from '@/components/forms';

type Props = object;

const TenantPayment: React.FC<Props> = () => {
  const { tenantDetail } = useAppSelector(tenantSlice.selectTenant);
  const { direction, pageVariants } = Navigation.useNavigation();

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
          {tenantDetail && <TenantPaymentForm tenant={tenantDetail} />}
        </motion.div>
      </div>
    </div>
  );
};

export default TenantPayment;
