'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';

import { GeocodingControl, GeocodingEvent } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/datepicker';
import { Label } from '@/components/ui/label';
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

const formSchema = z.object({
  checkIn: z.date().optional(),
  checkOut: z.date().optional(),
  people: z.string().optional(),
});

type Props = object;

const WorkspacesForm: React.FC<Props> = () => {
  const router = useRouter();
  const [place, setPlace] = useState<string>('');
  const [error, setError] = useState<string>('');

  const divRef = useRef<HTMLDivElement>(null);
  const geocodingControlRef = useRef<GeocodingControl | null>(null);

  type formSchema = z.infer<typeof formSchema>;

  const form = useForm<formSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
    setError('');
    if (!place) {
      setError('place is required');
      return;
    }
    router.push(
      `/workspaces?place=${place}&checkin=${data.checkIn?.toISOString()}&checkout=${data.checkOut?.toISOString()}&people=${data.people}`
    );
  };

  useEffect(() => {
    if (!geocodingControlRef.current) {
      geocodingControlRef.current = new GeocodingControl({
        target: divRef.current,
        apiKey: process.env.MAP_API_KEY,
      });
    }
    const handlePick = (e: GeocodingEvent) => {
      if (e.detail?.place_name) {
        setPlace(e.detail.place_name.toLowerCase());
      }
    };
    geocodingControlRef.current.addEventListener('pick', handlePick);
    return () => {
      if (geocodingControlRef.current) {
        geocodingControlRef.current.removeEventListener('pick', handlePick);
      }
      geocodingControlRef.current = null;
    };
  }, []);

  return (
    <div>
      <Label className={`${error && '!text-destructive'}`}>place</Label>
      <div ref={divRef} data-error={!!error} className="mt-1 mb-2"></div>
      {error && <p className="text-[10px] my-1 font-medium text-destructive">{error}</p>}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
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
