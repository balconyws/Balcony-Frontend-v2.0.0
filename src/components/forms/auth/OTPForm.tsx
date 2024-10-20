'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';

import { authActions, authSlice, useAppDispatch, useAppSelector } from '@/redux';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  passCode: z
    .string()
    .min(6, { message: 'passcode required' })
    .max(6, { message: 'invalid passcode' }),
});

type Props = object;

const OTPForm: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const {
    loading,
    error,
    otpDialog: { show, expiryTime, isResetRequest },
  } = useAppSelector(authSlice.selectAuth);
  const [resError, setResError] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  type formSchema = z.infer<typeof formSchema>;

  const form = useForm<formSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passCode: '',
    },
  });

  useEffect(() => {
    setResError('');
    form.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

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
      dispatch(authSlice.clearError());
    }
  }, [dispatch, error, form]);

  useEffect(() => {
    if (expiryTime) {
      const intervalId = setInterval(() => {
        const now = new Date();
        const timeLeft = Math.max(0, Math.ceil((expiryTime - now.getTime()) / 1000));
        setTimeLeft(timeLeft);
        setCanResend(timeLeft === 0);
        if (timeLeft <= 0) {
          clearInterval(intervalId);
        }
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [expiryTime]);

  const onSubmit: SubmitHandler<formSchema> = async (data: formSchema) => {
    setResError('');
    if (isResetRequest) {
      await dispatch(authActions.verifyUser({ ...data, isReset: 'true' }));
    } else {
      await dispatch(authActions.verifyUser({ ...data, isReset: 'false' }));
    }
  };

  const handleResendOtp = async () => {
    form.reset();
    setResError('');
    setIsSending(true);
    await dispatch(authActions.resendOtp());
    setIsSending(false);
  };

  return (
    <Dialog open={show}>
      <DialogContent className="w-[342px] md:w-[425px] rounded-md border border-[#CBD5E1]">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-semibold leading-7">
            registration one-time passcode
          </DialogTitle>
          <DialogDescription className="text-[#64748B] text-[14px] leading-5">
            {canResend ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                isLoading={isSending}
                onClick={handleResendOtp}
                className="!text-[12px] !px-2 !py-0 w-[80px] h-[22px]">
                resend otp
              </Button>
            ) : (
              `resend in:: ${timeLeft} seconds`
            )}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 py-4 w-full">
              <FormField
                control={form.control}
                name="passCode"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">passcode</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={e => {
                          field.onChange(e);
                          setResError('');
                        }}
                        error={isError('passCode')}
                        type="password"
                        placeholder="enter passcode"
                        className="col-span-3"
                      />
                    </FormControl>
                    <FormMessage className="w-full text-center col-span-4 !-mt-4" />
                    {resError && (
                      <p className="text-[10px] font-medium text-destructive w-full text-center col-span-4">
                        {resError}
                      </p>
                    )}
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="leading-6 border-[#E2E8F0]"
                  onClick={() => {
                    setResError('');
                    form.reset();
                    dispatch(authSlice.setOtpDialog({ show: false, expiryTime: undefined }));
                  }}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className="leading-6 w-[94px] h-[42px]" isLoading={loading}>
                Continue
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default OTPForm;
