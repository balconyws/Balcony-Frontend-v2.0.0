'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { ColumnDef } from '@tanstack/react-table';
import { Country, State, City } from 'country-state-city';
import { MinusIcon, PlusIcon, UploadIcon, XIcon } from 'lucide-react';

import { Amenity, UnitStatus } from '@/types';
import { imagePlaceholder, validator, amenities, mapAmenities } from '@/helper';
import { useAuthRedirect } from '@/hooks';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { DataTable } from '@/components/common';
import { CommandBox } from '@/components/ui/command';
import {
  propertyActions,
  propertySlice,
  authSlice,
  subscriptionSlice,
  useAppDispatch,
  useAppSelector,
  waitForDispatch,
} from '@/redux';
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
    leasingPolicyDoc: z.union([
      z
        .any()
        .optional()
        .refine(
          files =>
            files === undefined ||
            (files.length >= 1 &&
              [
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              ].includes(files?.[0]?.type)),
          { message: 'only PDF, and DOCX files are accepted' }
        )
        .refine(files => files === undefined || files[0]?.size <= 50 * 1024 * 1024, {
          message: 'max file size is 50MB',
        }),
      z.string().refine(url => validator.isValidDocument(url), {
        message: 'invalid document',
      }),
    ]),
    propertyName: z.string().min(1, { message: 'required' }),
    address: z.string().min(1, { message: 'required' }),
    city: z.string().min(1, { message: 'required' }),
    state: z.string().min(1, { message: 'required' }),
    country: z.string().min(1, { message: 'required' }),
    leaseDuration: z
      .number()
      .min(1, {
        message: 'at least 1',
      })
      .max(10, {
        message: 'at most 10',
      }),
    chargeFeeFromRent: z.boolean().optional(),
    chargeFeeAsAddition: z.boolean().optional(),
    summary: z.string().optional(),
    amenities: z.array(z.boolean().optional()).length(amenities.length),
    addManualAmenity: z.boolean().optional(),
    manualAmenity: z.string().optional(),
    unitList: z.array(
      z.object({
        _id: z.string().optional(),
        unit: z.number().optional(),
        price: z.number().optional(),
        beds: z.number().optional(),
        baths: z.number().optional(),
        isAvailable: z.boolean().default(true),
        floorPlanImg: z
          .union([
            z
              .any()
              .optional()
              .refine(files => files?.length >= 1, { message: 'required' })
              .refine(
                files => ['image/jpeg', 'image/jpg', 'image/png'].includes(files?.[0]?.type),
                {
                  message: '.jpg, .jpeg, and .png files are accepted',
                }
              )
              .refine(files => files?.[0]?.size <= 5 * 1024 * 1024, {
                message: 'max file size is 5MB',
              }),
            z.string().refine(url => validator.isValidImage(url), {
              message: 'invalid image',
            }),
          ])
          .optional(),
      })
    ),
    termsAndPolicy: z
      .boolean()
      .refine(value => value === true, { message: 'must agree to continue.' }),
    acknowledge: z
      .boolean()
      .refine(value => value === true, { message: 'must agree to continue.' }),
  })
  .superRefine((data, ctx) => {
    data.unitList.forEach((unit, index: number) => {
      if (unit.unit || unit.price || unit.beds || unit.baths || unit.floorPlanImg) {
        if (!unit.unit) {
          ctx.addIssue({
            message: 'required',
            code: z.ZodIssueCode.custom,
            path: [`unitList[${index}].unit`],
          });
        }
        if (!unit.price) {
          ctx.addIssue({
            message: 'required',
            code: z.ZodIssueCode.custom,
            path: [`unitList[${index}].price`],
          });
        }
        if (!unit.beds) {
          ctx.addIssue({
            message: 'required',
            code: z.ZodIssueCode.custom,
            path: [`unitList[${index}].beds`],
          });
        }
        if (!unit.baths) {
          ctx.addIssue({
            message: 'required',
            code: z.ZodIssueCode.custom,
            path: [`unitList[${index}].baths`],
          });
        }
        if (!unit.floorPlanImg) {
          ctx.addIssue({
            message: 'required',
            code: z.ZodIssueCode.custom,
            path: [`unitList[${index}].floorPlanImg`],
          });
        }
      }
    });
  })
  .refine(data => data.chargeFeeFromRent || data.chargeFeeAsAddition, {
    path: ['chargeFeeAsAddition'],
    message: 'at least one of must be selected',
  })
  .refine(data => !(data.chargeFeeFromRent && data.chargeFeeAsAddition), {
    path: ['chargeFeeAsAddition'],
    message: 'at most one of must be selected',
  })
  .refine(data => data.unitList.length > 0 && data.unitList[0].unit, {
    path: ['unitList[0].unit'],
    message: 'required',
  })
  .refine(data => data.unitList.length > 0 && data.unitList[0].price, {
    path: ['unitList[0].price'],
    message: 'required',
  })
  .refine(data => data.unitList.length > 0 && data.unitList[0].beds, {
    path: ['unitList[0].beds'],
    message: 'required',
  })
  .refine(data => data.unitList.length > 0 && data.unitList[0].baths, {
    path: ['unitList[0].baths'],
    message: 'required',
  })
  .refine(data => data.unitList.length > 0 && data.unitList[0].floorPlanImg !== undefined, {
    path: ['unitList[0].floorPlanImg'],
    message: 'required',
  });

