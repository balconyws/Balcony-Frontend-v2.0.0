'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { CreateTokenBankAccountData, StripeError } from '@stripe/stripe-js';
import { useStripe } from '@stripe/react-stripe-js';
import { ChevronDownIcon } from 'lucide-react';

import { Navigation, Cta } from '@/contexts';
import { Tenant } from '@/types';
import { capitalizeWords, formatCurrency, validator } from '@/helper';
import { DefaultCard } from '@/components/common';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  tenantActions,
  useAppDispatch,
  tenantSlice,
  useAppSelector,
  waitForDispatch,
} from '@/redux';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z
  .object({
    promoCode: z.string().optional(),
    accountHolderName: z.string().optional(),
    routingNo: z.string().optional(),
    accountNo: z.string().optional(),
    accountType: z.string().optional(),
  })
  .refine(values => !values.promoCode || values.promoCode.length >= 4, {
    message: 'Invalid code',
    path: ['promoCode'],
  });

type Tabs = 'card' | 'ach';

const SlideToggle = ({ activeTab }: { activeTab: Tabs }) => (
  <motion.div
    className="absolute inset-y-0 bg-primary rounded-lg m-[5px] shadow-md"
    layout={false}
    initial={{ left: activeTab === 'card' ? 0 : '45.5%' }}
    animate={{ left: activeTab === 'card' ? 0 : '45.5%' }}
    transition={{
      type: 'just',
      stiffness: 300,
      damping: 20,
    }}
    style={{ width: '50%' }}
  />
);

const SlidingTabContent = ({
  children,
  direction,
  animate,
}: {
  children: React.ReactNode;
  direction: 'left' | 'right';
  animate: boolean;
}) => (
  <motion.div
    initial={animate ? { opacity: 0, x: direction === 'left' ? 150 : -150 } : {}}
    animate={animate ? { opacity: 1, x: 0 } : {}}
    exit={animate ? { opacity: 0, x: direction === 'left' ? -150 : 150 } : {}}
    transition={{ duration: 0.5 }}>
    {children}
  </motion.div>
);

type Props = {
  tenant: Tenant;
};

