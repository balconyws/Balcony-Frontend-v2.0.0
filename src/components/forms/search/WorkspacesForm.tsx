'use client';

import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/datepicker';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

const formSchema = z
  .object({
    place: z.string().min(2, {
      message: 'Place is required',
    }),
    checkIn: z.date().optional(),
    checkOut: z.date().optional(),
    people: z.string().optional(),
  })
  .refine(
    data => {
      if (data.checkIn && data.checkOut) {
        const checkInDate = new Date(data.checkIn);
        const checkOutDate = new Date(data.checkOut);
        const oneDayAfterCheckIn = new Date(checkInDate);
        oneDayAfterCheckIn.setDate(checkInDate.getDate() + 1);
        return checkOutDate >= oneDayAfterCheckIn;
      }
      return true;
    },
    {
      message: 'Check-out date must be at least one day after check-in date',
      path: ['checkOut'],
    }
  );

type Props = object;

const WorkspacesForm: React.FC<Props> = () => {
  const router = useRouter();

  type formSchema = z.infer<typeof formSchema>;

  const form = useForm<formSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      place: '',
      checkIn: today,
      checkOut: today,
      people: '',
    },
  });

  const isError = (inputName: keyof formSchema): boolean => {
    const fieldState = form.getFieldState(inputName);
    return !!fieldState.error;
  };

  const onSubmit: SubmitHandler<formSchema> = (data: formSchema) => {
    router.push(
      `/workspaces?place=${data.place}&checkin=${data.checkIn?.toISOString()}&checkout=${data.checkOut?.toISOString()}&people=${data.people}`
    );
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="place"
            render={({ field }) => (
              <FormItem>
                <FormLabel>place*</FormLabel>
                <FormControl>
                  <Input {...field} error={isError('place')} placeholder="city" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="checkIn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>check in</FormLabel>
                <FormControl>
                  <DatePicker
                    {...field}
                    error={isError('checkIn')}
                    defaultMonth={today}
                    minDate={today}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="checkOut"
            render={({ field }) => (
              <FormItem>
                <FormLabel>check out</FormLabel>
                <FormControl>
                  <DatePicker
                    {...field}
                    error={isError('checkOut')}
                    defaultMonth={today}
                    minDate={
                      form.getValues('checkIn')
                        ? new Date(
                            new Date(form.getValues('checkIn') as Date).setDate(
                              new Date(form.getValues('checkIn') as Date).getDate() + 1
                            )
                          )
                        : today
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="people"
            render={({ field }) => (
              <FormItem>
                <FormLabel>people</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    error={isError('people')}
                    type="number"
                    min={0}
                    placeholder="##"
                    className="w-1/2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="leading-6">
            search
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default WorkspacesForm;
