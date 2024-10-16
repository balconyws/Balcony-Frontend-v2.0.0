'use server';

import { cookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';
import axios from 'axios';

import { Booking, OrderStatus, PromoType, Sort } from '@/types';

const getCookies = () => {
  const allCookies = cookies().getAll();
  const cookieHeader = allCookies
    .map(cookie => `${cookie.name}=${encodeURIComponent(cookie.value)}`)
    .join('; ');
  return cookieHeader
    ? {
        Cookie: cookieHeader,
      }
    : {};
};

const setCookies = (setCookieHeader: string[] | undefined) => {
  if (setCookieHeader) {
    setCookieHeader.forEach(cookieString => {
      const cookieParts = cookieString.split('; ');
      const [cookiePair] = cookieParts;
      const [key, value] = cookiePair.split('=');
      const cookieOptions: any = {
        httpOnly: false,
        path: '/',
      };
      cookieParts.slice(1).forEach(attribute => {
        const [attrKey, attrValue] = attribute.split('=');
        switch (attrKey.toLowerCase()) {
          case 'path':
            cookieOptions.path = attrValue;
            break;
          case 'expires':
            cookieOptions.expires = new Date(attrValue);
            break;
          case 'httponly':
            cookieOptions.httpOnly = true;
            break;
          case 'samesite':
            cookieOptions.sameSite = attrValue;
            break;
        }
      });
      // Set the cookie using the extracted key, value, and options
      cookies().set({
        name: key,
        value: decodeURIComponent(value),
        ...cookieOptions,
      });
    });
  }
};

const redirectToError = (message: string, status: number) => {
  if (
    message.includes('user account is currently inactive') ||
    message.includes('cannot access this resource') ||
    message.includes('not authorized to update this') ||
    message.includes('please login to continue')
  ) {
    return redirect(
      `/error?error=${encodeURIComponent(message)}&code=${status}`,
      RedirectType.replace
    );
  }
  return null;
};

export const CreateBooking = async (payload: {
  workspaceId: string;
  startDate: string;
  endDate: string;
  promoCode?: string;
}): Promise<
  | {
      data: {
        success: boolean;
      };
    }
  | { error: { key: string; message: string } }
> => {
  try {
    if (!process.env.BACKEND_URL) {
      throw new Error('process.env.BACKEND_URL is required');
    }
    const backendUrl = process.env.BACKEND_URL;
    const headers = getCookies();
    const response = await axios.post(`${backendUrl}/api/v2/booking/create`, payload, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return { data: { success: response.data.success } };
    }
    return { error: { key: '', message: response.data.message } };
  } catch (error: any) {
    if (error.response && error.response.data) {
      setCookies(error.response.headers['set-cookie']);
      const { data } = error.response;
      let message = '';
      if (data.message) {
        message = data.message;
      }
      redirectToError(message, error.response.status);
      const key = message.includes('promo') ? 'promoCode' : '';
      return { error: { key, message } };
    }
    return { error: { key: '', message: error.message.toLowerCase() } };
  }
};

export const AcceptBooking = async (payload: {
  bookingId: string;
}): Promise<
  | {
      data: {
        success: boolean;
      };
    }
  | { error: { key: string; message: string } }
> => {
  try {
    if (!process.env.BACKEND_URL) {
      throw new Error('process.env.BACKEND_URL is required');
    }
    const backendUrl = process.env.BACKEND_URL;
    const headers = getCookies();
    const response = await axios.get(`${backendUrl}/api/v2/booking/accept/${payload.bookingId}`, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return { data: { success: response.data.success } };
    }
    return { error: { key: '', message: response.data.message } };
  } catch (error: any) {
    if (error.response && error.response.data) {
      setCookies(error.response.headers['set-cookie']);
      const { data } = error.response;
      let message = '';
      if (data.message) {
        message = data.message;
      }
      redirectToError(message, error.response.status);
      return { error: { key: '', message } };
    }
    return { error: { key: '', message: error.message.toLowerCase() } };
  }
};

export const RejectBooking = async (payload: {
  bookingId: string;
}): Promise<
  | {
      data: {
        success: boolean;
      };
    }
  | { error: { key: string; message: string } }
> => {
  try {
    if (!process.env.BACKEND_URL) {
      throw new Error('process.env.BACKEND_URL is required');
    }
    const backendUrl = process.env.BACKEND_URL;
    const headers = getCookies();
    const response = await axios.get(`${backendUrl}/api/v2/booking/reject/${payload.bookingId}`, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return { data: { success: response.data.success } };
    }
    return { error: { key: '', message: response.data.message } };
  } catch (error: any) {
    if (error.response && error.response.data) {
      setCookies(error.response.headers['set-cookie']);
      const { data } = error.response;
      let message = '';
      if (data.message) {
        message = data.message;
      }
      redirectToError(message, error.response.status);
      return { error: { key: '', message } };
    }
    return { error: { key: '', message: error.message.toLowerCase() } };
  }
};

export const GetAllBookings = async (payload?: {
  query?: object;
  page?: number;
  limit?: number;
  sort?: Sort;
  select?: string;
  includeWorkspace?: boolean;
  includeHost?: boolean;
}): Promise<
  | {
      data: {
        totalDocuments: number;
        totalPages: number | null;
        currentPage: number | null;
        limit: number | null;
        skip: number | null;
        result: Booking[];
      };
    }
  | { error: { key: string; message: string } }
> => {
  try {
    if (!process.env.BACKEND_URL) {
      throw new Error('process.env.BACKEND_URL is required');
    }
    const backendUrl = process.env.BACKEND_URL;
    const headers = getCookies();
    const params: URLSearchParams = new URLSearchParams();
    if (payload) {
      if (payload.query) {
        params.append('query', JSON.stringify(payload.query));
      }
      if (payload.page !== undefined) {
        params.append('page', payload.page.toString());
      }
      if (payload.limit !== undefined) {
        params.append('limit', payload.limit.toString());
      }
      if (payload.sort !== undefined) {
        params.append('sort', payload.sort);
      }
      if (payload.select !== undefined) {
        params.append('select', payload.select);
      }
      if (payload.includeWorkspace !== undefined) {
        params.append('includeWorkspace', String(payload.includeWorkspace));
      }
      if (payload.includeHost !== undefined) {
        params.append('includeHost', String(payload.includeHost));
      }
    }
    const response = await axios.get(`${backendUrl}/api/v2/booking/all?${params.toString()}`, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return { data: response.data };
    }
    return { error: { key: '', message: response.data.message } };
  } catch (error: any) {
    if (error.response && error.response.data) {
      setCookies(error.response.headers['set-cookie']);
      const { data } = error.response;
      let message = '';
      if (data.message) {
        message = data.message;
      }
      redirectToError(message, error.response.status);
      return { error: { key: '', message } };
    }
    return { error: { key: '', message: error.message.toLowerCase() } };
  }
};

export const GetUserBookings = async (payload?: {
  status?: OrderStatus | OrderStatus[];
}): Promise<
  | {
      data: {
        bookings: Booking[];
      };
    }
  | { error: { key: string; message: string } }
> => {
  try {
    if (!process.env.BACKEND_URL) {
      throw new Error('process.env.BACKEND_URL is required');
    }
    const backendUrl = process.env.BACKEND_URL;
    const headers = getCookies();
    const params: URLSearchParams = new URLSearchParams();
    if (payload) {
      if (payload.status) {
        params.append('status', JSON.stringify(payload.status));
      }
    }
    const response = await axios.get(`${backendUrl}/api/v2/booking/me?${params.toString()}`, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return { data: { bookings: response.data.bookings } };
    }
    return { error: { key: '', message: response.data.message } };
  } catch (error: any) {
    if (error.response && error.response.data) {
      setCookies(error.response.headers['set-cookie']);
      const { data } = error.response;
      let message = '';
      if (data.message) {
        message = data.message;
      }
      redirectToError(message, error.response.status);
      return { error: { key: '', message } };
    }
    return { error: { key: '', message: error.message.toLowerCase() } };
  }
};

export const GetHostBookings = async (payload: {
  hostId: string;
  status?: OrderStatus | OrderStatus[];
}): Promise<
  | {
      data: {
        bookings: Booking[];
      };
    }
  | { error: { key: string; message: string } }
> => {
  try {
    if (!process.env.BACKEND_URL) {
      throw new Error('process.env.BACKEND_URL is required');
    }
    const backendUrl = process.env.BACKEND_URL;
    const headers = getCookies();
    const params: URLSearchParams = new URLSearchParams();
    if (payload) {
      if (payload.status) {
        params.append('status', JSON.stringify(payload.status));
      }
    }
    const response = await axios.get(
      `${backendUrl}/api/v2/booking/all/host/${payload.hostId}?${params.toString()}`,
      {
        headers,
        withCredentials: true,
      }
    );
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return { data: { bookings: response.data.bookings } };
    }
    return { error: { key: '', message: response.data.message } };
  } catch (error: any) {
    if (error.response && error.response.data) {
      setCookies(error.response.headers['set-cookie']);
      const { data } = error.response;
      let message = '';
      if (data.message) {
        message = data.message;
      }
      redirectToError(message, error.response.status);
      return { error: { key: '', message } };
    }
    return { error: { key: '', message: error.message.toLowerCase() } };
  }
};

