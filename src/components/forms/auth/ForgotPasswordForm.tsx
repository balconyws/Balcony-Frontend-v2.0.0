'use client';

import { z } from 'zod';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';

import { validator } from '@/helper';
import { authActions, authSlice, useAppDispatch, useAppSelector } from '@/redux';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
    emailOrPhone: z.string().min(1, { message: 'email or phone is required' }),
  })
  .refine(
    data => validator.isEmailValid(data.emailOrPhone) || validator.isPhoneValid(data.emailOrPhone),
    {
      path: ['emailOrPhone'],
      message: 'invalid email or phone number',
    }
  );

type Props = object;

const ForgotPasswordForm: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const { loading, error, otpDialog, resetDialog } = useAppSelector(authSlice.selectAuth);
  const [resError, setResError] = useState<string>('');

  type formSchema = z.infer<typeof formSchema>;

  const form = useForm<formSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailOrPhone: '',
    },
  });

  const isError = (inputName: keyof formSchema): boolean => {
    const fieldState = form.getFieldState(inputName);
    return !!fieldState.error;
  };

  useEffect(() => {
    if (error && !otpDialog.show && !resetDialog) {
      if (error.key === '') {
        setResError(error.message);
      } else {
        form.setError(error.key as keyof formSchema, { message: error.message });
      }
      dispatch(authSlice.clearError());
    }
  }, [dispatch, error, form, otpDialog.show, resetDialog]);

  const onSubmit: SubmitHandler<formSchema> = async (data: formSchema) => {
    setResError('');
    await dispatch(authActions.forgotPassword(data));
  };

  return (
    <div className="mt-3">
      <div className="w-full p-[25px] rounded-sm border border-[#E2E8F0]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="emailOrPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>email or phone number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      error={isError('emailOrPhone')}
                      placeholder="enter your email or phone number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {resError && <p className="text-[10px] font-medium text-destructive">{resError}</p>}
            <Button type="submit" className="w-[137px] h-9 leading-6" isLoading={loading}>
              reset password
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
