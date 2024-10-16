import type { NextAuthConfig } from 'next-auth';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';

export const BASE_PATH = '/api/auth';

export const authConfig = {
  pages: {
    error: '/error',
    signIn: '/error',
    signOut: '/error',
    newUser: '/error',
    verifyRequest: '/error',
  },
  basePath: BASE_PATH,
  secret: process.env.NEXT_AUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
  ],
  cookies: {
    sessionToken: {
      name: 'balcony-auth.session-token',
      options: {
        path: '/',
        secure: true,
        maxAge: 30,
      },
    },
    callbackUrl: {
      name: 'balcony-auth.callback-url',
      options: {
        path: '/',
        secure: true,
        maxAge: 30,
      },
    },
    csrfToken: {
      name: 'balcony-auth.csrf-token',
      options: {
        path: '/',
        secure: true,
        maxAge: 30,
      },
    },
    pkceCodeVerifier: {
      name: 'balcony-auth.pkce.code_verifier',
      options: {
        path: '/',
        secure: true,
        maxAge: 30,
      },
    },
    state: {
      name: 'balcony-auth.state',
      options: {
        path: '/',
        secure: true,
        maxAge: 30,
      },
    },
    nonce: {
      name: 'balcony-auth.nonce',
      options: {
        path: '/',
        secure: true,
        maxAge: 30,
      },
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export const getErrorMessage = (error: string) => {
  let errorMessage: string;
  switch (error) {
    case 'OAuthCallbackError':
      errorMessage = 'OAuth callback failed. Please try logging in again';
      break;
    case 'OAuthCreateAccountError':
      errorMessage = 'Failed to create an account using your OAuth provider';
      break;
    case 'OAuthAccountNotLinkedError':
      errorMessage =
        'This account is already linked with another provider. Please use the correct provider to sign in';
      break;
    case 'OAuthSigninError':
      errorMessage = 'There was a problem signing in with your OAuth provider. Please try again';
      break;
    case 'CredentialsSignin':
      errorMessage = 'Sign in failed. Check your credentials and try again';
      break;
    case 'EmailSignin':
      errorMessage = 'Email sign-in failed. Please try again';
      break;
    case 'CallbackError':
      errorMessage = 'There was an error during the callback phase. Please try again';
      break;
    case 'SessionRequired':
      errorMessage = 'You need to be signed in to access this page';
      break;
    case 'NoAuthorizationHeader':
      errorMessage = 'Authorization header is missing. Please sign in';
      break;
    case 'CSRFTokenMismatch':
      errorMessage = 'Security check failed. Please refresh the page and try again';
      break;
    case 'MissingState':
      errorMessage = 'Security state is missing. Please try again';
      break;
    case 'MissingCode':
      errorMessage = 'Authorization code is missing. Please try again';
      break;
    case 'MissingToken':
      errorMessage = 'Authorization token is missing. Please sign in';
      break;
    case 'RefreshAccessTokenError':
      errorMessage = 'Failed to refresh access token. Please sign in again';
      break;
    case 'AccessDenied':
      errorMessage = 'Access denied. You do not have permission to access this resource';
      break;
    case 'UnsupportedCredentials':
      errorMessage = 'The credentials provided are not supported';
      break;
    case 'Signin':
      errorMessage = 'An error occurred during the sign-in process. Please try again';
      break;
    case 'OAuthCallback':
      errorMessage = 'An error occurred during the OAuth callback. Please try again';
      break;
    case 'AccountNotLinked':
      errorMessage = 'Please sign in using the same account you originally used';
      break;
    case 'VerificationRequest':
      errorMessage = 'Too many verification requests. Please try again later';
      break;
    case 'DatabaseError':
      errorMessage = 'An error occurred with the database. Please try again later';
      break;
    case 'ConfigurationError':
      errorMessage = 'Configuration error. Please contact support';
      break;
    case 'InternalError':
      errorMessage = 'An internal server error occurred. Please try again later';
      break;
    default:
      errorMessage = '';
  }
  return errorMessage;
};
