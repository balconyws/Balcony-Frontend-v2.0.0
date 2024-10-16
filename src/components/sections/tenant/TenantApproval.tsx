'use client';

import { motion } from 'framer-motion';

import { tenantSlice, useAppSelector } from '@/redux';
import { Navigation } from '@/contexts';
import { TenantApprovalForm } from '@/components/forms';

type Props = object;

const TenantApproval: React.FC<Props> = () => {
  const { tenantDetail, isViewOnly } = useAppSelector(tenantSlice.selectTenant);
  const { direction, pageVariants } = Navigation.useNavigation();

  return (
    <div className="w-full h-full px-6 lg:pl-6">
      <div className="w-full h-full">
        <motion.div
          custom={direction}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full h-full">
          {tenantDetail && (
            <TenantApprovalForm
              data={{
                tenantId: tenantDetail._id,
                userId: tenantDetail.userId,
                firstName: tenantDetail.info.firstName,
                lastName: tenantDetail.info.lastName,
                phone: tenantDetail.info.phone,
                email: tenantDetail.info.email,
                selectedUnit: tenantDetail.selectedUnit.unit,
                building: tenantDetail.selectedUnit.property.info.address,
                moveInRequest: new Date(tenantDetail.info.moveInRequest),
                note: tenantDetail.info.note,
                socialSecurityNo: tenantDetail.info.socialSecurityNo,
                leasingPolicyDoc: tenantDetail.selectedUnit.property.other.leasingPolicyDoc,
                terms: true,
                agreement: true,
                isViewOnly,
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TenantApproval;
