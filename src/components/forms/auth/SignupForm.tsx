'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { RecaptchaVerifier } from 'firebase/auth';

import { firebase } from '@/config';
import { validator } from '@/helper';
import { authActions, authSlice, useAppDispatch, useAppSelector } from '@/redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

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
  password: z.string().min(8, {
    message: 'min 8 characters required',
  }),
  phone: z.string().refine(phone => validator.isPhoneValid(phone), {
    message: 'invalid number',
  }),
});

type Props = object;

const SignupForm: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const { loading, error, otpDialog, resetDialog } = useAppSelector(authSlice.selectAuth);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [resError, setResError] = useState<string>('');

  const toggleVisibility = () => setIsVisible(prev => !prev);

  type formSchema = z.infer<typeof formSchema>;

  const form = useForm<formSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      password: '',
      email: '',
      phone: '',
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

  useEffect(() => {
    window.recaptchaVerifier = new RecaptchaVerifier(firebase.auth, 'recaptcha-container', {
      size: 'invisible',
    });
  }, []);

  const onSubmit: SubmitHandler<formSchema> = async (data: formSchema) => {
    setResError('');
    await dispatch(authActions.signupUser(data));
  };

  return (
    <>
      <div id="recaptcha-container" />
      <ScrollArea className="w-full h-[58vh] md:h-[90vh] lg:h-[75vh] xl:h-full mt-3 rounded-sm border border-[#E2E8F0]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="p-[25px] flex flex-col gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>first name</FormLabel>
                    <FormControl>
                      <Input {...field} error={isError('firstName')} placeholder="first name" />
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
                      <Input {...field} error={isError('lastName')} placeholder="last name" />
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
                          placeholder="password"
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
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>phone number</FormLabel>
                    <FormControl>
                      <PhoneInput
                        {...field}
                        inputClassName={`flex justify-start items-center w-full !rounded-sm border focus-visible:ring-1 !outline-none bg-background !px-3 !py-2 text-sm ring-offset-background placeholder:text-muted-foreground placeholder:text-sm placeholder:leading-5 focus-visible:outline-none active:outline-none focus:outline-none focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
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
              {resError && <p className="text-[10px] font-medium text-destructive">{resError}</p>}
              <Button type="submit" className="w-[86px] h-10 leading-6" isLoading={loading}>
                register
              </Button>
            </div>
          </form>
        </Form>
      </ScrollArea>
    </>
  );
};

export default SignupForm;
