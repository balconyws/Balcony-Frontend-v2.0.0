'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

import { authActions, authSlice, useAppDispatch, useAppSelector } from '@/redux';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
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
  password: z.string().min(8, {
    message: 'min 8 characters required',
  }),
});

type Props = object;

const UpdatePasswordForm: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const { loading, error, resetDialog } = useAppSelector(authSlice.selectAuth);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [resError, setResError] = useState<string>('');

  const toggleVisibility = () => setIsVisible(prev => !prev);

  type formSchema = z.infer<typeof formSchema>;

  const form = useForm<formSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
    },
  });

  useEffect(() => {
    setResError('');
    form.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    await dispatch(authActions.updatePassword(data));
  };

  return (
    <Dialog open={resetDialog}>
      <DialogContent className="w-[342px] md:w-[425px] rounded-md border border-[#CBD5E1]">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-semibold leading-7">
            update your password
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 py-4 w-full">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">password</FormLabel>
                    <FormControl>
                      <div className="relative col-span-3 w-full flex items-center">
                        <Input
                          {...field}
                          onChange={e => {
                            field.onChange(e);
                            setResError('');
                          }}
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
                    dispatch(authSlice.setResetDialog({ show: false }));
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

export default UpdatePasswordForm;
