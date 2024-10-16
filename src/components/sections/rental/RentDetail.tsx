'use client';

import { motion } from 'framer-motion';
import { addMonths, startOfMonth, format } from 'date-fns';

import { Navigation } from '@/contexts';
import { capitalizeWords, formatCurrency, validator } from '@/helper';
import { tenantSlice, useAppSelector } from '@/redux';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

type Props = object;

const RentDetail: React.FC<Props> = () => {
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
          <ScrollArea className="mt-6 w-full h-[74vh] md:h-[90vh] lg:h-[90vh] overflow-hidden">
            {tenantDetail && (
              <div className="w-full md:w-[383px] h-fit pt-[1px] pl-[1px] pb-6 rounded-lg border border-[#E4E4E7] box-shadow-primary">
                <div className="rounded-t-lg form--header-bg p-6">
                  <h1 className="text-[17px] font-semibold leading-7 tracking-[-1px]">
                    {tenantDetail.selectedUnit.property.info.name}
                  </h1>
                </div>
                <div className="px-6 h-auto">
                  <p className="mt-6 text-[13px] font-semibold leading-5">leasing details</p>
                  <div className="mt-3 flex justify-between items-center">
                    <p className="text-[#71717A] text-[13px] leading-5">rent amount</p>
                    <p className="text-[13px] leading-5">
                      {formatCurrency((tenantDetail.agreement?.rent ?? 0) / 100, 'usd')}
                    </p>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <p className="text-[#71717A] text-[13px] leading-5">security fee</p>
                    <p className="text-[13px] leading-5">
                      {formatCurrency(
                        (tenantDetail.agreement?.securityDepositFee ?? 0) / 100,
                        'usd'
                      )}
                    </p>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <p className="text-[#71717A] text-[13px] leading-5">subtotal</p>
                    <p className="text-[13px] leading-5">
                      {formatCurrency(
                        ((tenantDetail.agreement?.rent ?? 0) +
                          (tenantDetail.agreement?.securityDepositFee ?? 0)) /
                          100,
                        'usd'
                      )}
                    </p>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <p className="text-[#71717A] text-[13px] leading-5">service fee</p>
                    <p className="text-[13px] leading-5">{formatCurrency(5, 'usd')}</p>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <p className="text-[#71717A] text-[13px] font-semibold leading-5">total</p>
                    <p className="text-[13px] leading-5">
                      {formatCurrency(
                        ((tenantDetail.agreement?.rent ?? 0) +
                          (tenantDetail.agreement?.securityDepositFee ?? 0)) /
                          100 +
                          5,
                        'usd'
                      )}
                    </p>
                  </div>
                  <Separator className="bg-[#E4E4E7] my-4 h-[0.8px]" />
                  <p className="mt-6 text-[13px] font-semibold leading-5">Due on or before</p>
                  <div className="mt-3 flex justify-between items-center">
                    <p className="text-[#71717A] text-[13px] leading-5">
                      {tenantDetail.agreement &&
                        format(
                          startOfMonth(
                            addMonths(new Date(tenantDetail.lastPaymentDate || Date()), 1)
                          ),
                          'dd/MM/yyyy'
                        )}
                    </p>
                  </div>
                  <Separator className="bg-[#E4E4E7] my-4 h-[0.8px]" />
                  <div className="flex justify-start items-center gap-[43px]">
                    <div className="flex flex-col justify-start items-start gap-3">
                      <p className="text-[13px] font-semibold leading-5">lease start date</p>
                      <p className="text-[#71717A] text-[13px] leading-5">
                        {tenantDetail.agreement &&
                          format(new Date(tenantDetail.agreement.leaseStartDate), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <div className="flex flex-col justify-start items-start gap-3">
                      <p className="text-[13px] font-semibold leading-5">lease end date</p>
                      <p className="text-[#71717A] text-[13px] leading-5">
                        {tenantDetail.agreement &&
                          format(new Date(tenantDetail.agreement.leaseEndDate), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                  <Separator className="bg-[#E4E4E7] my-4 h-[0.8px]" />
                  <p className="text-[13px] font-semibold leading-5">your info.</p>
                  <div className="mt-3 flex justify-between items-center">
                    <p className="text-[#71717A] text-[13px] leading-5">name</p>
                    <p className="text-[13px] leading-5">
                      {capitalizeWords(tenantDetail.info.firstName ?? '')}{' '}
                      {capitalizeWords(tenantDetail.info.lastName ?? '')}
                    </p>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <p className="text-[#71717A] text-[13px] leading-5">email</p>
                    <p className="text-[13px] leading-5">{tenantDetail.info.email}</p>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <p className="text-[#71717A] text-[13px] leading-5">phone</p>
                    <p className="text-[13px] leading-5">
                      {validator.formatPhoneNumber(tenantDetail.info.phone)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </motion.div>
      </div>
    </div>
  );
};

export default RentDetail;
