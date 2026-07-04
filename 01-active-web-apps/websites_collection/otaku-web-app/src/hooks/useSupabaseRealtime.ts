import { useEffect, useRef } from 'react';
import { getSupabase, isSupabaseConfigured } from '../shared/supabase/config';

export interface UseSupabaseRealtimeOptions {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string; // e.g. "user_id=eq.123"
}

/**
 * A custom React hook to listen to Supabase Realtime Postgres changes.
 * 
 * @param options Configuration for the realtime subscription
 * @param callback The function to execute when a change is detected
 */
export const useSupabaseRealtime = (
  options: UseSupabaseRealtimeOptions,
  callback: () => void
) => {
  const savedCallback = useRef(callback);

  // Remember the latest callback if it changes
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = getSupabase();
    
    const channel = supabase
      .channel(`realtime-${options.table}-${Math.random().toString(36).substring(7)}`)
      .on(
        'postgres_changes',
        {
          event: options.event || '*',
          schema: 'public',
          table: options.table,
          filter: options.filter,
        },
        (payload) => {
          console.log(`[Realtime Sync] Change detected on ${options.table}:`, payload);
          savedCallback.current();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[Realtime Sync] Subscribed to ${options.table}`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [options.table, options.event, options.filter]);
};
