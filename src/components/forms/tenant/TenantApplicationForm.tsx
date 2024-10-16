'use client';

import Link from 'next/link';
import { ChangeEvent, useEffect, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { ChevronDownIcon, EyeIcon, EyeOffIcon } from 'lucide-react';

import { Navigation, Cta } from '@/contexts';
import { validator } from '@/helper';
import {
  tenantActions,
  useAppDispatch,
  tenantSlice,
  authSlice,
  useAppSelector,
  waitForDispatch,
} from '@/redux';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { DatePicker } from '@/components/ui/datepicker';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Textarea } from '@/components/ui/textarea';
import { Property } from '@/types';

const formSchema = z.object({
  firstName: z
    .string()
    .min(1, {
      message: 'first name is required',
    })
    .refine(name => validator.isNameValid(name), {
      message: 'invalid name',
    }),
  lastName: z
    .string()
    .min(1, {
      message: 'last name is required',
    })
    .refine(name => validator.isNameValid(name), {
      message: 'invalid name',
    }),
  email: z.string().refine(email => validator.isEmailValid(email), {
    message: 'invalid email',
  }),
  phone: z.string().refine(phone => validator.isPhoneValid(phone), {
    message: 'invalid number',
  }),
  selectedUnitId: z.string().min(1, {
    message: 'interest is required',
  }),
  moveInRequest: z.date({
    required_error: 'move-in request is required',
  }),
  note: z
    .string()
    .optional()
    .refine(ssn => ssn === '' || (ssn && validator.isValidSocialSecurityNo(ssn)), {
      message: 'invalid security number',
    }),
  socialSecurityNo: z.string().optional(),
  terms: z.boolean().refine(val => val === true, {
    message: 'must agree to continue.',
  }),
  agreement: z.boolean().optional(),
});

type formSchema = z.infer<typeof formSchema>;

const today = new Date();
today.setHours(0, 0, 0, 0);

type Props = {
  property: Property;
  formData?: formSchema;
  tenantId?: string;
};

