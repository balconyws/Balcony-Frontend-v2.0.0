'use server';

import { cookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';
import axios from 'axios';

import { Ticket } from '@/types';

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
    message.includes('not authorized') ||
    message.includes('please login to continue')
  ) {
    return redirect(
      `/error?error=${encodeURIComponent(message)}&code=${status}`,
      RedirectType.replace
    );
  }
  return null;
};

export const CreateTicket = async (payload: {
  context: string;
  workspaceId?: string;
  propertyId?: string;
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
    const response = await axios.post(`${backendUrl}/api/v2/ticket/create`, payload, {
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

export const ReplyTicket = async (payload: {
  ticketId: string;
  context: string;
}): Promise<
  | {
      data: {
        reply: Ticket['conversation'];
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
    const response = await axios.post(`${backendUrl}/api/v2/ticket/reply`, payload, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return { data: { reply: response.data.reply } };
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

export const GetAllTickets = async (): Promise<
  | {
      data: {
        tickets: Ticket[];
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
    const response = await axios.get(`${backendUrl}/api/v2/ticket/all`, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return { data: { tickets: response.data.tickets } };
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

export const CloseTicket = async (payload: {
  ticketId: string;
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
    const response = await axios.get(`${backendUrl}/api/v2/ticket/close/${payload.ticketId}`, {
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
