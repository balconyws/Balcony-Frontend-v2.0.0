'use server';

import { cookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';
import axios from 'axios';

import { Property, Sort, Status } from '@/types';

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

export const AddProperty = async (
  formData: FormData
): Promise<
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
    const response = await axios.post(`${backendUrl}/api/v2/property/create`, formData, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
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
      const key = message.includes('name')
        ? 'workspaceName'
        : message.includes('location')
          ? 'address'
          : message.includes('city')
            ? 'city'
            : message.includes('state')
              ? 'state'
              : message.includes('country')
                ? 'currency'
                : message.includes('charge fee from rent')
                  ? 'chargeFeeFromRent'
                  : message.includes('charge fee as addition')
                    ? 'chargeFeeAsAddition'
                    : message.includes('lease duration')
                      ? 'leaseDuration'
                      : message.includes('file')
                        ? 'leasingPolicyDoc'
                        : message.includes('unit')
                          ? 'unitList[0].unit'
                          : message.includes('floor plan image')
                            ? 'unitList[0].floorPlanImg'
                            : message.includes('upload') ||
                                message.includes('image') ||
                                message.includes('file')
                              ? 'img1'
                              : '';
      return { error: { key, message } };
    }
    return { error: { key: '', message: error.message.toLowerCase() } };
  }
};

export const UpdateProperty = async (
  formData: FormData
): Promise<
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
      `${backendUrl}/api/v2/property/update/${formData.get('id')}`,
      formData,
      {
        headers,
        withCredentials: true,
      }
    );
    if (response && response.data && response.data.success) {
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
      const key = message.includes('name')
        ? 'workspaceName'
        : message.includes('location')
          ? 'address'
          : message.includes('city')
            ? 'city'
            : message.includes('state')
              ? 'state'
              : message.includes('country')
                ? 'currency'
                : message.includes('charge fee from rent')
                  ? 'chargeFeeFromRent'
                  : message.includes('charge fee as addition')
                    ? 'chargeFeeAsAddition'
                    : message.includes('lease duration')
                      ? 'leaseDuration'
                      : message.includes('file')
                        ? 'leasingPolicyDoc'
                        : message.includes('unit')
                          ? 'unitList[0].unit'
                          : message.includes('floor plan image')
                            ? 'unitList[0].floorPlanImg'
                            : message.includes('upload') ||
                                message.includes('image') ||
                                message.includes('file')
                              ? 'img1'
                              : '';
      return { error: { key, message } };
    }
    return { error: { key: '', message: error.message.toLowerCase() } };
  }
};

export const UpdateStatus = async (paylaod: {
  propertyId: string;
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
      `${backendUrl}/api/v2/property/update-status/${paylaod.propertyId}`,
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

export const GetAllProperties = async (payload?: {
  query?: object;
  page?: number;
  limit?: number;
  sort?: Sort;
  select?: string;
  includeHost?: boolean;
  includeUnitList?: boolean;
}): Promise<
  | {
      data: {
        totalDocuments: number;
        totalPages: number | null;
        currentPage: number | null;
        limit: number | null;
        skip: number | null;
        result: Property[];
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
      if (payload.includeHost !== undefined) {
        params.append('includeHost', String(payload.includeHost));
      }
      if (payload.includeUnitList !== undefined) {
        params.append('includeUnitList', String(payload.includeUnitList));
      }
    }
    const response = await axios.get(`${backendUrl}/api/v2/property/all?${params.toString()}`, {
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

export const SearchProperties = async (payload?: {
  place?: string;
  beds?: string;
  baths?: string;
  minrange?: string;
  maxrange?: string;
  page?: number;
  limit?: number;
  sort?: Sort;
  select?: string;
  includeHost?: boolean;
  includeUnitList?: boolean;
}): Promise<
  | {
      data: {
        totalDocuments: number;
        totalPages: number | null;
        currentPage: number | null;
        limit: number | null;
        skip: number | null;
        result: Property[];
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
      if (payload.place) {
        params.append('place', String(payload.place));
      }
      if (payload.beds) {
        params.append('beds', String(payload.beds));
      }
      if (payload.baths) {
        params.append('baths', String(payload.baths));
      }
      if (payload.minrange) {
        params.append('minrange', String(payload.minrange));
      }
      if (payload.maxrange) {
        params.append('maxrange', String(payload.maxrange));
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
      if (payload.includeHost !== undefined) {
        params.append('includeHost', String(payload.includeHost));
      }
      if (payload.includeUnitList !== undefined) {
        params.append('includeUnitList', String(payload.includeUnitList));
      }
    }
    const response = await axios.get(`${backendUrl}/api/v2/property/search?${params.toString()}`, {
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

export const FindPropertyById = async (payload: {
  propertyId: string;
}): Promise<
  | {
      data: {
        property: Property;
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
    const response = await axios.get(`${backendUrl}/api/v2/property/find/${payload.propertyId}`, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return { data: { property: response.data.property } };
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

export const GetHostProperties = async (payload: {
  hostId: string;
}): Promise<
  | {
      data: {
        properties: Property[];
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
    const response = await axios.get(`${backendUrl}/api/v2/property/all/host/${payload.hostId}`, {
      headers,
      withCredentials: true,
    });
    if (response && response.data && response.data.success) {
      setCookies(response.headers['set-cookie']);
      return { data: { properties: response.data.properties } };
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

export const DeleteProperty = async (payload: {
  propertyId: string;
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
    const response = await axios.delete(
      `${backendUrl}/api/v2/property/delete/${payload.propertyId}`,
      {
        headers,
        withCredentials: true,
      }
    );
    if (response && response.data && response.data.success) {
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
