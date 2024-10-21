'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { BedSingleIcon, BathIcon } from 'lucide-react';

import { GeocodingControl, GeocodingEvent } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
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
    beds: z
      .string()
      .optional()
      .refine(value => value === undefined || value.trim() === '' || Number(value) >= 1, {
        message: 'beds value must be at least 1',
      }),
    baths: z
      .string()
      .optional()
      .refine(value => value === undefined || value.trim() === '' || Number(value) >= 1, {
        message: 'baths value must be at least 1',
      }),
    minRange: z.string().optional(),
    maxRange: z.string().optional(),
  })
  .refine(
    data => {
      const { minRange, maxRange } = data;
      if (
        minRange !== undefined &&
        maxRange !== undefined &&
        minRange.trim() !== '' &&
        maxRange.trim() !== ''
      ) {
        return Number(maxRange) > Number(minRange);
      }
      return true;
    },
    {
      message: 'Max range must be greater than min range',
      path: ['maxRange'],
    }
  );

type Props = object;

const PropertiesForm: React.FC<Props> = () => {
  const router = useRouter();
  const [place, setPlace] = useState<string>('');
  const [error, setError] = useState<string>('');

  const divRef = useRef<HTMLDivElement>(null);
  const geocodingControlRef = useRef<GeocodingControl | null>(null);

  type formSchema = z.infer<typeof formSchema>;

  const form = useForm<formSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      beds: '',
      baths: '',
      minRange: '',
      maxRange: '',
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
      `/properties?place=${place}&beds=${data.beds}&baths=${data.baths}&minrange=${data.minRange}&maxrange=${data.maxRange}`
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="beds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>beds</FormLabel>
                <div className="relative">
                  <BedSingleIcon className="text-primary mr-2 h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <FormControl>
                    <Input
                      {...field}
                      error={isError('beds')}
                      type="number"
                      min={1}
                      placeholder="enter beds"
                      className="w-1/2 pl-8"
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="baths"
            render={({ field }) => (
              <FormItem>
                <FormLabel>baths</FormLabel>
                <div className="relative">
                  <BathIcon className="text-primary mr-2 h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <FormControl>
                    <Input
                      {...field}
                      error={isError('baths')}
                      type="number"
                      min={1}
                      placeholder="enter baths"
                      className="w-1/2 pl-8"
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-start items-start gap-4">
            <FormField
              control={form.control}
              name="minRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>min range</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      error={isError('minRange')}
                      type="number"
                      min={0}
                      placeholder="##"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="relative h-auto">
              <Separator
                orientation="vertical"
                className="h-[1px] w-3 absolute top-[45px] -left-[6px]"
              />
            </div>
            <FormField
              control={form.control}
              name="maxRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>max range</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      error={isError('maxRange')}
                      type="number"
                      min={
                        form.getValues('minRange') !== undefined
                          ? Number(form.getValues('minRange')) + 1
                          : 0
                      }
                      placeholder="##"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="leading-6">
            search
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default PropertiesForm;
