'use server';

import { cookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';
import axios from 'axios';

import { Promo, PromoType } from '@/types';

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

export const CreatePromo = async (payload: {
  code: string;
  type: PromoType;
  discount: number;
  applicableOn: 'workspace' | 'property';
}): Promise<
  | {
      data: {
        promo: Promo;
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
    const response = await axios.post(`${backendUrl}/api/v2/promo/create`, payload, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return { data: { promo: response.data.promo } };
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

export const UpdatePromo = async (
  payload: Promo
): Promise<
  | {
      data: {
        promo: Promo;
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
    const response = await axios.put(`${backendUrl}/api/v2/promo/update/${payload._id}`, payload, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return { data: { promo: response.data.promo } };
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

export const GetAllPromos = async (): Promise<
  | {
      data: {
        promos: Promo[];
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
    const response = await axios.get(`${backendUrl}/api/v2/promo/all`, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return { data: { promos: response.data.promos } };
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

export const FindPromoByCode = async (payload: {
  code: string;
}): Promise<
  | {
      data: {
        promo: Promo;
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
    const response = await axios.get(`${backendUrl}/api/v2/promo/find/${payload.code}`, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return { data: { promo: response.data.promo } };
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

export const GetHostPromos = async (payload: {
  hostId: string;
}): Promise<
  | {
      data: {
        promos: Promo[];
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
    const response = await axios.get(`${backendUrl}/api/v2/promo/all/host/${payload.hostId}`, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return { data: { promos: response.data.promos } };
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

export const DeletePromo = async (payload: {
  promoId: string;
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
    const response = await axios.delete(`${backendUrl}/api/v2/promo/delete/${payload.promoId}`, {
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
