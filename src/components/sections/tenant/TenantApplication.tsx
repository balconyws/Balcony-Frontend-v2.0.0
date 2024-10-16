'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { Navigation } from '@/contexts';
import { Property, Tenant } from '@/types';
import { TenantApplicationForm } from '@/components/forms';

type Props = object;

const TenantApplication: React.FC<Props> = () => {
  const { direction, pageVariants, dataPassed } = Navigation.useNavigation();
  const [property, setProperty] = useState<Property | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    if (dataPassed && dataPassed.property) {
      setProperty(dataPassed.property);
    }
    if (dataPassed && dataPassed.tenant) {
      setTenant(dataPassed.tenant);
      setProperty(dataPassed.tenant.selectedUnit.property);
    }
  }, [dataPassed]);

  return (
    <div className="w-full h-full px-6">
      <div className="w-full h-full">
        <motion.div
          custom={direction}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full h-full">
          {property && (
            <TenantApplicationForm
              property={property}
              tenantId={tenant?._id}
              formData={
                tenant
                  ? {
                      firstName: tenant.info.firstName,
                      lastName: tenant.info.lastName,
                      phone: tenant.info.phone,
                      email: tenant.info.email,
                      selectedUnitId: tenant.selectedUnit._id,
                      moveInRequest: new Date(tenant.info.moveInRequest),
                      note: tenant.info.note,
                      socialSecurityNo: tenant.info.socialSecurityNo,
                      terms: true,
                      agreement: true,
                    }
                  : undefined
              }
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TenantApplication;
