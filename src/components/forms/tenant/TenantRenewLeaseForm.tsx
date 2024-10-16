'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon, DownloadIcon, EyeIcon, EyeOffIcon } from 'lucide-react';

import { Navigation, Cta } from '@/contexts';
import { Tenant } from '@/types';
import { capitalizeWords, getLeaseAgreementPdf, validator } from '@/helper';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/datepicker';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  tenantActions,
  chatActions,
  useAppDispatch,
  tenantSlice,
  chatSlice,
  useAppSelector,
  waitForDispatch,
} from '@/redux';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  depositFee: z.string().optional(),
  rentAmount: z.string(),
  leaseStartDate: z.date({
    required_error: 'reequired',
  }),
  leaseEndDate: z.date({
    required_error: 'reequired',
  }),
});

const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

type Props = {
  tenant: Tenant;
};

const TenantRenewLeaseForm: React.FC<Props> = ({ tenant }: Props) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(tenantSlice.selectTenant);
  const { loading: chatLoading } = useAppSelector(chatSlice.selectChat);
  const { setOpen, pushToStack } = Navigation.useNavigation();
  const {
    setOpen: CtaOpenHandler,
    setTitle,
    setDescription,
    setSubmitBtnText,
    setSubmitBtnAction,
    setCloseBtnText,
    setLoading,
  } = Cta.useCta();

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [resError, setResError] = useState<string>('');

  const toggleVisibility = () => setIsVisible(prev => !prev);
  const maskNumber = (num: string): string => `* * * - * * - * * ${num.slice(-2)}`;

  type formSchema = z.infer<typeof formSchema>;

  const form = useForm<formSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      depositFee: String((tenant.agreement?.securityDepositFee ?? 0) / 100),
      rentAmount: String((tenant.agreement?.rent ?? 0) / 100),
      leaseStartDate: today,
      leaseEndDate: tomorrow,
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
    }
  }, [dispatch, error, form]);

  const onSubmit: SubmitHandler<formSchema> = async (data: formSchema) => {
    setResError('');
    await waitForDispatch(
      dispatch,
      tenantActions.tenantRenew({
        tenantId: tenant._id,
        leaseStartDate: data.leaseStartDate.toDateString(),
        leaseEndDate: data.leaseEndDate.toDateString(),
        rent: Number(data.rentAmount),
      }),
      state => {
        const { isFailed } = state.tenant;
        if (!isFailed) {
          setOpen(false);
          CtaOpenHandler(true);
          setTitle('All set!!');
          setDescription(
            'Please inform the tenant that their lease has been successfully renewed/extended. They should receive a notification as well.'
          );
          setSubmitBtnText(null);
          setCloseBtnText('done');
        }
      }
    );
  };

  const processRefund = () => {
    setOpen(false);
    CtaOpenHandler(true);
    setTitle('Are you sure?');
    setDescription('Are you sure you want to give a refund of their security deposit.');
    setSubmitBtnText('process refund');
    setSubmitBtnAction(() => () => {
      setLoading(true);
      dispatch(tenantActions.tenantRefund({ tenantId: tenant._id })).then(() => {
        setLoading(false);
        CtaOpenHandler(false);
        setTimeout(() => {
          CtaOpenHandler(true);
          setTitle('All done!');
          setDescription(
            'The tenant is expected to receive a refund in about 3 - 5 business days depending on their bank. Would you like to also toggle this tenant as inactive so this unit shows available on the marketplace. \n\n Please Note: Deactivated users are removed from your dashboard automatically in 3 months after the lease date ends as they are no longer a tenant of that unit.'
          );
          setSubmitBtnText('Yes, deactivate tenant');
          setSubmitBtnAction(() => () => {
            setLoading(true);
            dispatch(tenantActions.updateStatus({ tenantId: tenant._id, status: 'inactive' })).then(
              () => {
                setLoading(false);
                CtaOpenHandler(false);
              }
            );
          });
          setCloseBtnText('no, keep active');
        }, 100);
      });
    });
    setCloseBtnText('cancel');
  };

  const openFile = (url?: string) => {
    const newTab = window.open(url, '_blank');
    if (newTab) {
      newTab.focus();
    }
  };

  const downloadLeaseAgreement = async () => {
    const url = await getLeaseAgreementPdf(tenant);
    if (url) {
      openFile(url);
    }
  };

  return (
    <div className="xl:-mt-6 w-full lg:w-[90%] h-fit">
      <ScrollArea className="mt-6 w-full h-[74vh] md:h-[90vh] lg:h-[84vh] xl:h-[90vh] overflow-hidden">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full lg:w-[90%] h-full flex flex-col">
            <Button
              type="button"
              variant="secondary"
              className="!w-fit !pl-0 flex justify-start items-center gap-5"
              onClick={downloadLeaseAgreement}>
              <DownloadIcon className="text-primary w-4 lg:w-6 h-4 lg:h-6" />
              <h1 className="text-[16px] font-medium leading-[24px]">
                download lease agreement in PDF
              </h1>
            </Button>
            <Separator className="mt-2 mb-6" />
            <div className="rounded-lg border border-[rgba(0,84,81,0.40)] px-[22px] py-[24px] box-shadow-primary">
              <h3 className="text-[24px] font-medium leading-6 mb-6">info*</h3>
              <div className="w-full flex flex-col gap-4">
                <div className="space-y-1">
                  <p className="text-[14px] font-medium leading-5">first name</p>
                  <p className="ml-3 mt-4 text-sm leading-5">
                    {capitalizeWords(tenant.info.firstName)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[14px] font-medium leading-5">last name</p>
                  <p className="ml-3 mt-4 text-sm leading-5">
                    {capitalizeWords(tenant.info.lastName)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[14px] font-medium leading-5">phone number</p>
                  <p className="ml-3 mt-4 text-sm leading-5">
                    {validator.formatPhoneNumber(tenant.info.phone)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[14px] font-medium leading-5">email address</p>
                  <p className="ml-3 mt-4 text-sm leading-5">{tenant.info.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[14px] font-medium leading-5">building</p>
                  <p className="ml-3 mt-4 text-[14px] font-medium leading-5">
                    {tenant.selectedUnit.property.info.address}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[14px] font-medium leading-5">apt. of interest</p>
                  <p className="ml-3 mt-4 text-[14px] font-medium leading-5">
                    {tenant.selectedUnit.unit}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[14px] font-medium leading-5">anticipated move-in request</p>
                  <div className="ml-3 mt-4 flex justify-start items-center gap-[5px]">
                    <CalendarIcon className="text-primary h-4 w-4" />
                    <p className="text-[14px] font-medium leading-5">
                      {format(tenant.info.moveInRequest, 'MM/dd/yy')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {tenant.info?.socialSecurityNo && (
              <div className="mt-8 rounded-lg border border-[rgba(0,84,81,0.40)] px-[22px] py-[24px] box-shadow-primary">
                <h3 className="text-[24px] font-medium leading-6 mb-6">credit check</h3>
                <div className="space-y-1">
                  <p className="text-[14px] font-medium leading-5">social security number</p>
                  <div className="relative w-full h-full flex items-center">
                    <div className="flex justify-start items-center w-full rounded-sm border border-input bg-background px-3 py-2 text-sm leading-5">
                      {isVisible ? (
                        tenant.info.socialSecurityNo
                      ) : (
                        <span className="tracking-[-1.3px]">
                          {maskNumber(tenant.info.socialSecurityNo)}
                        </span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      className="absolute right-[15px] !m-0 !p-0"
                      onClick={toggleVisibility}>
                      {isVisible ? (
                        <EyeIcon className="w-5 h-5 text-primary" />
                      ) : (
                        <EyeOffIcon className="w-5 h-5 text-primary" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <div className="mt-[30px] p-6 rounded-lg border border-[#E4E4E7] box-shadow-primary">
              <h3 className="text-[24px] font-medium leading-6 mb-6">
                prospect tenant agreed to the following:
              </h3>
              <div className="w-fit flex flex-row-reverse justify-start items-center gap-3">
                <span>
                  <p className="!text-primary text-[13px] leading-[14px]">
                    I agree to balcony{' '}
                    <u>
                      <Link href="/terms" target="_blank">
                        terms of service
                      </Link>
                    </u>{' '}
                    and{' '}
                    <u>
                      <Link href="/policy" target="_blank">
                        privacy policy
                      </Link>
                    </u>
                    .
                  </p>
                </span>
                <span>
                  <Checkbox checked={true} className="cursor-default" />
                </span>
              </div>
              {tenant.selectedUnit.property.other.leasingPolicyDoc && (
                <div className="w-fit mt-[22px] flex flex-row-reverse justify-start items-center gap-3">
                  <span>
                    <p className="!text-primary text-[13px] font-normal leading-[14px]">
                      <u
                        className="cursor-pointer"
                        onClick={() =>
                          openFile(tenant.selectedUnit.property.other.leasingPolicyDoc)
                        }>
                        leasing agreement & policy
                      </u>
                    </p>
                  </span>
                  <span>
                    <Checkbox checked={true} className="cursor-default" />
                  </span>
                </div>
              )}
            </div>
            <div className="mt-[30px] p-6 rounded-lg border border-[#E4E4E7] box-shadow-primary">
              <h3 className="text-[24px] font-medium leading-6 mb-4">
                additional notes by applicant
              </h3>
              <p className="!text-primary text-[13px] font-normal leading-5">
                {tenant.info.note || <i>This section was left blank by the prospect applicant.</i>}
              </p>
            </div>
            <div className="mt-8 rounded-lg border border-[rgba(0,84,81,0.40)] px-[22px] py-[24px] box-shadow-primary">
              <h3 className="text-[24px] font-medium leading-6">security deposit already paid</h3>
              <i className="!text-primary text-[13px] font-normal leading-3 mt-2">
                This is just an acknowledgement. Tenant does not repay another deposit fee.
              </i>
              <FormField
                control={form.control}
                name="depositFee"
                render={({ field }) => (
                  <FormItem className="w-1/2 mt-6">
                    <FormLabel>deposit fee amount paid</FormLabel>
                    <FormControl>
                      <Input {...field} error={isError('depositFee')} placeholder="$####.##" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Separator className="mt-8 mb-6" />
            <div className="rounded-lg border border-[rgba(0,84,81,0.40)] px-[22px] py-[24px] box-shadow-primary">
              <h3 className="text-[24px] font-medium leading-6 mb-6">
                What’s the new lease duration?*
              </h3>
              <div className="w-full flex justify-start items-start gap-4">
                <FormField
                  control={form.control}
                  name="leaseStartDate"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
                      <FormLabel>lease start date</FormLabel>
                      <FormControl>
                        <DatePicker
                          {...field}
                          error={isError('leaseStartDate')}
                          minDate={today}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="relative h-auto">
                  <Separator
                    orientation="vertical"
                    className="h-[1px] w-3 absolute top-[45px] -left-[6px]"
                  />
                </div>
                <FormField
                  control={form.control}
                  name="leaseEndDate"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
                      <FormLabel>lease end date</FormLabel>
                      <FormControl>
                        <DatePicker
                          {...field}
                          error={isError('leaseEndDate')}
                          minDate={
                            form.getValues('leaseStartDate')
                              ? new Date(
                                  new Date(form.getValues('leaseStartDate') as Date).setDate(
                                    new Date(form.getValues('leaseStartDate') as Date).getDate() + 1
                                  )
                                )
                              : today
                          }
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="mt-7 w-full h-full pt-[1px] pl-[1px] rounded-lg border border-[#E4E4E7] box-shadow-primary">
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
              <div className="px-6 pb-6">
                <p className="mt-6 text-[13px] font-semibold leading-5">leasing details</p>
                <div className="mt-3 flex justify-between items-start">
                  <p className="text-[#71717A] text-[13px] leading-5">rent amount</p>
                  <div className="flex flex-col items-end justify-start">
                    <FormField
                      control={form.control}
                      name="rentAmount"
                      render={({ field }) => (
                        <FormItem className="space-y-0 w-1/2">
                          <FormControl>
                            <Input
                              {...field}
                              error={isError('rentAmount')}
                              readOnly={!isEditable}
                              onBlur={() => setIsEditable(false)}
                              type="number"
                              min={1}
                              placeholder="enter rent"
                              className="text-primary text-[13px] leading-5 border-none focus-visible:ring-0 p-0 text-right"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    {!isEditable && (
                      <Button
                        type="button"
                        variant="underline"
                        onClick={() => {
                          setIsEditable(true);
                          form.setFocus('rentAmount');
                        }}
                        className="text-[10px] !leading-[10px] mt-1">
                        edit
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {resError && (
              <p className="text-[10px] mt-6 -mb-6 font-medium text-destructive">{resError}</p>
            )}
            <div className="mt-12">
              <Button type="submit" className="leading-6 w-full h-9" isLoading={loading}>
                renew lease
              </Button>
              <p className="mt-2 mb-6 text-[8px] leading-[10px]">
                **Note: If you want to to increase the lease duration or perhaps change the rent
                price, etc. You can <br /> do it here.
              </p>
            </div>
            <div className="mt-5">
              <Button
                type="button"
                variant="outline"
                onClick={processRefund}
                className="leading-6 w-full"
                disabled={loading}>
                refund tenant first month security
              </Button>
              <p className="mt-2 mb-6 text-[8px] leading-[10px]">
                **Note: This would take you to the first month security refund modal
              </p>
            </div>
            <p className="text-[13px] mt-6 leading-[14px]">-- or --</p>
            <div className="mt-6 w-[252px]">
              <p className="leading-[14px] font-medium text-[14px]">
                Would you like to talk with the <br /> tenant?
              </p>
            </div>
            <div className="w-[252px] mt-1">
              <p className="leading-5 text-sm">chat &/or call with the tenant via the following:</p>
              <Separator className="my-4" />
            </div>
            <div className="flex gap-4 w-fit">
              <Button
                variant="secondary"
                size="sm"
                className={`p-0 rounded-none w-[29px] h-[21px] leading-5 font-normal ${
                  !chatLoading && 'border-b border-b-primary'
                }`}
                isLoading={chatLoading}
                strokeColor="#005451"
                onClick={async () => {
                  await waitForDispatch(
                    dispatch,
                    chatActions.startConversation({ userId: tenant.userId }),
                    state => {
                      const { conversations } = state.chat;
                      if (conversations) {
                        pushToStack('chats', { chat: conversations[0] });
                      }
                    }
                  );
                }}>
                chat
              </Button>
              <Separator orientation="vertical" className="h-auto" />
              <Link href={`tel:${tenant.info.phone}`}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="border-b border-b-primary p-0 rounded-none leading-5 font-normal">
                  call
                </Button>
              </Link>
            </div>
          </form>
        </Form>
      </ScrollArea>
    </div>
  );
};

export default TenantRenewLeaseForm;
