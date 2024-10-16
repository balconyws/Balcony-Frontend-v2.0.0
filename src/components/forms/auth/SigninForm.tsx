'use client';

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { EyeIcon, EyeOffIcon, FacebookIcon } from 'lucide-react';

import { AuthServerActions } from '@/server';
import { validator } from '@/helper';
import { authActions, authSlice, useAppDispatch, useAppSelector } from '@/redux';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
    password: z.string().min(8, {
      message: 'min 8 characters required',
    }),
  })
  .refine(
    data => validator.isEmailValid(data.emailOrPhone) || validator.isPhoneValid(data.emailOrPhone),
    {
      path: ['emailOrPhone'],
      message: 'invalid email or phone number',
    }
  );

type Props = object;

const SigninForm: React.FC<Props> = () => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { loading, error, otpDialog, resetDialog } = useAppSelector(authSlice.selectAuth);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [resError, setResError] = useState<string>('');
  const [socialLoading, setSocialLoading] = useState<{
    fbLoading: boolean;
    gLoading: boolean;
  }>({
    fbLoading: false,
    gLoading: false,
  });

  const toggleVisibility = () => setIsVisible(prev => !prev);

  type formSchema = z.infer<typeof formSchema>;

  const form = useForm<formSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailOrPhone: '',
      password: '',
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
    setIsVisible(false);
    setResError('');
    await dispatch(authActions.signinUser(data));
  };

  const socialLoginFB = async () => {
    setSocialLoading({ fbLoading: true, gLoading: false });
    await AuthServerActions.SigninWithFacebook(pathname);
  };

  const socialLoginG = async () => {
    setSocialLoading({ fbLoading: false, gLoading: true });
    await AuthServerActions.SigninWithGoogle(pathname);
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>password</FormLabel>
                  <FormControl>
                    <div className="relative w-full h-full flex items-center">
                      <Input
                        {...field}
                        error={isError('password')}
                        type={isVisible ? 'text' : 'password'}
                        placeholder="enter your password"
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
            {resError && <p className="text-[10px] font-medium text-destructive">{resError}</p>}
            <Button
              type="submit"
              className="w-[66px] h-10 leading-6"
              isLoading={loading}
              disabled={loading || socialLoading.fbLoading || socialLoading.gLoading}>
              login
            </Button>
          </form>
        </Form>
      </div>
      <div className="flex justify-center items-center">
        <div className="w-[90%]">
          <div className="my-10 w-full flex justify-center items-center gap-[10px]">
            <Separator className="w-[29%]" />
            <p className="text-[12px] leading-4">OR CONTINUE WITH</p>
            <Separator className="w-[29%]" />
          </div>
          <div className="w-full flex justify-center items-center gap-6">
            <Button
              type="button"
              onClick={socialLoginFB}
              isLoading={socialLoading.fbLoading}
              disabled={loading || socialLoading.fbLoading || socialLoading.gLoading}
              strokeColor="gray"
              className="w-1/2 h-[38px] px-4 py-2 flex justify-center items-center gap-2 border border-border text-primary bg-transparent box-shadow-primary">
              <FacebookIcon className="text-primary w-4 h-4" />
              <p className="text-sm font-medium">facebook</p>
            </Button>
            <Button
              type="button"
              onClick={socialLoginG}
              isLoading={socialLoading.gLoading}
              disabled={loading || socialLoading.fbLoading || socialLoading.gLoading}
              strokeColor="gray"
              className="w-1/2 h-[38px] px-4 py-2 flex justify-center items-center gap-2 border border-border text-primary bg-transparent box-shadow-primary">
              <Image
                src="/assets/icons/google.svg"
                alt="google"
                width={16}
                height={16}
                loading="eager"
                priority
                className="w-4 h-4"
              />
              <p className="text-sm font-medium">Google</p>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SigninForm;
