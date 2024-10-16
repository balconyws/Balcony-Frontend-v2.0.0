'use client';

import { configureStore, combineReducers, AnyAction } from '@reduxjs/toolkit';
import { ThunkAction } from 'redux-thunk';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { encryptTransform } from 'redux-persist-transform-encrypt';
import storage from 'redux-persist/lib/storage';
import {
  persistStore,
  persistReducer,
  purgeStoredState,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

import { hashAlgorithm } from '@/hash/client';
import {
  Action,
  authReducer,
  chatReducer,
  cardReducer,
  workspaceReducer,
  propertyReducer,
  subscriptionReducer,
  promoReducer,
  bookingReducer,
  autoReducer,
  tenantReducer,
  ticketReducer,
  userReducer,
} from '@/redux';

const persistConfig = {
  key: 'balcony',
  storage,
  transforms: [
    encryptTransform({
      secretKey: hashAlgorithm('balcony'),
      onError: () => purgeStoredState({ key: 'balcony', storage }),
    }),
  ],
};

const persistedReducer = persistReducer(persistConfig, authReducer);

const rootReducer = combineReducers({
  auth: persistedReducer,
  chat: chatReducer,
  card: cardReducer,
  workspace: workspaceReducer,
  property: propertyReducer,
  subscription: subscriptionReducer,
  promo: promoReducer,
  booking: bookingReducer,
  auto: autoReducer,
  tenant: tenantReducer,
  ticket: ticketReducer,
  user: userReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
export type AppThunk<ReturnType = void> = ThunkAction<
  Promise<ReturnType>,
  RootState,
  null,
  Action<string>
>;

export const waitForDispatch = async (
  dispatch: AppDispatch,
  action: ThunkAction<Promise<any>, RootState, unknown, AnyAction>,
  // eslint-disable-next-line no-unused-vars
  onSuccess: (state: RootState) => void,
  onError?: () => void
) => {
  try {
    const resultAction: {
      payload: any;
      meta?: any;
      type: string;
    } = await dispatch(action);
    if (resultAction.type.endsWith('/fulfilled')) {
      setTimeout(() => onSuccess(store.getState()), 0);
    } else if (resultAction.type.endsWith('/rejected')) {
      if (onError) {
        setTimeout(onError, 0);
      }
    }
  } catch (error) {
    if (onError) {
      setTimeout(onError, 0);
    }
  }
};
