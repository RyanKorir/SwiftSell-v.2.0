import { useEffect, useState } from 'react';
import type { QueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase.ts';

export type RealtimeStatus = 'connecting' | 'live' | 'offline';

/**
 * Subscribes to live Postgres changes (via Supabase Realtime) on every
 * SwiftSell table for the current user, and invalidates the matching React
 * Query cache key whenever a row changes — so data entered on one device
 * (or by a teammate) appears everywhere else without a manual refresh.
 */
export function useRealtimeSync(queryClient: QueryClient, userId: string | undefined) {
  const [status, setStatus] = useState<RealtimeStatus>('connecting');

  useEffect(() => {
    if (!userId) {
      setStatus('offline');
      return;
    }

    setStatus('connecting');

    const tableToQueryKeys: Record<string, string[]> = {
      products: ['products'],
      customers: ['customers'],
      orders: ['orders'],
      order_items: ['orders'],
      expenses: ['expenses']
    };

    const channel = supabase.channel(`swiftsell-live-${userId}`);

    for (const [table, keys] of Object.entries(tableToQueryKeys)) {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter: `owner_id=eq.${userId}` },
        () => {
          keys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
        }
      );
    }

    channel.subscribe((subStatus) => {
      if (subStatus === 'SUBSCRIBED') setStatus('live');
      else if (subStatus === 'CHANNEL_ERROR' || subStatus === 'TIMED_OUT' || subStatus === 'CLOSED') {
        setStatus('offline');
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, userId]);

  return status;
}