type formSchema = z.infer<typeof formSchema>;

const formatFileName = (filename: string): string => {
  const dotIndex = filename.lastIndexOf('.');
  if (filename.length > 8) {
    if (dotIndex === -1) {
      return `${filename.substring(0, 5)}...`;
    } else {
      const namePart = filename.substring(0, 5);
      const extension = filename.substring(dotIndex);
      return `${namePart}...${extension}`;
    }
  }
  return filename;
};

type Props = { formData?: formSchema; propertyId?: string };

const AddPropertyForm: React.FC<Props> = ({ formData, propertyId }: Props) => {
  const dispatch = useAppDispatch();
  const redirect = useAuthRedirect();
  const pathname = usePathname();
  const { loading, error } = useAppSelector(propertySlice.selectProperty);
  const { subscriptionDetail } = useAppSelector(subscriptionSlice.selectSubscription);
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
  const [leasingPolicyDocName, setLeasingPolicyDocName] = useState<string | null>(
    formData?.leasingPolicyDoc ? formatFileName(formData.leasingPolicyDoc.split('/').pop()) : null
  );
  const [maxUnits, setMaxUnits] = useState<number>(3);
  const [unitList, setUnitList] = useState<
    {
      _id?: string;
      unit: number;
      price: number;
      beds: number;
      baths: number;
      floorPlanImg: string | undefined;
      isAvailable: boolean;
      status?: UnitStatus;
    }[]
  >(
    formData?.unitList
      ? formData.unitList.map(unit => ({
          _id: unit._id,
          unit: unit.unit ?? 0,
          price: unit.price ?? 0,
          beds: unit.beds ?? 0,
          baths: unit.baths ?? 0,
          floorPlanImg: unit.floorPlanImg.split('/').pop() as string,
          isAvailable: unit.isAvailable ?? true,
        }))
      : Array.from({ length: 3 }, () => ({
          unit: 0,
          price: 0,
          beds: 0,
          baths: 0,
          floorPlanImg: undefined,
          isAvailable: true,
        }))
  );
  const [resError, setResError] = useState<string>('');

  useEffect(() => {
    const getAllowedUnits = () => {
      if (subscriptionDetail) {
        const { name } = subscriptionDetail;
        switch (name) {
          case 'free plan':
            return 3;
          case 'villa plan':
            return 50;
          case 'mansion plan':
            return 350;
          case 'chateau plan':
            return 1250;
          default:
            return 3;
        }
      }
      return 3;
    };
    setMaxUnits(getAllowedUnits());
  }, [subscriptionDetail]);

  const form = useForm<formSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: formData ?? {
      img1: '',
      img2: '',
      img3: '',
      propertyName: '',
      address: '',
      city: '',
      state: '',
      country: '',
      chargeFeeFromRent: false,
      chargeFeeAsAddition: false,
      summary: '',
      amenities: Array(amenities.length).fill(false),
      addManualAmenity: false,
      manualAmenity: '',
      leaseDuration: 1,
      leasingPolicyDoc: undefined,
      unitList: Array.from({ length: 3 }, () => ({
        unit: 0,
        price: 0,
        beds: 0,
        baths: 0,
        floorPlanImg: undefined,
        isAvailable: true,
      })),
      termsAndPolicy: false,
      acknowledge: false,
    },
  });

  const isError = useCallback(
    (inputName: keyof formSchema): boolean => {
      const fieldState = form.getFieldState(inputName);
      return !!fieldState.error;
    },
    [form]
  );

  useEffect(() => {
    if (error) {
      if (error.key === '') {
        setResError(error.message);
      } else {
        form.setError(error.key as keyof formSchema, { message: error.message });
      }
      dispatch(propertySlice.clearError());
    }
  }, [dispatch, error, form]);

  const onSubmit: SubmitHandler<formSchema> = async (formFilled: formSchema) => {
    setResError('');
    const formattedData = {
      info: {
        name: formFilled.propertyName,
        address: formFilled.address,
        city: formFilled.city.toLowerCase(),
        state: State.getStateByCodeAndCountry(
          formFilled.state,
          formFilled.country
        )?.name?.toLowerCase(),
        country: Country.getCountryByCode(formFilled.country)?.name?.toLowerCase(),
        summary: formFilled.summary,
      },
      unitList: formFilled.unitList.filter(
        unit => unit.unit && unit.price && unit.beds && unit.baths && unit.floorPlanImg
      ),
      other: {
        chargeFeeFromRent: formFilled.chargeFeeFromRent,
        chargeFeeAsAddition: formFilled.chargeFeeAsAddition,
        leaseDuration: formFilled.leaseDuration,
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
    formFilled.unitList.map(unit => {
      if (unit.floorPlanImg) {
        formDataToSubmit.append(
          'floorPlanImages',
          typeof unit.floorPlanImg === 'string' ? unit.floorPlanImg : unit.floorPlanImg[0]
        );
      }
    });
    if (formFilled.leasingPolicyDoc) {
      formDataToSubmit.append(
        'leasingPolicyDoc',
        typeof formFilled.leasingPolicyDoc === 'string'
          ? formFilled.leasingPolicyDoc
          : formFilled.leasingPolicyDoc[0]
      );
    }
    formDataToSubmit.append('info', JSON.stringify(formattedData.info));
    formDataToSubmit.append('unitList', JSON.stringify(formattedData.unitList));
    formDataToSubmit.append('other', JSON.stringify(formattedData.other));
    formDataToSubmit.append('amenities', JSON.stringify(formattedData.amenities));
    if (formData) {
      formDataToSubmit.append('id', propertyId ?? '');
      await waitForDispatch(dispatch, propertyActions.updateProperty(formDataToSubmit), state => {
        const { isFailed } = state.property;
        if (!isFailed) {
          if (user && user.role === 'admin') {
            redirect('/admin/dashboard/property');
          } else {
            redirect('/host/dashboard/property');
          }
        }
      });
    } else {
      await waitForDispatch(dispatch, propertyActions.addProperty(formDataToSubmit), state => {
        const { isFailed } = state.property;
        if (!isFailed) {
          if (user && user.role === 'admin') {
            redirect('/admin/dashboard/property');
          } else {
            redirect('/host/dashboard/property');
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

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formattedName = formatFileName(file.name);
      setLeasingPolicyDocName(formattedName);
      form.setValue('leasingPolicyDoc', event.target.files);
      form.clearErrors('leasingPolicyDoc');
    }
  };

  const handleFloorPlanImageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>, index: number) => {
      const file = event.target.files?.[0];
      if (file) {
        setUnitList(prev => {
          const updatedList = [...prev];
          updatedList[index] = {
            ...updatedList[index],
            floorPlanImg: formatFileName(file.name),
          };
          return updatedList;
        });
        form.setValue(`unitList.${index}.floorPlanImg`, event.target.files);
        form.clearErrors(`unitList.${index}.floorPlanImg`);
      }
    },
    [form]
  );

  const handleManualAmenityToggle = () => {
    setAddManualAmenity(!addManualAmenity);
    if (!addManualAmenity) {
      form.setValue('addManualAmenity', true);
    } else {
      form.setValue('addManualAmenity', false);
      form.setValue('manualAmenity', '');
    }
  };

  const addMoreUnitItem = () => {
    if (unitList.length === maxUnits) return;
    if (unitList.length < maxUnits) {
      setUnitList(prev => [
        ...prev,
        { unit: 0, price: 0, beds: 0, baths: 0, floorPlanImg: '', isAvailable: true },
      ]);
    }
  };

  const deleteFloorPlanImg = (index: number) => {
    setUnitList(prev => {
      const updatedList = [...prev];
      updatedList[index] = {
        ...updatedList[index],
        floorPlanImg: undefined,
      };
      return updatedList;
    });
  };

  const setUnitAvaliable = useCallback(
    (isAvailable: boolean, index: number) => {
      setUnitList(prev => {
        const updatedList = [...prev];
        updatedList[index] = {
          ...updatedList[index],
          isAvailable,
        };
        return updatedList;
      });
      form.setValue(`unitList.${index}.isAvailable`, isAvailable);
      form.clearErrors(`unitList.${index}.unit`);
      form.clearErrors(`unitList.${index}.price`);
      form.clearErrors(`unitList.${index}.beds`);
      form.clearErrors(`unitList.${index}.baths`);
      form.clearErrors(`unitList.${index}.floorPlanImg`);
      form.clearErrors(`unitList.${index}.isAvailable`);
    },
    [form]
  );

  const columns: ColumnDef<{
    _id?: string;
    unit: string;
    price: number;
    beds: number;
    baths?: number;
    isAvailable: boolean;
    floorPlanImg: string;
  }>[] = useMemo(
    () => [
      {
        id: 'unit',
        accessorKey: 'unit',
        enableSorting: false,
        enableHiding: false,
        header: () => <></>,
        cell: ({ row: { index } }) => (
          <div key={index} className="flex flex-col justify-center items-start gap-[5px]">
            <div className="flex gap-3 lg:gap-4">
              <FormField
                control={form.control}
                name={`unitList.${index}.unit`}
                render={({ field }) => (
                  <FormItem className="w-1/2 lg:w-3/5 space-y-0">
                    <FormLabel className="text-[14px] font-medium leading-5">unit #</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          const value = Number(event.target.value);
                          if (!isNaN(value)) {
                            field.onChange(value);
                          } else {
                            field.onChange('');
                          }
                          setUnitList(prev => {
                            const updatedList = [...prev];
                            updatedList[index] = {
                              ...updatedList[index],
                              unit: value,
                            };
                            return updatedList;
                          });
                          form.clearErrors(`unitList.${index}.price` as keyof formSchema);
                          form.clearErrors(`unitList.${index}.beds` as keyof formSchema);
                          form.clearErrors(`unitList.${index}.baths` as keyof formSchema);
                          form.clearErrors(`unitList.${index}.floorPlanImg` as keyof formSchema);
                        }}
                        disabled={!unitList[index].isAvailable && !!propertyId}
                        error={isError(`unitList.${index}.unit` as keyof formSchema)}
                        type="number"
                        min={0}
                        placeholder="enter unit no."
                        className="w-full rounded-sm border border-[#CBD5E1] text-[rgba(15,23,42,0.50)] text-[14px] leading-5 placeholder:text-[rgba(15,23,42,0.50)] placeholder:text-[14px] placeholder:leading-5 focus-visible:ring-0 focus-visible:border focus-visible:border-[#CBD5E1]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`unitList.${index}.price`}
                render={({ field }) => (
                  <FormItem className="w-2/5 space-y-0">
                    <FormLabel className="text-[14px] font-medium leading-5">price</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          const value = Number(event.target.value);
                          if (!isNaN(value)) {
                            field.onChange(value);
                          } else {
                            field.onChange('');
                          }
                          form.clearErrors(`unitList.${index}.unit` as keyof formSchema);
                          form.clearErrors(`unitList.${index}.beds` as keyof formSchema);
                          form.clearErrors(`unitList.${index}.baths` as keyof formSchema);
                          form.clearErrors(`unitList.${index}.floorPlanImg` as keyof formSchema);
                        }}
                        disabled={!unitList[index].isAvailable && !!propertyId}
                        error={isError(`unitList.${index}.price` as keyof formSchema)}
                        type="number"
                        min={0}
                        placeholder="enter price"
                        className="w-full rounded-sm border border-[#CBD5E1] text-[rgba(15,23,42,0.50)] text-[14px] leading-5 placeholder:text-[rgba(15,23,42,0.50)] placeholder:text-[14px] placeholder:leading-5 focus-visible:ring-0 focus-visible:border focus-visible:border-[#CBD5E1]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-start items-end gap-3 lg:gap-4">
              <FormField
                control={form.control}
                name={`unitList.${index}.beds`}
                render={({ field }) => (
                  <FormItem className="w-1/3 lg:w-2/5 space-y-0">
                    <FormLabel className="text-[14px] font-medium leading-5">beds</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          const value = Number(event.target.value);
                          if (!isNaN(value)) {
                            field.onChange(value);
                          } else {
                            field.onChange('');
                          }
                          form.clearErrors(`unitList.${index}.unit` as keyof formSchema);
                          form.clearErrors(`unitList.${index}.price` as keyof formSchema);
                          form.clearErrors(`unitList.${index}.baths` as keyof formSchema);
                          form.clearErrors(`unitList.${index}.floorPlanImg` as keyof formSchema);
                        }}
                        disabled={!unitList[index].isAvailable && !!propertyId}
                        error={isError(`unitList.${index}.beds` as keyof formSchema)}
                        type="number"
                        min={0}
                        placeholder="enter no. of beds"
                        className="w-full rounded-sm border border-[#CBD5E1] text-[rgba(15,23,42,0.50)] text-[14px] leading-5 placeholder:text-[rgba(15,23,42,0.50)] placeholder:text-[14px] placeholder:leading-5 focus-visible:ring-0 focus-visible:border focus-visible:border-[#CBD5E1]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`unitList.${index}.baths`}
                render={({ field }) => (
                  <FormItem className="w-1/5 space-y-0">
                    <FormLabel className="text-[14px] font-medium leading-5">baths</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          const value = Number(event.target.value);
                          if (!isNaN(value)) {
                            field.onChange(value);
                          } else {
                            field.onChange('');
                          }
                          form.clearErrors(`unitList.${index}.unit` as keyof formSchema);
                          form.clearErrors(`unitList.${index}.price` as keyof formSchema);
                          form.clearErrors(`unitList.${index}.beds` as keyof formSchema);
                          form.clearErrors(`unitList.${index}.floorPlanImg` as keyof formSchema);
                        }}
                        disabled={!unitList[index].isAvailable && !!propertyId}
                        error={isError(`unitList.${index}.baths` as keyof formSchema)}
                        type="number"
                        min={0}
                        placeholder="enter no. of baths"
                        className="w-full rounded-sm border border-[#CBD5E1] text-[rgba(15,23,42,0.50)] text-[14px] leading-5 placeholder:text-[rgba(15,23,42,0.50)] placeholder:text-[14px] placeholder:leading-5 focus-visible:ring-0 focus-visible:border focus-visible:border-[#CBD5E1]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`unitList.${index}.floorPlanImg`}
                render={() => (
                  <FormItem className="w-2/5 space-y-0">
                    {unitList[index].floorPlanImg ? (
                      <div
                        className={`w-full flex gap-1 lg:gap-3 justify-start items-center p-2 ${
                          !propertyId
                            ? 'cursor-pointer'
                            : unitList[index].isAvailable && !!propertyId
                              ? 'cursor-pointer'
                              : 'cursor-not-allowed opacity-50'
                        }`}
                        onClick={() => unitList[index].isAvailable && deleteFloorPlanImg(index)}>
                        <div
                          className={`w-[20px] h-[20px] rounded-full border-[1.6px] flex justify-center items-center ${
                            isError(`unitList.${index}.floorPlanImg` as keyof formSchema)
                              ? 'border-red-500'
                              : 'border-primary'
                          }`}>
                          <XIcon
                            className={`w-3 h-3 ${
                              isError(`unitList.${index}.floorPlanImg` as keyof formSchema)
                                ? 'text-red-500'
                                : 'text-primary'
                            }`}
                          />
                        </div>
                        <span
                          className={`text-[10px] font-medium leading-[14px] ${
                            isError(`unitList.${index}.floorPlanImg` as keyof formSchema)
                              ? 'text-red-500'
                              : 'text-primary'
                          }`}>
                          {formatFileName(unitList[index].floorPlanImg)}
                        </span>
                      </div>
                    ) : (
                      <FormLabel
                        className={`w-full flex gap-1 lg:gap-3 justify-start items-center px-0 p-2 ${
                          !propertyId
                            ? 'cursor-pointer'
                            : unitList[index].isAvailable
                              ? 'cursor-pointer'
                              : 'cursor-not-allowed'
                        }`}>
                        <div
                          className={`w-[20px] h-[20px] rounded-full border-[1.6px] flex justify-center items-center ${
                            isError(`unitList.${index}.floorPlanImg` as keyof formSchema)
                              ? 'border-red-500'
                              : 'border-primary'
                          }`}>
                          <PlusIcon
                            className={`w-3 h-3 ${
                              isError(`unitList.${index}.floorPlanImg` as keyof formSchema)
                                ? 'text-red-500'
                                : 'text-primary'
                            }`}
                          />
                        </div>
                        <span
                          className={`text-[10px] font-medium leading-[14px] ${
                            isError(`unitList.${index}.floorPlanImg` as keyof formSchema)
                              ? 'text-red-500'
                              : 'text-primary'
                          }`}>
                          add floor plan image
                        </span>
                      </FormLabel>
                    )}
                    <FormControl>
                      <Input
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        className="sr-only w-0"
                        disabled={!unitList[index].isAvailable && !!propertyId}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          handleFloorPlanImageChange(event, index);
                          form.clearErrors(`unitList.${index}.unit` as keyof formSchema);
                          form.clearErrors(`unitList.${index}.price` as keyof formSchema);
                          form.clearErrors(`unitList.${index}.beds` as keyof formSchema);
                          form.clearErrors(`unitList.${index}.baths` as keyof formSchema);
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            {propertyId && (
              <div
                className={`flex w-[146px] h-[30px] p-[5px] rounded-lg shadow-md ml-1 mt-2 ${
                  isError(`unitList.${index}.avaliable` as keyof formSchema) &&
                  'border border-red-500'
                }`}>
                <Button
                  type="button"
                  variant={unitList[index].isAvailable ? 'default' : 'secondary'}
                  onClick={() => setUnitAvaliable(true, index)}
                  className="w-1/2 text-[10px] leading-6">
                  available
                </Button>
                <Button
                  type="button"
                  variant={unitList[index].isAvailable ? 'secondary' : 'default'}
                  onClick={() => setUnitAvaliable(false, index)}
                  className="w-1/2 text-[10px] leading-6">
                  unavailable
                </Button>
              </div>
            )}
          </div>
        ),
      },
    ],
    [form, propertyId, unitList, isError, handleFloorPlanImageChange, setUnitAvaliable]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col lg:flex-row justify-center items-start flex-wrap gap-y-[30px] gap-x-5">
          {/* rental amenities */}
          <div className="order-4 xl:order-1 w-full xl:w-[32%] flex flex-col gap-[30px]">
            <div className="order-1 lg:order-1 hidden xl:block">
              <h1 className="text-[28px] font-medium mb-[30px]">
                we need a few information about your property.
              </h1>
              <Separator />
            </div>
            <div className="order-3 lg:order-2 rounded-lg border border-border box-shadow-primary px-[22px] py-6">
              <h1 className="text-[24px] font-medium leading-6">rental amenities</h1>
              <div className="mt-6 flex flex-col lg:flex-row xl:flex-col flex-wrap gap-[10px] lg:gap-6 xl:gap-[10px]">
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
                <div className="mt-[10px] w-full flex gap-3 justify-start items-center">
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
                      <FormItem className="w-full">
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
            {/* Lease duration 1 */}
            <div className="block lg:hidden xl:block order-2 lg:order-3 rounded-lg border border-border box-shadow-primary px-8 py-6">
              <h1 className="text-[23px] font-medium leading-6">lease duration</h1>
              <FormField
                control={form.control}
                name="leaseDuration"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-center items-end gap-4">
                      <FormControl>
                        <Slider
                          defaultValue={[field.value]}
                          onValueChange={(value: number[]) => field.onChange(value[0])}
                          min={1}
                          max={10}
                          step={1}
                          className="mb-4"
                        />
                      </FormControl>
                      <div className="flex flex-col gap-[6px]">
                        <p className="text-[14px] font-medium leading-5">year</p>
                        <p className="w-[42px] h-[36px] flex justify-center items-center rounded-sm border border-[#CBD5E1] text-[rgba(15,23,42,0.50)] text-[14px] leading-5">
                          {field.value}
                        </p>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* lease term & policy */}
            <div className="block lg:hidden xl:block order-4 lg:order-4 rounded-lg border border-border box-shadow-primary px-8 py-6">
              <h1 className="text-[23px] font-medium leading-6">leasing terms & policy</h1>
              <p className="my-3 text-[12px] text-[rgba(0,84,81,0.70)] leading-5">
                For the purpose of having prospect tenants applicants see your leasing agreements &
                policy, please upload this doc so that they may review when applying.
              </p>
              <p
                className={`text-[14px] font-medium leading-5 ${isError('leasingPolicyDoc') ? 'text-red-500' : 'text-primary'}`}>
                upload leasing policy doc (pdf, docx, etc.)*
              </p>
              <FormField
                control={form.control}
                name="leasingPolicyDoc"
                render={() => (
                  <FormItem>
                    <FormLabel className="w-fit flex justify-start items-center gap-6">
                      <span className="cursor-pointer flex justify-center items-center gap-2 mt-2 bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground border border-primary rounded-lg px-4 py-2 text-sm font-semibold leading-5">
                        <UploadIcon className="w-4 h-4" />
                        <span className="text-inherit">
                          {propertyId ? 'upload new doc.' : 'upload'}
                        </span>
                      </span>
                      {leasingPolicyDocName && (
                        <span className="flex justify-start items-end gap-2">
                          <Image
                            src="/assets/icons/pdf.svg"
                            alt="doc"
                            width={16}
                            height={20}
                            className="w-4 h-5"
                          />
                          <span className="text-[13px] text-primary leading-5">
                            {leasingPolicyDocName}
                          </span>
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf,.docx"
                        className="sr-only"
                        onChange={(event: ChangeEvent<HTMLInputElement>) => handleFileChange(event)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          {/* short summary and pricing */}
          <div className="order-2 xl:order-3 w-full lg:w-[46%] xl:w-[32%] flex flex-col gap-[30px]">
            <div className="order-3 lg:order-1 rounded-lg border border-border box-shadow-primary px-8 py-6">
              <h1 className="text-[24px] font-medium leading-6">
                short summary about the property rental
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
            <div className="order-1 lg:order-2 rounded-lg border border-border box-shadow-primary px-[22px] py-6">
              <h1 className="text-[24px] font-medium leading-6">processing fee*</h1>
              <p className="mt-2 text-[8px] leading-3">
                <b>Important, please read:</b> Our payment processor, <u>Stripe</u>, charges a
                processing fee for all ACH transfers, but the good news is that the cap they charge
                to is up to $5.
              </p>
              <p className="text-[8px] leading-3 mt-3">
                With that being said, would you like to charge your tenants that processing fee as
                an extra on top of the rent total or would you like to hide it from the tenant
                checkout UI where that fee is taken from the total of the rent. Again, the cap per
                Stripe’s policy is up to $5 for ACH transfers.
              </p>
              <div className="mt-3 flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="chargeFeeFromRent"
                  render={({ field }) => (
                    <FormItem className="w-fit flex flex-row-reverse justify-start items-start gap-3">
                      <FormLabel>
                        <span className="!text-primary text-[13px] leading-[14px]">
                          charge fee from the rent total (tenant does not see fee during checkout)
                          <FormMessage className="mt-1" />
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(value: boolean) => {
                            form.setValue('chargeFeeAsAddition', false);
                            form.clearErrors('chargeFeeAsAddition');
                            field.onChange(value);
                          }}
                          error={isError('chargeFeeFromRent')}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-start items-center gap-[5px]">
                  <Separator className="w-3" />
                  <p className="text-[13px] leading-[13px]">or</p>
                  <Separator className="w-3" />
                </div>
                <FormField
                  control={form.control}
                  name="chargeFeeAsAddition"
                  render={({ field }) => (
                    <FormItem className="w-fit flex flex-row-reverse justify-start items-start gap-3">
                      <FormLabel>
                        <span className="!text-primary text-[13px] leading-[14px]">
                          charge fee as an addition along with the rent total (tenant sees fee
                          during checkout)
                          <FormMessage className="mt-1" />
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(value: boolean) => {
                            form.setValue('chargeFeeFromRent', false);
                            form.clearErrors('chargeFeeFromRent');
                            field.onChange(value);
                          }}
                          error={isError('chargeFeeAsAddition')}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            {/* Unit List Table */}
            <div className="order-2 lg:order-3 rounded-lg border border-[rgba(0,84,81,0.40)] box-shadow-primary px-[22px] py-6">
              <h1 className="text-[24px] font-medium leading-6">unit list*</h1>
              <div className="mt-2 mb-6">
                <DataTable
                  columns={columns}
                  data={unitList.map(item => ({
                    ...item,
                    unit: item.unit ? item.unit.toString() : undefined,
                  }))}
                  filters={{
                    inputFilterColumnId: 'unit',
                    inputFilterClassName: 'w-[175px]',
                  }}
                  showTableHead={false}
                  showBorders={false}
                  showTableFooter={true}
                  footer={
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        className="mt-3 !p-0 flex gap-3 justify-start items-center"
                        onClick={addMoreUnitItem}
                        disabled={unitList.length === maxUnits}>
                        <span className="w-[30px] h-[30px] rounded-full border-[1.6px] border-primary flex justify-center items-center cursor-pointer">
                          <PlusIcon className="text-primary w-4 h-4" />
                        </span>
                        <p className="text-[15px] font-medium leading-[14px] border-b border-b-primary">
                          add more
                        </p>
                      </Button>
                      <Separator className="mt-6" />
                    </>
                  }
                  TableCellClassName="px-0"
                  showPagination={true}
                  pageSize={3}
                  paginationStyle="sm"
                />
              </div>
              <p className="text-[8px] font-medium leading-3 w-2/5">
                {unitList.length < maxUnits - 1
                  ? `${maxUnits - unitList.length} more slots left`
                  : unitList.length === maxUnits - 1
                    ? '1 slot left'
                    : '0 slot left'}{' '}
                , but you can update plan for more units if you like
              </p>
              <Link href={`/pricing?s=${pathname}`}>
                <Button type="button" variant="outline" className="text-[10px] mt-[5px]">
                  update plan
                </Button>
              </Link>
            </div>
          </div>
          {/* property photos and details */}
          <div className="order-1 xl:order-4 w-full lg:w-[46%] xl:w-[32%] flex flex-col gap-[30px]">
            <div className="-mb-[6px] lg:mb-0 mt-4 lg:mt-0 block xl:hidden">
              <h1 className="text-[28px] font-medium mb-6 lg:mb-[30px]">
                we need a few information about your property.
              </h1>
              <Separator />
            </div>
            <div className="rounded-lg border border-[rgba(0,84,81,0.40)] box-shadow-primary px-[19px] py-6">
              <h1 className="text-[24px] font-medium leading-6">property photos*</h1>
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
                        <span
                          className={`text-[10px] font-medium leading-5 ${isError('img1') ? 'text-white' : 'text-primary'}`}>
                          add
                        </span>
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
                          <span
                            className={`text-[10px] font-medium leading-5 ${isError('img2') ? 'text-white' : 'text-primary'}`}>
                            add
                          </span>
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
                          <span
                            className={`text-[10px] font-medium leading-5 ${isError('img3') ? 'text-white' : 'text-primary'}`}>
                            add
                          </span>
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
              <h1 className="text-[24px] font-medium leading-6">rental info*</h1>
              <div className="mt-6 flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="propertyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-medium leading-5">
                        property name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="enter name"
                          error={isError('propertyName')}
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
            {/* Lease Duration 2 */}
            <div className="hidden lg:block xl:hidden rounded-lg border border-border box-shadow-primary px-8 py-6">
              <h1 className="text-[23px] font-medium leading-6">lease duration</h1>
              <FormField
                control={form.control}
                name="leaseDuration"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-center items-end gap-4">
                      <FormControl>
                        <Slider
                          defaultValue={[field.value]}
                          onValueChange={(value: number[]) => field.onChange(value[0])}
                          min={1}
                          max={10}
                          step={1}
                          className="mb-4"
                        />
                      </FormControl>
                      <div className="flex flex-col gap-[6px]">
                        <p className="text-[14px] font-medium leading-5">year</p>
                        <p className="w-[42px] h-[36px] flex justify-center items-center rounded-sm border border-[#CBD5E1] text-[rgba(15,23,42,0.50)] text-[14px] leading-5">
                          {field.value}
                        </p>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* lease term & policy */}
            <div className="hidden lg:block xl:hidden rounded-lg border border-border box-shadow-primary px-8 py-6">
              <h1 className="text-[23px] font-medium leading-6">leasing terms & policy</h1>
              <p className="my-3 text-[12px] text-[rgba(0,84,81,0.70)] leading-5">
                For the purpose of having prospect tenants applicants see your leasing agreements &
                policy, please upload this doc so that they may review when applying.
              </p>
              <p
                className={`text-[14px] font-medium leading-5 ${isError('leasingPolicyDoc') ? 'text-red-500' : 'text-primary'}`}>
                upload leasing policy doc (pdf, word, etc.)*
              </p>
              <FormField
                control={form.control}
                name="leasingPolicyDoc"
                render={() => (
                  <FormItem>
                    <FormLabel className="w-fit flex justify-start items-center gap-6">
                      <span className="cursor-pointer flex justify-center items-center gap-2 mt-2 bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground border border-primary rounded-lg px-4 py-2 text-sm font-semibold leading-5">
                        <UploadIcon className="w-4 h-4" />
                        <span className="text-inherit">
                          {propertyId ? 'upload new doc.' : 'upload'}
                        </span>
                      </span>
                      {leasingPolicyDocName && (
                        <span className="flex justify-start items-end gap-2">
                          <Image
                            src="/assets/icons/pdf.svg"
                            alt="doc"
                            width={16}
                            height={20}
                            className="w-4 h-5"
                          />
                          <span className="text-[13px] text-primary leading-5">
                            {leasingPolicyDocName}
                          </span>
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="sr-only"
                        onChange={(event: ChangeEvent<HTMLInputElement>) => handleFileChange(event)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                    <span className="!text-primary text-[13px] leading-[14px]">
                      I acknowledge that I am going to receive a 1099 form if I make $600 or more
                      during the entire year. <br />
                      <span className="mt-1 flex justify-start items-start gap-1">
                        <span className="text-primary text-[13px] leading-[14px]">•</span>
                        <span className="text-primary text-[13px] leading-[14px]">
                          please read about tax faqs.
                        </span>
                      </span>
                      <FormMessage className="mt-1" />
                    </span>
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
            update property
          </Button>
        ) : (
          <Button type="submit" className="mt-8 w-[280px] h-9 leading-6" isLoading={loading}>
            add new property
          </Button>
        )}
        {resError && <p className="text-sm font-medium text-destructive mt-2">{resError}</p>}
      </form>
    </Form>
  );
};

export default AddPropertyForm;