export const GetBookedDates = async (): Promise<
  | {
      data: {
        dates: string[];
      };
    }
  | { error: { key: string; message: string } }
> => {
  try {
    if (!process.env.BACKEND_URL) {
      throw new Error('process.env.BACKEND_URL is required');
    }
    const backendUrl = process.env.BACKEND_URL;
    const headers = getCookies();
    const response = await axios.get(`${backendUrl}/api/v2/booking/booked-dates`, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return { data: { dates: response.data.dates } };
    }
    return { error: { key: '', message: response.data.message } };
  } catch (error: any) {
    if (error.response && error.response.data) {
      setCookies(error.response.headers['set-cookie']);
      const { data } = error.response;
      let message = '';
      if (data.message) {
        message = data.message;
      }
      redirectToError(message, error.response.status);
      return { error: { key: '', message } };
    }
    return { error: { key: '', message: error.message.toLowerCase() } };
  }
};

export const FindBookingById = async (payload: {
  bookingId: string;
}): Promise<
  | {
      data: {
        booking: Booking;
      };
    }
  | { error: { key: string; message: string } }
> => {
  try {
    if (!process.env.BACKEND_URL) {
      throw new Error('process.env.BACKEND_URL is required');
    }
    const backendUrl = process.env.BACKEND_URL;
    const headers = getCookies();
    const response = await axios.get(`${backendUrl}/api/v2/booking/find/${payload.bookingId}`, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return { data: { booking: response.data.booking } };
    }
    return { error: { key: '', message: response.data.message } };
  } catch (error: any) {
    if (error.response && error.response.data) {
      setCookies(error.response.headers['set-cookie']);
      const { data } = error.response;
      let message = '';
      if (data.message) {
        message = data.message;
      }
      redirectToError(message, error.response.status);
      return { error: { key: '', message } };
    }
    return { error: { key: '', message: error.message.toLowerCase() } };
  }
};

