'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import { setOnline } from '@/store/uiSlice';

export function useOnlineStatus() {
  const dispatch = useAppDispatch();
  const isOnline = useAppSelector(state => state.ui.isOnline);

  useEffect(() => {
    const handleOnline = () => dispatch(setOnline(true));
    const handleOffline = () => dispatch(setOnline(false));

    // Set initial status
    dispatch(setOnline(navigator.onLine));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);

  return isOnline;
}
