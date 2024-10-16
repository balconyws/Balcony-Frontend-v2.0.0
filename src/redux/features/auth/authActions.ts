'use client';

import { createAsyncThunk } from '@reduxjs/toolkit';

import { persistor, authSlice } from '@/redux';
import { AuthServerActions, UserServerActions } from '@/server';
import { validator } from '@/helper';
import { doSigninWithPhoneNumber } from '@/firebase/auth';
import {
  SigninCredentials,
  SignupCredentials,
  SocialAuthCredentials,
  VerifyCredentials,
} from '@/types';

export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (credentials: SignupCredentials, { dispatch }) => {
    const { startLoading, setLoading, setOtpDialog, authError } = authSlice;
    dispatch(startLoading());
    const res = await AuthServerActions.Signup(credentials);
    if ('data' in res) {
      doSigninWithPhoneNumber(credentials.phone)
        .then(confirmationResult => {
          window.confirmationResult = confirmationResult;
        })
        .catch(() => {});
      dispatch(setOtpDialog({ show: true, expiryTime: res.data.expiryTime }));
      dispatch(setLoading({ state: false }));
    } else if ('error' in res) {
      dispatch(authError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(authError({ key: '', message: 'signup failed' }));
    }
  }
);

export const resendOtp = createAsyncThunk('auth/resendOtp', async (_, { dispatch }) => {
  const { setOtpDialog, authError } = authSlice;
  const res = await AuthServerActions.ResendOtp();
  if ('data' in res) {
    doSigninWithPhoneNumber(res.data.phone)
      .then(confirmationResult => {
        window.confirmationResult = confirmationResult;
      })
      .catch(() => {});
    dispatch(setOtpDialog({ show: true, expiryTime: res.data.expiryTime }));
  } else if ('error' in res) {
    dispatch(authError({ key: res.error.key, message: res.error.message }));
  } else {
    dispatch(authError({ key: '', message: 'resend otp failed' }));
  }
});

export const otpStatus = createAsyncThunk('auth/otpStatus', async (_, { dispatch }) => {
  const { setOtpDialog, authError } = authSlice;
  const res = await AuthServerActions.OtpStatus();
  if ('data' in res) {
    if (res.data.expiryTime && res.data.attempts <= 2) {
      dispatch(setOtpDialog({ show: true, expiryTime: res.data.expiryTime }));
    }
  } else if ('error' in res) {
    dispatch(authError({ key: res.error.key, message: res.error.message }));
  } else {
    dispatch(authError({ key: '', message: 'otp status failed' }));
  }
});

export const verifyUser = createAsyncThunk(
  'auth/verifyUser',
  async (
    credentials: {
      passCode: string;
      isReset: 'true' | 'false';
    },
    { dispatch }
  ) => {
    const { startLoading, setLoading, login, setOtpDialog, setResetDialog, authError } = authSlice;
    dispatch(startLoading());
    const res = await AuthServerActions.OtpStatus();
    if ('data' in res) {
      if (res.data.expiryTime < new Date().getTime() || res.data.attempts > 2) {
        dispatch(setLoading({ state: false }));
        dispatch(authError({ key: '', message: 'otp has expired' }));
        return;
      }
    }
    const verify = async (payload: VerifyCredentials) => {
      const res = await AuthServerActions.Verify(payload);
      if ('data' in res) {
        if ('success' in res.data) {
          // Password reset request verified
          dispatch(setOtpDialog({ show: false }));
          dispatch(setResetDialog({ show: true }));
        } else {
          // New user registered
          dispatch(login({ user: res.data.user, token: res.data.token }));
          dispatch(setOtpDialog({ show: false }));
        }
        dispatch(setLoading({ state: false }));
      } else if ('error' in res) {
        dispatch(authError({ key: res.error.key, message: res.error.message }));
      } else {
        dispatch(authError({ key: '', message: 'verification failed' }));
      }
    };
    if (!window.confirmationResult) {
      await verify({ otp: credentials.passCode, reset: credentials.isReset });
      return;
    }
    window.confirmationResult
      .confirm(credentials.passCode)
      .then(() => verify({ reset: credentials.isReset }))
      .catch(() => verify({ otp: credentials.passCode, reset: credentials.isReset }));
  }
);

