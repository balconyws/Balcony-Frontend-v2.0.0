'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { ChevronDownIcon } from 'lucide-react';

import { Navigation, Cta } from '@/contexts';
import { Booking } from '@/types';
import { capitalizeWords, formatCurrency, getNumberOfDays } from '@/helper';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  bookingActions,
  useAppDispatch,
  bookingSlice,
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

const formSchema = z.object({
  refundAmount: z
    .number({
      required_error: 'amount is required',
    })
    .min(1, { message: 'amount is required' }),
  type: z.string().min(1, { message: 'type is required' }),
});

type Props = {
  booking: Booking;
};

const BookingRefundForm: React.FC<Props> = ({ booking }: Props) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(bookingSlice.selectBooking);
  const { setOpen, pushToStack, popFromStack } = Navigation.useNavigation();
  const [resError, setResError] = useState<string>('');
  const [canceling, setCanceling] = useState<boolean>(false);
  const {
    setOpen: CtaOpenHandler,
    setTitle,
    setDescription,
    setSubmitBtnText,
    setSubmitBtnAction,
    setCloseBtnText,
  } = Cta.useCta();

  const days = getNumberOfDays(new Date(booking.startDate), new Date(booking.endDate));

  type formSchema = z.infer<typeof formSchema>;

  const form = useForm<formSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      refundAmount: 1,
      type: 'flat',
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
    await waitForDispatch(
      dispatch,
      bookingActions.refundBooking({
        bookingId: booking._id,
        amount: data.refundAmount,
        type: data.type === 'percentage' ? 'percentage' : 'flat',
      }),
      state => {
        const { isFailed } = state.booking;
        if (!isFailed) {
          setOpen(false);
          CtaOpenHandler(true);
          setTitle('your all set!');
          setDescription('The customer should receive an email regarding the partial refund.');
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

  const onCancelBooking = async () => {
    setResError('');
    setCanceling(true);
    await waitForDispatch(
      dispatch,
      bookingActions.cancelBookingByHost({
        bookingId: booking._id,
      }),
      state => {
        const { isFailed } = state.booking;
        if (!isFailed) {
          setOpen(false);
          CtaOpenHandler(true);
          setTitle('');
          setDescription('The customer should receive an email with the cancellation & refund.');
          setSubmitBtnText('visit booking details page');
          setSubmitBtnAction(() => () => {
            popFromStack();
            pushToStack('all booking');
            CtaOpenHandler(false);
          });
          setCloseBtnText('done');
        }
        setCanceling(false);
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mt-6 w-full md:w-[383px] h-fit pt-[1px] pl-[1px] rounded-lg border border-[#E4E4E7] box-shadow-primary">
          <div className="rounded-t-lg form--header-bg p-6">
            <h1 className="text-[17px] font-semibold leading-7 tracking-[-1px]">
              Order {booking._id.slice(-10)}
            </h1>
            <p className="text-[13px] text-[#71717A] leading-5">
              Date: {format(new Date(booking.createdAt), 'MMMM dd, yyyy')}
            </p>
          </div>
          <ScrollArea className="px-6 h-[58vh] lg:h-[66vh]">
            <p className="mt-6 text-[13px] font-semibold leading-5">Order Details</p>
            <div className="mt-3 flex justify-between items-center">
              <p className="text-[#71717A] text-[13px] leading-5">
                {booking.workspace.info.name} x {days} day{days !== 1 ? 's' : ''}
              </p>
              <p className="text-[13px] leading-5">$250.00</p>
            </div>
            <Separator className="bg-[#E4E4E7] mt-12 h-[0.8px] mb-5" />
            <div className="mt-3 flex justify-between items-center">
              <p className="text-[#71717A] text-[13px] leading-5">subtotal</p>
              <p className="text-[13px] leading-5">{formatCurrency(booking.subtotal / 100)}</p>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <p className="text-[#71717A] text-[13px] leading-5">fees</p>
              <p className="text-[13px] leading-5">
                {formatCurrency(5, booking.workspace.pricing.currency)}
              </p>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <p className="text-[#71717A] text-[13px] leading-5">discount</p>
              <p className="text-[13px] leading-5">
                {formatCurrency(-(booking.discount / 100), booking.workspace.pricing.currency)}
              </p>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <p className="text-[#71717A] text-[13px] font-semibold leading-5">total</p>
              <p className="text-[13px] leading-5">
                {formatCurrency(
                  booking.subtotal / 100 + 5 - booking.discount / 100,
                  booking.workspace.pricing.currency
                )}
              </p>
            </div>
            <Separator className="bg-[#E4E4E7] my-4 h-[0.8px]" />
            <p className="text-[13px] font-semibold leading-5">Customer Information</p>
            <div className="mt-3 flex justify-between items-center">
              <p className="text-[#71717A] text-[13px] leading-5">Customer</p>
              <p className="text-[13px] leading-5">
                {capitalizeWords(booking.user.firstName)} {capitalizeWords(booking.user.lastName)}
              </p>
            </div>
            <Separator className="bg-[#E4E4E7] my-4 h-[0.8px]" />
            <p className="text-[13px] font-semibold leading-5">partial refund</p>
            <div className="mt-3 flex justify-between items-start gap-4">
              <FormField
                control={form.control}
                name="refundAmount"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem className="w-1/2 flex flex-col gap-[6px]">
                    <FormLabel className="text-[#71717A] text-[14px] font-medium leading-5">
                      refund amount
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...rest}
                        key={form.getValues('type')}
                        onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
                          let discountValue = form.getValues('refundAmount');
                          if (form.getValues('type') === 'flat') {
                            const rawValue = value.replace(/[^0-9.]/g, '');
                            discountValue = rawValue ? parseFloat(rawValue) : 0;
                          } else if (form.getValues('type') === 'percentage') {
                            const rawValue = value.replace(/[^\d]/g, '');
                            discountValue = Math.min(Number(rawValue), 100);
                          }
                          onChange(discountValue);
                        }}
                        placeholder={
                          form.getValues('type') === 'flat'
                            ? 'enter flat price'
                            : 'enter percentage'
                        }
                        value={form.getValues('type') === 'flat' ? `$${value}` : `${value}%`}
                        onFocus={e => e.target.select()}
                        error={isError('refundAmount')}
                        type="text"
                        className="w-full rounded-sm border border-[#CBD5E1] text-[rgba(15,23,42,0.50)] text-[14px] leading-5 placeholder:text-[rgba(15,23,42,0.50)] placeholder:text-[14px] placeholder:leading-5 focus-visible:ring-0 focus-visible:border focus-visible:border-[#CBD5E1]"
                      />
                    </FormControl>
                    <FormMessage className="!-mt-1" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field: { name, value, onChange, disabled } }) => (
                  <FormItem className="w-1/2 flex flex-col gap-[6px]">
                    <FormLabel className="text-[#71717A] text-[14px] font-medium leading-5">
                      percentage / flat
                    </FormLabel>
                    <Select name={name} value={value} disabled={disabled} onValueChange={onChange}>
                      <FormControl>
                        <SelectTrigger
                          error={isError('type')}
                          className="w-full rounded-sm border text-[14px] leading-5 h-[37.6px] border-[#CBD5E1] text-[rgba(15,23,42,0.50)]"
                          icon={<ChevronDownIcon className="text-primary opacity-50 h-4 w-4" />}>
                          <SelectValue placeholder="flat" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem defaultChecked value="flat">
                          flat
                        </SelectItem>
                        <SelectItem value="percentage">percentage</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="!-mt-1" />
                  </FormItem>
                )}
              />
            </div>
            {resError && (
              <p className="text-[10px] mt-2 -mb-2 font-medium text-destructive">{resError}</p>
            )}
            <Button
              type="submit"
              className="mt-4 w-[180px] h-9 leading-6 font-medium"
              isLoading={loading}
              disabled={canceling}>
              submit partial refund
            </Button>
            <Separator className="bg-[#E4E4E7] my-4 h-[0.8px]" />
            <p className="text-[13px] font-semibold leading-5">cancel order</p>
            <p className="mt-[5px] text-[8px] font-semibold leading-[10px]">
              You can cancel the booking for a full refund. However, if a booking is past the
              booking date, then the customer would receive 90% of the refund which would be partial
              per our cancellation policy.
            </p>
            <Button
              type="button"
              variant="outline"
              className={`mt-4 mb-6 w-[160px] h-[38px] leading-6 font-medium ${
                (canceling || loading) && 'hover:bg-secondary hover:text-secondary-foreground'
              }`}
              strokeColor="#005451"
              isLoading={canceling}
              disabled={loading}
              onClick={onCancelBooking}>
              cancel booking
            </Button>
          </ScrollArea>
        </div>
      </form>
    </Form>
  );
};

export default BookingRefundForm;
