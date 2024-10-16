'use client';

import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { BedSingleIcon, BathIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    place: z.string().min(2, {
      message: 'Place is required',
    }),
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

  type formSchema = z.infer<typeof formSchema>;

  const form = useForm<formSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      place: '',
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
    router.push(
      `/properties?place=${data.place}&beds=${data.beds}&baths=${data.baths}&minrange=${data.minRange}&maxrange=${data.maxRange}`
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
