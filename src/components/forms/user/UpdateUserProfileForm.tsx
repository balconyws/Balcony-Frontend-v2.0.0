'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { UserIcon } from 'lucide-react';

import { validator } from '@/helper';
import { authActions, authSlice, useAppDispatch, useAppSelector } from '@/redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  image: z.union([
    z
      .any()
      .refine(files => files?.length >= 1, { message: 'image is required' })
      .refine(files => ['image/jpeg', 'image/jpg', 'image/png'].includes(files?.[0]?.type), {
        message: '.jpg, .jpeg, and .png files are accepted',
      })
      .refine(files => files?.[0]?.size <= 5 * 1024 * 1024, {
        message: 'max file size is 5MB',
      }),
    z.string().refine(url => validator.isValidImage(url), {
      message: 'invalid image',
    }),
  ]),
  firstName: z.string().min(1, {
    message: 'first name is required',
  }),
  lastName: z.string().min(1, {
    message: 'last name is required',
  }),
  email: z.string().refine(email => validator.isEmailValid(email), {
    message: 'Invalid email',
  }),
  phone: z.string().refine(phone => validator.isPhoneValid(phone), {
    message: 'Invalid number',
  }),
});

type Props = object;

const UpdateUserProfileForm: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector(authSlice.selectAuth);
  const [preview, setPreview] = useState<string | null>(user?.image || null);
  const [resError, setResError] = useState<string>('');
  const [isEditable, setIsEditable] = useState<{
    firstName: boolean;
    lastName: boolean;
    email: boolean;
    phone: boolean;
  }>({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
  });

  type formSchema = z.infer<typeof formSchema>;

  const form = useForm<formSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: user?.image ?? '',
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    },
  });

  const makeEditable = (field: keyof typeof isEditable) => {
    setIsEditable(prev => ({ ...prev, [field]: true }));
    form.setFocus(field);
  };

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

  const onSubmit: SubmitHandler<formSchema> = async (data: formSchema) => {
    setResError('');
    const formData = new FormData();
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('image', typeof data.image === 'string' ? data.image : data.image[0]);
    await dispatch(authActions.updateUser(formData));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      form.setValue('image', event.target.files);
      form.clearErrors('image');
    }
  };

  return (
    <div className="mt-6 w-[342px] h-fit">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex justify-start items-center gap-2">
            {preview ? (
              <Avatar className="w-[50px] h-[50px] rounded-full">
                <AvatarImage src={preview} />
                <AvatarFallback>
                  <Skeleton className="w-full h-full" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <div
                className={`w-[50px] h-[50px] border rounded-full flex justify-center items-center gap-2 ${
                  isError('image') ? 'border-destructive' : 'border-primary'
                }`}>
                <UserIcon
                  className={`h-[34px] w-[34px] ${isError('image') ? 'text-destructive' : 'text-primary'}`}
                />
              </div>
            )}
            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 flex justify-center items-center text-sm leading-5 font-normal !p-0 !rounded-none border-b border-b-primary">
                    add profile image
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="mt-6 rounded-sm border border-[#E2E8F0] p-[25px] flex flex-col gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>first name</FormLabel>
                  <FormControl>
                    <div className="mt-[6px] flex justify-start items-center gap-3">
                      <Input
                        {...field}
                        error={isError('firstName')}
                        placeholder="first name"
                        readOnly={!isEditable.firstName}
                        className={
                          isEditable.firstName
                            ? 'focus-visible:ring-1'
                            : 'focus-visible:ring-0 focus-visible:border-border'
                        }
                      />
                      <Button
                        variant="underline"
                        type="button"
                        onClick={() => makeEditable('firstName')}>
                        edit
                      </Button>
                    </div>
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
                    <div className="mt-[6px] flex justify-start items-center gap-3">
                      <Input
                        {...field}
                        error={isError('lastName')}
                        placeholder="last name"
                        readOnly={!isEditable.lastName}
                        className={
                          isEditable.lastName
                            ? 'focus-visible:ring-1'
                            : 'focus-visible:ring-0 focus-visible:border-border'
                        }
                      />
                      <Button
                        variant="underline"
                        type="button"
                        onClick={() => makeEditable('lastName')}>
                        edit
                      </Button>
                    </div>
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
                    <div className="mt-[6px] flex justify-start items-center gap-3">
                      <Input
                        {...field}
                        error={isError('email')}
                        placeholder="email address"
                        readOnly={!isEditable.email}
                        className={
                          isEditable.email
                            ? 'focus-visible:ring-1'
                            : 'focus-visible:ring-0 focus-visible:border-border'
                        }
                      />
                      <Button
                        variant="underline"
                        type="button"
                        onClick={() => makeEditable('email')}>
                        edit
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
                    <div className="mt-[6px] flex justify-start items-center gap-3">
                      <PhoneInput
                        {...field}
                        inputClassName={`flex justify-start items-center w-full !rounded-sm border !outline-none bg-background !px-3 !py-2 text-sm ring-offset-background placeholder:text-muted-foreground placeholder:text-sm placeholder:leading-5 focus-visible:outline-none active:outline-none focus:outline-none focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
                          isEditable.phone
                            ? 'focus-visible:ring-1'
                            : 'focus-visible:ring-0 focus-visible:border-border'
                        } ${
                          isError('phone')
                            ? '!text-destructive !border-destructive placeholder:!text-destructive !ring-destructive focus-visible:!ring-destructive focus-visible:ring-1'
                            : 'border-input placeholder:text-muted-foreground focus-visible:ring-ring'
                        }`}
                        inputProps={{
                          readOnly: !isEditable.phone,
                        }}
                        onChange={value => {
                          form.setValue('phone', value);
                        }}
                      />
                      <Button
                        variant="underline"
                        type="button"
                        onClick={() => makeEditable('phone')}>
                        edit
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {resError && <p className="text-[10px] font-medium text-destructive">{resError}</p>}
            <Button type="submit" className="mt-6 w-[127px] leading-6" isLoading={loading}>
              update profile
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UpdateUserProfileForm;
