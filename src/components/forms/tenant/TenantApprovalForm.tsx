'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon, EyeIcon, EyeOffIcon } from 'lucide-react';

import { Navigation, Cta } from '@/contexts';
import { capitalizeWords, validator } from '@/helper';
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

const formSchema = z
  .object({
    securityDepositYes: z.boolean().optional(),
    securityDepositNo: z.boolean().optional(),
    depositFee: z.string().optional(),
    amountAsRent: z.boolean().optional(),
    leaseStartDate: z.date({
      required_error: 'reequired',
    }),
    leaseEndDate: z.date({
      required_error: 'reequired',
    }),
  })
  .refine(
    data =>
      data.securityDepositYes
        ? data.depositFee
          ? data.depositFee.trim().length > 0
          : false
        : true,
    {
      path: ['depositFee'],
      message: 'amount is required if security deposit is true',
    }
  )
  .refine(data => data.securityDepositYes || data.securityDepositNo || data.amountAsRent, {
    path: ['amountAsRent'],
    message: 'either security deposit or amount as rent is required',
  });

const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

type Props = {
  data: {
    tenantId: string;
    userId: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    selectedUnit: number;
    building: string;
    moveInRequest: Date;
    terms: boolean;
    agreement: boolean;
    leasingPolicyDoc?: string;
    socialSecurityNo?: string;
    note?: string;
    isViewOnly?: boolean;
  };
};