const TenantPaymentForm: React.FC<Props> = ({ tenant }: Props) => {
  const dispatch = useAppDispatch();
  const { loading, error, isLoadingBankDetails, bankAccount } = useAppSelector(
    tenantSlice.selectTenant
  );
  const { setOpen, pushToStack, popFromStack } = Navigation.useNavigation();
  const {
    setOpen: CtaOpenHandler,
    setTitle,
    setDescription,
    setSubmitBtnText,
    setSubmitBtnAction,
    setCloseBtnText,
  } = Cta.useCta();
  const [activeTab, setActiveTab] = useState<Tabs>('card');
  const [resError, setResError] = useState<string>('');
  const [confirmationLoading, setConfirmationLoading] = useState<boolean>(false);
  const prevTab = useRef<Tabs | null>(null);
  const isFirstRender = useRef(true);

  const stripe = useStripe();

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  useEffect(() => {
    dispatch(tenantActions.getBankAccount());
  }, [dispatch, tenant._id]);

  type formSchema = z.infer<typeof formSchema>;

  const form = useForm<formSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      promoCode: '',
      accountHolderName: bankAccount?.accountHolderName ?? '',
      routingNo: bankAccount?.routingNo ?? '',
      accountNo: bankAccount?.accountNo ? `**********${bankAccount.accountNo}` : '',
      accountType: bankAccount?.accountHolderType ?? '',
    },
  });

  const isError = (inputName: keyof formSchema): boolean => {
    const fieldState = form.getFieldState(inputName);
    return !!fieldState.error;
  };

  useEffect(() => {
    if (error) {
      if (error.key === '') {
        setResError(error.message);
      } else {
        form.setError(error.key as keyof formSchema, { message: error.message });
      }
      dispatch(tenantSlice.clearError());
      setConfirmationLoading(false);
    }
  }, [dispatch, error, form]);

  const handleError = (error: StripeError) => {
    if (error.type === 'validation_error') {
      setResError('please check your details and try again');
    } else if (error.type === 'api_error') {
      setResError('There was an issue connecting to our payment processor');
    } else {
      setResError(error.message || 'something went wrong');
    }
    setConfirmationLoading(false);
  };

  const onSuccess = () => {
    setOpen(false);
    CtaOpenHandler(true);
    setTitle('your all set!');
    setDescription(
      'You should receive an email with the rental details. You can also visit the rental manager page as well.'
    );
    setSubmitBtnText('visit rental manager page');
    setSubmitBtnAction(() => () => {
      popFromStack();
      pushToStack('rental manager');
      CtaOpenHandler(false);
    });
    setCloseBtnText('done');
  };

  const onSubmit: SubmitHandler<formSchema> = async (data: formSchema) => {
    setResError('');
    if (confirmationLoading || isLoadingBankDetails) return;
    if (activeTab === 'ach') {
      if (!data.accountHolderName) {
        form.setError('accountHolderName', { message: 'account holder name is required' });
        return;
      }
      if (!data.accountNo) {
        form.setError('accountNo', { message: 'account number is required' });
        return;
      }
      if (!data.routingNo) {
        form.setError('routingNo', { message: 'routing number is required' });
        return;
      }
      if (!data.accountType) {
        form.setError('accountType', { message: 'account type is required' });
        return;
      }
      setConfirmationLoading(true);
    }
    await waitForDispatch(
      dispatch,
      tenantActions.tenantPayment({
        tenantId: tenant._id,
        type: activeTab,
        promoCode: data.promoCode,
      }),
      state => {
        const { isFailed, stripeClientSecret } = state.tenant;
        if (!isFailed) {
          if (activeTab === 'ach') {
            if (bankAccount) {
              onSuccess();
              return;
            }
            if (stripe && stripeClientSecret) {
              stripe
                .confirmUsBankAccountPayment(stripeClientSecret, {
                  payment_method: {
                    billing_details: {
                      name: data.accountHolderName,
                      email: tenant.info.email,
                      phone: tenant.info.phone,
                    },
                    us_bank_account: {
                      account_number: data.accountNo ?? '',
                      routing_number: data.routingNo ?? '',
                      account_holder_type: data.accountType ?? '',
                    },
                  },
                  return_url: `${process.env.NEXT_PUBLIC_URL}`,
                })
                .then(async ({ paymentIntent, error }) => {
                  if (error) {
                    handleError(error);
                  } else if (paymentIntent.status === 'requires_payment_method') {
                    setResError('It seems you canceled the bank verification');
                  } else if (paymentIntent.status === 'requires_action') {
                    stripe
                      .verifyMicrodepositsForPayment(stripeClientSecret, {
                        amounts: [32, 45],
                      })
                      .then(async ({ paymentIntent, error }) => {
                        if (error) {
                          handleError(error);
                        }
                        if (paymentIntent?.status === 'processing') {
                          setResError('');
                          const tenantAccount: CreateTokenBankAccountData = {
                            account_holder_name: data.accountHolderName,
                            account_number: data.accountNo ?? '',
                            routing_number: data.routingNo ?? '',
                            account_holder_type: data.accountType ?? '',
                            country: 'US',
                            currency: 'usd',
                          };
                          const res = await stripe.createToken('bank_account', tenantAccount);
                          if (res.token) {
                            await dispatch(
                              tenantActions.addBankAccount({
                                tenantId: tenant._id,
                                token: res.token.id,
                              })
                            );
                          } else {
                            setResError('something went wrong');
                          }
                        } else {
                          setResError('something went wrong');
                        }
                      })
                      .catch(() => setResError('something went wrong'))
                      .finally(() => setConfirmationLoading(false));
                  } else {
                    setResError('something went wrong');
                    setConfirmationLoading(false);
                  }
                })
                .catch(() => setResError('something went wrong'));
            } else {
              setResError('something went wrong');
            }
          } else {
            onSuccess();
          }
        }
      }
    );
  };

  const getDirection = (currentTab: Tabs) => {
    if (!prevTab.current) return 'right';
    return prevTab.current === 'card' && currentTab === 'ach' ? 'right' : 'left';
  };

  const handleTabChange = (value: string) => {
    setResError('');
    prevTab.current = activeTab;
    setActiveTab(value as Tabs);
    form.clearErrors('routingNo');
    form.clearErrors('accountNo');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mt-6 w-full md:w-[383px] h-fit pt-[1px] pl-[1px] rounded-lg border border-[#E4E4E7] box-shadow-primary">
          <div className="rounded-t-lg form--header-bg p-6">
            <h1 className="text-[17px] font-semibold leading-7 tracking-[-1px]">
              {tenant.selectedUnit.property.info.name}
            </h1>
            <div className="flex justify-start items-start gap-[3px]">
              <Image
                src="/assets/icons/ratings-2.svg"
                alt="rating"
                width={117}
                height={23}
                className="w-[55px] h-[12px]"
              />
              <p className="text-[10px]">(1)</p>
            </div>
          </div>
          <ScrollArea className="px-6 h-[64vh] lg:h-[72vh]">
            <p className="mt-6 text-[13px] font-semibold leading-5">leasing details</p>
            <div className="mt-3 flex justify-between items-center">
              <p className="text-[#71717A] text-[13px] leading-5">rent amount</p>
              <p className="text-[13px] leading-5">
                {formatCurrency((tenant.agreement?.rent ?? 0) / 100, 'usd')}
              </p>
            </div>
            {tenant.agreement?.securityDepositFee ? (
              <div className="mt-3 flex justify-between items-center">
                <p className="text-[#71717A] text-[13px] leading-5">security fee</p>
                <p className="text-[13px] leading-5">
                  {formatCurrency(tenant.agreement.securityDepositFee / 100, 'usd')}
                </p>
              </div>
            ) : (
              ''
            )}
            <div className="mt-3 flex justify-between items-center">
              <p className="text-[#71717A] text-[13px] leading-5">subtotal</p>
              <p className="text-[13px] leading-5">
                {formatCurrency(
                  ((tenant.agreement?.rent ?? 0) + (tenant.agreement?.securityDepositFee ?? 0)) /
                    100,
                  'usd'
                )}
              </p>
            </div>
            {tenant.selectedUnit.property.other.chargeFeeAsAddition && (
              <div className="mt-3 flex justify-between items-center">
                <p className="text-[#71717A] text-[13px] leading-5">service fee</p>
                <p className="text-[13px] leading-5">{formatCurrency(5, 'usd')}</p>
              </div>
            )}
            <div className="mt-3 flex justify-between items-center">
              <p className="text-[#71717A] text-[13px] font-semibold leading-5">total</p>
              <p className="text-[13px] leading-5">
                {formatCurrency(
                  ((tenant.agreement?.rent ?? 0) + (tenant.agreement?.securityDepositFee ?? 0)) /
                    100 +
                    (tenant.selectedUnit.property.other.chargeFeeAsAddition ? 5 : 0),
                  'usd'
                )}
              </p>
            </div>
            <Separator className="bg-[#E4E4E7] my-4 h-[0.8px]" />
            <p className="mt-6 text-[13px] font-semibold leading-5">Due on or before</p>
            <div className="mt-3 flex justify-between items-center">
              <p className="text-[#71717A] text-[13px] leading-5">
                {tenant.agreement?.leaseStartDate &&
                  format(new Date(tenant.agreement.leaseStartDate), 'dd/MM/yyyy')}
              </p>
            </div>
            <Separator className="bg-[#E4E4E7] my-4 h-[0.8px]" />
            <div className="flex justify-start items-center gap-[43px]">
              <div className="flex flex-col justify-start items-start gap-3">
                <p className="text-[13px] font-semibold leading-5">lease start date</p>
                <p className="text-[#71717A] text-[13px] leading-5">
                  {tenant.agreement?.leaseStartDate &&
                    format(new Date(tenant.agreement.leaseStartDate), 'dd/MM/yyyy')}
                </p>
              </div>
              <div className="flex flex-col justify-start items-start gap-3">
                <p className="text-[13px] font-semibold leading-5">lease end date</p>
                <p className="text-[#71717A] text-[13px] leading-5">
                  {tenant.agreement?.leaseEndDate &&
                    format(new Date(tenant.agreement.leaseEndDate), 'dd/MM/yyyy')}
                </p>
              </div>
            </div>
            <Separator className="bg-[#E4E4E7] my-4 h-[0.8px]" />
            <p className="text-[13px] font-semibold leading-5">your info.</p>
            <div className="mt-3 flex justify-between items-center">
              <p className="text-[#71717A] text-[13px] leading-5">name</p>
              <p className="text-[13px] leading-5">
                {capitalizeWords(tenant.info.firstName ?? '')}{' '}
                {capitalizeWords(tenant.info.lastName ?? '')}
              </p>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <p className="text-[#71717A] text-[13px] leading-5">email</p>
              <p className="text-[13px] leading-5">{tenant.info.email}</p>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <p className="text-[#71717A] text-[13px] leading-5">phone</p>
              <p className="text-[13px] leading-5">
                {validator.formatPhoneNumber(tenant.info.phone)}
              </p>
            </div>
            <Separator className="bg-[#E4E4E7] my-4 h-[0.8px]" />
            <FormField
              control={form.control}
              name="promoCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[14px] font-medium leading-5 mb-[6px]">
                    promo code
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="enter promo"
                      className="w-full rounded-sm border border-[#CBD5E1] text-[rgba(15,23,42,0.50)] text-[14px] leading-5 placeholder:text-[rgba(15,23,42,0.50)] placeholder:text-[14px] placeholder:leading-5 focus-visible:ring-0 focus-visible:border focus-visible:border-[#CBD5E1]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator className="bg-[#E4E4E7] my-4 h-[0.8px]" />
            <p className="text-[13px] font-semibold leading-5 mb-4">Payment Information</p>
            <Tabs
              defaultValue="card"
              value={activeTab}
              onValueChange={loading ? () => {} : handleTabChange}
              className="w-full">
              <div className="flex w-full ml-1 mb-4">
                <div className="relative w-3/4 h-[40px] p-[5px] rounded-lg shadow-md">
                  <TabsList className="flex w-full h-full relative z-10 shadow-none">
                    <TabsTrigger
                      value="card"
                      className="!p-0 bg-transparent data-[state=active]:bg-transparent">
                      Card
                    </TabsTrigger>
                    <TabsTrigger
                      value="ach"
                      className="!p-0 bg-transparent data-[state=active]:bg-transparent">
                      ACH Transfer
                    </TabsTrigger>
                  </TabsList>
                  <SlideToggle activeTab={activeTab} />
                </div>
              </div>
              <TabsContent value="card" className="-mx-1 px-1 overflow-hidden">
                <SlidingTabContent
                  direction={getDirection('card')}
                  animate={!isFirstRender.current}>
                  <DefaultCard
                    forceToWallet={false}
                    feeMsg="There is a 2.9% + 30¢ processing fee"
                  />
                </SlidingTabContent>
              </TabsContent>
              <TabsContent value="ach" className="-mx-1 px-1 overflow-hidden">
                <SlidingTabContent direction={getDirection('ach')} animate={!isFirstRender.current}>
                  <h1 className="text-[12px] font-medium leading-5 mb-4">ACH Direct Debit</h1>
                  <FormField
                    control={form.control}
                    name="accountHolderName"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel className="text-[14px] font-medium leading-5 mb-[6px]">
                          account holder name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            error={isError('accountHolderName')}
                            disabled={!!bankAccount}
                            placeholder="enter name"
                            className="w-full rounded-sm border border-[#CBD5E1] text-[rgba(15,23,42,0.50)] text-[14px] leading-5 placeholder:text-[rgba(15,23,42,0.50)] placeholder:text-[14px] placeholder:leading-5 focus-visible:ring-0 focus-visible:border focus-visible:border-[#CBD5E1]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="routingNo"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel className="text-[14px] font-medium leading-5 mb-[6px]">
                          routing number
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            error={isError('routingNo')}
                            disabled={!!bankAccount}
                            type="number"
                            min={0}
                            placeholder="enter routing no"
                            className="w-full rounded-sm border border-[#CBD5E1] text-[rgba(15,23,42,0.50)] text-[14px] leading-5 placeholder:text-[rgba(15,23,42,0.50)] placeholder:text-[14px] placeholder:leading-5 focus-visible:ring-0 focus-visible:border focus-visible:border-[#CBD5E1]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accountNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[14px] font-medium leading-5 mb-[6px]">
                          account number
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            error={isError('accountNo')}
                            disabled={!!bankAccount}
                            type={bankAccount ? 'text' : 'number'}
                            min={0}
                            placeholder="enter account no"
                            className="w-full rounded-sm border border-[#CBD5E1] text-[rgba(15,23,42,0.50)] text-[14px] leading-5 placeholder:text-[rgba(15,23,42,0.50)] placeholder:text-[14px] placeholder:leading-5 focus-visible:ring-0 focus-visible:border focus-visible:border-[#CBD5E1]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accountType"
                    render={({ field: { name, value, onChange } }) => (
                      <FormItem className="w-1/2 mt-4">
                        <FormLabel className="text-[14px] font-medium leading-5 mb-[6px]">
                          account holder type
                        </FormLabel>
                        <Select
                          name={name}
                          value={value}
                          disabled={!!bankAccount}
                          onValueChange={onChange}>
                          <FormControl>
                            <SelectTrigger
                              error={isError('accountType')}
                              className="w-full rounded-sm border text-[14px] leading-5 h-[37.6px] border-[#CBD5E1] text-[rgba(15,23,42,0.50)]"
                              icon={
                                <ChevronDownIcon className="text-primary opacity-50 h-4 w-4" />
                              }>
                              <SelectValue placeholder="select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem defaultChecked value="individual">
                              individual
                            </SelectItem>
                            <SelectItem value="company">company</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Separator orientation="horizontal" className="bg-[#E4E4E7] mt-4" />
                </SlidingTabContent>
              </TabsContent>
            </Tabs>
            {resError && (
              <p className="text-[10px] mt-2 -mb-2 font-medium text-destructive">{resError}</p>
            )}
            <Button
              type="submit"
              className="mt-4 px-5 leading-6 font-medium w-full h-9"
              isLoading={loading || confirmationLoading}>
              submit payment
            </Button>
            <p className="text-[8px] leading-[10px] mt-2 mb-4">
              **Note: To avoid 2.9% + 30¢ on card processing fee, we suggest you pay with ACH direct
              debit, wire transfer as ACH is only 0.8% at a cap of $5.
            </p>
          </ScrollArea>
        </div>
      </form>
    </Form>
  );
};

export default TenantPaymentForm;
