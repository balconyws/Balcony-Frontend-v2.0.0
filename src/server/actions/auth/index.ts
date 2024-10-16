'use server';

import { cookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';
import axios from 'axios';

import { NextAuth } from '@/config';
import { SignupCredentials, SocialAuthCredentials, User, VerifyCredentials } from '@/types';

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
    message.includes('not authorized to update this')
  ) {
    return redirect(
      `/error?error=${encodeURIComponent(message)}&code=${status}`,
      RedirectType.replace
    );
  }
  return null;
};

export const Signup = async (
  credentials: SignupCredentials
): Promise<
  | {
      data: {
        expiryTime: number;
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
    const response = await axios.post(`${backendUrl}/api/v2/auth/register`, credentials, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return {
        data: { expiryTime: response.data.expiryTime },
      };
    }
    return { error: { key: '', message: response.data.message } };
  } catch (error: any) {
    if (error.response && error.response.data) {
      const { data } = error.response;
      let message = '';
      if (data.message) {
        message = data.message;
      }
      const key = message.includes('first name')
        ? 'firstname'
        : message.includes('last name')
          ? 'lastname'
          : message.includes('email')
            ? 'email'
            : message.includes('phone')
              ? 'phone'
              : message.includes('password')
                ? 'password'
                : '';
      return { error: { key, message } };
    }
    return { error: { key: '', message: error.message.toLowerCase() } };
  }
};

export const ResendOtp = async (): Promise<
  | {
      data: {
        email: string;
        phone: string;
        expiryTime: number;
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
    const response = await axios.get(`${backendUrl}/api/v2/auth/resend-otp?reset=false`, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return {
        data: {
          email: response.data.email,
          phone: response.data.phone,
          expiryTime: response.data.expiryTime,
        },
      };
    }
    return { error: { key: '', message: response.data.message } };
  } catch (error: any) {
    if (error.response && error.response.data) {
      const { data } = error.response;
      let message = '';
      if (data.message) {
        message = data.message;
      }
      return { error: { key: '', message } };
    }
    return { error: { key: '', message: error.messag } };
  }
};

export const OtpStatus = async (): Promise<
  | {
      data: {
        expiryTime: number;
        message: string;
        attempts: number;
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
    const response = await axios.get(`${backendUrl}/api/v2/auth/otp-status`, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return {
        data: {
          expiryTime: response.data.expiryTime,
          message: response.data.message,
          attempts: response.data.attempts,
        },
      };
    }
    return { error: { key: '', message: response.data.message } };
  } catch (error: any) {
    if (error.response && error.response.data) {
      const { data } = error.response;
      let message = '';
      if (data.message) {
        message = data.message;
      }
      return { error: { key: '', message } };
    }
    return { error: { key: '', message: error.message.toLowerCase() } };
  }
};

export const Verify = async (
  credentials: VerifyCredentials
): Promise<
  | {
      data:
        | { success: boolean }
        | {
            token: string;
            user: User;
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
    const response = await axios.post(`${backendUrl}/api/v2/auth/verify`, credentials, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      if (response.status === 200 && response.data.message === 'ok') {
        return { data: { success: true } };
      }
      return { data: { token: response.data.token, user: response.data.user } };
    }
    return { error: { key: '', message: response.data.message } };
  } catch (error: any) {
    if (error.response && error.response.data) {
      const { data } = error.response;
      let message = '';
      if (data.message) {
        message = data.message;
      }
      return { error: { key: 'passCode', message } };
    }
    return { error: { key: '', message: error.message.toLowerCase() } };
  }
};

export const Signin = async (credentials: {
  email: string;
  phone: string;
  password: string;
}): Promise<
  | {
      data: {
        token: string;
        user: User;
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
    const response = await axios.post(`${backendUrl}/api/v2/auth/login`, credentials, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return { data: { token: response.data.token, user: response.data.user } };
    }
    return { error: { key: '', message: response.data.message } };
  } catch (error: any) {
    if (error.response && error.response.data) {
      const { data } = error.response;
      let message = '';
      if (data.message) {
        message = data.message;
      }
      const key =
        message.includes('email') || message.includes('phone')
          ? 'emailOrPhone'
          : message.includes('password')
            ? 'password'
            : '';
      return { error: { key, message } };
    }
    return { error: { key: '', message: error.message.toLowerCase() } };
  }
};

export const SigninWithGoogle = async (redirectTo?: string) =>
  await NextAuth.signIn('google', { redirectTo: `/social-auth?to=${redirectTo}` });

export const SigninWithFacebook = async (redirectTo?: string) =>
  await NextAuth.signIn('facebook', { redirectTo: `/social-auth?to=${redirectTo}` });

export const SocialAuth = async (
  credentials: SocialAuthCredentials
): Promise<
  | {
      data: {
        token: string;
        user: User;
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
    const response = await axios.post(`${backendUrl}/api/v2/auth/social-auth`, credentials, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return { data: { token: response.data.token, user: response.data.user } };
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

export const ForgotPassword = async (credentials: {
  email: string;
  phone: string;
}): Promise<
  | {
      data: {
        expiryTime: number;
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
    const response = await axios.post(`${backendUrl}/api/v2/auth/forgot-password`, credentials, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return {
        data: { expiryTime: response.data.expiryTime },
      };
    }
    return { error: { key: '', message: response.data.message } };
  } catch (error: any) {
    if (error.response && error.response.data) {
      const { data } = error.response;
      let message = '';
      if (data.message) {
        message = data.message;
      }
      const key = message.includes('email') || message.includes('phone') ? 'emailOrPhone' : '';
      return { error: { key, message } };
    }
    return { error: { key: '', message: error.message.toLowerCase() } };
  }
};

export const UpdatePassword = async (credentials: {
  password: string;
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
    const response = await axios.put(`${backendUrl}/api/v2/auth/update-password`, credentials, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success && response.data.message === 'ok') {
      setCookies(response.headers['set-cookie']);
      return {
        data: { success: true },
      };
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
      const key = message.includes('password') ? 'password' : '';
      return { error: { key, message } };
    }
    return { error: { key: '', message: error.message.toLowerCase() } };
  }
};

export const ReAuthenticate = async (): Promise<
  | {
      data: {
        token: string;
        user: User;
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
    const response = await axios.get(`${backendUrl}/api/v2/auth/reauthenticate`, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return { data: { token: response.data.token, user: response.data.user } };
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
      return { error: { key: '', message } };
    }
    return { error: { key: '', message: error.message.toLowerCase() } };
  }
};

export const Logout = async (): Promise<
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
    const response = await axios.get(`${backendUrl}/api/v2/auth/logout`, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success && response.data.message === 'ok') {
      setCookies(response.headers['set-cookie']);
      return { data: { success: true } };
    }
    return { error: { key: '', message: response.data.message } };
  } catch (error: any) {
    if (error.response && error.response.data) {
      const { data } = error.response;
      let message = '';
      if (data.message) {
        message = data.message;
      }
      return { error: { key: '', message } };
    }
    return { error: { key: '', message: error.message.toLowerCase() } };
  }
};
