import {
  format,
  isYesterday,
  isToday,
  eachDayOfInterval,
  getDay,
  differenceInCalendarDays,
  isBefore,
  parseISO,
} from 'date-fns';

import { DaysInWeek, Workspace } from '@/types';
import { capitalizeWords, data } from '.';

export const formatDate = (date: Date): string => {
  if (isToday(date)) {
    return format(date, 'hh:mm a');
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  return format(date, 'dd/MM/yyyy');
};

export const formatTimeRange = (startTime: string, endTime: string, timeZone: string): string => {
  const format12Hour = (time: string) => {
    const [hour] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour} ${period}`;
  };
  return `${format12Hour(startTime)} - ${format12Hour(endTime)} ${timeZone.toUpperCase()}`;
};

export const formatWorkspaceTimes = (workspace: Workspace, timeZone: string): string[] => {
  const formattedTimes = data.daysOfWeek.map(day => {
    const dayTime = workspace.times[day as keyof typeof workspace.times];
    if (dayTime?.startTime && dayTime?.endTime) {
      return `${formatTimeRange(dayTime.startTime, dayTime.endTime, timeZone)} ${capitalizeWords(day)}`;
    }
    return null;
  });
  // Filter out null values and return the array of formatted times
  return formattedTimes.filter(Boolean) as string[];
};

// getDay returns an integer from 0 (Sunday) to 6 (Saturday)
export const getDayOfWeek = (date: Date): DaysInWeek => data.daysOfWeek[getDay(date)];

export const areSelectedDaysAvailable = (
  selectedDates: {
    from: Date;
    to: Date;
  },
  serviceHours: Workspace['times']
): boolean => {
  const daysInRange = eachDayOfInterval({ start: selectedDates.from, end: selectedDates.to });
  for (const day of daysInRange) {
    const dayName = getDayOfWeek(day);
    // Check if the day is present in the service hours
    if (!serviceHours[dayName]?.startTime || !serviceHours[dayName]?.endTime) {
      return false; // Day is not available if it doesn't exist or has no time slots
    }
  }
  return true; // All days are within the service hours
};

export const getNumberOfDays = (from: Date, to: Date): number =>
  differenceInCalendarDays(new Date(to), new Date(from)) + 1;

export const getStartAndEndTime = (
  selectedDates: { from: Date; to: Date },
  time: Workspace['times'],
  timeZone: string
) => {
  const firstDayOfWeek = getDayOfWeek(new Date(selectedDates.from));
  const lastDayOfWeek = getDayOfWeek(new Date(selectedDates.to));
  const startTime = time[firstDayOfWeek as keyof Workspace['times']]?.startTime;
  const endTime = time[lastDayOfWeek as keyof Workspace['times']]?.endTime;
  if (startTime && endTime) {
    return formatTimeRange(startTime, endTime, timeZone);
  }
};

export const formatDateRange = (from: Date, to: Date): string => {
  const startDate = format(from, 'MMMM do'); // "June 8th"
  const endDate = format(to, 'do'); // "16th"
  return `${startDate} - ${endDate}`;
};

export const isRentPaid = (leaseEndDate?: string, lastPaymentDate?: string): boolean => {
  if (!leaseEndDate) {
    return false;
  }
  const leaseEndDateParsed = parseISO(leaseEndDate);
  const currentDate = new Date();
  const isLeaseActive = isBefore(currentDate, leaseEndDateParsed);
  // Check if the last payment date is undefined or before the lease end date
  const isPaymentPending =
    !lastPaymentDate || isBefore(parseISO(lastPaymentDate), leaseEndDateParsed);
  return isLeaseActive && isPaymentPending;
};
