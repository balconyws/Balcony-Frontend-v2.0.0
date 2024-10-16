'use client';

import { useEffect, useState } from 'react';
import { isFuture, parse, format } from 'date-fns';
import InputMask from 'react-input-mask';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
  CardNumberElement,
  CardCvcElement,
  CardExpiryElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

import { CardDetail } from '@/types';
import { cardActions, cardSlice, useAppDispatch, useAppSelector, waitForDispatch } from '@/redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'name is required',
  }),
});

const initialCardState = {
  focus: false,
  error: false,
};

type Props = {
  card?: CardDetail;
  // eslint-disable-next-line no-unused-vars
  changeTab: (value: string) => void;
};

const AddCreditCardForm: React.FC<Props> = ({ card, changeTab }: Props) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(cardSlice.selectCard);
  const [expiry, setExpiry] = useState(
    card ? format(parse(card.expiry, 'yyyy-MM-dd', new Date()), 'MM / yy') : ''
  );
  const [isInvalidExpiry, setIsInvalidExpiry] = useState(false);
  const [resError, setResError] = useState<string>('');
  const [loadingToken, setLoadingToken] = useState<boolean>(false);

  const [cardElementsState, setCardElementsState] = useState<{
    cardNoEl: {
      focus: boolean;
      error: boolean;
    };
    expiryEl: {
      focus: boolean;
      error: boolean;
    };
    cvcEl: {
      focus: boolean;
      error: boolean;
    };
  }>({
    cardNoEl: { ...initialCardState },
    expiryEl: { ...initialCardState },
    cvcEl: { ...initialCardState },
  });

  const handleFocus = (element: 'cardNoEl' | 'expiryEl' | 'cvcEl') => {
    setCardElementsState(prevState => ({
      ...prevState,
      [element]: { ...prevState[element], focus: true },
    }));
  };

  const handleBlur = (element: 'cardNoEl' | 'expiryEl' | 'cvcEl') => {
    setCardElementsState(prevState => ({
      ...prevState,
      [element]: { ...prevState[element], focus: false },
    }));
  };

  const handleChange = (element: 'cardNoEl' | 'expiryEl' | 'cvcEl', isComplete: boolean) => {
    setCardElementsState(prevState => ({
      ...prevState,
      [element]: { focus: false, error: !isComplete },
    }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, '');
    if (input.length > 4) {
      input = input.slice(0, 4);
    }
    if (input.length >= 3) {
      input = `${input.slice(0, 2)} / ${input.slice(2, 4)}`;
    }
    setExpiry(input);
    if (input.length === 7) {
      validateExpiry(input);
    } else {
      setIsInvalidExpiry(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && expiry.endsWith(' / ')) {
      setExpiry(expiry.slice(0, -3));
    }
  };

  const validateExpiry = (expiryString: string) => {
    const [month, year] = expiryString.split(' / ');
    const expiryDate = parse(`20${year}-${month}-01`, 'yyyy-MM-dd', new Date());
    const isValid = isFuture(expiryDate);
    setIsInvalidExpiry(!isValid);
  };

  type formSchema = z.infer<typeof formSchema>;

  const stripe = useStripe();
  const elements = useElements();

  const form = useForm<formSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: card?.name ?? '',
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
      dispatch(cardSlice.clearError());
    }
  }, [dispatch, error, form]);

  const onSubmit: SubmitHandler<formSchema> = async (data: formSchema) => {
    setResError('');
    if (card) {
      const [month, year] = expiry.split('/').map(part => part.trim());
      await waitForDispatch(
        dispatch,
        cardActions.updateCard({
          id: card._id,
          name: data.name,
          month,
          year: `20${year}`,
        }),
        state => {
          const { isFailed } = state.card;
          if (!isFailed) {
            changeTab('cards');
          }
        }
      );
      return;
    }
    if (!stripe || !elements) {
      setResError('something went wrong');
      return;
    }
    setLoadingToken(true);
    const cardElement = elements.getElement(CardNumberElement);
    if (cardElement) {
      const res = await stripe.createToken(cardElement, {
        name: data.name,
      });
      if (res.token) {
        await waitForDispatch(dispatch, cardActions.addCard({ token: res.token.id }), state => {
          const { isFailed } = state.card;
          if (!isFailed) {
            changeTab('cards');
          }
        });
      } else {
        setResError('something went wrong');
      }
    }
    setLoadingToken(false);
  };

  return (
    <ScrollArea className="h-[38vh] md:h-[28vh] lg:h-[45vh] pb-2 xl:pb-0 xl:h-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-[290px] ml-[1px]">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>full name</FormLabel>
                <FormControl>
                  <Input {...field} error={isError('name')} placeholder="full name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-1">
            <FormLabel className={cardElementsState.cardNoEl.error ? '!text-destructive' : ''}>
              card number
            </FormLabel>
            {card ? (
              <Input value={`**** **** **** ${card.cardNo}`} readOnly={true} disabled={true} />
            ) : (
              <CardNumberElement
                className={`!h-9 !w-full rounded-sm bg-background border px-3 py-2 text-black text-sm leading-5 ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
                  cardElementsState.cardNoEl.focus
                    ? 'ring-1 ring-ring ring-offset-0 border-transparent outline-none'
                    : cardElementsState.cardNoEl.error
                      ? '!text-destructive !border-destructive placeholder:!text-destructive !ring-destructive'
                      : 'border-input'
                }`}
                onChange={e => handleChange('cardNoEl', e.complete)}
                onFocus={() => handleFocus('cardNoEl')}
                onBlur={() => handleBlur('cardNoEl')}
                options={{
                  classes: {
                    invalid:
                      '!text-destructive !border-destructive placeholder:!text-destructive !ring-destructive',
                  },
                }}
              />
            )}
          </div>
          <div className="flex gap-4 w-full">
            <div className="space-y-1 w-1/2">
              <FormLabel
                className={
                  cardElementsState.expiryEl.error || isInvalidExpiry ? '!text-destructive' : ''
                }>
                expires
              </FormLabel>
              {card ? (
                <InputMask
                  type="text"
                  mask="99 / 99"
                  placeholder="MM / YY"
                  value={expiry}
                  onChange={handleExpiryChange}
                  onKeyDown={handleKeyDown}
                  maskChar={null}
                  maxLength={7}
                  className={cn(
                    'flex justify-start items-center w-full rounded-sm border border-input bg-background px-3 py-2 text-black text-sm leading-5 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground placeholder:text-sm placeholder:leading-5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
                    isInvalidExpiry &&
                      '!text-destructive !border-destructive placeholder:!text-destructive !ring-destructive focus-visible:!ring-destructive'
                  )}
                />
              ) : (
                <CardExpiryElement
                  className={`!h-9 !w-full rounded-sm bg-background border px-3 py-2 text-black text-sm leading-5 ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
                    cardElementsState.expiryEl.focus
                      ? 'ring-1 ring-ring ring-offset-0 border-transparent outline-none'
                      : cardElementsState.expiryEl.error
                        ? '!text-destructive !border-destructive placeholder:!text-destructive !ring-destructive'
                        : 'border-input'
                  }`}
                  onChange={e => handleChange('expiryEl', e.complete)}
                  onFocus={() => handleFocus('expiryEl')}
                  onBlur={() => handleBlur('expiryEl')}
                  options={{
                    classes: {
                      invalid:
                        '!text-destructive !border-destructive placeholder:!text-destructive !ring-destructive',
                    },
                  }}
                />
              )}
            </div>
            <div className="space-y-1 w-1/2">
              <FormLabel className={cardElementsState.cvcEl.error ? '!text-destructive' : ''}>
                CVC
              </FormLabel>
              {card ? (
                <Input value="***" readOnly={true} disabled={true} />
              ) : (
                <CardCvcElement
                  className={`!h-9 !w-full rounded-sm bg-background border px-3 py-2 text-black text-sm leading-5 ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
                    cardElementsState.cvcEl.focus
                      ? 'ring-1 ring-ring ring-offset-0 border-transparent outline-none'
                      : cardElementsState.cvcEl.error
                        ? '!text-destructive !border-destructive placeholder:!text-destructive !ring-destructive'
                        : 'border-input'
                  }`}
                  onChange={e => handleChange('cvcEl', e.complete)}
                  onFocus={() => handleFocus('cvcEl')}
                  onBlur={() => handleBlur('cvcEl')}
                  options={{
                    classes: {
                      invalid:
                        '!text-destructive !border-destructive placeholder:!text-destructive !ring-destructive',
                    },
                  }}
                />
              )}
            </div>
          </div>
          {resError && <p className="text-[10px] font-medium text-destructive">{resError}</p>}
          <Button
            type="submit"
            className="rounded-sm py-[10px] !mt-[36px] h-[40px] leading-5 text-[#FAFAFA] text-[13px] font-medium w-full"
            isLoading={loading || loadingToken}>
            {card ? 'update card' : 'add to wallet'}
          </Button>
        </form>
      </Form>
    </ScrollArea>
  );
};

export default AddCreditCardForm;
