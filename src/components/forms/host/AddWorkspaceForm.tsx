'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChangeEvent, useEffect, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Country, State, City } from 'country-state-city';
import { ChevronDownIcon, MinusIcon, PlusIcon } from 'lucide-react';

import { Amenity } from '@/types';
import { imagePlaceholder, validator, data, amenities, mapAmenities } from '@/helper';
import { useAuthRedirect } from '@/hooks';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CommandBox } from '@/components/ui/command';
import {
  workspaceActions,
  workspaceSlice,
  authSlice,
  useAppDispatch,
  useAppSelector,
  waitForDispatch,
} from '@/redux';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
    img1: z.union([
      z
        .any()
        .refine(files => files?.length >= 1, { message: 'required' })
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
    img2: z.union([
      z
        .any()
        .refine(files => files?.length >= 1, { message: 'required' })
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
    img3: z.union([
      z
        .any()
        .refine(files => files?.length >= 1, { message: 'required' })
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
    workspaceName: z.string().min(1, { message: 'required' }),
    address: z.string().min(1, { message: 'required' }),
    floor: z.string().min(1, { message: 'required' }),
    city: z.string().min(1, { message: 'required' }),
    state: z.string().min(1, { message: 'required' }),
    country: z.string().min(1, { message: 'required' }),
    times: z.record(
      z.object({
        selected: z.boolean().optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
      })
    ),
    indoorSpace: z.boolean().optional(),
    outdoorSpace: z.boolean().optional(),
    coWorkingWorkspace: z.boolean().optional(),
    summary: z.string().max(4096, { message: 'max characters exceeded' }).optional(),
    currency: z.string().min(3, { message: 'required' }).max(3, { message: 'invalid currency' }),
    totalPerDay: z.string().min(1, { message: 'required' }),
    additionalGuests: z.string().min(1, { message: 'required' }),
    cleaningFee: z.string().optional(),
    cleaningFeeType: z.string().optional(),
    maintenanceFee: z.string().optional(),
    maintenanceFeeType: z.string().optional(),
    additionalFee: z.string().optional(),
    additionalFeeType: z.string().optional(),
    amenities: z.array(z.boolean().optional()).length(amenities.length),
    addManualAmenity: z.boolean().optional(),
    manualAmenity: z.string().optional(),
    termsAndPolicy: z
      .boolean()
      .refine(value => value === true, { message: 'must agree to continue.' }),
    acknowledge: z
      .boolean()
      .refine(value => value === true, { message: 'must agree to continue.' }),
  })
  .refine(data => data.indoorSpace || data.outdoorSpace, {
    path: ['outdoorSpace'],
    message: 'at least one is required',
  })
  .refine(data => Object.values(data.times).some(day => day.selected), {
    path: ['times.sunday.selected'],
    message: 'at least one day must be selected',
  })
  .superRefine((data, ctx) => {
    Object.entries(data.times).forEach(([day, value]) => {
      if (value.selected) {
        if (!value.startTime) {
          ctx.addIssue({
            message: 'required',
            code: z.ZodIssueCode.custom,
            path: [`times.${day}.startTime`],
          });
        }
        if (!value.endTime) {
          ctx.addIssue({
            message: 'required',
            code: z.ZodIssueCode.custom,
            path: [`times.${day}.endTime`],
          });
        }
      }
    });
  });

type formSchema = z.infer<typeof formSchema>;

type Props = { formData?: formSchema; workspaceId?: string };

const AddWorkspaceForm: React.FC<Props> = ({ formData, workspaceId }: Props) => {
  const dispatch = useAppDispatch();
  const redirect = useAuthRedirect();
  const { loading, error } = useAppSelector(workspaceSlice.selectWorkspace);
  const { user } = useAppSelector(authSlice.selectAuth);
  const [preview, setPreview] = useState<{
    img1: string | null;
    img2: string | null;
    img3: string | null;
  }>(
    formData
      ? { img1: formData.img1 ?? null, img2: formData.img2 ?? null, img3: formData.img3 ?? null }
      : { img1: null, img2: null, img3: null }
  );
  const [addManualAmenity, setAddManualAmenity] = useState<boolean>(
    formData?.addManualAmenity ?? false
  );
  const [resError, setResError] = useState<string>('');

  const form = useForm<formSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: formData ?? {
      img1: '',
      img2: '',
      img3: '',
      workspaceName: '',
      address: '',
      floor: '',
      city: '',
      state: '',
      country: '',
      times: {
        sunday: { selected: false, startTime: '', endTime: '' },
        monday: { selected: false, startTime: '', endTime: '' },
        tuesday: { selected: false, startTime: '', endTime: '' },
        wednesday: { selected: false, startTime: '', endTime: '' },
        thursday: { selected: false, startTime: '', endTime: '' },
        friday: { selected: false, startTime: '', endTime: '' },
        saturday: { selected: false, startTime: '', endTime: '' },
      },
      indoorSpace: false,
      outdoorSpace: false,
      coWorkingWorkspace: false,
      summary: '',
      currency: '',
      totalPerDay: '',
      additionalGuests: '',
      cleaningFee: '',
      cleaningFeeType: '',
      maintenanceFee: '',
      maintenanceFeeType: '',
      additionalFee: '',
      additionalFeeType: '',
      amenities: Array(amenities.length).fill(false),
      addManualAmenity: false,
      manualAmenity: '',
      termsAndPolicy: false,
      acknowledge: false,
    },
  });

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
      dispatch(workspaceSlice.clearError());
    }
  }, [dispatch, error, form]);

  const onSubmit: SubmitHandler<formSchema> = async (formFilled: formSchema) => {
    setResError('');
    const formattedData = {
      info: {
        name: formFilled.workspaceName,
        address: formFilled.address,
        floor: formFilled.floor,
        city: formFilled.city.toLowerCase(),
        state: State.getStateByCodeAndCountry(
          formFilled.state,
          formFilled.country
        )?.name?.toLowerCase(),
        country: Country.getCountryByCode(formFilled.country)?.name?.toLowerCase(),
        summary: formFilled.summary,
      },
      pricing: {
        currency: formFilled.currency,
        totalPerDay: Number(formFilled.totalPerDay),
        cleaning: {
          fee: Number(formFilled.cleaningFee),
          type: formFilled.cleaningFeeType,
        },
        maintenance: {
          fee: Number(formFilled.maintenanceFee),
          type: formFilled.maintenanceFeeType,
        },
        additional: {
          fee: Number(formFilled.additionalFee),
          type: formFilled.additionalFeeType,
        },
      },
      times: Object.keys(formFilled.times).reduce(
        (acc, day) => {
          const time = formFilled.times[day];
          if (time.selected && time.startTime && time.endTime) {
            acc[day] = {
              startTime: time.startTime,
              endTime: time.endTime,
            };
          }
          return acc;
        },
        {} as Record<string, { startTime: string; endTime: string }>
      ),
      other: {
        isIndoorSpace: formFilled.coWorkingWorkspace,
        isOutdoorSpace: formFilled.outdoorSpace,
        isCoWorkingWorkspace: formFilled.coWorkingWorkspace,
        additionalGuests: Number(formFilled.additionalGuests),
      },
      amenities:
        formFilled.addManualAmenity && formFilled.manualAmenity
          ? [...mapAmenities(formFilled.amenities), formFilled.manualAmenity]
          : mapAmenities(formFilled.amenities),
    };
    const formDataToSubmit = new FormData();
    formDataToSubmit.append(
      'images',
      typeof formFilled.img1 === 'string' ? formFilled.img1 : formFilled.img1[0]
    );
    formDataToSubmit.append(
      'images',
      typeof formFilled.img2 === 'string' ? formFilled.img2 : formFilled.img2[0]
    );
    formDataToSubmit.append(
      'images',
      typeof formFilled.img3 === 'string' ? formFilled.img3 : formFilled.img3[0]
    );
    formDataToSubmit.append('info', JSON.stringify(formattedData.info));
    formDataToSubmit.append('pricing', JSON.stringify(formattedData.pricing));
    formDataToSubmit.append('times', JSON.stringify(formattedData.times));
    formDataToSubmit.append('other', JSON.stringify(formattedData.other));
    formDataToSubmit.append('amenities', JSON.stringify(formattedData.amenities));
    if (formData) {
      formDataToSubmit.append('id', workspaceId ?? '');
      await waitForDispatch(dispatch, workspaceActions.updateWorkspace(formDataToSubmit), state => {
        const { isFailed } = state.workspace;
        if (!isFailed) {
          if (user && user.role === 'admin') {
            redirect('/admin/dashboard/workspace');
          } else {
            redirect('/host/dashboard/workspace');
          }
        }
      });
    } else {
      await waitForDispatch(dispatch, workspaceActions.addWorkspace(formDataToSubmit), state => {
        const { isFailed } = state.workspace;
        if (!isFailed) {
          if (user && user.role === 'admin') {
            redirect('/admin/dashboard/workspace');
          } else {
            redirect('/host/dashboard/workspace');
          }
        }
      });
    }
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>, inputName: keyof formSchema) => {
    const file = event.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(prev => ({
        ...prev,
        [inputName]: previewUrl,
      }));
      form.setValue(inputName, event.target.files);
      form.clearErrors(inputName);
    }
  };

  const handleManualAmenityToggle = () => {
    setAddManualAmenity(!addManualAmenity);
    if (!addManualAmenity) {
      form.setValue('addManualAmenity', true);
    } else {
      form.setValue('addManualAmenity', false);
      form.setValue('manualAmenity', '');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col lg:flex-row justify-center items-start flex-wrap gap-y-[30px] gap-x-5">
          {/* workspace amenities */}
          <div className="mt-0 lg:-mt-[19.5%] xl:mt-0 order-4 xl:order-1 w-full lg:w-[46%] xl:w-[24%] flex flex-col gap-[30px]">
            <div className="hidden xl:block">
              <h1 className="text-[28px] font-medium mb-[30px]">
                we need a few information about your workspace.
              </h1>
              <Separator />
            </div>
            <div className="rounded-lg border border-border box-shadow-primary px-[22px] py-6">
              <h1 className="text-[24px] font-medium leading-6">workspace amenities</h1>
              <div className="mt-6 flex flex-col gap-[10px]">
                {amenities.map((amenity: Amenity, i: number) => (
                  <FormField
                    key={i}
                    control={form.control}
                    name={`amenities.${i}`}
                    render={({ field }) => (
                      <FormItem className="w-fit flex flex-row-reverse justify-start items-center gap-3">
                        <FormLabel>
                          <div className="flex justify-start items-center gap-3">
                            {amenity.icon}
                            <p className="!text-primary text-[13px] leading-[14px]">
                              {amenity.label}
                            </p>
                          </div>
                          <FormMessage className="mt-1" />
                        </FormLabel>
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
                <div className="mt-[10px] flex gap-3 justify-start items-center">
                  <div
                    className="w-[30px] h-[30px] rounded-full border-[1.6px] border-primary flex justify-center items-center cursor-pointer"
                    onClick={handleManualAmenityToggle}>
                    {addManualAmenity ? (
                      <MinusIcon className="text-primary w-4 h-4" />
                    ) : (
                      <PlusIcon className="text-primary w-4 h-4" />
                    )}
                  </div>
                  <p className="text-[13px] font-medium leading-[14px]">
                    {addManualAmenity ? 'Remove' : 'Not listed? Manually add an amenity.'}
                  </p>
                </div>
                {/* Input Field for Manual Amenity */}
                {addManualAmenity && (
                  <FormField
                    control={form.control}
                    name="manualAmenity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[13px] leading-[14px]">Enter amenity</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="type the amenity name..."
                            error={isError('manualAmenity')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>
          </div>
          {/* available workspace hours */}
          <div className="order-3 xl:order-2 w-full lg:w-[46%] xl:w-[24%] flex flex-col gap-[30px]">
            <div className="rounded-lg border border-[rgba(0,84,81,0.40)] box-shadow-primary px-[22px] py-6">
              <h1 className="text-[24px] font-medium leading-6">available workspace hours*</h1>
              <div className="mt-8 flex flex-col">
                {data.daysOfWeek.map((day: string, i: number) => (
                  <div key={i}>
                    <div className="flex justify-start items-end gap-8">
                      <FormField
                        control={form.control}
                        name={`times.${day}.selected`}
                        render={({ field }) => (
                          <FormItem className="w-2/5 flex flex-row-reverse justify-start items-center gap-3">
                            <FormLabel className="flex-1">
                              <p className="!text-primary text-[13px] leading-[14px]">
                                {day}
                                <FormMessage className="mt-1" />
                              </p>
                            </FormLabel>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={value => {
                                  field.onChange(value);
                                  form.clearErrors(`times.${day}.startTime`);
                                  form.clearErrors(`times.${day}.endTime`);
                                }}
                                error={isError(`times.${day}.selected` as keyof formSchema)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="w-3/5 flex items-end gap-2 lg:gap-8">
                        <FormField
                          control={form.control}
                          name={`times.${day}.startTime`}
                          render={({ field: { name, value, onChange, disabled } }) => (
                            <FormItem className="w-1/2 flex flex-col gap-[6px]">
                              <FormLabel className="text-[12px] font-medium leading-5">
                                am / pm
                              </FormLabel>
                              <Select
                                name={name}
                                value={value}
                                onValueChange={onChange}
                                disabled={disabled}>
                                <SelectTrigger
                                  error={isError(`times.${day}.startTime` as keyof formSchema)}
                                  className="w-full rounded-sm border text-[14px] leading-5 h-[37.6px] border-[#CBD5E1] text-[rgba(15,23,42,0.50)]"
                                  icon={
                                    <ChevronDownIcon className="text-primary opacity-50 h-4 w-4" />
                                  }>
                                  <SelectValue placeholder="select time" />
                                </SelectTrigger>
                                <SelectContent>
                                  {data.hours.map((hour: string, i: number) => (
                                    <SelectItem key={i} value={hour}>
                                      {hour}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <Separator className="block lg:hidden h-[1.8px] w-3 mb-[8%]" />
                        <FormField
                          control={form.control}
                          name={`times.${day}.endTime`}
                          render={({ field: { name, value, onChange, disabled } }) => (
                            <FormItem className="w-1/2 flex flex-col gap-[6px]">
                              <FormLabel className="text-[12px] font-medium leading-5">
                                am / pm
                              </FormLabel>
                              <Select
                                name={name}
                                value={value}
                                onValueChange={onChange}
                                disabled={disabled}>
                                <SelectTrigger
                                  error={isError(`times.${day}.endTime` as keyof formSchema)}
                                  className="w-full rounded-sm border text-[14px] leading-5 h-[37.6px] border-[#CBD5E1] text-[rgba(15,23,42,0.50)]"
                                  icon={
                                    <ChevronDownIcon className="text-primary opacity-50 h-4 w-4" />
                                  }>
                                  <SelectValue placeholder="select time" />
                                </SelectTrigger>
                                <SelectContent>
                                  {data.hours.map((hour: string, i: number) => (
                                    <SelectItem key={i} value={hour}>
                                      {hour}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    {i < data.daysOfWeek.length - 1 && <Separator className="mt-5 mb-2 rotate-1" />}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-border box-shadow-primary px-[22px] py-6">
              <h1 className="text-[24px] font-medium leading-6">hosting space*</h1>
              <div className="mt-6 flex flex-col gap-[10px]">
                <FormField
                  control={form.control}
                  name="indoorSpace"
                  render={({ field }) => (
                    <FormItem className="w-fit flex flex-row-reverse justify-start items-center gap-3">
                      <FormLabel>
                        <p className="!text-primary text-[13px] leading-[14px]">
                          indoor (ex: office, dining area, great room, etc.)
                          <FormMessage className="mt-1" />
                        </p>
                      </FormLabel>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={value => {
                            field.onChange(value);
                            form.clearErrors('outdoorSpace');
                            form.setValue('outdoorSpace', false);
                          }}
                          error={isError('indoorSpace')}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="outdoorSpace"
                  render={({ field }) => (
                    <FormItem className="w-fit flex flex-row-reverse justify-start items-center gap-3">
                      <FormLabel>
                        <p className="!text-primary text-[13px] leading-[14px]">
                          outdoor (ex: backyard, patio, terrace, balcony, etc. )
                          <FormMessage className="mt-1" />
                        </p>
                      </FormLabel>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={value => {
                            field.onChange(value);
                            form.clearErrors('indoorSpace');
                            form.setValue('indoorSpace', false);
                          }}
                          error={isError('outdoorSpace')}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <h1 className="mt-6 text-[24px] font-medium leading-6">workspace style</h1>
              <div className="mt-6 flex flex-col gap-[10px]">
                <FormField
                  control={form.control}
                  name="coWorkingWorkspace"
                  render={({ field }) => (
                    <FormItem className="w-fit flex flex-row-reverse justify-start items-start gap-3">
                      <FormLabel>
                        <p className="!text-primary text-[13px] leading-[14px]">
                          co-working workspaces workspaces would be shared by multiple people within
                          the same date & time frame. <br />
                          <span className="mt-1 flex justify-start items-start gap-1">
                            <span className="text-primary text-[13px] leading-[14px]">•</span>
                            <span className="text-primary text-[13px] leading-[14px]">
                              if not checked, then only one user can book the workspace for a
                              date/time at a time. Its highly advised that this is checked so
                              multiple people can take advantage of the workspace specially if
                              coworking is offered.
                            </span>
                          </span>
                          <FormMessage className="mt-1" />
                        </p>
                      </FormLabel>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          error={isError('coWorkingWorkspace')}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
          {/* short summary and pricing */}
          <div className="order-2 xl:order-3 w-full lg:w-[46%] xl:w-[24%] flex flex-col gap-[30px]">
            <div className="rounded-lg border border-border box-shadow-primary px-8 py-6">
              <h1 className="text-[24px] font-medium leading-6">
                short summary about the workspace
              </h1>
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormControl>
                      <Textarea
                        {...field}
                        error={isError('summary')}
                        placeholder="Type your message here."
                        className="text-[13px] leading-5"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="rounded-lg border border-[rgba(0,84,81,0.40)] box-shadow-primary px-[22px] py-6">
              <h1 className="text-[24px] font-medium leading-6">pricing*</h1>
              <div className="mt-6 flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field: { name, value, onChange, disabled } }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-medium leading-5">currency</FormLabel>
                      <FormControl>
                        <Select
                          name={name}
                          value={value}
                          onValueChange={onChange}
                          disabled={disabled}>
                          <SelectTrigger
                            error={isError('currency')}
                            className="w-full rounded-sm border text-[14px] leading-5 h-[38.13px] border-[#CBD5E1] text-[rgba(15,23,42,0.50)]"
                            icon={<ChevronDownIcon className="text-primary opacity-50 h-4 w-4" />}>
                            <SelectValue placeholder="select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="usd">USD</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalPerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-medium leading-5">
                        total per day
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          error={isError('totalPerDay')}
                          type="number"
                          min={1}
                          placeholder="price"
                          className="w-full rounded-sm border border-[#CBD5E1] text-[rgba(15,23,42,0.50)] text-[14px] leading-5 placeholder:text-[rgba(15,23,42,0.50)] placeholder:text-[14px] placeholder:leading-5 focus-visible:ring-0 focus-visible:border focus-visible:border-[#CBD5E1]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="additionalGuests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-medium leading-5">
                        additional guests per booking
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          error={isError('additionalGuests')}
                          type="number"
                          min={0}
                          placeholder="2.."
                          className="w-full rounded-sm border border-[#CBD5E1] text-[rgba(15,23,42,0.50)] text-[14px] leading-5 placeholder:text-[rgba(15,23,42,0.50)] placeholder:text-[14px] placeholder:leading-5 focus-visible:ring-0 focus-visible:border focus-visible:border-[#CBD5E1]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <h1 className="mt-6 text-[24px] font-medium leading-6">additional charges</h1>
              <p className="mt-2 text-[13px] leading-5">
                **Note: We suggest you do not include cleaning, maintenance, or any other fees on
                top of the subtotal per booking as users may be less inclined to book the workspace.
                <br />
                <span className="mt-1 flex justify-start items-start gap-2">
                  <span className="text-primary text-[13px] leading-[14px]">•</span>
                  <span className="text-primary text-[13px] leading-[14px]">
                    However, we understand so please do add additional fees if you like.
                  </span>
                </span>
              </p>
              <div className="mt-6 flex flex-col gap-4">
                <div className="flex gap-5">
                  <FormField
                    control={form.control}
                    name="cleaningFee"
                    render={({ field }) => (
                      <FormItem className="w-3/5">
                        <FormLabel className="text-[14px] font-medium leading-5">
                          cleaning fee
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            error={isError('cleaningFee')}
                            type="number"
                            min={0}
                            placeholder="enter fee amount"
                            className="w-full rounded-sm border border-[#CBD5E1] text-[rgba(15,23,42,0.50)] text-[14px] leading-5 placeholder:text-[rgba(15,23,42,0.50)] placeholder:text-[14px] placeholder:leading-5 focus-visible:ring-0 focus-visible:border focus-visible:border-[#CBD5E1]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cleaningFeeType"
                    render={({ field: { name, value, onChange, disabled } }) => (
                      <FormItem className="w-2/5">
                        <FormLabel className="text-[12px] font-medium leading-5 -mb-[6px]">
                          fee type
                        </FormLabel>
                        <FormControl>
                          <Select
                            name={name}
                            value={value}
                            onValueChange={onChange}
                            disabled={disabled}>
                            <SelectTrigger
                              error={isError('cleaningFeeType')}
                              className="w-full rounded-sm border text-[14px] leading-5 h-[38.13px] border-[#CBD5E1] text-[rgba(15,23,42,0.50)]"
                              icon={
                                <ChevronDownIcon className="text-primary opacity-50 h-4 w-4" />
                              }>
                              <SelectValue placeholder="select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">daily</SelectItem>
                              <SelectItem value="weekly">weekly</SelectItem>
                              <SelectItem value="monthly">monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex gap-5">
                  <FormField
                    control={form.control}
                    name="maintenanceFee"
                    render={({ field }) => (
                      <FormItem className="w-3/5">
                        <FormLabel className="text-[14px] font-medium leading-5">
                          maintenance fee
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            error={isError('maintenanceFee')}
                            type="number"
                            min={0}
                            placeholder="enter fee amount"
                            className="w-full rounded-sm border border-[#CBD5E1] text-[rgba(15,23,42,0.50)] text-[14px] leading-5 placeholder:text-[rgba(15,23,42,0.50)] placeholder:text-[14px] placeholder:leading-5 focus-visible:ring-0 focus-visible:border focus-visible:border-[#CBD5E1]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maintenanceFeeType"
                    render={({ field: { name, value, onChange, disabled } }) => (
                      <FormItem className="w-2/5">
                        <FormLabel className="text-[12px] font-medium leading-5 -mb-[6px]">
                          fee type
                        </FormLabel>
                        <FormControl>
                          <Select
                            name={name}
                            value={value}
                            onValueChange={onChange}
                            disabled={disabled}>
                            <SelectTrigger
                              error={isError('maintenanceFeeType')}
                              className="w-full rounded-sm border text-[14px] leading-5 h-[38.13px] border-[#CBD5E1] text-[rgba(15,23,42,0.50)]"
                              icon={
                                <ChevronDownIcon className="text-primary opacity-50 h-4 w-4" />
                              }>
                              <SelectValue placeholder="select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">daily</SelectItem>
                              <SelectItem value="weekly">weekly</SelectItem>
                              <SelectItem value="monthly">monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex gap-5">
                  <FormField
                    control={form.control}
                    name="additionalFee"
                    render={({ field }) => (
                      <FormItem className="w-3/5">
                        <FormLabel className="text-[14px] font-medium leading-5">
                          additional general fee
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            error={isError('additionalFee')}
                            type="number"
                            min={0}
                            placeholder="enter fee amount"
                            className="w-full rounded-sm border border-[#CBD5E1] text-[rgba(15,23,42,0.50)] text-[14px] leading-5 placeholder:text-[rgba(15,23,42,0.50)] placeholder:text-[14px] placeholder:leading-5 focus-visible:ring-0 focus-visible:border focus-visible:border-[#CBD5E1]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="additionalFeeType"
                    render={({ field: { name, value, onChange, disabled } }) => (
                      <FormItem className="w-2/5">
                        <FormLabel className="text-[12px] font-medium leading-5 -mb-[6px]">
                          fee type
                        </FormLabel>
                        <FormControl>
                          <Select
                            name={name}
                            value={value}
                            onValueChange={onChange}
                            disabled={disabled}>
                            <SelectTrigger
                              error={isError('additionalFeeType')}
                              className="w-full rounded-sm border text-[14px] leading-5 h-[38.13px] border-[#CBD5E1] text-[rgba(15,23,42,0.50)]"
                              icon={
                                <ChevronDownIcon className="text-primary opacity-50 h-4 w-4" />
                              }>
                              <SelectValue placeholder="select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">daily</SelectItem>
                              <SelectItem value="weekly">weekly</SelectItem>
                              <SelectItem value="monthly">monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* workspace photos and details */}
          <div className="order-1 xl:order-4 w-full lg:w-[46%] xl:w-[24%] flex flex-col gap-[30px]">
            <div className="-mb-[6px] lg:mb-0 mt-4 lg:mt-0 block xl:hidden">
              <h1 className="text-[28px] font-medium mb-6 lg:mb-[30px]">
                we need a few information about your workspace.
              </h1>
              <Separator />
            </div>
            <div className="rounded-lg border border-[rgba(0,84,81,0.40)] box-shadow-primary px-[19px] py-6">
              <h1 className="text-[24px] font-medium leading-6">workspace photos*</h1>
              <div
                className={`relative mt-6 w-full h-[178px] rounded-lg ${
                  preview.img1 ? 'bg-transparent' : 'bg-primary'
                }`}>
                {preview.img1 && (
                  <Image
                    src={preview.img1}
                    alt="img1"
                    width={352}
                    height={178}
                    placeholder={imagePlaceholder}
                    className="w-full h-[178px] rounded-lg"
                  />
                )}
                <FormField
                  control={form.control}
                  name="img1"
                  render={() => (
                    <FormItem className="z-10 absolute bottom-3 right-3 flex justify-center items-center gap-2">
                      <FormLabel
                        className={`cursor-pointer px-[14px] py-[5px] rounded-lg flex justify-center items-center gap-2 ${
                          isError('img1') ? 'bg-red-400' : 'bg-white'
                        }`}>
                        <div
                          className={`w-4 h-4 rounded-full border-[1.6px] flex justify-center items-center ${isError('img1') ? 'border-white' : 'border-primary'}`}>
                          <PlusIcon
                            className={`w-[10px] h-[10px] mt-[1px] ${isError('img1') ? 'text-white' : 'text-primary'}`}
                          />
                        </div>
                        <p
                          className={`text-[10px] font-medium leading-5 ${isError('img1') ? 'text-white' : 'text-primary'}`}>
                          add
                        </p>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".png,.jpg,.jpeg"
                          className="sr-only"
                          onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            handleImageChange(event, 'img1')
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-3 mt-3">
                <div
                  className={`relative w-1/2 h-[179px] rounded-lg ${
                    preview.img2 ? 'bg-transparent' : 'bg-primary'
                  }`}>
                  {preview.img2 && (
                    <Image
                      src={preview.img2}
                      alt="img2"
                      width={169}
                      height={179}
                      placeholder={imagePlaceholder}
                      className="w-full h-[179px] rounded-lg"
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="img2"
                    render={() => (
                      <FormItem className="z-10 absolute bottom-3 right-3 flex justify-center items-center gap-2">
                        <FormLabel
                          className={`cursor-pointer px-[14px] py-[5px] rounded-lg flex justify-center items-center gap-2 ${
                            isError('img2') ? 'bg-red-400' : 'bg-white'
                          }`}>
                          <div
                            className={`w-4 h-4 rounded-full border-[1.6px] flex justify-center items-center ${isError('img2') ? 'border-white' : 'border-primary'}`}>
                            <PlusIcon
                              className={`w-[10px] h-[10px] mt-[1px] ${isError('img2') ? 'text-white' : 'text-primary'}`}
                            />
                          </div>
                          <p
                            className={`text-[10px] font-medium leading-5 ${isError('img2') ? 'text-white' : 'text-primary'}`}>
                            add
                          </p>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept=".png,.jpg,.jpeg"
                            className="sr-only"
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                              handleImageChange(event, 'img2')
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div
                  className={`relative w-1/2 h-[179px] rounded-lg ${
                    preview.img3 ? 'bg-transparent' : 'bg-primary'
                  }`}>
                  {preview.img3 && (
                    <Image
                      src={preview.img3}
                      alt="img3"
                      width={169}
                      height={179}
                      placeholder={imagePlaceholder}
                      className="w-full h-[179px] rounded-lg"
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="img3"
                    render={() => (
                      <FormItem className="z-10 absolute bottom-3 right-3 flex justify-center items-center gap-2">
                        <FormLabel
                          className={`cursor-pointer px-[14px] py-[5px] rounded-lg flex justify-center items-center gap-2 ${
                            isError('img3') ? 'bg-red-400' : 'bg-white'
                          }`}>
                          <div
                            className={`w-4 h-4 rounded-full border-[1.6px] flex justify-center items-center ${isError('img3') ? 'border-white' : 'border-primary'}`}>
                            <PlusIcon
                              className={`w-[10px] h-[10px] mt-[1px] ${isError('img3') ? 'text-white' : 'text-primary'}`}
                            />
                          </div>
                          <p
                            className={`text-[10px] font-medium leading-5 ${isError('img3') ? 'text-white' : 'text-primary'}`}>
                            add
                          </p>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept=".png,.jpg,.jpeg"
                            className="sr-only"
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                              handleImageChange(event, 'img3')
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-[rgba(0,84,81,0.40)] box-shadow-primary px-[19px] py-6">
              <h1 className="text-[24px] font-medium leading-6">workspace info*</h1>
              <div className="mt-6 flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="workspaceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-medium leading-5">
                        name of workspace
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          error={isError('workspaceName')}
                          placeholder="enter name"
                          className="w-full rounded-sm border border-[#CBD5E1] text-[rgba(15,23,42,0.50)] text-[14px] leading-5 placeholder:text-[rgba(15,23,42,0.50)] placeholder:text-[14px] placeholder:leading-5 focus-visible:ring-0 focus-visible:border focus-visible:border-[#CBD5E1]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-medium leading-5">address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          error={isError('address')}
                          placeholder="e.g. 1234 Elm Street"
                          className="w-full rounded-sm border border-[#CBD5E1] text-[rgba(15,23,42,0.50)] text-[14px] leading-5 placeholder:text-[rgba(15,23,42,0.50)] placeholder:text-[14px] placeholder:leading-5 focus-visible:ring-0 focus-visible:border focus-visible:border-[#CBD5E1]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="floor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-medium leading-5">
                        foor, apt., etc.
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          error={isError('floor')}
                          placeholder="e.g. floor 2"
                          className="w-full rounded-sm border border-[#CBD5E1] text-[rgba(15,23,42,0.50)] text-[14px] leading-5 placeholder:text-[rgba(15,23,42,0.50)] placeholder:text-[14px] placeholder:leading-5 focus-visible:ring-0 focus-visible:border focus-visible:border-[#CBD5E1]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field: { name, value, onChange, disabled } }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-medium leading-5">city</FormLabel>
                      <FormControl>
                        <CommandBox
                          data={City.getCitiesOfState(
                            form.getValues('country'),
                            form.getValues('state')
                          ).map(c => ({
                            value: c.name,
                            label: c.name.toLowerCase(),
                          }))}
                          prompt="city"
                          value={value}
                          setValue={onChange}
                          error={isError('city')}
                          name={name}
                          disabled={disabled}
                          className="!w-full !rounded-sm !border !text-[14px] !leading-5 !h-[38.13px] !border-[#CBD5E1] !text-[rgba(15,23,42,0.50)]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field: { name, value, onChange, disabled } }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-medium leading-5">state</FormLabel>
                      <FormControl>
                        <CommandBox
                          data={State.getStatesOfCountry(form.getValues('country')).map(s => ({
                            value: s.isoCode,
                            label: s.name.toLowerCase(),
                          }))}
                          prompt="state"
                          value={value}
                          setValue={val => {
                            onChange(val);
                            if (!val) {
                              form.setValue('city', '');
                            }
                          }}
                          error={isError('state')}
                          name={name}
                          disabled={disabled}
                          className="!w-full !rounded-sm !border !text-[14px] !leading-5 !h-[38.13px] !border-[#CBD5E1] !text-[rgba(15,23,42,0.50)]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field: { name, value, onChange, disabled } }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-medium leading-5">country</FormLabel>
                      <FormControl>
                        <CommandBox
                          data={Country.getAllCountries().map(c => ({
                            value: c.isoCode,
                            label: c.name.toLowerCase(),
                          }))}
                          prompt="country"
                          value={value}
                          setValue={val => {
                            onChange(val);
                            if (!val) {
                              form.setValue('state', '');
                              form.setValue('city', '');
                            }
                          }}
                          error={isError('country')}
                          name={name}
                          disabled={disabled}
                          className="!w-full !rounded-sm !border !text-[14px] !leading-5 !h-[38.13px] !border-[#CBD5E1] !text-[rgba(15,23,42,0.50)]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
        <Separator className="my-8" />
        {/* terms of service* */}
        <div className="w-full lg:w-1/4 rounded-lg border border-border box-shadow-primary px-8 py-6">
          <h1 className="text-[24px] font-medium leading-6">terms of service*</h1>
          <div className="mt-6 flex flex-col gap-[10px]">
            <FormField
              control={form.control}
              name="termsAndPolicy"
              render={({ field }) => (
                <FormItem className="w-fit flex flex-row-reverse justify-start items-center gap-3">
                  <FormLabel>
                    <p className="!text-primary text-[13px] leading-[14px]">
                      I agree to balcony{' '}
                      <u>
                        <Link href="/terms" target="_blank">
                          terms of service
                        </Link>
                      </u>{' '}
                      and{' '}
                      <u>
                        <Link href="/policy" target="_blank">
                          privacy policy
                        </Link>
                      </u>
                      .
                      <FormMessage className="mt-1" />
                    </p>
                  </FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      error={isError('termsAndPolicy')}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="acknowledge"
              render={({ field }) => (
                <FormItem className="w-fit flex flex-row-reverse justify-start items-start gap-3">
                  <FormLabel>
                    <p className="!text-primary text-[13px] leading-[14px]">
                      I acknowledge that I am going to receive a 1099 form if I make $600 or more
                      during the entire year. <br />
                      <span className="mt-1 flex justify-start items-start gap-1">
                        <span className="text-primary text-[13px] leading-[14px]">•</span>
                        <span className="text-primary text-[13px] leading-[14px]">
                          please read about tax faqs.
                        </span>
                      </span>
                      <FormMessage className="mt-1" />
                    </p>
                  </FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      error={isError('acknowledge')}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        {formData ? (
          <Button type="submit" className="mt-8 w-[280px] h-9 leading-6" isLoading={loading}>
            update workspace
          </Button>
        ) : (
          <Button type="submit" className="mt-8 w-[280px] h-9 leading-6" isLoading={loading}>
            add new workspace
          </Button>
        )}
        {resError && <p className="text-sm font-medium text-destructive mt-2">{resError}</p>}
      </form>
    </Form>
  );
};

export default AddWorkspaceForm;
