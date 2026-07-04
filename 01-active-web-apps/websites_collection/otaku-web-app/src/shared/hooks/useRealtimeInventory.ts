/**
 * Supabase Realtime inventory sync — cross-tab instant grants (MASTER_ARCHITECTURE_2026 §2).
 */
import { useCallback, useEffect, useState } from 'react';
import { getSupabase, isSupabaseConfigured } from '../supabase/config';
import type { UserInventoryRow } from '../membership/types';
import { fetchUserInventory } from '../membership/inventory';

export function useRealtimeInventory(userId: string | null | undefined) {
  const [inventory, setInventory] = useState<UserInventoryRow[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'connected' | 'offline'>('idle');

  const refresh = useCallback(async () => {
    if (!userId || !isSupabaseConfigured()) return;
    try {
      const rows = await fetchUserInventory(userId);
      setInventory(rows);
    } catch (err) {
      console.warn('[useRealtimeInventory] fetch failed', err);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId || !isSupabaseConfigured()) {
      setSyncStatus('offline');
      return;
    }

    void refresh();

    const supabase = getSupabase();
    const channel = supabase
      .channel(`inventory-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_inventory',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void refresh();
        },
      )
      .subscribe((status) => {
        setSyncStatus(status === 'SUBSCRIBED' ? 'connected' : 'offline');
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, refresh]);

  return { inventory, syncStatus, refresh };
}