export const RefundBooking = async (payload: {
  bookingId: string;
  amount: number;
  type: PromoType;
}): Promise<
  | {
      data: {
        success: boolean;
      };
    }
  | { error: { key: string; message: string } }
> => {
  try {
    if (!process.env.BACKEND_URL) {
      throw new Error('process.env.BACKEND_URL is required');
    }
    const backendUrl = process.env.BACKEND_URL;
    const headers = getCookies();
    const response = await axios.post(`${backendUrl}/api/v2/booking/refund`, payload, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return { data: { success: response.data.success } };
    }
    return { error: { key: '', message: response.data.message } };
  } catch (error: any) {
    if (error.response && error.response.data) {
      setCookies(error.response.headers['set-cookie']);
      const { data } = error.response;
      let message = '';
      if (data.message) {
        message = data.message;
      }
      redirectToError(message, error.response.status);
      const key = message.includes('amount')
        ? 'refundAmount'
        : message.includes('type')
          ? 'type'
          : '';
      return { error: { key, message } };
    }
    return { error: { key: '', message: error.message.toLowerCase() } };
  }
};

export const CancelBookingByHost = async (payload: {
  bookingId: string;
}): Promise<
  | {
      data: {
        success: boolean;
      };
    }
  | { error: { key: string; message: string } }
> => {
  try {
    if (!process.env.BACKEND_URL) {
      throw new Error('process.env.BACKEND_URL is required');
    }
    const backendUrl = process.env.BACKEND_URL;
    const headers = getCookies();
    const response = await axios.get(
      `${backendUrl}/api/v2/booking/host/cancel/${payload.bookingId}`,
      {
        headers,
        withCredentials: true,
      }
    );
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return { data: { success: response.data.success } };
    }
    return { error: { key: '', message: response.data.message } };
  } catch (error: any) {
    if (error.response && error.response.data) {
      setCookies(error.response.headers['set-cookie']);
      const { data } = error.response;
      let message = '';
      if (data.message) {
        message = data.message;
      }
      redirectToError(message, error.response.status);
      return { error: { key: '', message } };
    }
    return { error: { key: '', message: error.message.toLowerCase() } };
  }
};

export const CancelBookingByUser = async (payload: {
  bookingId: string;
}): Promise<
  | {
      data: {
        success: boolean;
      };
    }
  | { error: { key: string; message: string } }
> => {
  try {
    if (!process.env.BACKEND_URL) {
      throw new Error('process.env.BACKEND_URL is required');
    }
    const backendUrl = process.env.BACKEND_URL;
    const headers = getCookies();
    const response = await axios.get(
      `${backendUrl}/api/v2/booking/user/cancel/${payload.bookingId}`,
      {
        headers,
        withCredentials: true,
      }
    );
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return { data: { success: response.data.success } };
    }
    return { error: { key: '', message: response.data.message } };
  } catch (error: any) {
    if (error.response && error.response.data) {
      setCookies(error.response.headers['set-cookie']);
      const { data } = error.response;
      let message = '';
      if (data.message) {
        message = data.message;
      }
      redirectToError(message, error.response.status);
      return { error: { key: '', message } };
    }
    return { error: { key: '', message: error.message.toLowerCase() } };
  }
};