export const signinUser = createAsyncThunk(
  'auth/signinUser',
  async (credentials: SigninCredentials, { dispatch }) => {
    const { startLoading, login, authError } = authSlice;
    dispatch(startLoading());
    const payload = {
      email: validator.isEmailValid(credentials.emailOrPhone) ? credentials.emailOrPhone : '',
      phone: validator.isPhoneValid(credentials.emailOrPhone) ? credentials.emailOrPhone : '',
      password: credentials.password,
    };
    const res = await AuthServerActions.Signin(payload);
    if ('data' in res) {
      dispatch(login({ user: res.data.user, token: res.data.token }));
    } else if ('error' in res) {
      dispatch(authError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(authError({ key: '', message: 'signin failed' }));
    }
  }
);

export const socialAuth = createAsyncThunk(
  'auth/socialAuth',
  async (credentials: SocialAuthCredentials, { dispatch }) => {
    const { startLoading, login, authError } = authSlice;
    dispatch(startLoading());
    const res = await AuthServerActions.SocialAuth(credentials);
    if ('data' in res) {
      dispatch(login({ user: res.data.user, token: res.data.token }));
    } else if ('error' in res) {
      dispatch(authError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(authError({ key: '', message: 'social signin failed' }));
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (credentials: { emailOrPhone: string }, { dispatch }) => {
    const { startLoading, setLoading, setOtpDialog, authError } = authSlice;
    dispatch(startLoading());
    const payload = {
      email: validator.isEmailValid(credentials.emailOrPhone) ? credentials.emailOrPhone : '',
      phone: validator.isPhoneValid(credentials.emailOrPhone) ? credentials.emailOrPhone : '',
    };
    const res = await AuthServerActions.ForgotPassword(payload);
    if ('data' in res) {
      dispatch(setOtpDialog({ show: true, expiryTime: res.data.expiryTime, isResetRequest: true }));
      dispatch(setLoading({ state: false }));
    } else if ('error' in res) {
      dispatch(authError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(authError({ key: '', message: 'forgot password failed' }));
    }
  }
);

export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async (credentials: { password: string }, { dispatch }) => {
    const { startLoading, setLoading, setResetDialog, authError } = authSlice;
    dispatch(startLoading());
    const res = await AuthServerActions.UpdatePassword(credentials);
    if ('data' in res && 'success' in res.data) {
      dispatch(setResetDialog({ show: false }));
      dispatch(setLoading({ state: false }));
    } else if ('error' in res) {
      dispatch(authError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(authError({ key: '', message: 'reset password failed' }));
    }
  }
);

export const reAuthenticate = createAsyncThunk('auth/reAuthenticate', async (_, { dispatch }) => {
  const { login, setReAuthenticate } = authSlice;
  const res = await AuthServerActions.ReAuthenticate();
  if ('data' in res) {
    dispatch(login({ user: res.data.user, token: res.data.token }));
  } else {
    await dispatch(logoutUser());
    dispatch(setReAuthenticate({ reauthenticate: true }));
  }
});

export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async (formData: FormData, { dispatch }) => {
    const { setLoading, setUser, setError } = authSlice;
    dispatch(setLoading({ state: true }));
    const res = await UserServerActions.UpdateUser(formData);
    if ('data' in res) {
      dispatch(setUser({ user: res.data.user }));
    } else if ('error' in res) {
      dispatch(setError({ key: res.error.key, message: res.error.message }));
    } else {
      dispatch(setError({ key: '', message: 'user update failed' }));
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { dispatch }) => {
  const { logout, authError } = authSlice;
  const res = await AuthServerActions.Logout();
  if ('data' in res && 'success' in res.data) {
    dispatch(logout());
    persistor.purge();
  } else if ('error' in res) {
    dispatch(authError({ key: res.error.key, message: res.error.message }));
  } else {
    dispatch(authError({ key: '', message: 'logout failed' }));
  }
});
