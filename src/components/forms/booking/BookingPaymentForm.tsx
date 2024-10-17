'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';

import { Navigation, Cta } from '@/contexts';
import { Workspace } from '@/types';
import { DefaultCard } from '@/components/common';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  bookingActions,
  useAppDispatch,
  authSlice,
  bookingSlice,
  useAppSelector,
  waitForDispatch,
} from '@/redux';
import {
  getNumberOfDays,
  formatCurrency,
  getStartAndEndTime,
  formatDateRange,
  capitalizeWords,
  validator,
} from '@/helper';
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
  })
  .refine(values => !values.promoCode || values.promoCode.length >= 1, {
    message: 'Invalid code',
    path: ['promoCode'],
  });

type Props = {
  workspace: Workspace;
  selectedDates: { from: Date; to: Date };
};

const BookingPaymentForm: React.FC<Props> = ({ workspace, selectedDates }: Props) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(authSlice.selectAuth);
  const { loading, error } = useAppSelector(bookingSlice.selectBooking);
  const { setOpen, pushToStack, popFromStack } = Navigation.useNavigation();
  const [resError, setResError] = useState<string>('');
  const {
    setOpen: CtaOpenHandler,
    setTitle,
    setDescription,
    setSubmitBtnText,
    setSubmitBtnAction,
    setCloseBtnText,
  } = Cta.useCta();

  const days = getNumberOfDays(selectedDates.from, selectedDates.to);

  type formSchema = z.infer<typeof formSchema>;

  const form = useForm<formSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      promoCode: '',
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
      dispatch(bookingSlice.clearError());
    }
  }, [dispatch, error, form]);

  const onSubmit: SubmitHandler<formSchema> = async (data: formSchema) => {
    const startDate = selectedDates.from.toISOString();
    const endDate = selectedDates.to.toISOString();
    await waitForDispatch(
      dispatch,
      bookingActions.createBooking({
        workspaceId: workspace._id,
        startDate,
        endDate,
        promoCode: data.promoCode,
      }),
      state => {
        const { isFailed } = state.booking;
        if (!isFailed) {
          setOpen(false);
          CtaOpenHandler(true);
          setTitle('your all set!');
          setDescription(
            'You should receive an email with the booking details. You can also visit the booking detail page as well.'
          );
          setSubmitBtnText('visit booking details page');
          setSubmitBtnAction(() => () => {
            popFromStack();
            pushToStack('all booking');
            CtaOpenHandler(false);
          });
          setCloseBtnText('done');
        }
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mt-6 w-full md:w-[383px] h-fit pt-[1px] pl-[1px] rounded-lg border border-[#E4E4E7] box-shadow-primary">
          <div className="rounded-t-lg form--header-bg p-6">
            <h1 className="text-[17px] font-semibold leading-7 tracking-[-1px]">
              {workspace.info.name}
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
            <p className="mt-6 text-[13px] font-semibold leading-5">Order Details</p>
            <div className="mt-3 flex justify-between items-center">
              <p className="text-[#71717A] text-[13px] leading-5">
                {workspace.info.name} x {days} day{days !== 1 ? 's' : ''}
              </p>
              <p className="text-[13px] leading-5">
                {formatCurrency(workspace.pricing.totalPerDay * days, workspace.pricing.currency)}
              </p>
            </div>
            <Separator className="bg-[#E4E4E7] mt-12 h-[0.8px] mb-5" />
            <div className="mt-3 flex justify-between items-center">
              <p className="text-[#71717A] text-[13px] leading-5">subtotal</p>
              <p className="text-[13px] leading-5">
                {formatCurrency(workspace.pricing.totalPerDay * days, workspace.pricing.currency)}
              </p>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <p className="text-[#71717A] text-[13px] leading-5">fees</p>
              <p className="text-[13px] leading-5">
                {formatCurrency(5, workspace.pricing.currency)}
              </p>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <p className="text-[#71717A] text-[13px] font-semibold leading-5">total</p>
              <p className="text-[13px] leading-5">
                {formatCurrency(
                  workspace.pricing.totalPerDay * days + 5,
                  workspace.pricing.currency
                )}
              </p>
            </div>
            <Separator className="bg-[#E4E4E7] my-4 h-[0.8px]" />
            <div className="flex justify-start items-center gap-[43px]">
              <div className="flex flex-col justify-start items-start gap-3">
                <p className="text-[13px] font-semibold leading-5">time frame of service</p>
                <p className="text-[#71717A] text-[13px] leading-5">
                  {getStartAndEndTime(selectedDates, workspace.times, 'EST')}
                </p>
              </div>
              <div className="flex flex-col justify-start items-start gap-3">
                <p className="text-[13px] font-semibold leading-5">service days</p>
                <p className="text-[#71717A] text-[13px] leading-5">
                  {formatDateRange(selectedDates.from, selectedDates.to)}
                </p>
              </div>
            </div>
            <Separator className="bg-[#E4E4E7] my-4 h-[0.8px]" />
            <p className="text-[13px] font-semibold leading-5">your info.</p>
            <div className="mt-3 flex justify-between items-center">
              <p className="text-[#71717A] text-[13px] leading-5">name</p>
              <p className="text-[13px] leading-5">
                {capitalizeWords(user?.firstName ?? '')} {capitalizeWords(user?.lastName ?? '')}
              </p>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <p className="text-[#71717A] text-[13px] leading-5">email</p>
              <p className="text-[13px] leading-5">{user?.email}</p>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <p className="text-[#71717A] text-[13px] leading-5">phone</p>
              <p className="text-[13px] leading-5">
                {validator.formatPhoneNumber(user?.phone ?? '')}
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
                      error={isError('promoCode')}
                      placeholder="enter promo"
                      className="w-full rounded-sm border border-[#CBD5E1] text-[rgba(15,23,42,0.50)] text-[14px] leading-5 placeholder:text-[rgba(15,23,42,0.50)] placeholder:text-[14px] placeholder:leading-5 focus-visible:ring-0 focus-visible:border focus-visible:border-[#CBD5E1]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator className="bg-[#E4E4E7] my-4 h-[0.8px]" />
            <p className="text-[13px] font-semibold leading-5 mb-[14px]">Payment Information</p>
            <DefaultCard forceToWallet={false} />
            {resError && <p className="text-[10px] font-medium text-destructive">{resError}</p>}
            <Button
              type="submit"
              className="mt-4 mb-6 w-[151px] h-9 leading-6 font-medium"
              isLoading={loading}>
              book workspace
            </Button>
          </ScrollArea>
        </div>
      </form>
    </Form>
  );
};

export default BookingPaymentForm;