const TenantApplicationForm: React.FC<Props> = ({ property, formData, tenantId }: Props) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(tenantSlice.selectTenant);
  const { user } = useAppSelector(authSlice.selectAuth);
  const { setOpen, pushToStack, popFromStack } = Navigation.useNavigation();
  const {
    setOpen: CtaOpenHandler,
    setTitle,
    setDescription,
    setSubmitBtnText,
    setSubmitBtnAction,
    setCloseBtnText,
  } = Cta.useCta();

  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [resError, setResError] = useState<string>('');

  const toggleVisibility = () => setIsVisible(prev => !prev);
  const maskNumber = (num: string | undefined): string => `***-**-**${num?.slice(-4)}`;

  const form = useForm<formSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: formData
      ? formData
      : {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          selectedUnitId: '',
          moveInRequest: today,
          note: '',
          socialSecurityNo: '',
          terms: false,
          agreement: false,
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
    if (property.other.leasingPolicyDoc && !data.agreement) {
      form.setError('agreement', { message: 'must agree to continue.' });
      return;
    }
    if (tenantId) {
      await waitForDispatch(
        dispatch,
        tenantActions.updateTenant({
          tenantId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          selectedUnitId: data.selectedUnitId,
          moveInRequest: data.moveInRequest.toISOString(),
          socialSecurityNo: data.socialSecurityNo,
          note: data.note,
        }),
        state => {
          const { isFailed } = state.tenant;
          if (!isFailed) {
            popFromStack();
          }
        }
      );
    } else {
      await waitForDispatch(
        dispatch,
        tenantActions.applyForTenancy({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          selectedUnitId: data.selectedUnitId,
          moveInRequest: data.moveInRequest.toISOString(),
          socialSecurityNo: data.socialSecurityNo,
          note: data.note,
        }),
        state => {
          const { isFailed } = state.tenant;
          if (!isFailed) {
            setOpen(false);
            CtaOpenHandler(true);
            setTitle('your all set!');
            setDescription(
              'thank you for submitting your application. The host is expected to review your application for the next steps.'
            );
            setSubmitBtnText('visit rental manager page');
            setSubmitBtnAction(() => () => {
              popFromStack();
              pushToStack('rental manager');
              CtaOpenHandler(false);
            });
            setCloseBtnText('done');
          }
        }
      );
    }
  };

  const openFile = (url?: string) => {
    const newTab = window.open(url, '_blank');
    if (newTab) {
      newTab.focus();
    }
  };

  return (
    <div className="xl:-mt-6 w-full h-fit">
      <h1 className="text-[28px] font-medium leading-normal mb-6 xl:mb-14">
        hello {user?.firstName} we need a few information about you.
      </h1>
      <ScrollArea className="w-full h-[60vh] md:h-[85vh] lg:h-[76vh] xl:h-[80vh] overflow-hidden">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-[330px] lg:w-[395px] ml-[1px] h-full flex flex-col">
            <div className="rounded-lg border border-[rgba(0,84,81,0.40)] px-[22px] py-[24px] box-shadow-primary">
              <h3 className="text-[24px] font-medium leading-6 mb-6">info*</h3>
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem autoFocus={false}>
                      <FormLabel>first name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          error={isError('firstName')}
                          autoFocus={false}
                          placeholder="first name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>last name</FormLabel>
                      <FormControl>
                        <Input error={isError('lastName')} {...field} placeholder="last name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>phone number</FormLabel>
                      <FormControl>
                        <PhoneInput
                          {...field}
                          inputClassName={`flex justify-start items-center w-full focus-visible:ring-1 !rounded-sm border !outline-none bg-background !px-3 !py-2 text-sm ring-offset-background placeholder:text-muted-foreground placeholder:text-sm placeholder:leading-5 focus-visible:outline-none active:outline-none focus:outline-none focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
                            isError('phone')
                              ? '!text-destructive !border-destructive placeholder:!text-destructive !ring-destructive focus-visible:!ring-destructive'
                              : 'border-input placeholder:text-muted-foreground focus-visible:ring-ring'
                          }`}
                          onChange={value => {
                            form.setValue('phone', value);
                            form.clearErrors('phone');
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>email address</FormLabel>
                      <FormControl>
                        <Input {...field} error={isError('email')} placeholder="email address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <p className="text-[14px] font-medium leading-5">building</p>
                  <p className="ml-3 mt-4 text-[14px] font-medium leading-5">
                    {property.info.address}
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="selectedUnitId"
                  render={({ field: { name, value, onChange, disabled } }) => (
                    <FormItem className="w-1/2">
                      <FormLabel>apt. of interest</FormLabel>
                      <Select
                        name={name}
                        value={value}
                        onValueChange={onChange}
                        disabled={
                          disabled ||
                          property.unitList.filter(i => i.status === 'not leased').length === 0
                        }>
                        <FormControl>
                          <SelectTrigger
                            error={isError('selectedUnitId')}
                            className="w-full rounded-sm border text-[14px] leading-5 h-[37.6px] border-[#CBD5E1] text-[rgba(15,23,42,0.50)]"
                            icon={<ChevronDownIcon className="text-primary opacity-50 h-4 w-4" />}>
                            <SelectValue placeholder="select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {property.unitList
                            .filter(i => i.status === 'not leased')
                            .map((u, i: number) => (
                              <SelectItem key={i} value={u._id}>
                                {u.unit}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="moveInRequest"
                  render={({ field }) => (
                    <FormItem className="w-3/5">
                      <FormLabel>anticipated move-in request</FormLabel>
                      <FormControl>
                        <DatePicker
                          {...field}
                          error={isError('moveInRequest')}
                          defaultMonth={today}
                          minDate={today}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="mt-8 rounded-lg border border-border px-[22px] py-[24px] box-shadow-primary">
              <h3 className="text-[24px] font-medium leading-6 mb-6">
                additional notes for host’s review if applicable
              </h3>
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        error={isError('note')}
                        placeholder="Type your message here."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-8 rounded-lg border border-[rgba(0,84,81,0.40)] px-[22px] py-[24px] box-shadow-primary">
              <h3 className="text-[24px] font-medium leading-6 mb-6">credit check</h3>
              <FormField
                control={form.control}
                name="socialSecurityNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>social security number</FormLabel>
                    <FormControl>
                      <div className="relative w-full h-full flex items-center">
                        <Input
                          {...field}
                          value={isVisible ? field.value : maskNumber(field.value)}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const formattedValue = validator.formatSSN(e.target.value);
                            field.onChange(formattedValue);
                          }}
                          error={isError('socialSecurityNo')}
                          placeholder="security no."
                          readOnly={!isVisible}
                          onBlur={toggleVisibility}
                          className={
                            isVisible
                              ? 'focus-visible:ring-1'
                              : 'focus-visible:ring-0 focus-visible:border-border'
                          }
                        />
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Separator className="mt-8 mb-6" />
            <div className="p-6 rounded-lg border border-[#E4E4E7] box-shadow-primary">
              <h3 className="text-[24px] font-medium leading-6 mb-6">terms of service*</h3>
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="w-fit flex flex-row-reverse justify-start items-center gap-3">
                    <FormLabel>
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
                        <FormMessage className="mt-1" />
                      </p>
                    </FormLabel>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        error={isError('terms')}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {property.other.leasingPolicyDoc && (
                <FormField
                  control={form.control}
                  name="agreement"
                  render={({ field }) => (
                    <FormItem className="w-fit mt-[22px] flex flex-row-reverse justify-start items-center gap-3">
                      <FormLabel>
                        <p className="!text-primary text-[13px] font-normal leading-[14px]">
                          <u
                            className="cursor-pointer"
                            onClick={() => openFile(property.other.leasingPolicyDoc)}>
                            leasing agreement & policy
                          </u>
                          <FormMessage className="mt-1" />
                        </p>
                      </FormLabel>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          error={isError('terms')}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>
            {resError && (
              <p className="text-[10px] mt-4 -mb-4 font-medium text-destructive">{resError}</p>
            )}
            <Button type="submit" className="mt-8 w-4/5 lg:w-3/4 leading-6 h-9" isLoading={loading}>
              {tenantId ? 'update application' : 'submit application'}
            </Button>
            <p className="mt-[6px] mb-6 text-[8px] leading-[10px] w-4/5 lg:w-3/4">
              **Note: If application is approved by property manager, then you will be prompted to
              next step(s) which is usually leasing agreement & first month rent & security.
            </p>
          </form>
        </Form>
      </ScrollArea>
    </div>
  );
};

export default TenantApplicationForm;
