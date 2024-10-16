'use client';

import { z } from 'zod';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { ChevronDownIcon } from 'lucide-react';

import { Navigation, Cta } from '@/contexts';
import { PaymentType, Tenant } from '@/types';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  autoActions,
  useAppDispatch,
  tenantSlice,
  cardSlice,
  autoSlice,
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
  paymentType: z.string().min(1, { message: 'required' }),
  policy: z.boolean().refine(val => val === true, {
    message: 'must agree to continue.',
  }),
  terms: z.boolean().refine(val => val === true, {
    message: 'must agree to continue.',
  }),
});

type Props = {
  tenant: Tenant;
};

const AutoPayRentForm: React.FC<Props> = ({ tenant }: Props) => {
  const dispatch = useAppDispatch();
  const { bankAccount } = useAppSelector(tenantSlice.selectTenant);
  const { cards } = useAppSelector(cardSlice.selectCard);
  const { loading, error, status } = useAppSelector(autoSlice.selectAuto);
  const { setOpen, pushToStack, popFromStack } = Navigation.useNavigation();
  const {
    setOpen: CtaOpenHandler,
    setTitle,
    setDescription,
    setSubmitBtnText,
    setSubmitBtnAction,
    setCloseBtnText,
  } = Cta.useCta();
  const [options, setOptions] = useState<{ value: PaymentType; label: string }[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [resError, setResError] = useState<string>('');

  useEffect(() => {
    dispatch(autoActions.checkStatus());
  }, [dispatch]);

  useEffect(() => {
    const fetchedOptions: { value: PaymentType; label: string }[] = [];
    if (cards && cards.length !== 0) {
      fetchedOptions.push({ value: 'card', label: 'Card' });
    }
    if (bankAccount) {
      fetchedOptions.push({ value: 'ach', label: 'Bank Account' });
    }
    setOptions(fetchedOptions);
  }, [bankAccount, cards]);

  type formSchema = z.infer<typeof formSchema>;

  const form = useForm<formSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentType: '',
      policy: false,
      terms: false,
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
      dispatch(autoSlice.clearError());
    }
  }, [dispatch, error, form]);

  const onSubmit: SubmitHandler<formSchema> = async (data: formSchema) => {
    setResError('');
    if (status?.autoRentPay) return;
    await waitForDispatch(
      dispatch,
      autoActions.toggleAutoRentPay({
        tenantId: tenant._id,
        type: data.paymentType as PaymentType,
      }),
      state => {
        const { isFailed } = state.auto;
        if (!isFailed) {
          setOpen(false);
          CtaOpenHandler(true);
          setTitle('your all set!');
          setDescription('You are going to automatically get charged in the first of the month.');
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
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="-mt-2">
        <FormField
          control={form.control}
          name="paymentType"
          render={({ field: { name, value, onChange } }) => (
            <FormItem className="w-1/2 mt-4">
              <FormLabel className="text-[14px] font-medium leading-5 mb-[6px]">
                payment type
              </FormLabel>
              <Select
                name={name}
                value={value}
                disabled={!bankAccount && !cards}
                onValueChange={val => {
                  setSelectedType(val);
                  onChange(val);
                }}>
                <FormControl>
                  <SelectTrigger
                    error={isError('paymentType')}
                    className="w-full rounded-sm border text-[14px] leading-5 h-[37.6px] border-[#CBD5E1] text-[rgba(15,23,42,0.50)]"
                    icon={<ChevronDownIcon className="text-primary opacity-50 h-4 w-4" />}>
                    <SelectValue placeholder="select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {options.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {selectedType === 'card' && (
          <div className="flex justify-start items-end gap-4">
            <p className="mt-6 text-[8px] leading-[8px]">There is a 2.9% + 30¢ processing fee</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="p-0 rounded-none text-[10px] font-normal leading-5 border-b border-b-primary"
              onClick={() => pushToStack('wallet')}>
              update from wallet
            </Button>
          </div>
        )}
        <Separator className="bg-[#E4E4E7] my-4 h-[0.8px]" />
        <FormField
          control={form.control}
          name="policy"
          render={({ field }) => (
            <FormItem className="flex flex-row-reverse gap-3">
              <FormLabel>
                <p className="!text-primary text-[13px] font-normal leading-[14px]">
                  I agree to balcony <u>terms of service</u> and <u>privacy policy</u>.
                  <FormMessage className="mt-1" />
                </p>
              </FormLabel>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  error={isError('policy')}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem className="mt-[22px] flex flex-row-reverse gap-3">
              <FormLabel>
                <p className="!text-primary text-[13px] font-normal leading-[14px]">
                  I agree to the service fee charge which is usually a real small amount per{' '}
                  <u>terms of service</u> of our payment gateway
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
        {resError && (
          <p className="text-[10px] mt-5 -mb-5 font-medium text-destructive">{resError}</p>
        )}
        <Button
          type="submit"
          className="mt-10 px-5 leading-6 h-9 font-medium w-full"
          isLoading={loading}
          disabled={status?.autoRentPay}>
          complete autopay setup
        </Button>
      </form>
    </Form>
  );
};

export default AutoPayRentForm;
