'use server';

import { cookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';
import axios from 'axios';

import { decrypt } from '@/hash/server';
import {
  BankAccountDetail,
  HostTenantsType,
  PaymentType,
  Sort,
  Status,
  Tenant,
  UserAsTenantType,
} from '@/types';

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

export const ApplyForTenancy = async (payload: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  selectedUnitId: string;
  moveInRequest: string;
  socialSecurityNo?: string;
  note?: string;
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
    const response = await axios.post(`${backendUrl}/api/v2/tenant/apply`, payload, {
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
      const key = message.includes('first name')
        ? 'firstname'
        : message.includes('last name')
          ? 'lastname'
          : message.includes('email')
            ? 'email'
            : message.includes('phone')
              ? 'phone'
              : message.includes('unit')
                ? 'selectedUnitId'
                : message.includes('move in request')
                  ? 'moveInRequest'
                  : message.includes('security number')
                    ? 'socialSecurityNo'
                    : message.includes('note')
                      ? 'note'
                      : '';
      return { error: { key, message } };
    }
    return { error: { key: '', message: error.message.toLowerCase() } };
  }
};

export const UpdateTenant = async (payload: {
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  selectedUnitId: string;
  moveInRequest: string;
  socialSecurityNo?: string;
  note?: string;
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
    const response = await axios.put(
      `${backendUrl}/api/v2/tenant/update/${payload.tenantId}`,
      payload,
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
      const key = message.includes('first name')
        ? 'firstname'
        : message.includes('last name')
          ? 'lastname'
          : message.includes('email')
            ? 'email'
            : message.includes('phone')
              ? 'phone'
              : message.includes('unit')
                ? 'selectedUnitId'
                : message.includes('move in request')
                  ? 'moveInRequest'
                  : message.includes('security number')
                    ? 'socialSecurityNo'
                    : message.includes('note')
                      ? 'note'
                      : '';
      return { error: { key, message } };
    }
    return { error: { key: '', message: error.message.toLowerCase() } };
  }
};

export const UpdateStatus = async (paylaod: {
  tenantId: string;
  status: Status;
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
    const response = await axios.put(
      `${backendUrl}/api/v2/tenant/update-status/${paylaod.tenantId}`,
      { status: paylaod.status },
      {
        headers,
        withCredentials: true,
      }
    );
    if (response && response.data && response.data.success && response.data.message === 'ok') {
      setCookies(response.headers['set-cookie']);
      return { data: { success: true } };
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

export const ApproveTenant = async (payload: {
  tenantId: string;
  leaseStartDate: string;
  leaseEndDate: string;
  securityDepositFee?: number;
  isSameAsRent?: boolean;
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
    const response = await axios.put(
      `${backendUrl}/api/v2/tenant/approve/${payload.tenantId}`,
      payload,
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
      const key = message.includes('security deposit fee')
        ? 'securityDepositFee'
        : message.includes('same as rent')
          ? 'amountAsRent'
          : message.includes('lease start date')
            ? 'leaseStartDate'
            : message.includes('lease end date')
              ? 'leaseEndDate'
              : '';
      return { error: { key, message } };
    }
    return { error: { key: '', message: error.message.toLowerCase() } };
  }
};

export const RejectTenant = async (payload: {
  tenantId: string;
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
    const response = await axios.get(`${backendUrl}/api/v2/tenant/reject/${payload.tenantId}`, {
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

export const TenantPayment = async (payload: {
  tenantId: string;
  type: PaymentType;
  promoCode?: string;
}): Promise<
  | {
      data: {
        success: boolean;
        clientSecret: string;
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
    const response = await axios.post(`${backendUrl}/api/v2/tenant/payment`, payload, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return { data: { success: response.data.success, clientSecret: response.data.clientSecret } };
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
      const key = message.includes('payment type')
        ? 'paymentType'
        : message.includes('promo')
          ? 'promoCode'
          : '';
      return { error: { key, message } };
    }
    return { error: { key: '', message: error.message.toLowerCase() } };
  }
};

export const AddBankAccount = async (payload: {
  tenantId: string;
}): Promise<
  | {
      data: {
        account: BankAccountDetail;
      };
    }
  | { error: { key: string; message: string } }
> => {
  try {
    if (!process.env.BACKEND_URL) {
      throw new Error('process.env.BACKEND_URL is required');
    }
    const backendUrl = process.env.BACKEND_URL;
    const crypto = cookies().get('tmp')?.value;
    if (!crypto) {
      return { error: { key: '', message: 'something went wrong' } };
    }
    const stripe = (await decrypt(crypto)) as
      | undefined
      | {
          token: string;
        };
    if (!stripe) {
      return { error: { key: '', message: 'something went wrong' } };
    }
    const headers = getCookies();
    const response = await axios.post(
      `${backendUrl}/api/v2/tenant/add-account`,
      {
        tenantId: payload.tenantId,
        stripeToken: stripe.token,
      },
      {
        headers,
        withCredentials: true,
      }
    );
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return { data: { account: response.data.account } };
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

export const GetBankAccount = async (): Promise<
  | {
      data: {
        account: BankAccountDetail;
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
    const response = await axios.get(`${backendUrl}/api/v2/tenant/get-account`, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return { data: { account: response.data.account } };
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

export const TenantRenew = async (payload: {
  tenantId: string;
  leaseStartDate: string;
  leaseEndDate: string;
  rent?: number;
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
    const response = await axios.post(`${backendUrl}/api/v2/tenant/renew`, payload, {
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
      const key = message.includes('rent')
        ? 'rent'
        : message.includes('lease start date')
          ? 'leaseStartDate'
          : message.includes('lease end date')
            ? 'leaseEndDate'
            : '';
      return { error: { key, message } };
    }
    return { error: { key: '', message: error.message.toLowerCase() } };
  }
};

export const TenantRefund = async (payload: {
  tenantId: string;
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
    const response = await axios.get(`${backendUrl}/api/v2/tenant/refund/${payload.tenantId}`, {
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

export const GetAllTenants = async (payload?: {
  query?: object;
  page?: number;
  limit?: number;
  sort?: Sort;
  select?: string;
  includeSelectedUnit?: boolean;
  includeProperty?: boolean;
  includeHost?: boolean;
}): Promise<
  | {
      data: {
        totalDocuments: number;
        totalPages: number | null;
        currentPage: number | null;
        limit: number | null;
        skip: number | null;
        result: Tenant[];
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
      if (payload.includeSelectedUnit !== undefined) {
        params.append('includeSelectedUnit', String(payload.includeSelectedUnit));
      }
      if (payload.includeProperty !== undefined) {
        params.append('includeProperty', String(payload.includeProperty));
      }
      if (payload.includeHost !== undefined) {
        params.append('includeHost', String(payload.includeHost));
      }
    }
    const response = await axios.get(`${backendUrl}/api/v2/tenant/all?${params.toString()}`, {
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

export const GetHostTenants = async (payload: {
  hostId: string;
  status?: HostTenantsType | HostTenantsType[];
}): Promise<
  | {
      data: {
        tenants: Tenant[];
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
      `${backendUrl}/api/v2/tenant/all/host/${payload.hostId}?${params.toString()}`,
      {
        headers,
        withCredentials: true,
      }
    );
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return { data: { tenants: response.data.tenants } };
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

export const GetUserAsTenants = async (payload?: {
  status?: UserAsTenantType | UserAsTenantType[];
}): Promise<
  | {
      data: {
        tenants: Tenant[];
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
    const response = await axios.get(`${backendUrl}/api/v2/tenant/me?${params.toString()}`, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return { data: { tenants: response.data.tenants } };
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

export const FindTenantById = async (payload: {
  tenantId: string;
}): Promise<
  | {
      data: {
        tenant: Tenant;
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
    const response = await axios.get(`${backendUrl}/api/v2/tenant/find/${payload.tenantId}`, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return { data: { tenant: response.data.tenant } };
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
