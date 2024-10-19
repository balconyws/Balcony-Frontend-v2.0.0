'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { ChevronDownIcon } from 'lucide-react';

import { Navigation } from '@/contexts';
import { Booking, Tenant } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  ticketActions,
  bookingActions,
  tenantActions,
  useAppDispatch,
  ticketSlice,
  bookingSlice,
  tenantSlice,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Props = {
  ticketId?: string;
};

const AddTicketRequestForm: React.FC<Props> = ({ ticketId }: Props) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(ticketSlice.selectTicket);
  const { inProgress } = useAppSelector(bookingSlice.selectBooking);
  const { renting } = useAppSelector(tenantSlice.selectTenant);
  const { popFromStack } = Navigation.useNavigation();
  const [resError, setResError] = useState<string>('');
  const [uniqueWorkspaces, setUniqueWorkspaces] = useState<Booking[]>([]);
  const [uniqueProperties, setUniqueProperties] = useState<Tenant[]>([]);

  useEffect(() => {
    if (!ticketId) {
      dispatch(bookingActions.getUserInProgressBookings());
      dispatch(tenantActions.getUserAsTenants({ status: 'renting' }));
    }
  }, [dispatch, ticketId]);

  useEffect(() => {
    if (!ticketId && inProgress) {
      const workspaces = new Set();
      const unique = inProgress.filter(booking => {
        if (!workspaces.has(booking.workspace._id)) {
          workspaces.add(booking.workspace._id);
          return true;
        }
        return false;
      });
      setUniqueWorkspaces(unique);
    }
  }, [inProgress, ticketId]);

  useEffect(() => {
    if (!ticketId && renting) {
      const properties = new Set();
      const unique = renting.filter(tenant => {
        const propertyId = tenant.selectedUnit.property._id;
        if (!properties.has(propertyId)) {
          properties.add(propertyId);
          return true;
        }
        return false;
      });
      setUniqueProperties(unique);
    }
  }, [renting, ticketId]);

  const formSchema = z
    .object({
      request: z.string().min(10, { message: 'Write a few words' }),
      workspaceId: z.string().optional(),
      propertyId: z.string().optional(),
    })
    .refine(
      data => {
        if (ticketId) {
          return true;
        }
        if (uniqueWorkspaces.length === 0 && uniqueProperties.length === 0) {
          return false;
        }
        if (uniqueWorkspaces.length > 0 && uniqueProperties.length > 0) {
          return data.workspaceId || data.propertyId;
        }
        if (uniqueWorkspaces.length > 0) {
          return data.workspaceId && !data.propertyId;
        }
        if (uniqueProperties.length > 0) {
          return data.propertyId && !data.workspaceId;
        }
        return true;
      },
      {
        message:
          uniqueWorkspaces.length === 0 && uniqueProperties.length === 0
            ? 'either workspace or property is required'
            : uniqueWorkspaces.length > 0 && uniqueProperties.length === 0
              ? 'workspace is required.'
              : uniqueProperties.length > 0 && uniqueWorkspaces.length === 0
                ? 'property is required.'
                : 'either workspace or property is required',
        path:
          uniqueWorkspaces.length === 0 && uniqueProperties.length === 0
            ? ['request']
            : uniqueWorkspaces.length > 0 && uniqueProperties.length === 0
              ? ['workspaceId']
              : uniqueProperties.length > 0 && uniqueWorkspaces.length === 0
                ? ['propertyId']
                : ['propertyId'],
      }
    )
    .refine(
      data => {
        if (!ticketId && data.workspaceId && data.propertyId) {
          return false;
        }
        return true;
      },
      {
        message: 'only one of workspace or property is allowed',
        path: ['workspaceId'],
      }
    );

  type formSchema = z.infer<typeof formSchema>;

  const form = useForm<formSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      request: '',
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
      dispatch(ticketSlice.clearError());
    }
  }, [dispatch, error, form]);

  const onSubmit: SubmitHandler<formSchema> = async (data: formSchema) => {
    setResError('');
    if (ticketId) {
      await waitForDispatch(
        dispatch,
        ticketActions.replyTicket({
          context: data.request,
          ticketId,
        }),
        state => {
          const { error } = state.ticket;
          if (error) {
            setResError(error.message);
          }
        }
      );
    } else {
      await waitForDispatch(
        dispatch,
        ticketActions.createTicket({
          context: data.request,
          workspaceId: data.workspaceId,
          propertyId: data.propertyId,
        }),
        state => {
          const { isFailed } = state.ticket;
          if (!isFailed) {
            popFromStack();
          }
        }
      );
    }
    form.reset();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="p-6 flex flex-col gap-6 rounded-lg border border-[rgba(0,84,81,0.40)] box-shadow-primary">
        <h1 className="text-[24px] font-medium leading-6">support context</h1>
        <FormField
          control={form.control}
          name="request"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  {...field}
                  error={isError('request')}
                  placeholder="Type your summary here.."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!ticketId && (
          <>
            {uniqueWorkspaces.length > 0 && (
              <FormField
                control={form.control}
                name="workspaceId"
                render={({ field: { name, value, onChange } }) => (
                  <FormItem>
                    <FormLabel className="text-[14px] font-medium leading-5 mb-[6px]">
                      select workspace
                    </FormLabel>
                    <Select name={name} value={value} onValueChange={onChange}>
                      <FormControl>
                        <SelectTrigger
                          error={isError('workspaceId')}
                          className="w-full rounded-sm border text-[14px] leading-5 h-[37.6px] border-[#CBD5E1] text-[rgba(15,23,42,0.50)]"
                          icon={<ChevronDownIcon className="text-primary opacity-50 h-4 w-4" />}>
                          <SelectValue placeholder="select workspace" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {uniqueWorkspaces.map(w => (
                          <SelectItem key={w.workspace._id} value={w.workspace._id}>
                            {w.workspace.info.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {uniqueProperties.length > 0 && (
              <FormField
                control={form.control}
                name="propertyId"
                render={({ field: { name, value, onChange } }) => (
                  <FormItem>
                    <FormLabel className="text-[14px] font-medium leading-5 mb-[6px]">
                      select property
                    </FormLabel>
                    <Select name={name} value={value} onValueChange={onChange}>
                      <FormControl>
                        <SelectTrigger
                          error={isError('propertyId')}
                          className="w-full rounded-sm border text-[14px] leading-5 h-[37.6px] border-[#CBD5E1] text-[rgba(15,23,42,0.50)]"
                          icon={<ChevronDownIcon className="text-primary opacity-50 h-4 w-4" />}>
                          <SelectValue placeholder="select property" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {uniqueProperties.map(p => (
                          <SelectItem
                            key={p.selectedUnit.property._id}
                            value={p.selectedUnit.property._id}>
                            {p.selectedUnit.property.info.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )}
        {resError && <p className="text-[10px] font-medium text-destructive">{resError}</p>}
        <Button type="submit" className="px-5 leading-6 font-medium h-9" isLoading={loading}>
          add to request
        </Button>
      </form>
    </Form>
  );
};

export default AddTicketRequestForm;