const TenantApprovalForm: React.FC<Props> = ({ data }: Props) => {
  const dispatch = useAppDispatch();
  const { error } = useAppSelector(tenantSlice.selectTenant);
  const { loading: chatLoading } = useAppSelector(chatSlice.selectChat);
  const { setOpen, pushToStack } = Navigation.useNavigation();
  const {
    setOpen: CtaOpenHandler,
    setTitle,
    setDescription,
    setSubmitBtnText,
    setSubmitBtnAction,
    setCloseBtnText,
  } = Cta.useCta();

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isAccepting, setIsAccepting] = useState<boolean>(false);
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [resError, setResError] = useState<string>('');

  const toggleVisibility = () => setIsVisible(prev => !prev);
  const maskNumber = (num: string): string => `* * * - * * - * * ${num.slice(-2)}`;

  type formSchema = z.infer<typeof formSchema>;

  const form = useForm<formSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      securityDepositYes: false,
      securityDepositNo: false,
      depositFee: '',
      amountAsRent: false,
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

  const onSubmit: SubmitHandler<formSchema> = async (formData: formSchema) => {
    setResError('');
    if (isRejecting || data.isViewOnly) return;
    setIsAccepting(true);
    await waitForDispatch(
      dispatch,
      tenantActions.approveTenant({
        tenantId: data.tenantId,
        leaseStartDate: formData.leaseStartDate.toISOString(),
        leaseEndDate: formData.leaseEndDate.toISOString(),
        securityDepositFee:
          formData.securityDepositYes && !formData.amountAsRent
            ? Number(formData.depositFee)
            : undefined,
        isSameAsRent: !formData.depositFee ? formData.amountAsRent : undefined,
      }),
      state => {
        const { isFailed } = state.tenant;
        if (!isFailed) {
          setOpen(false);
          CtaOpenHandler(true);
          setTitle('your all set!');
          setDescription(
            'Please inform the prospect tenant to fill out the rest of the application on their end which they can access on their interface which now they are ready to proceed to paying and completing the lease agreement.'
          );
          setSubmitBtnText(null);
          setSubmitBtnAction(() => () => {});
          setCloseBtnText('done');
        }
      }
    );
    setIsAccepting(false);
  };

  const onDisApproved = async () => {
    setResError('');
    if (isAccepting || data.isViewOnly) return;
    setIsRejecting(true);
    await waitForDispatch(
      dispatch,
      tenantActions.rejectTenant({
        tenantId: data.tenantId,
      }),
      state => {
        const { isFailed, error } = state.tenant;
        if (!isFailed) {
          setIsRejecting(false);
          setOpen(false);
          CtaOpenHandler(true);
          setTitle('your all set!');
          setDescription(
            'The application has successfully been disapproved. The prospect tenant should see a rejection notificaiton.'
          );
          setSubmitBtnText(null);
          setSubmitBtnAction(() => () => {});
          setCloseBtnText('done');
        } else {
          setResError(error?.message || 'something went wrong');
        }
      }
    );
    setIsRejecting(false);
  };

  const openFile = (url?: string) => {
    const newTab = window.open(url, '_blank');
    if (newTab) {
      newTab.focus();
    }
  };

  return (
    <div className="xl:-mt-6 w-full lg:w-[90%] h-fit">
      <ScrollArea className="mt-6 w-full h-[74vh] md:h-[90vh] lg:h-[84vh] xl:h-[90vh] overflow-hidden">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-[330px] lg:w-[90%] h-full flex flex-col">
            <div className="rounded-lg border border-[rgba(0,84,81,0.40)] px-[22px] py-[24px] box-shadow-primary">
              <h3 className="text-[24px] font-medium leading-6 mb-6">info*</h3>
              <div className="w-full flex flex-col gap-4">
                <div className="space-y-1">
                  <p className="text-[14px] font-medium leading-5">first name</p>
                  <p className="ml-3 mt-4 text-sm leading-5">{capitalizeWords(data.firstName)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[14px] font-medium leading-5">last name</p>
                  <p className="ml-3 mt-4 text-sm leading-5">{capitalizeWords(data.lastName)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[14px] font-medium leading-5">phone number</p>
                  <p className="ml-3 mt-4 text-sm leading-5">
                    {validator.formatPhoneNumber(data.phone)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[14px] font-medium leading-5">email address</p>
                  <p className="ml-3 mt-4 text-sm leading-5">{data.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[14px] font-medium leading-5">building</p>
                  <p className="ml-3 mt-4 text-[14px] font-medium leading-5">{data.building}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[14px] font-medium leading-5">apt. of interest</p>
                  <p className="ml-3 mt-4 text-[14px] font-medium leading-5">{data.selectedUnit}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[14px] font-medium leading-5">anticipated move-in request</p>
                  <div className="ml-3 mt-4 flex justify-start items-center gap-[5px]">
                    <CalendarIcon className="text-primary h-4 w-4" />
                    <p className="text-[14px] font-medium leading-5">
                      {format(data.moveInRequest, 'MM/dd/yy')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {data.socialSecurityNo && (
              <div className="mt-8 rounded-lg border border-[rgba(0,84,81,0.40)] px-[22px] py-[24px] box-shadow-primary">
                <h3 className="text-[24px] font-medium leading-6 mb-6">credit check</h3>
                <div className="space-y-1">
                  <p className="text-[14px] font-medium leading-5">social security number</p>
                  <div className="relative w-full h-full flex items-center">
                    <div className="flex justify-start items-center w-full rounded-sm border border-input bg-background px-3 py-2 text-sm leading-5">
                      {isVisible ? (
                        data.socialSecurityNo
                      ) : (
                        <span className="tracking-[-1.3px]">
                          {maskNumber(data.socialSecurityNo)}
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
                  <Checkbox checked={data.terms} className="cursor-default" />
                </span>
              </div>
              {data.leasingPolicyDoc && (
                <div className="w-fit mt-[22px] flex flex-row-reverse justify-start items-center gap-3">
                  <span>
                    <p className="!text-primary text-[13px] font-normal leading-[14px]">
                      <u className="cursor-pointer" onClick={() => openFile(data.leasingPolicyDoc)}>
                        leasing agreement & policy
                      </u>
                    </p>
                  </span>
                  <span>
                    <Checkbox checked={data.agreement} className="cursor-default" />
                  </span>
                </div>
              )}
            </div>
            <div className="mt-[30px] p-6 rounded-lg border border-[#E4E4E7] box-shadow-primary">
              <h3 className="text-[24px] font-medium leading-6 mb-4">
                additional notes by applicant
              </h3>
              <p className="!text-primary text-[13px] font-normal leading-5">
                {data.note || <i>This section was left blank by the prospect applicant.</i>}
              </p>
            </div>
            {!data.isViewOnly && (
              <>
                <Separator className="mt-8 mb-6" />
                <div className="mt-8 rounded-lg border border-[rgba(0,84,81,0.40)] px-[22px] py-[24px] box-shadow-primary">
                  <h3 className="text-[24px] font-medium leading-6 mb-6">
                    Do you charge security deposit?*
                  </h3>
                  <div className="flex flex-col gap-6">
                    <div className="flex justify-start items-center gap-[30px]">
                      <FormField
                        control={form.control}
                        name="securityDepositYes"
                        render={({ field }) => (
                          <FormItem className="w-fit flex flex-row-reverse justify-start items-center gap-3">
                            <FormLabel>
                              <p className="!text-primary text-[13px] font-normal leading-[14px] mt-[3px]">
                                yes
                                <FormMessage className="mt-1" />
                              </p>
                            </FormLabel>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={checked => {
                                  field.onChange(checked);
                                  form.clearErrors('amountAsRent');
                                  form.setValue('securityDepositNo', false);
                                  form.setValue('amountAsRent', false);
                                }}
                                error={isError('securityDepositYes')}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="securityDepositNo"
                        render={({ field }) => (
                          <FormItem className="w-fit flex flex-row-reverse justify-start items-center gap-3">
                            <FormLabel>
                              <p className="!text-primary text-[13px] font-normal leading-[14px] mt-[3px]">
                                no
                                <FormMessage className="mt-1" />
                              </p>
                            </FormLabel>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={checked => {
                                  field.onChange(checked);
                                  form.clearErrors('depositFee');
                                  form.clearErrors('amountAsRent');
                                  form.setValue('securityDepositYes', false);
                                  form.setValue('amountAsRent', false);
                                }}
                                error={isError('securityDepositNo')}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="depositFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>deposit fee amount</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              error={isError('depositFee')}
                              disabled={
                                form.getValues('amountAsRent') ||
                                form.getValues('securityDepositNo')
                              }
                              type="number"
                              min={1}
                              placeholder="1000."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <p className="text-[13px] leading-[14px]">-- or --</p>
                    <FormField
                      control={form.control}
                      name="amountAsRent"
                      render={({ field }) => (
                        <FormItem className="w-fit flex flex-row-reverse justify-start items-center gap-3">
                          <FormLabel>
                            <p className="!text-primary text-[13px] font-normal leading-[14px] mt-[3px]">
                              same amount as rent
                              <FormMessage className="mt-1" />
                            </p>
                          </FormLabel>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={checked => {
                                field.onChange(checked);
                                form.clearErrors('depositFee');
                                form.setValue('securityDepositYes', false);
                                form.setValue('securityDepositNo', false);
                                form.setValue('depositFee', '');
                              }}
                              error={isError('amountAsRent')}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="mt-8 rounded-lg border border-[rgba(0,84,81,0.40)] px-[22px] py-[24px] box-shadow-primary">
                  <h3 className="text-[24px] font-medium leading-6 mb-6">
                    What’s the lease duration?*
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
                              defaultMonth={today}
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
                              defaultMonth={today}
                              minDate={
                                form.getValues('leaseStartDate')
                                  ? new Date(
                                      new Date(form.getValues('leaseStartDate') as Date).setDate(
                                        new Date(
                                          form.getValues('leaseStartDate') as Date
                                        ).getDate() + 1
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
                {resError && (
                  <p className="text-[10px] mt-6 -mb-6 font-medium text-destructive">{resError}</p>
                )}
                <div className={`mt-12 flex justify-around items-start gap-[11px] flex-wrap`}>
                  <div className="w-full lg:w-[45%]">
                    <Button
                      type="button"
                      variant="outline"
                      className="leading-6 w-full h-10 !text-[12px]"
                      onClick={onDisApproved}
                      isLoading={isRejecting}
                      disabled={isAccepting || data.isViewOnly}>
                      disapprove application
                    </Button>
                    <p className="mt-2 mb-6 text-[8px] leading-[10px]">
                      **Note: Disapproving an application would disqualify this applicant from
                      renting this unit. The prospect would have to reapply if they are ever
                      interested in inquiring about the unit.
                    </p>
                  </div>
                  <div className="w-full lg:w-[45%]">
                    <Button
                      type="submit"
                      variant="default"
                      className="leading-6 w-full h-10 !text-[12px]"
                      isLoading={isAccepting}
                      disabled={isRejecting || data.isViewOnly}>
                      proceed to next phase
                    </Button>
                    <p className="mt-2 mb-6 text-[8px] leading-[10px]">
                      **Note: If application is approved by you, then the tenant would see an
                      approved for signing lease interface where they can now make the first month
                      rent & deposit.
                    </p>
                  </div>
                </div>
                <p className="text-[13px] mt-6 leading-[14px]">-- or --</p>
                <div className="mt-6 w-[252px]">
                  <p className="leading-[14px] font-medium text-[14px]">
                    Need application to edit the <br /> application before approval?
                    <br />
                    <br /> Please reach out to the applicant to <br /> edit:
                  </p>
                </div>
              </>
            )}
            <div className={`w-[252px] ${data.isViewOnly ? 'mt-4' : 'mt-1'}`}>
              <p className="leading-5 text-sm">
                chat &/or call with the user {!data.isViewOnly && 'before approval'}
              </p>
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
                    chatActions.startConversation({ userId: data.userId }),
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
              <Link href={`tel:${data.phone}`}>
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

export default TenantApprovalForm;
